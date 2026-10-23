# Voice conversation development

Voice work lives on `codex/voice-conversations`; keep its PR in draft and never merge or deploy without explicit user approval.

## 2026-10-23: first increment

- Opt-in browser speech recognition in English, editable transcript in the existing message composer, and optional spoken replies through the existing response/session flow.
- Explicit stop cancels recognition and playback; late callbacks are discarded. Clear, navigation, hidden tabs, urgent support and new messages stop audio.
- No raw audio storage by Kindevra. Browser providers may process audio and reply text externally; disclosure and visit-only consent precede use.
- 76 Node tests pass, including seven voice lifecycle tests. Browser UI checked: consent gate blocks start, typed message produces the expected response, and controls render correctly.
- Real microphone recognition and audible playback were not exercised. This is a draft prototype, not a verified hands-free call experience. Recognition support and provider behavior vary by browser.

## Next increments

Test supported browsers with an explicitly authorized microphone session; add integration coverage for clear/navigation/urgent cancellation, improve state-driven controls, evaluate local-only speech support, and develop optional continuous turns with deliberate interruption behavior. Keep transcript review as the default until those behaviors are verified.

Reference: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
