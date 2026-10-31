# Changelog

## Unreleased

- Combined exercise refusals and explicit care-finding requests now receive both pause acknowledgment and referral guidance. Learned preferences remain intact while automatic exercises stay paused.


## 0.3.0 — 2026-10-30

Source baseline: 029ad6388a35c16320c8308494d1f8d25a4b7e28.

Visit-only practice personalization is now merged: explicit feedback influences later small-step suggestions, declined practices are avoided, and another explicitly helpful practice can remain available. Preferences can be forgotten without clearing the conversation or check-in. Reset and refresh discard visit memory; queued updates cannot restore cleared preferences. Listening, exercise pauses and recognized safety concerns retain priority. No cross-visit storage or external transmission was added.

Verification: 166/166 unit tests, 13/13 original scenarios and nine source records with 114 references across eight sets pass. Documented manual browser checks cover preference changes, forgetting, reset, refresh, tab isolation and response precedence. Coverage remains limited to one browser; these checks do not establish clinical competence. Source approvals are pending and zero summaries qualify for retrieval. Voice is not included. No intentional breaking changes were identified.

Additional improvements included in this version:

- Explicit requests to find or choose a mental health professional now receive source-linked referral guidance before generic stress exercises. Eleven added regressions cover both support modes and exercise-pause states.

- Extended provenance checks to all seven separate evaluation sets (103 fixtures), with explicit source or product-boundary labels and failures for malformed sets, unresolved references and duplicate case IDs.

- Reduced false exercise pauses caused by selected negated requests, quotations and unrelated mentions. Genuine refusals still persist alongside medical and urgent concerns; complex intent remains limited.

- Added source-linked support for selected grief disclosures, preserving existing safety boundaries and exercise pauses. Verified with 16 additional tests; broader language coverage and clinical review remain pending.

- Added local knowledge-catalog validation and review-gated summary selection. All eight source records remain pending; existing scripted responses are unchanged.

- Exercise refusals now persist alongside medical questions and recognized crisis language. Medication questions retain the prescriber boundary and link to NIMH medication guidance. Verified by 81 unit tests and 13 original scenarios; wording rules and clinical-review limitations remain.



## 0.2.0 — 2026-10-24

Source baseline: 324df039805e27fa3bc8cec5254ada36c4ca8405. This version groups completed improvements on the main branch since the initial 0.1.0 prototype.

### Added
- Optional confirmed mood check-ins and listening or small-step preferences adapt scripted replies without inferring a diagnosis.
- Requests to stop exercises remain respected across subsequent messages until explicit resumption or reset.
- Source-linked responses address selected unverified experiences and identity-related change pressure without affirming unverified claims or treating identity as an illness.
- Expanded synthetic evaluations and source records include provenance, rights restrictions and pending review status.

### Fixed
- Harmful requests and exclusive-dependency wording take priority over mood-based replies.
- Selected indirect-distress language receives a direct safety question and human-support guidance.
- A narrow explicit opening denial no longer triggers emergency wording by itself; other recognized crisis language retains priority.

### Verification and limits
- 69/69 unit tests and 13/13 unchanged original scenarios pass on the versioned source.
- Scripted English rules can still miss danger or misread context. Tests measure fixture compliance, not clinical competence. Clinical review and browser interaction verification remain pending.
- No model integration, persistent accounts, cross-visit profiles, voice capability or production deployment is included. Profile and voice experiments remain outside this version.
- No intentional breaking interface or storage changes are recorded; state remains visit-only.

## 0.1.0 — 2026-10-20

Initial scripted mental wellness prototype: conversation interface, mood check-in, three sourced practices, urgent-support panel and memory-only conversation state. Initial source: 0de5e1d. This entry documents the original package version; it does not imply a historical release tag.
