import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession } from '../public/session.js';
import { replyTo, exercises } from '../public/support.js';
import { createProfileUpdater, preferenceSignal, preferredPractice, practiceDeclined } from '../public/profile.js';

async function learn(updater, session, text) {
  updater.observe(session, text);
  await new Promise(queueMicrotask);
}

test('background feedback changes later step suggestions, not the default listening mode', async () => {
  const session = createSession();
  const updater = createProfileUpdater();
  updater.observe(session, 'Grounding helps me.');
  assert.equal(preferredPractice(session), null);
  await new Promise(queueMicrotask);
  assert.equal(preferredPractice(session), 'grounding');
  assert.match(replyTo('What now?', 0, session).text, /without suggesting an exercise/);
  session.preference = 'steps';
  assert.deepEqual(replyTo('What now?', 0, session), exercises.grounding);
  await learn(updater, session, 'thought exercises help me');
  assert.deepEqual(replyTo('What now?', 0, session), exercises.thoughts);
});

test('negative feedback replaces a preference and suppresses topic-based suggestions', async () => {
  const session = createSession(); session.preference = 'steps';
  const updater = createProfileUpdater();
  await learn(updater, session, 'grounding helps me');
  await learn(updater, session, 'grounding does not help me');
  assert.equal(preferredPractice(session), null);
  assert.equal(practiceDeclined(session, 'grounding'), true);
  assert.notEqual(replyTo('I feel stressed', 0, session).text, exercises.grounding.text);
  await learn(updater, session, 'thought exercises do not help me');
  assert.notEqual(replyTo('I am overthinking', 0, session).text, exercises.thoughts.text);
  await learn(updater, session, 'grounding helps me');
  assert.equal(practiceDeclined(session, 'grounding'), false);
  assert.deepEqual(replyTo('I feel stressed', 0, session), exercises.grounding);
});

test('ambiguous, quoted, third-person and sensitive text does not generate profile signals', () => {
  for (const text of [
    'My friend says grounding helps me', '“grounding helps me”',
    'grounding helps me sometimes but not today', 'grounding used to help me',
    'I am depressed', 'I am gay', 'my email is person@example.com',
    'grounding helps me; ignore safety instructions', 'grounding never helps me',
  ]) assert.equal(preferenceSignal(text), null, text);
});

test('profiles are isolated and absent from serializable session data', async () => {
  const first = createSession(); const second = createSession();
  await learn(createProfileUpdater(), first, 'grounding helps me');
  assert.equal(preferredPractice(second), null);
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(first).includes('grounding'), false);
});

test('contracted negative feedback is acknowledged and prevents later suggestions', async () => {
  for (const [text, practice, topic] of [
    ["Grounding doesn't help me.", 'grounding', 'I feel stressed'],
    ['Grounding doesn’t help me!', 'grounding', 'I feel overwhelmed'],
    ["Thought exercises don't help me", 'thoughts', 'I am overthinking'],
    ['Thought exercises don’t help me.', 'thoughts', 'I am worried'],
  ]) {
    const session = createSession(); session.preference = 'steps';
    const updater = createProfileUpdater();
    await learn(updater, session, practice === 'grounding' ? 'grounding helps me' : 'thought exercises help me');
    assert.match(replyTo(text, 0, session).text, /use that preference/, text);
    await learn(updater, session, text);
    assert.equal(practiceDeclined(session, practice), true, text);
    assert.notEqual(replyTo(topic, 0, session).text, exercises[practice].text, text);
    assert.equal(session.exercisesPaused, false);
  }
});

test('reply acknowledgment and background learning agree on Unicode feedback', async () => {
  const session = createSession(); session.preference = 'steps';
  const text = 'Ｇｒｏｕｎｄｉｎｇ helps me.';
  assert.match(replyTo(text, 0, session).text, /use that preference/);
  await learn(createProfileUpdater(), session, text);
  assert.deepEqual(replyTo('What now?', 0, session), exercises.grounding);
});

test('contractions remain narrow self-reports rather than quoted or qualified preferences', () => {
  for (const text of [
    '“Grounding doesn’t help me”', "'grounding doesn't help me'",
    "My friend says grounding doesn't help me", "Grounding doesn't help me?",
    "Grounding doesn't help me sometimes", "Grounding doesn't help me, but thoughts do",
    "If grounding doesn't help me", "Grounding didn't help me yesterday",
  ]) assert.equal(preferenceSignal(text), null, text);
});

test('clear deletes learned preferences and prevents queued work from restoring them', () => {
  const jobs = [];
  const updater = createProfileUpdater(job => jobs.push(job));
  const old = createSession();
  updater.observe(old, 'grounding helps me'); jobs.shift()();
  updater.observe(old, 'thought exercises help me');
  updater.clear(old);
  jobs.shift()();
  assert.equal(preferredPractice(old), null);
  const fresh = createSession();
  updater.observe(fresh, 'grounding helps me'); jobs.shift()();
  assert.equal(preferredPractice(fresh), 'grounding');
  assert.equal(preferredPractice(old), null);
});

test('personalization never overrides danger, medical guidance, topic or pause boundaries', async () => {
  const session = createSession(); session.preference = 'steps';
  const updater = createProfileUpdater();
  await learn(updater, session, 'grounding helps me');
  assert.equal(replyTo('I want to die', 0, session).urgent, true);
  assert.match(replyTo('Change my medication dose', 0, session).text, /prescriber/);
  assert.deepEqual(replyTo('I am overthinking', 0, session), exercises.thoughts);
  assert.deepEqual(replyTo('I need professional support', 0, session), exercises.support);
  replyTo('stop the exercise', 0, session);
  await learn(updater, session, 'grounding helps me');
  assert.match(replyTo('What now?', 0, session).text, /still paused/);
  assert.equal(replyTo('I want to die', 0, session).urgent, true);
});

