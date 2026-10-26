export function createVoice({ Recognition, synthesis, Utterance, onText, onState }) {
  let recognition = null;
  let generation = 0;
  const supported = Boolean(Recognition);
  function stop() {
    generation++;
    const old = recognition;
    recognition = null;
    if (old) { try { old.abort(); } catch {} }
    try { synthesis?.cancel(); } catch {}
    onState('Ready');
  }
  function start(consent) {
    stop();
    if (!consent) return onState('Allow browser voice processing first.');
    if (!supported) return onState('Voice input is unavailable. Please type your message.');
    const token = generation;
    let heard = false;
    let failed = false;
    try {
      const instance = new Recognition();
      recognition = instance;
      instance.lang = 'en-US';
      instance.continuous = false;
      instance.interimResults = false;
      instance.onstart = () => { if (token === generation) onState('Listening — speak one message, then review it below.'); };
      instance.onresult = event => {
        if (token !== generation || heard || failed) return;
        const text = Array.from(event.results).filter(r => r.isFinal).map(r => r[0].transcript).join(' ').trim();
        if (text) { heard = true; onText(text.slice(0, 2000), { truncated: text.length > 2000 }); }
      };
      instance.onerror = event => {
        if (token !== generation) return;
        failed = true;
        stop();
        onState(event.error === 'not-allowed' ? 'Microphone permission denied. You can keep typing.' : 'Voice input failed. Try again or type your message.');
      };
      instance.onend = () => {
        if (token !== generation) return;
        recognition = null;
        generation++;
        if (!failed) onState(heard ? 'Review your transcript, then send.' : 'No speech detected. Try again or type.');
      };
      onState('Waiting for microphone permission…');
      instance.start();
    } catch { stop(); onState('Unable to start voice input. Please type your message.'); }
  }
  function speak(text, consent) {
    stop();
    if (!consent || !synthesis || !Utterance) return;
    const token = generation;
    try {
      const utterance = new Utterance(text);
      utterance.lang = 'en-US';
      utterance.onend = () => { if (token === generation) { generation++; onState('Ready'); } };
      utterance.onerror = () => { if (token === generation) { stop(); onState('Playback unavailable. Read the reply above.'); } };
      onState('Speaking');
      synthesis.speak(utterance);
    } catch { stop(); onState('Playback unavailable. Read the reply above.'); }
  }
  return { supported, start, stop, speak };
}
