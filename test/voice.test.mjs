import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoice } from '../public/voice.js';
function fixture() {
  const instances = [], texts = [], states = [], spoken = [];
  class Recognition { constructor() { instances.push(this); } start() {} abort() { this.aborted = true; } }
  const voice = createVoice({ Recognition, synthesis: { cancel() {}, speak(u) { spoken.push(u); } }, Utterance: class { constructor(text) { this.text = text; } }, onText: t => texts.push(t), onState: s => states.push(s) });
  const result = text => ({ results: [Object.assign([{ transcript: text }], { isFinal: true })] });
  return { voice, instances, texts, states, spoken, result };
}
test('microphone requires explicit consent', () => { const f = fixture(); f.voice.start(false); assert.equal(f.instances.length, 0); });
test('stop discards late transcripts and callbacks', () => { const f = fixture(); f.voice.start(true); const r = f.instances[0]; f.voice.stop(); r.onresult(f.result('late')); r.onstart(); assert.deepEqual(f.texts, []); assert.equal(f.states.at(-1), 'Ready'); assert.equal(r.aborted, true); });
test('transcript is delivered once and bounded', () => { const f = fixture(); f.voice.start(true); const r = f.instances[0]; r.onresult(f.result('a'.repeat(2100))); r.onresult(f.result('duplicate')); r.onend(); assert.equal(f.texts.length, 1); assert.equal(f.texts[0].length, 2000); assert.match(f.states.at(-1), /Review/); });
test('permission errors survive end and reject results', () => { const f = fixture(); f.voice.start(true); const r = f.instances[0]; r.onerror({error:'not-allowed'}); r.onresult(f.result('ignore')); r.onend(); assert.match(f.states.at(-1), /denied/); assert.deepEqual(f.texts, []); });
test('new input cancels playback; old playback callback cannot change listening state', () => { const f = fixture(); f.voice.speak('reply', true); f.voice.start(true); f.instances[0].onstart(); f.spoken[0].onend(); assert.match(f.states.at(-1), /Listening/); });
test('playback also requires consent', () => { const f = fixture(); f.voice.speak('private', false); assert.equal(f.spoken.length, 0); });
test('unsupported browser falls back to text', () => { let state; const v = createVoice({onText() {}, onState(s) {state=s;} }); v.start(true); assert.equal(v.supported, false); assert.match(state, /unavailable/); });

test('recognition completion rejects late results and state changes', () => {
  const f = fixture();
  f.voice.start(true);
  const r = f.instances[0];
  r.onend();
  const completedState = f.states.at(-1);
  r.onresult(f.result('late transcript'));
  r.onstart();
  r.onerror({ error: 'network' });
  assert.deepEqual(f.texts, []);
  assert.equal(f.states.at(-1), completedState);
});

test('recognition failure aborts capture and cannot return to listening', () => {
  const f = fixture();
  f.voice.start(true);
  const r = f.instances[0];
  r.onerror({ error: 'not-allowed' });
  r.onstart();
  r.onend();
  assert.equal(r.aborted, true);
  assert.match(f.states.at(-1), /denied/);
  f.voice.start(true);
  f.instances[1].onresult(f.result('retry succeeds'));
  assert.deepEqual(f.texts, ['retry succeeds']);
});

test('a throwing cancellation service cannot prevent stop or transcript capture', () => {
  let recognition;
  const texts = [];
  const voice = createVoice({
    Recognition: class { constructor() { recognition = this; } start() {} abort() { throw new Error('unavailable'); } },
    synthesis: { cancel() { throw new Error('unavailable'); } },
    onText: text => texts.push(text), onState() {}
  });
  assert.doesNotThrow(() => voice.start(true));
  recognition.onresult({ results: [Object.assign([{ transcript: 'hello' }], { isFinal: true })] });
  assert.deepEqual(texts, ['hello']);
  assert.doesNotThrow(() => voice.stop());
  recognition.onresult({ results: [Object.assign([{ transcript: 'late' }], { isFinal: true })] });
  assert.deepEqual(texts, ['hello']);
});

test('playback completion ignores subsequent error callbacks', () => {
  const f = fixture();
  f.voice.speak('reply', true);
  f.spoken[0].onend();
  f.spoken[0].onerror();
  assert.equal(f.states.at(-1), 'Ready');
});

test('playback failure remains visible after late completion', () => {
  const f = fixture();
  f.voice.speak('reply', true);
  f.spoken[0].onerror();
  f.spoken[0].onend();
  assert.match(f.states.at(-1), /Playback unavailable/);
});
