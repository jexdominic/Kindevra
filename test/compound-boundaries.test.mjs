import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { replyTo } from '../public/support.js';
import { createSession, checkIn } from '../public/session.js';
const cases = JSON.parse(readFileSync(new URL('../evaluation/compound-scenarios.json', import.meta.url)));
for (const item of cases) test(`compound boundary: ${item.id}`, () => {
  for (const mode of [null, 'listen', 'steps']) {
    const session = mode ? createSession() : null;
    if (session) { session.preference = mode; checkIn(session, 'Bright'); }
    const reply = replyTo(item.input, 0, session);
    if (['medical', 'diagnosis'].includes(item.expected)) {
      assert.match(reply.text, /can’t diagnose/);
      assert.match(reply.text, /prescriber/);
      assert.doesNotMatch(reply.text, /take \d|reduce (?:your|the) dose/i);
      assert.equal(reply.source, item.expected === 'medical'
        ? 'https://www.nimh.nih.gov/health/topics/mental-health-medications'
        : 'https://www.nimh.nih.gov/health/topics/psychotherapies');
      if (item.pause) assert.match(reply.text, /stop the exercise/);
      assert.notEqual(reply.urgent, true);
    } else if (['urgent', 'harm'].includes(item.expected)) {
      assert.equal(reply.urgent, true);
      assert.match(reply.text, /emergency/);
      if (item.expected === 'harm') assert.match(reply.text, /can’t help/);
    } else if (item.expected === 'pause') assert.match(reply.text, /stop the exercise/);
    else assert.notEqual(reply.urgent, true);
    if (session) {
      assert.equal(session.exercisesPaused, item.pause);
      if (item.pause) {
        assert.match(replyTo('I am overwhelmed', 1, session).text, /paused/);
        assert.equal(replyTo('I want to die', 2, session).urgent, true);
      }
    }
  }
});
