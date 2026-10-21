# Kindevra product requirements

Research date: October 20, 2026. Audience hypothesis: adults seeking everyday emotional support. This is desk research, not research with Kindevra users or proof of treatment benefit.

## Evidence and expected needs

[S1: Yoo et al., 2026](https://mental.jmir.org/2026/1/e78288) interviewed 17 US adults with lived experience of depression using a chatbot probe. Themes included useful and personally applicable information, emotional validation alongside human connection, and tension between personalization and privacy. This small contextual study cannot establish what all users want.

[S2: APA App Evaluation Model](https://www.psychiatry.org/psychiatrists/practice/mental-health-apps/the-app-evaluation-model) provides a framework covering access, privacy, clinical foundation, usability and integration. It does not certify Kindevra.

Requirements below are product-design inferences from those sources and the user's request. No new user interviews have occurred.

## Prioritized requirements and acceptance criteria

| ID | Need / basis | Acceptance criteria | Status |
| --- | --- | --- | --- |
| P0-01 | Control over personalization (S1) | Optional check-ins; suggestions require confirmation; user can change or forget the active check-in | Implemented prototype |
| P0-02 | Appropriate conversation style (S1) | Listen-first default avoids unsolicited exercises; user can choose small-step suggestions; crisis and medical boundaries take precedence | Implemented prototype |
| P0-03 | Notice changes without false certainty (user request) | Compare successive confirmed check-ins; ask whether change or correction; never infer diagnosis, recovery or safety from a score | Implemented session-only |
| P0-04 | Privacy and transparency (S1, S2) | No uploads or persistence; explain memory-only state; clear conversation resets mood and preferences; forgetting mood explains earlier messages remain | Implemented prototype |
| P0-05 | Reliable safety boundaries (S2) | Resolve three remaining known scenario failures; test contextual and multi-turn cases; qualified review before broader use | Incomplete; release blocker |
| P0-06 | Honest limits (S1, S2) | Label scripted replies; show unknown state rather than manufacture certainty; no diagnosis, medication adjustment or guarantees | Partial; contextual accuracy remains limited |
| P1-01 | Wider state-sensitive support (user request) | Confirm anxiety, anger, grief, loneliness, numbness and mixed feelings; offer state-appropriate options reviewed by a clinician | Planned |
| P1-02 | Useful memory with control (S1) | Separate consent before cross-session storage; edit, export and delete; explicit retention | Planned |
| P1-03 | Accessible help (S2) | Keyboard and screen-reader testing, readable mobile layout, reduced-motion behavior, no compulsory disclosures | Manual testing pending |
| P1-04 | Adapt to feedback (S1) | Helpful / not helpful feedback changes the next suggestion; remember declined exercises in session; avoid repetitive prompts | Planned |
| P2-01 | Model-based interpretation | Evaluate ambiguity, negation, sarcasm, language variation and temporal context with abstention; explain interpretations and allow correction | Planned; no model connected |

## State and response contract

Current state contains current and previous confirmed mood plus support preference, only in page memory. A text suggestion is separate pending state. Only exact simple first-person phrases produce suggestions; ambiguous, quoted, third-person and negated inputs abstain. This is limited phrase recognition, not mental-state detection. No probabilities or clinical severity scores are produced.

| Situation | Required approach |
| --- | --- |
| Unknown or ambiguous mood | Ask or allow skipping; do not label |
| Confirmed heavy/low mood | Listen by default; optional manageable next step without pressure |
| Confirmed good/bright mood | Optional reflection; remain open to difficult feelings; never assume no crisis |
| Changed check-in | Ask whether it represents change or correction; do not claim improvement or worsening |
| Anxiety/overwhelm | Respect listening preference; optional grounding in step mode; allow stopping |
| Grief, anger, numbness or mixed feelings | Planned explicit state support; do not pretend current generic replies are tailored |
| Unverified beliefs, dependency, harmful requests | Remaining three-case backlog must be addressed before wider release |
| Potential immediate danger | Safety guidance overrides mood and preference; no automated diagnosis or promises of rescue |

The aim is to support the user's chosen next step, not to force an opposite emotion or suppress feelings. Crisis language recognition remains incomplete and can misread context.

## Validation plan

Recruit consenting adult volunteers and a qualified clinician for moderated testing with fictional scenarios. Do not require sensitive personal disclosures. Ask whether users understand the prototype, privacy choices, corrections and support options. Observe task completion and misunderstandings. Measure perceived usefulness and autonomy separately from clinical efficacy. Include people with varied accessibility, language and cultural needs; do not generalize a small convenience sample to everyone.

Engineering gates: unit checks; browser interaction coverage; multi-turn safety cases; source and license review; no severe unresolved safety findings before broader release. Clinical benefit would need a separate ethically reviewed study, not questionnaire scores assigned to the bot.

October 21 update: harmful-request and dependency fixtures now pass with bounded rules in both support modes. This is partial coverage, not closure of P0-05. See evaluation/2026-10-21.md.
