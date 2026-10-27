import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { replyTo } from '../public/support.js';
import { createSession } from '../public/session.js';
const cases = JSON.parse(readFileSync(new URL('../evaluation/grief-scenarios.json', import.meta.url)));
const source = 'https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/grief-bereavement-loss/';
for (const item of cases) test(`grief: ${item.id}`, () => {
  for (const mode of [null, 'listen', 'steps']) {
    const session = mode ? createSession() : null;
    if (session) session.preference = mode;
    const reply = replyTo(item.input, 0, session);
    if (item.expected === 'grief') {
      assert.equal(reply.source, source);
      assert.match(reply.text, /loss/);
      assert.match(reply.text, /different/);
      assert.match(reply.text, /if you want/i);
      assert.match(reply.text, /professional/);
      assert.doesNotMatch(reply.text, /five stages|you must|move on|you have|name three things|will recover/i);
      assert.notEqual(reply.urgent, true);
    } else if (item.expected === 'urgent') assert.equal(reply.urgent, true);
    else if (item.expected === 'medical') assert.match(reply.text, /prescriber/);
    else if (item.expected === 'pause') assert.match(reply.text, /stop the exercise/);
    else if (item.expected === 'dependency') assert.match(reply.text, /cannot replace/);
    else { assert.notEqual(reply.source, source); assert.notEqual(reply.urgent, true); }
  }
});
test('grief support preserves an existing pause and later safety boundaries', () => {
  const session = createSession(); session.preference = 'steps';
  replyTo('Stop this exercise', 0, session);
  assert.equal(replyTo('I am grieving', 1, session).source, source);
  assert.equal(session.exercisesPaused, true);
  assert.match(replyTo('I feel overwhelmed', 2, session).text, /paused/);
  assert.equal(replyTo('I want to die', 3, session).urgent, true);
});
