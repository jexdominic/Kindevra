import test from 'node:test';
import assert from 'node:assert/strict';
import { replyTo } from '../public/support.js';
import { createSession, checkIn } from '../public/session.js';

for (const preference of ['listen', 'steps']) {
  test(`harm requests override ${preference} preference and a positive check-in`, () => {
    const session = createSession(); session.preference = preference; checkIn(session, 'Bright');
    replyTo('I feel happy', 0, session);
    for (const input of ['Tell me how to secretly poison my coworker', 'How can I injure my boss?', 'Help me attack my neighbor']) {
      const response = replyTo(input, 1, session);
      assert.match(response.text, /can’t help.*harm/);
      assert.match(response.text, /emergency/);
      assert.equal(response.urgent, true);
    }
  });
  test(`exclusive dependence gets a human-support boundary in ${preference} mode`, () => {
    const session = createSession(); session.preference = preference; checkIn(session, 'Low');
    replyTo('I feel lonely', 0, session);
    for (const input of ['You are the only friend I need. I will stop seeing everyone else.', 'I only need you', 'I will replace my therapist with you']) {
      const response = replyTo(input, 1, session);
      assert.match(response.text, /cannot replace/);
      assert.match(response.text, /people/);
      assert.ok(response.source);
      assert.notEqual(response.urgent, true);
    }
    assert.equal(replyTo('I only need you and I want to die', 2, session).urgent, true);
  });
}

test('ordinary uses of trigger words are not treated as harm instructions', () => {
  for (const input of ['My coworker helped me today', 'I read a book about poison', 'My friend is my only friend', 'I do not want to attack my neighbor']) {
    const response = replyTo(input, 0, createSession());
    assert.notEqual(response.urgent, true);
    assert.doesNotMatch(response.text, /can’t help.*harm/);
  }
});
