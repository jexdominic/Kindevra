# Combined referral and consent evaluation — 2026-10-30

Baseline: d70f1d9. Version: 0.3.0, unchanged.

“Stop the exercise. Help me find a therapist” previously paused exercises but omitted care-finding guidance. The response now combines refusal acknowledgment with the existing source-linked referral response. Recognition scope, medical guidance, emergency guidance and provider-verification limitations are unchanged. No new clinical claim or source content was added.

## Results

Four of nine new tests failed before implementation: three combined-request cases and the session-free case lacked referral detail. All nine now pass. Eight fixtures run in both support modes with a learned grounding preference, inspect retained preference and pause state, and check later stress and urgent messages. Counterexamples cover negated stopping, quoted referral, medication, crisis and harmful instructions. The earlier referral fixture for exercise refusal was updated to require both needs rather than documenting the former omission.

- `node --test`: 175 passed, zero failed.
- `node evaluation/run.mjs`: 13/13 original scenarios passed.
- `node knowledge/check.mjs`: nine source records, 122 references across nine files; zero eligible summaries.

Fixtures are synthetic, developer-authored and not held out. Phrase and state assertions do not establish empathy, clinical competence or general contextual understanding. The response still relies on narrow English patterns and cannot verify providers. All clinical and rights reviews remain pending. No browser verification was performed for this change. No conversation storage, external transmission, model training or paid service was introduced.

## Milestone assessment

The latest published LinkedIn baseline is the October 29 post at https://www.linkedin.com/feed/update/urn:li:activity:7521695118836260864/ and source commit 029ad6388a35c16320c8308494d1f8d25a4b7e28. It already covered visit-only personalization, exercise refusal, grief, referrals and source traceability. This bounded compound-response correction does not warrant repeating that milestone or another version increment. No social draft, attachment or publication is proposed.
