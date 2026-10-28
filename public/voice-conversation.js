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
    try {
      while (allowed()) {
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
        onState('thinking');
        const response = await respond(text, { signal });
        if (!allowed()) return;
        if (!response || typeof response.text !== 'string' || !response.text.trim()) {
          throw new Error('Empty response');
        }
        onMessage({ role: 'assistant', ...response });
        if (!allowed()) return;
        if (response.urgent) { stop('urgent'); return; }
        onState('speaking');
        await playback(response.text, { signal });
        if (!allowed()) return;
      }
    } catch {
      if (current()) stop('error');
    }
  }

  function interrupt() {
    if (!active) return Promise.resolve();
    return start();
  }

  return { start, stop: () => stop(), interrupt, get active() { return active; } };
}
