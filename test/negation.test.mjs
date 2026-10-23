import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { replyTo } from '../public/support.js';
import { createSession } from '../public/session.js';
const cases = JSON.parse(readFileSync(new URL('../evaluation/negation-scenarios.json', import.meta.url)));
for (const item of cases) {
  test(`negation: ${item.id}`, () => {
    for (const preference of [null, 'listen', 'steps']) {
      const session = preference ? createSession() : null;
      if (session) session.preference = preference;
      const response = replyTo(item.input, 0, session);
      if (['work', 'clarify'].includes(item.expected)) {
        assert.notEqual(response.urgent, true);
        assert.doesNotMatch(response.text, /emergency department|you are safe|no risk/i);
        assert.match(response.text, item.expected === 'work' ? /work/ : /clarifying/);
      } else if (item.expected === 'medical') assert.match(response.text, /prescriber/);
      else {
        assert.equal(response.urgent, true);
        assert.match(response.text, /emergency/);
        if (item.expected === 'harm') assert.match(response.text, /can’t help/);
      }
    }
  });
}
test('clarification does not unpause exercises or establish safety for later turns', () => {
  const session = createSession();
  replyTo('Stop this exercise', 0, session);
  assert.match(replyTo('I am not suicidal. Work is stressful.', 1, session).text, /paused/);
  assert.equal(session.exercisesPaused, true);
  assert.equal(replyTo('I want to die', 2, session).urgent, true);
});
