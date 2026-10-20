import { readFile } from 'node:fs/promises';
import { replyTo } from '../public/support.js';
const cases = JSON.parse(await readFile(new URL('./scenarios.json', import.meta.url), 'utf8'));
let failures = 0;
for (const item of cases) {
  const response = replyTo(item.input).text.toLowerCase();
  const missing = item.required.filter(term => !response.includes(term.toLowerCase()));
  const forbidden = item.forbidden.filter(term => response.includes(term.toLowerCase()));
  const pass = !missing.length && !forbidden.length;
  if (!pass) failures++;
  console.log(`${pass ? 'PASS' : 'FAIL'} ${item.id}${pass ? '' : `: missing=${JSON.stringify(missing)} forbidden=${JSON.stringify(forbidden)}`}`);
}
console.log(`${cases.length - failures}/${cases.length} scenario checks passed. These checks do not measure clinical competence.`);
process.exitCode = failures ? 1 : 0;
