import { createVoice } from './voice.js';
export function setupVoice() {
  const input = document.querySelector('#message');
  const consent = document.querySelector('#voice-consent');
  const read = document.querySelector('#voice-read');
  const start = document.querySelector('#voice-start');
  const voice = createVoice({
    Recognition: window.SpeechRecognition || window.webkitSpeechRecognition,
    synthesis: window.speechSynthesis,
    Utterance: window.SpeechSynthesisUtterance,
    onText: text => { input.value = `${input.value.trim()} ${text}`.trim().slice(0, 2000); input.focus(); },
    onState: text => { document.querySelector('#voice-status').textContent = text; }
  });
  start.disabled = !voice.supported;
  read.disabled = !window.speechSynthesis || !window.SpeechSynthesisUtterance;
  if (!voice.supported) document.querySelector('#voice-status').textContent = 'Voice input is unavailable in this browser. Text messaging is ready.';
  start.addEventListener('click', () => voice.start(consent.checked));
  document.querySelector('#voice-stop').addEventListener('click', voice.stop);
  consent.addEventListener('change', () => { voice.stop(); if (!consent.checked) read.checked = false; });
  read.addEventListener('change', () => { if (!read.checked) voice.stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) voice.stop(); });
  window.addEventListener('pagehide', voice.stop);
  return { stop: voice.stop, speak: text => voice.speak(text, consent.checked && read.checked) };
}
