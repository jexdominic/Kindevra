import test from 'node:test';
import assert from 'node:assert/strict';
import { setupVoice } from '../public/voice-ui.js';

function fixture({ supported = true, prefixed = false } = {}) {
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
  const voice = setupVoice({ document, window });
  const element = selector => document.querySelector(selector);
  const start = () => { element('#voice-consent').checked = true; element('#voice-start').fire('click'); };
  const result = text => ({ results: [Object.assign([{ transcript: text }], { isFinal: true })] });
  return { voice, document, window, element, start, instances, spoken, result, cancellations: () => cancellations };
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