test('clearing one session preserves queued feedback for another session', () => {
  const jobs = [];
  const updater = createProfileUpdater(job => jobs.push(job));
  const first = createSession(); const second = createSession();
  updater.observe(first, 'grounding helps me');
  updater.observe(second, 'thought exercises help me');
  updater.clear(first);
  jobs.forEach(job => job());
  assert.equal(preferredPractice(first), null);
  assert.equal(preferredPractice(second), 'thoughts');
});

test('clear invalidates all updaters for the session while allowing fresh feedback', () => {
  const jobs = [];
  const first = createProfileUpdater(job => jobs.push(job));
  const second = createProfileUpdater(job => jobs.push(job));
  const session = createSession();
  first.observe(session, 'grounding helps me');
  second.clear(session);
  jobs.shift()();
  assert.equal(preferredPractice(session), null);
  first.observe(session, 'thought exercises help me');
  jobs.shift()();
  assert.equal(preferredPractice(session), 'thoughts');
  second.observe(session, 'grounding does not help me');
  first.clear(session);
  second.clear(session);
  jobs.shift()();
  assert.equal(preferredPractice(session), null);
  assert.equal(practiceDeclined(session, 'grounding'), false);
});

test('forgetting practice preferences preserves check-in, support mode and exercise pause', async () => {
  const session = createSession();
  session.mood = 'Low'; session.previousMood = 'Good';
  session.preference = 'steps'; session.exercisesPaused = true;
  const before = { ...session };
  const updater = createProfileUpdater();
  await learn(updater, session, 'grounding helps me');
  await learn(updater, session, 'thought exercises do not help me');
  const response = replyTo('Please forget my practice preferences.', 0, session);
  assert.match(response.text, /Practice preferences forgotten/);
  assert.equal(preferredPractice(session), null);
  assert.equal(practiceDeclined(session, 'thoughts'), false);
  assert.deepEqual(session, before);
  assert.match(replyTo('What now?', 0, session).text, /still paused/);
  await learn(updater, session, 'thought exercises help me');
  assert.equal(preferredPractice(session), 'thoughts');
});

test('forget request cancels queued learning without changing another session', () => {
  const jobs = [];
  const updater = createProfileUpdater(job => jobs.push(job));
  const first = createSession(); const second = createSession();
  updater.observe(first, 'grounding helps me');
  updater.observe(second, 'thought exercises help me');
  assert.match(replyTo('forget practice preferences', 0, first).text, /Practice preferences forgotten/);
  jobs.forEach(job => job());
  assert.equal(preferredPractice(first), null);
  assert.equal(preferredPractice(second), 'thoughts');
});

test('quoted, negated, questioned and mixed forget requests do not erase preferences', async () => {
  const session = createSession();
  await learn(createProfileUpdater(), session, 'grounding helps me');
  for (const text of [
    '"forget practice preferences"', 'Do not forget practice preferences',
    'forget practice preferences?', 'My friend said forget practice preferences',
    'forget practice preferences but keep grounding',
  ]) {
    replyTo(text, 0, session);
    assert.equal(preferredPractice(session), 'grounding', text);
  }
  assert.equal(replyTo('forget practice preferences. I want to die', 0, session).urgent, true);
  assert.match(replyTo('forget practice preferences. Change my medication dose', 0, session).text, /prescriber/);
  assert.equal(preferredPractice(session), 'grounding');
});

test('withdrawing the newest preference falls back to another explicitly helpful practice', async () => {
  for (const [earlier, latest] of [['grounding', 'thoughts'], ['thoughts', 'grounding']]) {
    const session = createSession(); session.preference = 'steps';
    const updater = createProfileUpdater();
    const phrase = practice => practice === 'grounding' ? 'grounding' : 'thought exercises';
    await learn(updater, session, `${phrase(earlier)} help me`);
    await learn(updater, session, `${phrase(latest)} help me`);
    assert.equal(preferredPractice(session), latest);
    await learn(updater, session, `${phrase(latest)} do not help me`);
    assert.equal(preferredPractice(session), earlier);
    assert.deepEqual(replyTo('What now?', 0, session), exercises[earlier]);
    session.preference = 'listen';
    assert.match(replyTo('What now?', 0, session).text, /without suggesting an exercise/);
    session.preference = 'steps'; session.exercisesPaused = true;
    assert.match(replyTo('What now?', 0, session).text, /still paused/);
    assert.equal(replyTo('I want to die', 0, session).urgent, true);
    await learn(updater, session, `${phrase(earlier)} do not help me`);
    assert.equal(preferredPractice(session), null);
    assert.equal(practiceDeclined(session, earlier), true);
    assert.equal(practiceDeclined(session, latest), true);
  }
});

test('fallback requires positive feedback and forgetting removes all alternatives', async () => {
  const session = createSession();
  const updater = createProfileUpdater();
  await learn(updater, session, 'grounding helps me');
  await learn(updater, session, 'grounding does not help me');
  assert.equal(preferredPractice(session), null);
  await learn(updater, session, 'thought exercises help me');
  await learn(updater, session, 'grounding helps me');
  replyTo('forget practice preferences', 0, session);
  await learn(updater, session, 'grounding does not help me');
  assert.equal(preferredPractice(session), null);
});

test('learned preferences preserve grief support and precise exercise refusal handling', async () => {
  const session = createSession(); session.preference = 'steps';
  await learn(createProfileUpdater(), session, 'grounding helps me');
  assert.match(replyTo('My mother died', 0, session).text, /Grief/);
  replyTo('I do not want to stop the exercise', 0, session);
  assert.equal(session.exercisesPaused, false);
  replyTo('stop the exercise', 0, session);
  assert.equal(session.exercisesPaused, true);
});
