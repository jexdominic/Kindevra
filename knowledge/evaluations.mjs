import { readdir, readFile } from 'node:fs/promises';
import { validateCatalog } from './catalog.mjs';

export async function inspectEvaluations(sources, directory) {
  const files = (await readdir(directory)).filter(name => /^(?:.+-)?scenarios\.json$/.test(name)).sort();
  const errors = [];
  let count = 0;
  if (!files.length) errors.push('No scenario files found');
  for (const file of files) {
    try {
      const rows = JSON.parse(await readFile(new URL(file, directory), 'utf8'));
      if (!Array.isArray(rows) || !rows.length) {
        errors.push(`${file}: expected nonempty scenario array`);
        continue;
      }
      count += rows.length;
      const ids = new Set();
      for (const [index, row] of rows.entries()) {
        if (typeof row?.id !== 'string' || !row.id.trim()) errors.push(`${file}[${index}]: missing scenario id`);
        else if (ids.has(row.id)) errors.push(`${file}[${index}]: duplicate scenario id ${row.id}`);
        else ids.add(row.id);
      }
      errors.push(...validateCatalog(sources, rows).map(error => `${file}: ${error}`));
    } catch (error) { errors.push(`${file}: ${error.message}`); }
  }
  return { files, count, errors };
}
