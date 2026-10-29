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
## Continuous turn orchestration

A new internal conversation controller sequences listening, response generation, playback and the next listening turn. Stop and interruption abort the active operation and invalidate late completions. Consent is checked between stages; truncated transcripts become drafts for review, and urgent responses end the loop before playback or further capture.

All 112 Node tests pass, including nine orchestration tests for turn order, stopping in each phase, interruption, consent, transcript review, urgent routing through the existing response engine, and audio failure. The controller is not yet connected to browser audio or exposed in the interface. Its capture and playback adapters must release resources on abort. Browser adapters, explicit continuous-mode controls and real microphone/playback validation remain necessary before release.
## Browser audio adapters

Promise-based browser speech adapters now provide capture and playback for the continuous-turn controller. Abort signals reject pending operations and stop audio; completion detaches handlers and clears timers. Capture has a 30-second timeout and playback a 120-second timeout. Recognition errors retain their browser error code, unavailable services fail without capture, and transcript truncation is preserved for review.

All 123 Node tests pass, including 11 adapter tests and a simulated complete conversation turn. The continuous path remains internal and is not exposed in the interface. Live device behavior, browser compatibility and the proposed timeout durations still need validation. Existing manual dictation behavior is unchanged.

API references: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/abort and https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel
## Continuous conversation interface

Continuous mode is now connected to the browser audio adapters and the same session, turn counter, response selection and mood suggestions used by text messaging. A separate automatic-send checkbox explains the behavior before Start conversation can capture audio. The interface offers listening/thinking/speaking status, interruption during playback and Stop voice. Existing drafts prevent starting a continuous session. Typing, consent withdrawal, page hiding, navigation, clearing and urgent-support access stop voice through the shared stop entry point.

All 130 Node tests and 13 response scenarios pass. Seven new UI integration tests exercise continuous consent, draft protection, transcript/reply flow, interruption, urgent responses and stop triggers using simulated browser services. A local browser check verified module loading, consent gating and ordinary text replies after integration. Real microphone input, audible playback, device permission recovery and live interruption across supported browsers remain unverified. Continuous mode is experimental and not ready for release.
## Next increments

Remaining work includes real microphone testing across supported browsers, integration coverage for clear/navigation/urgent cancellation, state-driven controls, local-only speech support, and continuous turns with deliberate interruption behavior. Transcript review remains the default while these behaviors are evaluated.

Reference: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
