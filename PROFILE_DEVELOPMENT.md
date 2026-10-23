# Internal personalization development

Branch: `codex/private-user-profiles`. Keep this work in a draft pull request;
do not merge into main, enable auto-merge, or deploy it.

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

## Daily continuation at 18:30 Europe/Warsaw

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

Validation for this increment: `node --test` passes 75/75 checks;
`node evaluation/run.mjs` passes 13/13 scenarios. These are engineering checks,
not clinical validation. Browser interaction verification remains pending: the
in-app browser could not connect to the local preview in this environment.

- Extend explicit preference coverage with ambiguity and correction tests.
- Evaluate multi-turn usefulness and repetition with synthetic scenarios.
- Add browser lifecycle coverage, including queued updates and clear/reset.
- Scope authenticated storage, consent and retention before cross-visit memory.
- Keep clinical inference out of this profile; do not claim clinical validation.

Keep changes bounded and tested, update the existing pull request, and never
merge into main without a new explicit instruction from the user.
