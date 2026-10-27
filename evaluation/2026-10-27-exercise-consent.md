# Response evaluation — October 27, 2026

Baseline: main commit 03d767b, version 0.2.0. Exercise refusal previously matched a stop/decline word anywhere in the message together with any exercise word. It incorrectly paused suggestions for negated stop requests, unrelated clauses, quotations, hypothetical questions and third-person reports.

The matcher now recognizes selected clause-opening requests, direct first-person refusals and discomfort statements. Double-quoted spans are excluded. Separate sentences, commas and contrast clauses are considered independently. Exercise consent remains visit-only; a negated stop request does not resume a prior pause. Explicit resumption and reset retain their existing behavior. Risk and medical checks still use the complete message.

## Verification

Nine of 19 new tests failed before the change. All 132 tests now pass. Eighteen separate fixtures run in listening and step modes; a further sequence checks pause/resume behavior. Coverage includes contractions, unrelated clauses, negation, discomfort, quotes, hypothetical and third-person wording, mixed intent, medication and danger. The unchanged original suite passes 13/13. Knowledge checks pass for nine sources and 13 references; zero sources are eligible for summary retrieval. `git diff --check` passes.

## Limits and provenance

The expected consent behavior is a product boundary, not a clinical protocol. Existing exercise context is linked to `who-stress`; this change adds no psychological claims or source approvals. Clause matching remains limited English syntax. Embedded requests, single-quoted speech, reported requests without quotes, historical wording and more complex negation may be missed or misread. It is not general intent understanding. No browser interaction or clinical review was performed. No model training, external inference, paid services or private conversations were used.

Version stays 0.2.0 with the fix under Unreleased. The reviewed context still identifies 1c2462c as the introduction baseline and no later approved/published progress post. This bounded correction does not meet the substantial LinkedIn milestone threshold. No LinkedIn action was taken.
