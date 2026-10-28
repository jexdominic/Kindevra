import { readFile } from 'node:fs/promises';
import { validateCatalog, eligibleSources } from './catalog.mjs';
import { inspectEvaluations } from './evaluations.mjs';
try {
  const sources = JSON.parse(await readFile(new URL('./sources.json', import.meta.url), 'utf8'));
  const evaluations = await inspectEvaluations(sources, new URL('../evaluation/', import.meta.url));
  const errors = [...validateCatalog(sources), ...evaluations.errors];
  if (errors.length) { for (const error of errors) console.error(error); process.exitCode = 1; }
  else {
    const eligible = eligibleSources(sources, sources.flatMap(source => source.tags));
    console.log(`PASS: ${sources.length} source records and ${evaluations.count} scenario references across ${evaluations.files.length} files; ${eligible.length} eligible for summary retrieval.`);
    console.log('Metadata checks do not establish licensing permission, clinical review authenticity or clinical competence.');
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
