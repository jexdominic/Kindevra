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
