import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateCatalog, eligibleSources } from '../knowledge/catalog.mjs';
const sources = JSON.parse(readFileSync(new URL('../knowledge/sources.json', import.meta.url)));
const scenarios = JSON.parse(readFileSync(new URL('../evaluation/scenarios.json', import.meta.url)));
const copy = () => structuredClone(sources);
test('catalog provenance and scenario references are complete', () => assert.deepEqual(validateCatalog(sources, scenarios), []));
test('pending sources never become eligible through tag matches', () => assert.deepEqual(eligibleSources(sources, sources.flatMap(s => s.tags)), []));
for (const field of ['publisher', 'rights', 'summary', 'tags', 'limitations', 'checked', 'clinicalReview', 'rightsReview', 'contentScope']) {
  test(`missing ${field} blocks eligibility`, () => {
    const data = copy(); delete data[0][field];
    assert.ok(validateCatalog(data).length);
    assert.throws(() => eligibleSources(data, ['crisis']));
  });
}
test('duplicate source IDs and dangling source references fail', () => {
  assert.ok(validateCatalog([...sources, sources[0]]).some(e => e.includes('duplicate id')));
  assert.ok(validateCatalog(sources, [{ basis: 'missing-source' }]).some(e => e.includes('unresolved')));
  assert.deepEqual(validateCatalog(sources, [{ basis: 'product-boundary' }]), []);
});
test('malformed catalog inputs produce diagnostics', () => {
  for (const data of [null, {}, [], [null], ['text']]) assert.ok(validateCatalog(data).length);
  assert.ok(validateCatalog(sources, [null]).length);
});
test('invalid calendar dates and unsafe URLs fail', () => {
  for (const [field, value] of [['checked', '2026-02-30'], ['url', 'http://example.org'], ['url', 'https://name:secret@example.org']]) {
    const data = copy(); data[0][field] = value; assert.ok(validateCatalog(data).length);
  }
});
test('an approval label alone does not establish eligibility', () => {
  const data = copy(); data[0].clinicalReview = 'approved'; data[0].rightsReview = 'approved';
  assert.throws(() => eligibleSources(data, data[0].tags));
});
test('both approvals and matching tags are required; returned records are isolated', () => {
  const data = copy(); const item = data[0];
  // Synthetic review metadata exercises the gate; no real source is approved.
  for (const field of ['clinicalReview', 'rightsReview']) {
    item[field] = 'approved';
    item[`${field}Evidence`] = { reviewer: 'Synthetic test reviewer', date: '2026-10-25', url: 'https://example.org/test-evidence' };
  }
  const result = eligibleSources(data, ['crisis']); assert.equal(result.length, 1);
  result[0].tags.push('changed'); assert.ok(!item.tags.includes('changed'));
  assert.deepEqual(eligibleSources(data, ['unmatched']), []);
  assert.deepEqual(eligibleSources(data, []), []);
  item.rightsReview = 'rejected'; assert.deepEqual(eligibleSources(data, ['crisis']), []);
  item.rightsReview = 'pending'; assert.deepEqual(eligibleSources(data, ['crisis']), []);
});
