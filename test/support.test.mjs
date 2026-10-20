import test from 'node:test';
import assert from 'node:assert/strict';
import { replyTo, exercises } from '../public/support.js';
test('urgent support takes priority over ordinary stress prompts', () => {
  for (const text of ['I am anxious and want to die', 'I might hurt myself', 'I took an overdose', 'I want to kill someone']) {
    assert.equal(replyTo(text).urgent, true);
    assert.match(replyTo(text).text, /emergency/);
  }
});
test('diagnosis and medication requests receive a boundary', () => {
  assert.match(replyTo('Diagnose my anxiety').text, /can’t diagnose/);
  assert.match(replyTo('What medication dose should I take?').text, /prescriber/);
});
test('psychology exercises include reputable references', () => {
  for (const exercise of Object.values(exercises)) assert.match(exercise.source, /^https:\/\/www\.(who\.int|nimh\.nih\.gov)\//);
});
test('unmatched user text is never interpolated into replies', () => {
  assert.ok(!replyTo('<script>alert(1)</script>').text.includes('<script>'));
});

test('indirect distress gets a safety question and human support', () => {
  for (const text of ['My family would be better off without me', 'I wish I wouldn’t wake up']) {
    const response = replyTo(text);
    assert.equal(response.urgent, true);
    assert.match(response.text, /thinking about suicide/);
    assert.match(response.text, /trusted person/);
  }
});
test('an exercise refusal is respected without suppressing explicit danger', () => {
  assert.match(replyTo('I do not want this breathing exercise').text, /do not have to/);
  assert.equal(replyTo('Stop the grounding exercise. I want to die').urgent, true);
});
