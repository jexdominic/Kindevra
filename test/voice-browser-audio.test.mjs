import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrowserVoiceAudio } from '../public/voice-browser-audio.js';
import { createVoiceConversation } from '../public/voice-conversation.js';

function fixture() {
  const recognitions = [], utterances = [], timers = new Map();
  let consent = true, cancellations = 0, nextTimer = 0;
  const audio = createBrowserVoiceAudio({
    Recognition: class {
      constructor() { recognitions.push(this); }
      start() { this.started = true; }
      abort() { this.aborted = true; }
    },
    synthesis: { speak(u) { utterances.push(u); }, cancel() { cancellations++; } },
    Utterance: class { constructor(text) { this.text = text; } },
    hasConsent: () => consent,
    setTimer(fn) { timers.set(++nextTimer, fn); return nextTimer; },
    clearTimer(id) { timers.delete(id); }
  });
  const result = text => ({ results: [Object.assign([{ transcript: text }], { isFinal: true })] });
  return { audio, recognitions, utterances, timers, result, revoke: () => { consent = false; }, cancellations: () => cancellations };
}

test('capture waits for microphone end and preserves truncation metadata', async () => {
  const f = fixture(); const pending = f.audio.capture();
  const r = f.recognitions[0];
  r.onresult(f.result('x'.repeat(2100)));
  assert.equal(f.timers.size, 1);
  r.onend();
  assert.deepEqual(await pending, { text: 'x'.repeat(2000), truncated: true });
  assert.equal(f.timers.size, 0);
  assert.equal(r.onresult, null);
});

test('capture abort rejects promptly and detaches browser handlers', async () => {
  const f = fixture(); const controller = new AbortController();
  const pending = f.audio.capture({ signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { code: 'aborted' });
  assert.equal(f.recognitions[0].aborted, true);
  assert.equal(f.recognitions[0].onend, null);
  assert.equal(f.timers.size, 0);
});

for (const kind of ['capture', 'playback']) {
  test(`${kind} requires consent and rejects already-aborted signals`, async () => {
    const f = fixture(); const controller = new AbortController(); controller.abort();
    const invoke = () => kind === 'capture' ? f.audio.capture({ signal: controller.signal }) : f.audio.playback('reply', { signal: controller.signal });
    await assert.rejects(invoke(), { code: 'aborted' });
    f.revoke(); await assert.rejects(invoke(), { code: 'consent-required' });
    assert.equal(f.recognitions.length + f.utterances.length, 0);
  });
  test(`${kind} timeout releases audio and clears its timer`, async () => {
    const f = fixture();
    const pending = kind === 'capture' ? f.audio.capture() : f.audio.playback('reply');
    [...f.timers.values()][0]();
    await assert.rejects(pending, { code: 'timeout' });
    assert.equal(f.timers.size, 0);
    if (kind === 'capture') assert.equal(f.recognitions[0].aborted, true);
    else assert.equal(f.cancellations(), 1);
  });
}

test('recognition permission error is preserved for the caller', async () => {
  const f = fixture(); const pending = f.audio.capture();
  f.recognitions[0].onerror({ error: 'not-allowed' });
  await assert.rejects(pending, { code: 'not-allowed' });
  assert.equal(f.recognitions[0].aborted, true);
});

test('playback completion removes abort listener so later abort does not cancel another turn', async () => {
  const f = fixture(); const controller = new AbortController();
  const pending = f.audio.playback('reply', { signal: controller.signal });
  f.utterances[0].onend(); await pending;
  controller.abort();
  assert.equal(f.cancellations(), 0);
  assert.equal(f.timers.size, 0);
});

test('browser adapters drive a complete turn and stop pending capture', async () => {
  const f = fixture(); const messages = [], states = [];
  const conversation = createVoiceConversation({ ...f.audio, respond: () => ({ text: 'Welcome' }),
    hasConsent: () => true, onMessage: m => messages.push(m), onState: s => states.push(s) });
  const run = conversation.start();
  f.recognitions[0].onresult(f.result('Hello')); f.recognitions[0].onend();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.utterances[0].text, 'Welcome');
  f.utterances[0].onend();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.recognitions.length, 2);
  conversation.stop(); await run;
  assert.equal(f.recognitions[1].aborted, true);
  assert.equal(f.timers.size, 0);
  assert.deepEqual(messages.map(m => m.text), ['Hello', 'Welcome']);
  assert.equal(states.at(-1), 'idle');
});

test('aborting playback cancels audio and rejects even without an end event', async () => {
  const f = fixture(); const controller = new AbortController();
  const pending = f.audio.playback('reply', { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { code: 'aborted' });
  assert.equal(f.cancellations(), 1);
  assert.equal(f.utterances[0].onend, null);
  assert.equal(f.timers.size, 0);
});

test('unsupported services reject without starting audio', async () => {
  const audio = createBrowserVoiceAudio({ hasConsent: () => true });
  await assert.rejects(audio.capture(), { code: 'recognition-unavailable' });
  await assert.rejects(audio.playback('reply'), { code: 'playback-unavailable' });
});
