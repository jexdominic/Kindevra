# Kindevra roadmap

## Complete
- [x] Responsive first app with guided conversation, check-in, and practice library.
- [x] Explicit prototype limitations and session-only privacy.
- [x] Source-backed initial educational content.
- [x] Automated response-boundary checks.

## Next daily increments
- [ ] Add keyboard and browser interaction tests for navigation, reset, and support dialog.
- [ ] Expand the reviewed knowledge schema: source, license, review status, contraindications, and retrieval tags.
- [ ] Add a server-only language-model adapter with an explicit opt-in disclosure before sending messages externally. Provider credentials must remain server-side.
- [ ] Build conversation safety evaluations covering indirect distress, negation, harmful requests, delusions, dependency, and medication questions. Keyword rules alone are insufficient.
- [ ] Add structured, multi-step exercises with user-controlled stopping and skipping.
- [ ] Arrange qualified clinical review before claiming therapeutic benefit or public clinical readiness.
- [ ] Add opt-in persistence with deletion/export and a documented retention policy.
- [ ] Prepare an installable app with deliberate offline behavior and no caching of private conversations.
- [ ] Assess authentication, rate limiting, privacy, accessibility, and deployment before public release.

Daily work should make a bounded, meaningful improvement, run relevant checks, and push source changes to the repository. Never commit user conversations or credentials.

## October 20 evaluation increment
- [x] Add source metadata with rights constraints and pending review status.
- [x] Add a 13-scenario reproducible evaluation and dated results (8 passed, 5 unresolved).
- [x] Improve indirect-distress prompts and exercise refusal; 6 unit checks pass.
- [ ] Address the five failures in evaluation/2026-10-20.md, then expand paraphrase and multi-turn coverage.

The broader knowledge-review and conversation-safety milestones above remain open.

## Adaptive support requirements
Follow REQUIREMENTS.md for future development. Prototype now has optional confirmed check-ins, change clarification, support preference and tentative text suggestions. Next: multi-turn and browser tests, refusal memory, broader clinician-reviewed state options, and the five unresolved safety scenarios. No cross-session tracking or clinical state detection is implemented.

## October 21 boundary increment
- [x] Add harmful-instruction refusal and human-support boundaries before personalized fallback replies.
- [x] Test both support modes and mood context; 18/18 unit tests pass.
- [x] Preserve original scenario fixtures: 10/13 now pass, with three unresolved failures.
- [x] Add NIMH self-care source metadata with rights and review status.
- [ ] Next: negation, unverified beliefs, and identity-sensitive responses; broaden quoted/hypothetical and multi-turn evaluations.

Earlier dated results remain historical. See evaluation/2026-10-21.md for current limitations. Refusal memory and browser tests remain pending.

## October 22 preference-memory increment
- [x] Remember requests to stop automatic exercises within the current session.
- [x] Require explicit resumption; preserve safety and professional-support boundaries.
- [x] Add five session-sequence checks: all 23 unit tests pass.
- [ ] Browser verification, richer refusal interpretation and the three known scenario failures remain open.

See evaluation/2026-10-22.md. This increment alone does not warrant a LinkedIn progress post.

## October 22 additional response-development increment
- [x] Add a source-grounded uncertainty and human-support response for selected unverified-experience wording.
- [x] Register NIMH and NSW Health sources with rights constraints, retrieval tags and pending clinical review.
- [x] Add 15 separate regression fixtures covering paraphrases, ordinary contexts and boundary priority in three session contexts; 38/38 unit tests pass.
- [x] Re-run unchanged original scenarios: 11/13 pass; preserve failure exit status.
- [ ] Resolve remaining crisis-negation and identity-respect failures; expand beyond developer-authored wording fixtures.
- [ ] Qualified clinical review and browser verification remain outstanding. No general psychosis detection, model training or clinical validation is claimed.

The earlier dated counts above are historical. Current results and limitations are recorded in evaluation/2026-10-22.md.

