import { createVoice } from './voice.js';
export function setupVoice({ document = globalThis.document, window = globalThis.window } = {}) {
  const input = document.querySelector('#message');
  const consent = document.querySelector('#voice-consent');
  const read = document.querySelector('#voice-read');
  const start = document.querySelector('#voice-start');
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const unavailable = 'Voice input is unavailable in this browser. Text messaging is ready.';
  let transcriptLimited = false;
  const limitNotice = 'Message limit reached. Some speech was not added. Review or shorten your message before sending.';
  const voice = createVoice({
    Recognition,
    synthesis: window.speechSynthesis,
    Utterance: window.SpeechSynthesisUtterance,
    onText: (text, { truncated = false } = {}) => {
      const combined = `${input.value.trim()} ${text}`.trim();
      transcriptLimited = truncated || combined.length > 2000;
      input.value = combined.slice(0, 2000);
      if (transcriptLimited) document.querySelector('#voice-status').textContent = limitNotice;
      input.focus();
    },
    onState: text => {
      if (text === 'Ready') transcriptLimited = false;
      const status = transcriptLimited && text === 'Review your transcript, then send.' ? limitNotice : text;
      document.querySelector('#voice-status').textContent = !Recognition && status === 'Ready' ? unavailable : status;
    }
  });
  start.disabled = !voice.supported;
  read.disabled = !window.speechSynthesis || !window.SpeechSynthesisUtterance;
  if (!voice.supported) document.querySelector('#voice-status').textContent = unavailable;
  start.addEventListener('click', () => {
    voice.stop();
    if (input.value.trim().length >= 2000) {
      document.querySelector('#voice-status').textContent = 'Your message is full. Send or shorten it before speaking again.';
      return;
    }
    voice.start(consent.checked);
  });
  input.addEventListener('input', voice.stop);
  document.querySelector('#voice-stop').addEventListener('click', voice.stop);
  consent.addEventListener('change', () => { voice.stop(); if (!consent.checked) read.checked = false; });
  read.addEventListener('change', () => { if (!read.checked) voice.stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) voice.stop(); });
  window.addEventListener('pagehide', voice.stop);
  return { stop: voice.stop, speak: text => voice.speak(text, consent.checked && read.checked) };
}
