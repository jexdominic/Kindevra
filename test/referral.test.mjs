import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { replyTo } from '../public/support.js';
import { createSession } from '../public/session.js';
const cases = JSON.parse(readFileSync(new URL('../evaluation/referral-scenarios.json', import.meta.url)));
for (const item of cases) test(`professional referral: ${item.id}`, () => {
  for (const preference of ['listen', 'steps']) for (const paused of [false, true]) {
    const session = createSession(); session.preference = preference; session.exercisesPaused = paused;
    const reply = replyTo(item.input, 0, session);
    if (['referral', 'both'].includes(item.expected)) {
      for (const phrase of ['credentials', 'fees', 'confidentiality', 'availability']) assert.ok(reply.text.includes(phrase), phrase);
      assert.equal(reply.source, 'https://www.nimh.nih.gov/health/topics/psychotherapies');
      assert.ok(!reply.urgent);
      assert.ok(!reply.text.includes('beneath your feet'));
    } else {
      assert.ok(!reply.text.includes('credentials'));
      if (item.expected === 'urgent') assert.equal(reply.urgent, true);
      if (item.expected === 'medical') assert.match(reply.text, /prescriber/);
      if (item.expected === 'pause') assert.match(reply.text, /stop the exercise/);
    }
    if (item.expected === 'both') assert.match(reply.text, /stop the exercise/);
    assert.equal(session.exercisesPaused, paused || ['pause', 'both'].includes(item.expected));
  }
});
