import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { replyTo } from '../public/support.js';
import { createSession, checkIn } from '../public/session.js';

const cases = JSON.parse(readFileSync(new URL('../evaluation/belief-scenarios.json', import.meta.url)));
for (const item of cases) {
  test(`belief response: ${item.id}`, () => {
    // Each fixture must pass without context and in both support modes,
    // including after a positive check-in and an exercise refusal.
    for (const preference of [null, 'listen', 'steps']) {
      const session = preference ? createSession() : null;
      if (session) {
        session.preference = preference;
        checkIn(session, 'Bright');
        replyTo('Please stop this grounding exercise', 0, session);
      }
      const response = replyTo(item.input, 1, session);
      if (item.expected === 'support') {
        assert.match(response.text, /cannot confirm/i);
        assert.match(response.text, /feel/i);
        assert.match(response.text, /mental health professional/i);
        assert.match(response.text, /someone you trust/i);
        assert.doesNotMatch(response.text, /you (?:have|are experiencing) (?:psychosis|schizophrenia)|definitely|name three things|noticing the thought/i);
        assert.equal(response.source, 'https://www.nimh.nih.gov/health/publications/understanding-psychosis');
        assert.notEqual(response.urgent, true);
      } else if (item.expected === 'ordinary') {
        assert.doesNotMatch(response.text, /cannot confirm/i);
        assert.notEqual(response.urgent, true);
      } else if (item.expected === 'medical') {
        assert.match(response.text, /prescriber/);
      } else {
        assert.equal(response.urgent, true);
        assert.match(response.text, /emergency/);
        if (item.expected === 'harm') assert.match(response.text, /can’t help/);
      }
      if (session) assert.equal(session.exercisesPaused, true);
    }
  });
}
