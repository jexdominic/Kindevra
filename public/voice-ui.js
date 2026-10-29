import { createVoice } from './voice.js';
import { createVoiceConversation } from './voice-conversation.js';
import { createBrowserVoiceAudio } from './voice-browser-audio.js';
export function setupVoice({ document = globalThis.document, window = globalThis.window, respond, onMessage = () => {} } = {}) {
  const input = document.querySelector('#message');
  const consent = document.querySelector('#voice-consent');
  const read = document.querySelector('#voice-read');
  const start = document.querySelector('#voice-start');
  const automatic = document.querySelector('#voice-automatic');
  const conversationStart = document.querySelector('#voice-conversation-start');
  const interrupt = document.querySelector('#voice-interrupt');
  const status = document.querySelector('#voice-status');
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const unavailable = 'Voice input is unavailable in this browser. Text messaging is ready.';
  let transcriptLimited = false;
  const limitNotice = 'Message limit reached. Some speech was not added. Review or shorten your message before sending.';
  const audio = createBrowserVoiceAudio({ Recognition, synthesis: window.speechSynthesis,
    Utterance: window.SpeechSynthesisUtterance, hasConsent: () => consent.checked && automatic.checked && !document.hidden });
  const states = {
    idle: 'Ready', listening: 'Listening — your spoken message will send automatically.',
    thinking: 'Preparing a reply…', speaking: 'Speaking — interrupt to take your turn.',
    'consent-required': 'Allow voice processing and automatic sending before starting a conversation.',
    'no-speech': 'No speech detected. Start again when you are ready.',
    'review-required': limitNotice, urgent: 'Voice stopped. Please read the urgent support information.',
    error: 'Voice conversation stopped. Check microphone permission or try text messaging.'
  };
  const conversation = createVoiceConversation({ ...audio, respond,
    hasConsent: () => consent.checked && automatic.checked && !document.hidden,
    onMessage,
    onState: state => {
      status.textContent = states[state];
      interrupt.disabled = state !== 'speaking';
      conversationStart.disabled = !canConverse || ['listening', 'thinking', 'speaking'].includes(state);
    },
    onDraft: text => { input.value = text; input.focus(); }
  });
  const canConverse = Boolean(Recognition && window.speechSynthesis && window.SpeechSynthesisUtterance && respond);
  const voice = createVoice({
    Recognition, synthesis: window.speechSynthesis, Utterance: window.SpeechSynthesisUtterance,
    onText: (text, { truncated = false } = {}) => {
      const combined = `${input.value.trim()} ${text}`.trim();
      transcriptLimited = truncated || combined.length > 2000;
      input.value = combined.slice(0, 2000);
      if (transcriptLimited) status.textContent = limitNotice;
      input.focus();
    },
    onState: text => {
      if (text === 'Ready') transcriptLimited = false;
      const message = transcriptLimited && text === 'Review your transcript, then send.' ? limitNotice : text;
      status.textContent = !Recognition && message === 'Ready' ? unavailable : message;
    }
  });
  function stop() { conversation.stop(); voice.stop(); }
  start.disabled = !voice.supported;
  read.disabled = !window.speechSynthesis || !window.SpeechSynthesisUtterance;
  conversationStart.disabled = !canConverse;
  automatic.disabled = !canConverse;
  interrupt.disabled = true;
  if (!voice.supported) status.textContent = unavailable;
  start.addEventListener('click', () => {
    stop();
    if (input.value.trim().length >= 2000) {
      status.textContent = 'Your message is full. Send or shorten it before speaking again.';
      return;
    }
    voice.start(consent.checked);
  });
  conversationStart.addEventListener('click', () => {
    stop();
    if (!canConverse) return;
    if (input.value.trim()) {
      status.textContent = 'Send or clear your draft before starting a voice conversation.';
      return;
    }
    void conversation.start();
  });
  interrupt.addEventListener('click', () => { void conversation.interrupt(); });
  automatic.addEventListener('change', stop);
  input.addEventListener('input', stop);
  document.querySelector('#voice-stop').addEventListener('click', stop);
  consent.addEventListener('change', () => { stop(); if (!consent.checked) { read.checked = false; automatic.checked = false; } });
  read.addEventListener('change', () => { if (!read.checked) stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  return { stop, speak: text => voice.speak(text, consent.checked && read.checked) };
}
