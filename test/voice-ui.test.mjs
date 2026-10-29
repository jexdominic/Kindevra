import test from 'node:test';
import assert from 'node:assert/strict';
import { setupVoice } from '../public/voice-ui.js';

function fixture({ supported = true, prefixed = false, respond } = {}) {
  const elements = new Map();
  function target() {
    const listeners = new Map();
    return { value: '', checked: false, disabled: false, textContent: '', focus() {},
      addEventListener(name, callback) { listeners.set(name, callback); },
      fire(name) { listeners.get(name)?.(); }
    };
  }
  const document = Object.assign(target(), { hidden: false, querySelector(selector) {
    if (!elements.has(selector)) elements.set(selector, target());
    return elements.get(selector);
  } });
  const instances = [], spoken = [];
  let cancellations = 0;
  class Recognition {
    constructor() { instances.push(this); }
    start() {}
    abort() { this.aborted = true; }
  }
  const window = Object.assign(target(), {
    speechSynthesis: { cancel() { cancellations++; }, speak(value) { spoken.push(value); } },
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } }
  });
  if (supported) window[prefixed ? 'webkitSpeechRecognition' : 'SpeechRecognition'] = Recognition;
  const messages = [];
  const voice = setupVoice({ document, window, respond, onMessage: message => messages.push(message) });
  const element = selector => document.querySelector(selector);
  const start = () => { element('#voice-consent').checked = true; element('#voice-start').fire('click'); };
  const result = text => ({ results: [Object.assign([{ transcript: text }], { isFinal: true })] });
  return { voice, document, window, messages, element, start, instances, spoken, result, cancellations: () => cancellations };
}

test('unsupported input notice survives reset, stop and playback completion', () => {
  const f = fixture({ supported: false });
  assert.equal(f.element('#voice-start').disabled, true);
  f.voice.stop();
  assert.match(f.element('#voice-status').textContent, /unavailable/);
  f.element('#voice-consent').checked = true;
  f.element('#voice-read').checked = true;
  f.voice.speak('A reply');
  assert.equal(f.element('#voice-status').textContent, 'Speaking');
  f.spoken[0].onend();
  assert.match(f.element('#voice-status').textContent, /unavailable/);
});

test('UI requires consent and withdrawal aborts capture and suppresses late text', () => {
  const f = fixture();
  f.element('#voice-start').fire('click');
  assert.equal(f.instances.length, 0);
  f.start();
  f.element('#message').value = 'My draft';
  f.element('#voice-read').checked = true;
  f.element('#voice-consent').checked = false;
  f.element('#voice-consent').fire('change');
  f.instances[0].onresult(f.result('discarded'));
  assert.equal(f.instances[0].aborted, true);
  assert.equal(f.element('#message').value, 'My draft');
  assert.equal(f.element('#voice-read').checked, false);
  f.voice.speak('private reply');
  assert.equal(f.spoken.length, 0);
});

for (const event of ['visibilitychange', 'pagehide']) {
  test(`${event} cancels recognition and playback`, () => {
    const f = fixture();
    f.start();
    const before = f.cancellations();
    if (event === 'visibilitychange') { f.document.hidden = true; f.document.fire(event); }
    else f.window.fire(event);
    assert.equal(f.instances[0].aborted, true);
    assert.ok(f.cancellations() > before);
    f.instances[0].onresult(f.result('late'));
    assert.equal(f.element('#message').value, '');
  });
}

test('prefixed recognition appends a transcript to the editable draft', () => {
  const f = fixture({ prefixed: true });
  f.element('#message').value = 'Existing draft';
  f.start();
  f.instances[0].onresult(f.result('spoken continuation'));
  assert.equal(f.element('#message').value, 'Existing draft spoken continuation');
  assert.equal(f.spoken.length, 0);
});

test('typing cancels capture and protects an edited draft from late speech', () => {
  const f = fixture();
  f.start();
  f.element('#message').value = 'Edited by hand';
  f.element('#message').fire('input');
  f.instances[0].onresult(f.result('late speech'));
  assert.equal(f.instances[0].aborted, true);
  assert.equal(f.element('#message').value, 'Edited by hand');
});

test('full composer prevents microphone capture', () => {
  const f = fixture();
  f.element('#message').value = 'a'.repeat(2000);
  f.start();
  assert.equal(f.instances.length, 0);
  assert.match(f.element('#voice-status').textContent, /message is full/);
});

