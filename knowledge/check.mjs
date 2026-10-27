import { readFile } from 'node:fs/promises';
import { validateCatalog, eligibleSources } from './catalog.mjs';
try {
  const sources = JSON.parse(await readFile(new URL('./sources.json', import.meta.url), 'utf8'));
  const scenarios = JSON.parse(await readFile(new URL('../evaluation/scenarios.json', import.meta.url), 'utf8'));
  const errors = validateCatalog(sources, scenarios);
  if (errors.length) { for (const error of errors) console.error(error); process.exitCode = 1; }
  else {
    const eligible = eligibleSources(sources, sources.flatMap(source => source.tags));
    console.log(`PASS: ${sources.length} source records and ${scenarios.length} scenario references; ${eligible.length} eligible for summary retrieval.`);
    console.log('Metadata checks do not establish licensing permission, clinical review authenticity or clinical competence.');
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
