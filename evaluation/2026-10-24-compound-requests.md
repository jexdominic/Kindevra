# Response evaluation — October 24, 2026

## Scope

Baseline: main commit 2f9f817, version 0.2.0. Baseline checks passed 69/69 unit tests and 13/13 original scenarios. Separate profile and voice branches were excluded from this change.

Previously, a message asking to stop an exercise and change a medication dose returned only the exercise-refusal response. A refusal accompanying recognized crisis language also did not persist the pause for later messages. Exercise consent is now recorded independently of response selection. Medical questions receive a boundary plus pause acknowledgment; urgent guidance remains first in recognized danger cases. Medication replies now link to NIMH medication guidance. Source provenance, reuse constraints and pending clinical review are recorded in the source register.

## Evidence

Twelve separate synthetic fixtures cover both message orders, discomfort, diagnosis-only and medication-only requests, direct and indirect danger, overdose wording, harm requests, ordinary refusal and stress. Nine failed before implementation: four missing combined medical responses, one medication-source mismatch and four missing pause-state updates after urgent responses. All twelve now pass in three contexts (no session, listening, small steps). Session cases also check the next stress message and a later danger message.

Final checks: `node --test` 81/81 pass; `node evaluation/run.mjs` 13/13 pass with original fixtures unchanged. `git diff --check` passes. No browser interaction or qualified clinical review was performed.

## Limits

These developer-authored cases are not held-out or clinical evaluations. Phrase-based routing still misreads some negated, quoted, historical and mixed-topic language and can miss danger. Passing checks shows regression compliance, not clinical competence. No model training, external inference, paid services or private conversation data were used. The work remains a mental wellness software prototype.

The version remains 0.2.0; this fix is recorded under Unreleased. Compared with introduction baseline 1c2462c, narrow response improvements alone still do not establish the broader verified milestone needed for a progress post. No new approved or published progress update was identified in the reviewed project context. No LinkedIn action was taken.
