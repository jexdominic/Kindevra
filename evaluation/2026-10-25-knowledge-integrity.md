# Knowledge integrity evaluation — October 25, 2026

Baseline: main commit 471746b; version remains 0.2.0. The existing source catalog had descriptive rights notes and pending clinical review, but no automated integrity checks or explicit rights-review eligibility field.

Added validation for required provenance, valid calendar dates, credential-free HTTPS URLs, unique source IDs, tags, limitations, supported content scope and review statuses. The original scenario suite's source IDs must resolve or explicitly identify a product boundary. Original summaries become eligible for tag-based selection only with both approvals and evidence metadata. All eight real source records remain pending and return zero eligible results. No new psychology sources or approvals were added.

## Verification

- `node knowledge/check.mjs`: eight records and 13 scenario references pass; zero records eligible.
- `node --test`: 97/97 pass, including 16 new knowledge-integrity tests. Negative tests cover missing fields, duplicate IDs, unknown references, invalid inputs/dates/URLs and unsupported approvals. Synthetic evidence verifies positive selection, pending/rejected exclusions, tag matching and output isolation without approving real sources.
- `node evaluation/run.mjs`: 13/13 unchanged original scenarios pass.
- `git diff --check`: passes.

## Limits

The gate checks evidence shape, not its authenticity or the reviewer's qualifications. It cannot grant licenses, establish clinical competence, verify source authority or detect stale guidance. Clinical and scoped rights reviews are still pending. Existing browser responses do not use the selector; no claims about runtime retrieval safety or new conversation behavior follow from these checks. No external AI transmission, model training, paid services or private conversation data were involved. Browser verification was not required for this tooling-only change.

No version bump is warranted. This preparation does not meet the requested LinkedIn milestone threshold; broader evaluated user-facing capability is still needed. No LinkedIn action was taken. The introduction baseline remains 1c2462c in the reviewed context; no later approved or published progress post was identified there.
