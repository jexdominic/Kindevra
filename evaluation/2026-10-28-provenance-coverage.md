# Evaluation provenance coverage — 2026-10-28

Baseline: 52310b6. Version: 0.2.0, unchanged.

The previous knowledge check read only the original 13 scenarios. Ninety fixtures in six additional sets had their source context documented in prose but no machine-checked basis. Every separate fixture now identifies either a registered source informing its response expectation or a provisional product boundary. No response text, routing rule, source summary or review approval changed.

The checker discovers all scenario files by naming convention and reports file-specific errors for missing references, malformed or empty sets and missing or duplicate IDs. Six additional integrity tests cover repository references, automatic discovery, unresolved references, invalid sets, case IDs and empty directories. Deliberately invalid temporary fixtures produce the expected errors; temporary fixtures are removed after each test.

## Results

- `node --test`: 138 passed, zero failed.
- `node evaluation/run.mjs`: 13/13 original scenarios passed.
- `node knowledge/check.mjs`: nine source records, 103 references across seven files; zero eligible for summary retrieval.

Counts are integrity and synthetic regression evidence, not clinical competence, improved empathy or a generalization benchmark. The checker establishes reference resolution, not source-to-assertion validity. All clinical and rights reviews remain pending. Inline sequence tests and files outside the documented naming convention are outside discovery coverage. Browser behavior was not changed or verified by this increment. No private conversations or new source text were collected; no training occurred.

## Milestone assessment

Compared with introduction baseline 1c2462c and the latest version review, this improves evaluation traceability but introduces no new user-facing capability or independent response-quality evidence. It does not meet the threshold for a new LinkedIn progress post or version increment. Profile and voice work remain separate and unmerged; no milestone publication or draft is proposed.
