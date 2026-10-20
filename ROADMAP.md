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
