# Internal personalization development

## First increment — October 23, 2026

The app builds a bounded internal profile asynchronously from explicit practice
feedback. Exact statements such as “grounding helps me”, “thought exercises help
me”, “grounding does not help me” and “thought exercises do not help me” update
two preference flags and the most recently helpful practice. This is deliberately
narrow phrase recognition, not psychological analysis or model training.

Profiles exist only in browser memory, keyed to a session through a WeakMap.
There is no profile view, export endpoint, storage, analytics or network upload.
The queue retains only recognized enums and booleans, not message text. Clear
conversation deletes the profile and invalidates pending updates; refreshing
discards the entire visit. Forget check-in removes mood context but retains
practice preferences; profiles never contain mood or mood history.

Listening mode, exercise pauses, safety boundaries and current topic routing
take precedence over a preferred practice. A declined practice is not suggested
automatically; the library remains available by choice. Positive feedback does
not switch support mode or resume paused exercises. Contradictory explicit
feedback replaces the previous preference. Profiles never contain diagnoses,
identity traits, inferred vulnerability, contact information or transcripts.

Because this is a browser-only prototype, “internal” means absent from the
product UI and external transmissions, not secret from the person controlling
the browser or its developer tools. Persistent per-person profiles are not yet
implemented: there are no authenticated users to isolate them safely.

## Validation

### October 23 follow-up: corrections and consistent normalization

Fixed a regression where “grounding doesn't help me” could immediately produce
the previously preferred grounding exercise. Straight and curly apostrophe
contractions now count as explicit negative feedback. Profile parsing also uses
the same Unicode normalization as reply routing, avoiding acknowledgments for
feedback that the background updater would silently ignore. Quoted, conditional,
questioned, historical and qualified statements still abstain.

Reproduced both failures before the fix. Afterward, `node --test` passes 78/78
checks and the existing scenario suite passes 13/13. No storage or sharing was
added. Browser interaction verification remains pending.

These are engineering checks, not clinical validation. Browser interaction
verification remains pending because the local preview connection failed.

## Remaining work

- Broader explicit preference coverage and ambiguity handling.
- Multi-turn usefulness and repetition evaluation with synthetic scenarios.
- Browser lifecycle coverage, including queued updates and clear/reset.
- Authentication, consent and retention design for potential cross-visit memory.

## October 24 validation: session-scoped clearing

Pending profile updates now use cancellation tokens shared by session rather
than a counter owned by each updater. Clearing a session cancels all its pending
updates, including work queued by another updater, without discarding feedback
for unrelated sessions. Fresh feedback after clearing still works. Tokens and
preferences remain in weakly keyed, memory-only maps.

Two regression tests reproduced the previous cancellation failures before the
fix. The complete unit suite passes 80/80 checks and the response evaluation
passes 13/13 scenarios. These lifecycle checks exercise multiple updaters and
sessions; the current interface uses a single updater. Browser interaction
verification remains outstanding.

## October 25 validation: preference-only forgetting

The exact request “forget practice preferences” (optionally “please” or “my”)
now erases learned practice choices without clearing the conversation, check-in,
support mode or exercise pause. It invalidates pending updates for that session
through the same clearing operation as conversation reset. Other sessions remain
unaffected, and subsequent explicit feedback can establish new preferences.
Feedback acknowledgments explain the command. Quoted, negated, questioned and
mixed requests do not trigger erasure; existing safety routing takes precedence.

The unit suite passes 83/83 checks and the scenario suite passes 13/13. Coverage
includes preserving session state, cancelling queued learning, session isolation,
and rejecting ambiguous commands. Browser interaction verification remains pending.

## October 26 validation: retaining helpful alternatives

When the most recently preferred practice is declined, suggestions can fall back
 to the other practice only if it still has explicit positive feedback. Previously,
withdrawing the latest choice discarded the active preference even when another
practice was known to help. Unknown, declined and forgotten alternatives are not
selected. Listening mode, exercise pauses and safety routing keep precedence.

A multi-turn regression reproduced the lost preference before the fix. Both
practice orderings, declining both choices, forgetting alternatives and response
boundaries are covered. All 85 unit checks and 13 scenario checks pass. Browser
interaction verification remains pending.
