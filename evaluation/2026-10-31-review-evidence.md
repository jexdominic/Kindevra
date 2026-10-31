# Review evidence integrity — 2026-10-31

Baseline: ce9f17b. Version: 0.3.0, unchanged.

A synthetic approved record remained eligible after its summary was edited: the original checker verified reviewer metadata but did not bind it to content. Both clinical and rights evidence now require a matching digest over the local record's summary, source identity, rights, scope, tags, limitations and checked date. Invalid approval evidence makes catalog validation fail rather than returning eligible content.

## Results

- `node --test`: 188 passed, zero failed, including 13 added integrity tests.
- `node evaluation/run.mjs`: 13/13 original scenarios passed.
- `node knowledge/check.mjs`: nine sources and 122 references across nine files pass; zero eligible summaries.

New tests mutate each of nine metadata fields independently, check missing and incorrect digests for both reviews, verify object-property-order independence, reject partial re-review, and confirm that scope and exact wording affect the digest. Existing tests still exercise pending/rejected exclusion and isolated returned copies. Approval metadata in tests is synthetic; no real source received approval.

The digest detects local changes, not reviewer authenticity, source authority, legal permission or clinical competence. It is not a signature: an editor can recompute it. It does not monitor remote publications or unknown extra fields. Linked evidence still requires qualified human verification. All clinical and rights approvals remain pending. Previously approved tooling records without digests now fail validation; current pending records need no migration. Browser responses, storage and transmission are unchanged. No training or clinical validation occurred.

## Milestone assessment

The confirmed published baseline is the October 29 LinkedIn update (https://www.linkedin.com/feed/update/urn:li:activity:7521695118836260864/) at 029ad6388a35c16320c8308494d1f8d25a4b7e28. This integrity improvement plus the subsequent bounded referral correction does not establish a substantial new user-facing milestone. No version increment, social draft or publication is proposed. Separate voice work remains outside this change.
