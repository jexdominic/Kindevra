import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { inspectEvaluations } from '../knowledge/evaluations.mjs';
const sources = JSON.parse(await readFile(new URL('../knowledge/sources.json', import.meta.url), 'utf8'));
async function fixture(t, files) {
  const path = await mkdtemp(join(tmpdir(), 'kindevra-evaluation-'));
  t.after(() => rm(path, { recursive: true, force: true }));
  for (const [name, data] of Object.entries(files)) await writeFile(join(path, name), data);
  return pathToFileURL(path + '/');
}
const valid = JSON.stringify([{ id: 'sample', basis: 'nimh-warning' }]);
test('all repository scenario sets resolve their provenance', async () => {
  const result = await inspectEvaluations(sources, new URL('../evaluation/', import.meta.url));
  assert.deepEqual(result.errors, []);
  assert.ok(result.files.includes('exercise-consent-scenarios.json'));
  assert.ok(result.count > 13);
});
test('newly named scenario sets are discovered without a registry edit', async t => {
  const directory = await fixture(t, { 'scenarios.json': valid, 'new-context-scenarios.json': valid, 'notes.json': '{}' });
  const result = await inspectEvaluations(sources, directory);
  assert.equal(result.count, 2);
  assert.equal(result.files.length, 2);
  assert.deepEqual(result.errors, []);
});
test('missing and unknown source references identify the failing file', async t => {
  const directory = await fixture(t, { 'extra-scenarios.json': JSON.stringify([{ id: 'missing' }, { id: 'unknown', basis: 'unknown' }]) });
  const result = await inspectEvaluations(sources, directory);
  assert.equal(result.errors.length, 2);
  assert.ok(result.errors.every(error => error.includes('extra-scenarios.json') && error.includes('unresolved')));
});
test('malformed and empty sets cannot disappear from the results', async t => {
  const directory = await fixture(t, { 'broken-scenarios.json': '{', 'empty-scenarios.json': '[]', 'object-scenarios.json': '{}' });
  const result = await inspectEvaluations(sources, directory);
  assert.equal(result.errors.length, 3);
  assert.equal(result.files.length, 3);
});
test('missing and duplicate case IDs fail within each set', async t => {
  const directory = await fixture(t, { 'scenarios.json': JSON.stringify([{ basis: 'product-boundary' }, { id: 'same', basis: 'product-boundary' }, { id: 'same', basis: 'product-boundary' }]) });
  const result = await inspectEvaluations(sources, directory);
  assert.ok(result.errors.some(error => error.includes('missing scenario id')));
  assert.ok(result.errors.some(error => error.includes('duplicate scenario id')));
});
test('an empty evaluation directory fails closed', async t => {
  const result = await inspectEvaluations(sources, await fixture(t, {}));
  assert.deepEqual(result.errors, ['No scenario files found']);
});
