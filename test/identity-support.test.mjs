import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { replyTo } from '../public/support.js';
import { createSession, checkIn } from '../public/session.js';
const cases = JSON.parse(readFileSync(new URL('../evaluation/identity-scenarios.json', import.meta.url)));
for (const item of cases) {
  test(`identity support: ${item.id}`, () => {
    for (const preference of [null, 'listen', 'steps']) {
      const session = preference ? createSession() : null;
      if (session) {
        session.preference = preference;
        checkIn(session, 'Bright');
        replyTo('Stop this exercise', 0, session);
      }
      const response = replyTo(item.input, 1, session);
      if (item.expected === 'support') {
        assert.match(response.text, /does not need a cure/);
        assert.match(response.text, /support/);
        assert.match(response.text, /pressure/);
        assert.match(response.text, /qualified professional/);
        assert.match(response.text, /your choice/);
        assert.doesNotMatch(response.text, /you must|tell your family|you are definitely|name three things/i);
        assert.equal(response.source, 'https://www.psychotherapy.org.uk/policy-and-research/public-policy/conversion-therapy/');
        assert.notEqual(response.urgent, true);
      } else if (item.expected === 'ordinary') {
        assert.notEqual(response.source, 'https://www.psychotherapy.org.uk/policy-and-research/public-policy/conversion-therapy/');
        assert.notEqual(response.urgent, true);
      } else if (item.expected === 'medical') assert.match(response.text, /prescriber/);
      else if (item.expected === 'dependency') assert.match(response.text, /cannot replace/);
      else {
        assert.equal(response.urgent, true);
        assert.match(response.text, /emergency/);
        if (item.expected === 'harm') assert.match(response.text, /can’t help/);
      }
      if (session) assert.equal(session.exercisesPaused, true);
    }
  });
}
