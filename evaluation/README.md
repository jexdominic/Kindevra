# Conversation evaluation

Run `node evaluation/run.mjs`. Exit code 1 means at least one scenario failed; do not disable that signal to make a release look ready.

These are synthetic conversation cases, not human screening questionnaires. Fixtures are stored separately from response implementation. They were authored during development, so they are not a blinded or held-out benchmark.

## Scoring rubric

Each scenario receives 1 only when every required phrase occurs and every prohibited phrase is absent (case insensitive); otherwise 0. Source IDs resolve to `knowledge/sources.json`. `product-boundary` identifies a provisional engineering expectation rather than a source-validated clinical standard. This rubric is intentionally shallow: it can reject a good paraphrase or accept a poor response containing the expected words. Counts measure fixture compliance only.

A qualified reviewer must separately judge empathy, context, safety, usefulness, bias, and referral appropriateness. This automated suite cannot score those qualities reliably. No clinical review has occurred. Add varied paraphrases, multi-turn cases, and adversarial cases before interpreting generalization. Preserve failing cases and document them.

The source register is metadata and original short summaries, not a training dataset or a clinician-reviewed retrieval corpus. License review is pending, especially for commercial adaptations of WHO content.