## October 23 identity-support increment
- [x] Add a bounded identity-respecting response to selected cure/change pressure and conversion questions.
- [x] Register UKCP primary guidance with rights constraints and pending clinical review.
- [x] Add 18 separate fixtures across three contexts; all 56 unit tests pass.
- [x] Preserve the original suite: 12/13 now pass, failure exit status retained.
- [ ] Resolve crisis negation, then broaden independent, multi-turn and bias evaluations; qualified clinical and browser review remain outstanding.

See evaluation/2026-10-23.md for current results and limitations. Earlier counts are historical.

## October 23 clarification increment
- [x] Handle a narrow explicit opening denial without treating it as a safety assessment; retain other crisis-language checks.
- [x] Add 12 separate fixtures across three contexts and a multi-turn regression; 69/69 unit tests pass.
- [x] Preserve all original scenarios: 13/13 now pass. Counts reflect fixture compliance only.
- [ ] Broaden negation, temporal context and implicit-danger evaluations with independent and clinical review; browser interaction checks remain outstanding.

See knowledge/negation-handling.md and the latest section of evaluation/2026-10-23.md. This does not establish clinical readiness or a LinkedIn milestone.

## Compound-request handling
- [x] Preserve exercise refusal alongside medical questions and recognized urgent language.
- [x] Link medication boundaries to a dedicated primary source with provenance and review status.
- [x] Verify 12 additional compound-request fixtures across three contexts; 81 unit tests and all 13 original scenarios pass.
- [ ] Broader intent combinations, independent evaluations and clinical review remain outstanding.

See evaluation/2026-10-24-compound-requests.md. Version 0.2.0 is unchanged.

## Knowledge integrity
- [x] Validate provenance, source references, rights-review status and summary content scope.
- [x] Exclude pending or rejected records from tag-based summary eligibility; approval records require evidence metadata.
- [x] Add 16 integrity tests; all 97 tests and 13 original scenarios pass.
- [ ] Verify qualified clinical and scoped rights approvals before retrieval integration. Evidence authenticity, source aging and runtime integration remain open.

See evaluation/2026-10-25-knowledge-integrity.md. No existing source was approved by this change.

## Grief support
- [x] Acknowledge selected personal grief disclosures with optional sharing and human-support options.
- [x] Add NHS provenance, retrieval tags and pending rights/clinical review status.
- [x] Add 15 separate fixtures and a session sequence; 113 tests and 13 original scenarios pass.
- [ ] Broader paraphrases, multi-turn understanding and independent clinical review remain open.

See evaluation/2026-10-26-grief.md. Version 0.2.0 is unchanged.

## Exercise-consent context
- [x] Distinguish selected genuine refusals from negated, quoted, hypothetical and unrelated mentions.
- [x] Preserve existing pauses until explicit resumption and retain medical/crisis boundaries.
- [x] Verify 19 additional tests; 132 tests and 13 original scenarios pass.
- [ ] Broader reported speech, complex negation and independent intent evaluation remain open.

See evaluation/2026-10-27-exercise-consent.md. Version remains 0.2.0.

## Evaluation provenance coverage
- [x] Label all 103 separate fixtures with a source or product-boundary basis.
- [x] Discover all seven scenario sets and reject missing references, malformed sets and duplicate IDs.
- [x] Verify six additional integrity tests; 138 total tests and 13 original scenarios pass.
- [ ] Independent source-to-assertion review and clinical scoring remain outstanding.

See evaluation/2026-10-28-provenance-coverage.md. Version remains 0.2.0.

## Professional-referral requests
- [x] Respond to selected care-finding requests with source-linked questions about choosing a professional.
- [x] Preserve higher-priority boundaries and exercise-pause state across 44 response checks.
- [x] Verify 149 tests, 13 original scenarios and 114 source references across eight sets.
- [ ] Broader language coverage, access-barrier evaluation and independent clinical review remain open.

See evaluation/2026-10-29-referral.md. Version remains 0.2.0.
