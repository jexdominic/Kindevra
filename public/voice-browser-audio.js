export function createBrowserVoiceAudio({
  Recognition, synthesis, Utterance, hasConsent,
  setTimer = setTimeout, clearTimer = clearTimeout,
  captureTimeout = 30000, playbackTimeout = 120000
}) {
  const error = code => Object.assign(new Error(code), { code });

  function operation(signal, timeout, setup) {
    return new Promise((resolve, reject) => {
      if (!hasConsent()) { reject(error('consent-required')); return; }
      if (signal?.aborted) { reject(error('aborted')); return; }
      let settled = false;
      let dispose = () => {};
      let timer;
      const finish = (failure, value) => {
        if (settled) return;
        settled = true;
        clearTimer(timer);
        signal?.removeEventListener('abort', abort);
        try { dispose(Boolean(failure)); } catch {}
        if (failure) reject(failure); else resolve(value);
      };
      const abort = () => finish(error('aborted'));
      signal?.addEventListener('abort', abort, { once: true });
      timer = setTimer(() => finish(error('timeout')), timeout);
      try {
        const resource = setup(finish);
        dispose = resource.dispose;
        if (signal?.aborted || !hasConsent()) {
          finish(error(signal?.aborted ? 'aborted' : 'consent-required'));
          return;
        }
        resource.start();
      } catch (failure) { finish(failure); }
    });
  }

  function capture({ signal } = {}) {
    return operation(signal, captureTimeout, finish => {
      if (!Recognition) throw error('recognition-unavailable');
      const recognition = new Recognition();
      let text = '';
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = event => {
        text = Array.from(event.results).filter(result => result.isFinal)
          .map(result => result[0].transcript).join(' ').trim();
      };
      recognition.onerror = event => finish(error(event.error || 'recognition-error'));
      recognition.onend = () => finish(null, { text: text.slice(0, 2000), truncated: text.length > 2000 });
      return {
        start: () => recognition.start(),
        dispose: failed => {
          recognition.onresult = recognition.onerror = recognition.onend = null;
          if (failed) recognition.abort();
        }
      };
    });
  }

  function playback(text, { signal } = {}) {
    return operation(signal, playbackTimeout, finish => {
      if (!synthesis || !Utterance) throw error('playback-unavailable');
      const utterance = new Utterance(text);
      utterance.lang = 'en-US';
      utterance.onend = () => finish(null);
      utterance.onerror = event => finish(error(event.error || 'playback-error'));
      return {
        start: () => synthesis.speak(utterance),
        dispose: failed => {
          utterance.onend = utterance.onerror = null;
          if (failed) synthesis.cancel();
        }
      };
    });
  }
  return { capture, playback };
}
