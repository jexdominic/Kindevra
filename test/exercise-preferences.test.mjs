import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, checkIn } from '../public/session.js';
import { replyTo } from '../public/support.js';

for (const preference of ['listen', 'steps']) {
  test(`exercise refusal persists across messages and mood changes in ${preference} mode`, () => {
    const session = createSession(); session.preference = preference;
    replyTo('Please stop the grounding exercise', 0, session);
    checkIn(session, 'Good');
    for (const text of ['I feel overwhelmed', 'I am stuck in my thoughts', 'What now?']) {
      const reply = replyTo(text, 1, session);
      assert.match(reply.text, /paused/);
      assert.doesNotMatch(reply.text, /name three things|noticing the thought|choose a practice/i);
    }
  });
}
test('resuming requires explicit request, not a negated or quoted mention', () => {
  const session = createSession(); session.preference = 'steps';
  replyTo('This breathing exercise makes me feel worse', 0, session);
  for (const text of ['Do not resume exercises', 'My friend said resume exercises', '"resume exercises"', 'yes']) {
    replyTo(text, 1, session); assert.equal(session.exercisesPaused, true);
  }
  assert.match(replyTo('Resume exercises', 2, session).text, /available again/);
  assert.equal(session.exercisesPaused, false);
  assert.match(replyTo('I feel overwhelmed', 3, session).text, /feet/);
});
test('pausing exercises does not suppress urgent help or medication boundaries', () => {
  const session = createSession();
  replyTo('Stop this exercise', 0, session);
  assert.equal(replyTo('I want to die', 1, session).urgent, true);
  assert.match(replyTo('Can you change my medication dose?', 2, session).text, /prescriber/);
  assert.match(replyTo('I only need you', 3, session).text, /cannot replace/);
  const referral = replyTo('I feel depressed and overwhelmed', 4, session);
  assert.match(referral.text, /professional/);
  assert.doesNotMatch(referral.text, /feet|name three things/);
});
test('a fresh session removes the exercise pause', () => {
  const session = createSession(); replyTo('Skip this exercise', 0, session);
  assert.equal(session.exercisesPaused, true);
  assert.equal(createSession().exercisesPaused, false);
});
