# Changelog

## Unreleased

- Explicit requests to find or choose a mental health professional now receive source-linked referral guidance before generic stress exercises. Eleven added regressions cover both support modes and exercise-pause states.

- Extended provenance checks to all seven separate evaluation sets (103 fixtures), with explicit source or product-boundary labels and failures for malformed sets, unresolved references and duplicate case IDs.

- Reduced false exercise pauses caused by selected negated requests, quotations and unrelated mentions. Genuine refusals still persist alongside medical and urgent concerns; complex intent remains limited.

- Added source-linked support for selected grief disclosures, preserving existing safety boundaries and exercise pauses. Verified with 16 additional tests; broader language coverage and clinical review remain pending.

- Added local knowledge-catalog validation and review-gated summary selection. All eight source records remain pending; existing scripted responses are unchanged.

- Exercise refusals now persist alongside medical questions and recognized crisis language. Medication questions retain the prescriber boundary and link to NIMH medication guidance. Verified by 81 unit tests and 13 original scenarios; wording rules and clinical-review limitations remain.

Versioning now reserves increments for substantial features or major milestones. Minor improvements accumulate here until that threshold is met.

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
