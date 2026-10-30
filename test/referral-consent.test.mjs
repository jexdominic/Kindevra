import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { replyTo } from '../public/support.js';
import { createSession } from '../public/session.js';
import { createProfileUpdater, preferredPractice } from '../public/profile.js';
const cases = JSON.parse(readFileSync(new URL('../evaluation/referral-consent-scenarios.json', import.meta.url)));
for (const item of cases) test(`referral and consent: ${item.id}`, async () => {
  for (const preference of ['listen', 'steps']) {
    const session = createSession(); session.preference = preference;
    createProfileUpdater().observe(session, 'grounding helps me');
    await Promise.resolve();
    const result = replyTo(item.input, 0, session);
    const pauses = item.expected !== 'referral';
    assert.equal(session.exercisesPaused, pauses);
    assert.equal(preferredPractice(session), 'grounding');
    if (['both', 'referral'].includes(item.expected)) {
      assert.match(result.text, /credentials/);
      assert.equal(result.source, 'https://www.nimh.nih.gov/health/topics/psychotherapies');
      assert.ok(!result.urgent);
    }
    if (['both', 'pause', 'medical'].includes(item.expected)) assert.match(result.text, /stop the exercise/);
    if (item.expected === 'medical') assert.match(result.text, /prescriber/);
    if (['urgent', 'harm'].includes(item.expected)) assert.equal(result.urgent, true);
    if (item.expected === 'harm') assert.match(result.text, /can’t help with instructions/);
    if (item.expected === 'pause') assert.ok(!result.text.includes('credentials'));
    if (pauses) assert.match(replyTo('I feel stressed', 1, session).text, /still paused/);
    assert.equal(replyTo('I want to die', 2, session).urgent, true);
  }
});
test('combined referral without a session does not claim a stored pause', () => {
  const result = replyTo('Stop the exercise. Help me find a therapist.');
  assert.match(result.text, /stop the exercise/);
  assert.match(result.text, /credentials/);
  assert.ok(!result.text.includes('paused for this visit'));
});
