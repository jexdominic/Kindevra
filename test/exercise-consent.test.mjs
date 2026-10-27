import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { replyTo } from '../public/support.js';
import { createSession } from '../public/session.js';
const cases = JSON.parse(readFileSync(new URL('../evaluation/exercise-consent-scenarios.json', import.meta.url)));
for (const item of cases) test(`exercise consent: ${item.id}`, () => {
  for (const preference of ['listen', 'steps']) {
    const session = createSession(); session.preference = preference;
    const response = replyTo(item.input, 0, session);
    assert.equal(session.exercisesPaused, item.pause);
    if (item.id.startsWith('danger')) assert.equal(response.urgent, true);
    else if (item.id === 'medical') assert.match(response.text, /prescriber/);
    else if (item.pause) assert.match(response.text, /stop the exercise/);
    else assert.doesNotMatch(response.text, /We can stop the exercise/);
    if (item.pause) assert.match(replyTo('I feel overwhelmed', 1, session).text, /paused/);
  }
});
test('a negated stop request never resumes an already paused session', () => {
  const session = createSession(); replyTo('Stop this exercise', 0, session);
  replyTo('Do not stop this exercise', 1, session);
  assert.equal(session.exercisesPaused, true);
  replyTo('Resume exercises', 2, session);
  assert.equal(session.exercisesPaused, false);
});
