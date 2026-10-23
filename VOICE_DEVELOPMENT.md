# Voice conversation development

The voice prototype adds optional speech input and spoken replies to the existing conversation flow.

## 2026-10-23: first increment

- Opt-in browser speech recognition in English, editable transcript in the existing message composer, and optional spoken replies through the existing response/session flow.
- Explicit stop cancels recognition and playback; late callbacks are discarded. Clear, navigation, hidden tabs, urgent support and new messages stop audio.
- No raw audio storage by Kindevra. Browser providers may process audio and reply text externally; disclosure and visit-only consent precede use.
- 76 Node tests pass, including seven voice lifecycle tests. Browser UI checked: consent gate blocks start, typed message produces the expected response, and controls render correctly.
- Real microphone recognition and audible playback were not exercised. This is a draft prototype, not a verified hands-free call experience. Recognition support and provider behavior vary by browser.

## Next increments

Remaining work includes real microphone testing across supported browsers, integration coverage for clear/navigation/urgent cancellation, state-driven controls, local-only speech support, and continuous turns with deliberate interruption behavior. Transcript review remains the default while these behaviors are evaluated.

Reference: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
