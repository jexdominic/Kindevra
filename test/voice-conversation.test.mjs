import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoiceConversation } from '../public/voice-conversation.js';
import { createSession } from '../public/session.js';
import { replyTo } from '../public/support.js';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
function fixture(respond) {
  const captures = [], replies = [], playbacks = [], messages = [], states = [], drafts = [];
  let consent = true;
  function pending(list, signal, text) {
    const operation = { ...deferred(), signal, text };
    list.push(operation);
    return operation.promise;
  }
  const conversation = createVoiceConversation({
    capture: ({ signal }) => pending(captures, signal),
    respond: respond || ((text, { signal }) => pending(replies, signal, text)),
    playback: (text, { signal }) => pending(playbacks, signal, text),
    hasConsent: () => consent,
    onMessage: message => messages.push(message),
    onState: state => states.push(state),
    onDraft: text => drafts.push(text)
  });
  return { conversation, captures, replies, playbacks, messages, states, drafts, revoke: () => { consent = false; } };
}

test('complete turns listen again only after reply playback finishes', async () => {
  const f = fixture();
  const run = f.conversation.start();
  f.captures[0].resolve({ text: 'Hello' }); await flush();
  assert.equal(f.states.at(-1), 'thinking');
  f.replies[0].resolve({ text: 'Welcome' }); await flush();
  assert.equal(f.states.at(-1), 'speaking');
  assert.equal(f.captures.length, 1);
  f.playbacks[0].resolve(); await flush();
  assert.equal(f.captures.length, 2);
  assert.equal(f.states.at(-1), 'listening');
  f.conversation.stop();
  f.captures[1].resolve({ text: 'late' }); await run;
  assert.deepEqual(f.messages.map(m => m.text), ['Hello', 'Welcome']);
});

for (const phase of ['capture', 'reply', 'playback']) {
  test(`stop during ${phase} rejects late completion without restarting`, async () => {
    const f = fixture();
    const run = f.conversation.start();
    if (phase !== 'capture') { f.captures[0].resolve({ text: 'hello' }); await flush(); }
    if (phase === 'playback') { f.replies[0].resolve({ text: 'reply' }); await flush(); }
    f.conversation.stop();
    const count = f.messages.length;
    const pending = phase === 'capture' ? f.captures[0] : phase === 'reply' ? f.replies[0] : f.playbacks[0];
    assert.equal(pending.signal.aborted, true);
    pending.resolve(phase === 'capture' ? { text: 'late' } : { text: 'late reply' });
    await run;
    assert.equal(f.messages.length, count);
    assert.equal(f.captures.length, 1);
    assert.equal(f.conversation.active, false);
  });
}

test('interruption aborts playback and starts a fresh listening turn', async () => {
  const f = fixture(); const first = f.conversation.start();
  f.captures[0].resolve({ text: 'hello' }); await flush();
  f.replies[0].resolve({ text: 'reply' }); await flush();
  const second = f.conversation.interrupt();
  assert.equal(f.playbacks[0].signal.aborted, true);
  assert.equal(f.captures.length, 2);
  f.playbacks[0].resolve(); await first;
  assert.equal(f.states.at(-1), 'listening');
  f.conversation.stop(); f.captures[1].resolve({ text: 'late' }); await second;
});

test('consent is required initially and checked again before sending speech', async () => {
  const blocked = fixture(); blocked.revoke(); await blocked.conversation.start();
  assert.equal(blocked.captures.length, 0);
  const f = fixture(); const run = f.conversation.start(); f.revoke();
  f.captures[0].resolve({ text: 'private' }); await run;
  assert.equal(f.replies.length, 0);
  assert.deepEqual(f.messages, []);
  assert.equal(f.states.at(-1), 'consent-required');
});

test('truncated speech becomes a draft instead of an automatic message', async () => {
  const f = fixture(); const run = f.conversation.start();
  f.captures[0].resolve({ text: 'partial words', truncated: true }); await run;
  assert.deepEqual(f.drafts, ['partial words']);
  assert.deepEqual(f.messages, []);
  assert.equal(f.states.at(-1), 'review-required');
});

test('urgent responses from the shared response engine stop the conversation', async () => {
  const session = createSession();
  const f = fixture(text => replyTo(text, 0, session));
  const run = f.conversation.start();
  f.captures[0].resolve({ text: 'I want to kill myself' }); await run;
  assert.equal(f.messages[1].urgent, true);
  assert.equal(f.states.at(-1), 'urgent');
  assert.equal(f.playbacks.length, 0);
  assert.equal(f.conversation.active, false);
});

test('audio failure ends the session without automatic retries', async () => {
  const f = fixture(); const run = f.conversation.start();
  f.captures[0].reject(new Error('permission denied')); await run;
  assert.equal(f.states.at(-1), 'error');
  assert.equal(f.captures.length, 1);
  assert.equal(f.captures[0].signal.aborted, true);
});

for (const phase of ['capture', 'playback']) {
  test(`${phase} timeout produces its own recovery state`, async () => {
    const f = fixture(); const run = f.conversation.start();
    if (phase === 'playback') {
      f.captures[0].resolve({ text: 'hello' }); await flush();
      f.replies[0].resolve({ text: 'reply' }); await flush();
    }
    const operation = phase === 'capture' ? f.captures[0] : f.playbacks[0];
    operation.reject(Object.assign(new Error('timeout'), { code: 'timeout' }));
    await run;
    assert.equal(f.states.at(-1), `${phase}-timeout`);
    assert.equal(f.conversation.active, false);
    assert.equal(operation.signal.aborted, true);
  });
}
