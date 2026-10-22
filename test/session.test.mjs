import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, checkIn, suggestMood } from '../public/session.js';
import { replyTo } from '../public/support.js';
test('check-ins distinguish changed choices without diagnosing a trend', () => {
  const session = createSession();
  checkIn(session, 'Good');
  assert.match(checkIn(session, 'Low'), /correcting your choice/);
  assert.equal(session.previousMood, 'Good');
  assert.equal(session.mood, 'Low');
  assert.throws(() => checkIn(session, 'depressed'));
});
test('narrow text suggestions abstain on negation, quotations and third-person wording', () => {
  assert.equal(suggestMood('I feel sad'), 'Low');
  assert.equal(suggestMood('I’m feeling overwhelmed.'), 'Heavy');
  for (const input of ['I am not sad', 'My friend is sad', '“I feel sad”', 'I was sad yesterday', 'I feel sad but happy too']) assert.equal(suggestMood(input), null);
});
test('suggestions do not mutate confirmed mood', () => {
  const session = createSession(); suggestMood('I feel happy');
  assert.equal(session.mood, null);
});
test('listening preference avoids unsolicited grounding', () => {
  assert.match(replyTo('I am overwhelmed', 0, createSession()).text, /without suggesting an exercise/);
});
test('step responses adapt to confirmed mood', () => {
  const session = createSession(); session.preference = 'steps';
  checkIn(session, 'Low'); assert.match(replyTo('What now?', 0, session).text, /small step/);
  checkIn(session, 'Good'); assert.match(replyTo('What now?', 0, session).text, /one thing that helped/);
});
test('positive mood and listening never suppress explicit danger or medical boundaries', () => {
  const session = createSession(); checkIn(session, 'Bright');
  assert.equal(replyTo('I want to die', 0, session).urgent, true);
  assert.match(replyTo('Change my medication dose', 0, session).text, /prescriber/);
});
test('new session drops old context', () => {
  const old = createSession(); checkIn(old, 'Low'); old.preference = 'steps';
  assert.deepEqual(createSession(), { mood: null, previousMood: null, preference: 'listen', exercisesPaused: false });
});
