# Voice conversation development

The voice prototype adds optional speech input and spoken replies to the existing conversation flow.

## 2026-10-23: first increment

- Opt-in browser speech recognition in English, editable transcript in the existing message composer, and optional spoken replies through the existing response/session flow.
- Explicit stop cancels recognition and playback; late callbacks are discarded. Clear, navigation, hidden tabs, urgent support and new messages stop audio.
- No raw audio storage by Kindevra. Browser providers may process audio and reply text externally; disclosure and visit-only consent precede use.
- 76 Node tests pass, including seven voice lifecycle tests. Browser UI checked: consent gate blocks start, typed message produces the expected response, and controls render correctly.
- Real microphone recognition and audible playback were not exercised. This is a draft prototype, not a verified hands-free call experience. Recognition support and provider behavior vary by browser.

## Voice lifecycle reliability

Completed recognition sessions now reject late transcripts and status callbacks. Recognition errors abort capture, and completed or failed playback ignores subsequent events. Exceptions from browser cancellation services no longer interrupt the surrounding messaging flow.

All 81 Node tests pass, including five additional regressions covering completion, permission failure recovery, cancellation exceptions and playback event ordering. These use simulated browser speech services; real microphone recognition and audible playback remain unverified. No UI layout or voice processing provider changed.
## Browser fallback and UI integration

The unavailable-input notice now survives conversation resets, stop actions and playback completion. Browsers without speech recognition can still use text messaging and supported speech playback.

All 98 Node tests pass. Five new UI integration tests cover unsupported input, consent gating and withdrawal, hidden-page and page-exit cleanup, and prefixed recognition appending to an editable draft. The tests use a simulated DOM and speech services; real microphone and audible playback validation remain outstanding.
## Transcript limits and draft protection

Typing in the composer stops voice capture and playback, preventing delayed recognition from modifying an edited draft. A full composer blocks microphone capture. Speech that exceeds the 2,000-character limit now produces an immediate status warning, including when a short transcript exceeds the remaining space in an existing draft.

All 103 Node tests pass, including five additional integration cases for draft edits, a full composer, transcript truncation and recovery. These checks use simulated DOM and speech services. Real microphone and audible playback validation remain outstanding.
## Next increments

Remaining work includes real microphone testing across supported browsers, integration coverage for clear/navigation/urgent cancellation, state-driven controls, local-only speech support, and continuous turns with deliberate interruption behavior. Transcript review remains the default while these behaviors are evaluated.

Reference: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
