# Voice validation

## Current status

Automated tests use simulated speech services. Local browser checks cover interface loading, consent gating and text messaging. Real microphone input, audible replies and browser-specific recovery have not been verified. The feature remains experimental.

## Live checks

Use the feature checkout with `node server.mjs` and open the displayed loopback address in the browser under test. Record the browser version, operating system, microphone and output device. Use synthetic phrases, not personal conversations. Browser voice services may process audio and reply text externally; the in-app disclosures and consent choices apply.

| Check | Procedure | Expected result | Result |
| --- | --- | --- | --- |
| Consent | Leave both consent choices unchecked and select Start conversation. | No microphone capture; consent explanation appears. | Not performed |
| Turn-taking | Enable voice processing and automatic sending. Start and say "I just need to talk". After the reply, say another short phrase. | Each message appears once; replies are audible; listening resumes only after playback ends. | Not performed |
| Interruption | Select Interrupt reply while a reply is audible, then speak. | Playback stops and the next spoken message is captured once. | Not performed |
| Stop | Select Stop voice during listening, then repeat during playback. | Capture or playback ends; no automatic restart or late message appears. | Not performed |
| Draft editing | Type while listening. | Capture stops; delayed recognition does not modify the draft. | Not performed |
| Permission recovery | Deny microphone permission, then allow it in browser settings and explicitly restart. | Denial is explained; typing remains usable; a fresh start can capture speech. | Not performed |
| Clear and navigation | Clear during a voice turn; repeat while navigating to the library and while switching away from the tab. | Audio stops, no late response is added, and returning does not resume capture automatically. | Not performed |
| Urgent support | Open urgent support during a voice turn. | Audio stops; the support dialog remains usable; closing it does not restart voice. | Not performed |
| Consent withdrawal | Uncheck voice processing during a turn. | Audio stops and automatic sending is unchecked. | Not performed |
| Text fallback | Use a browser without recognition support and send a typed message. | Voice controls are unavailable; text conversation remains usable. | Not performed |

Successful simulated checks are not a substitute for these device tests. Record failures and retest fixes before marking a browser supported. No raw audio recording is required for this checklist.