for (const existing of ['', 'Draft '.repeat(300)]) {
  test(`transcript overflow is disclosed with ${existing.length} existing characters`, () => {
    const f = fixture();
    f.element('#message').value = existing;
    f.start();
    f.instances[0].onresult(f.result('b'.repeat(2100)));
    f.instances[0].onend();
    assert.equal(f.element('#message').value.length, 2000);
    assert.match(f.element('#voice-status').textContent, /Some speech was not added/);
    f.element('#message').value = '';
    f.start();
    f.instances[1].onresult(f.result('short message'));
    f.instances[1].onend();
    assert.equal(f.element('#voice-status').textContent, 'Review your transcript, then send.');
  });
}

test('a short transcript that exceeds remaining space warns before recognition ends', () => {
  const f = fixture();
  f.element('#message').value = 'a'.repeat(1900);
  f.start();
  f.instances[0].onresult(f.result('b'.repeat(200)));
  assert.equal(f.element('#message').value.length, 2000);
  assert.match(f.element('#voice-status').textContent, /Some speech was not added/);
  f.instances[0].onend();
  assert.match(f.element('#voice-status').textContent, /Some speech was not added/);
});

const flushVoice = () => new Promise(resolve => setImmediate(resolve));
function startConversation(f) {
  f.element('#voice-consent').checked = true;
  f.element('#voice-automatic').checked = true;
  f.element('#voice-conversation-start').fire('click');
}

test('continuous UI requires automatic-send consent and preserves existing drafts', () => {
  const f = fixture({ respond: () => ({ text: 'reply' }) });
  f.element('#voice-consent').checked = true;
  f.element('#voice-conversation-start').fire('click');
  assert.equal(f.instances.length, 0);
  assert.match(f.element('#voice-status').textContent, /automatic sending/);
  f.element('#message').value = 'Unsent draft';
  startConversation(f);
  assert.equal(f.instances.length, 0);
  assert.equal(f.element('#message').value, 'Unsent draft');
});

test('continuous UI sends transcripts, plays replies, interrupts and stops', async () => {
  const received = [];
  const f = fixture({ respond: text => { received.push(text); return { text: 'reply' }; } });
  startConversation(f);
  assert.equal(f.element('#voice-conversation-start').disabled, true);
  f.instances[0].onresult(f.result('spoken message')); f.instances[0].onend();
  await flushVoice();
  assert.deepEqual(received, ['spoken message']);
  assert.equal(f.spoken[0].text, 'reply');
  assert.equal(f.element('#voice-interrupt').disabled, false);
  f.element('#voice-interrupt').fire('click');
  await flushVoice();
  assert.equal(f.instances.length, 2);
  assert.equal(f.spoken[0].onend, null);
  f.element('#voice-stop').fire('click'); await flushVoice();
  assert.equal(f.instances[1].aborted, true);
  assert.equal(f.element('#voice-conversation-start').disabled, false);
  assert.deepEqual(f.messages.map(m => m.text), ['spoken message', 'reply']);
});

test('continuous urgent response stops before playback and further capture', async () => {
  const f = fixture({ respond: () => ({ text: 'Urgent support', urgent: true }) });
  startConversation(f);
  f.instances[0].onresult(f.result('need help')); f.instances[0].onend();
  await flushVoice();
  assert.equal(f.spoken.length, 0);
  assert.equal(f.instances.length, 1);
  assert.match(f.element('#voice-status').textContent, /urgent support/);
});

for (const action of ['typing', 'withdraw', 'hide', 'external-stop']) {
  test(`continuous capture ends on ${action}`, async () => {
    const f = fixture({ respond: () => ({ text: 'reply' }) });
    startConversation(f);
    if (action === 'typing') f.element('#message').fire('input');
    if (action === 'withdraw') { f.element('#voice-consent').checked = false; f.element('#voice-consent').fire('change'); }
    if (action === 'hide') { f.document.hidden = true; f.document.fire('visibilitychange'); }
    if (action === 'external-stop') f.voice.stop();
    await flushVoice();
    assert.equal(f.instances[0].aborted, true);
    assert.equal(f.instances[0].onresult, null);
    assert.deepEqual(f.messages, []);
  });
}
