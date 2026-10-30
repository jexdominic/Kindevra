// Audio adapters must release their resources when the supplied signal is aborted.
export function createVoiceConversation({ capture, respond, playback, hasConsent, onMessage, onState, onDraft = () => {} }) {
  let generation = 0;
  let controller = null;
  let active = false;

  function stop(state = 'idle') {
    generation++;
    active = false;
    const previous = controller;
    controller = null;
    previous?.abort();
    onState(state);
  }

  async function start() {
    stop();
    if (!hasConsent()) { onState('consent-required'); return; }
    active = true;
    controller = new AbortController();
    const signal = controller.signal;
    const token = generation;
    const current = () => active && generation === token && !signal.aborted;
    const allowed = () => {
      if (!current()) return false;
      if (!hasConsent()) { stop('consent-required'); return false; }
      return true;
    };
    let phase = 'capture';
    try {
      while (allowed()) {
        phase = 'capture';
        onState('listening');
        const result = await capture({ signal });
        if (!allowed()) return;
        const text = result?.text?.trim() || '';
        if (!text) { stop('no-speech'); return; }
        if (result.truncated || text.length > 2000) {
          stop('review-required');
          onDraft(text.slice(0, 2000));
          return;
        }
        onMessage({ role: 'user', text });
        if (!allowed()) return;
        phase = 'response';
        onState('thinking');
        const response = await respond(text, { signal });
        if (!allowed()) return;
        if (!response || typeof response.text !== 'string' || !response.text.trim()) {
          throw new Error('Empty response');
        }
        onMessage({ role: 'assistant', ...response });
        if (!allowed()) return;
        if (response.urgent) { stop('urgent'); return; }
        phase = 'playback';
        onState('speaking');
        await playback(response.text, { signal });
        if (!allowed()) return;
      }
    } catch (failure) {
      if (current()) {
        const code = failure?.code;
        let state = 'error';
        if (code === 'consent-required') state = 'consent-required';
        else if (phase === 'capture') {
          const captureErrors = {
            'not-allowed': 'microphone-denied', 'service-not-allowed': 'speech-service-denied',
            'audio-capture': 'microphone-unavailable', network: 'voice-network-error',
            'no-speech': 'no-speech', timeout: 'capture-timeout',
            'recognition-unavailable': 'recognition-unavailable'
          };
          if (Object.hasOwn(captureErrors, code)) state = captureErrors[code];
        } else if (phase === 'playback') state = code === 'timeout' ? 'playback-timeout' : 'playback-error';
        stop(state);
      }
    }
  }

  function interrupt() {
    if (!active) return Promise.resolve();
    return start();
  }

  return { start, stop: () => stop(), interrupt, get active() { return active; } };
}
