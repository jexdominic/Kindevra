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
