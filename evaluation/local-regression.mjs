import { readdir, readFile, writeFile } from 'node:fs/promises';
import { generateReply, MODEL, SYSTEM } from '../local-model.mjs';
import { localBoundary } from '../public/local-boundary.js';
import { createHash } from 'node:crypto';

const output = process.argv[2];
if (!output) throw new Error('Supply an output JSON path for synthetic evaluation results');
const directory = new URL('./', import.meta.url);
const files = (await readdir(directory)).filter(name => /^(?:.+-)?scenarios\.json$/.test(name)).sort();
const report = { model:MODEL, systemDigest:createHash('sha256').update(SYSTEM).digest('hex'), startedAt:new Date().toISOString(), mode:'English; fresh context per case; listen preference; no paused exercises', rubric:'Existing required/forbidden terms score lexical compatibility only. Route and pause expectations are preserved for manual review. No clinical pass score.', results:[] };
let errors = 0;
for (const file of files) {
  const fixtureText = await readFile(new URL(file,directory),'utf8');
  const fixtureDigest = createHash('sha256').update(fixtureText).digest('hex');
  for (const item of JSON.parse(fixtureText)) {
    const row = { file, fixtureDigest, id:item.id, input:item.input, basis:item.basis, expectations:item, reviewStatus:'pending' };
    const started = performance.now();
    try {
      const raw = await generateReply({consent:true,language:'en',preference:'listen',exercisesPaused:false,messages:[{role:'user',content:item.input}]}, {signal:AbortSignal.timeout(90000)});
      row.raw = raw;
      const boundary = localBoundary(item.input,'en','listen',false);
      row.integrated = boundary ? {...boundary,generated:false} : raw;
      if (Array.isArray(item.required) && Array.isArray(item.forbidden)) {
        row.lexical = {};
        for (const mode of ['raw','integrated']) {
          const text = row[mode].text.toLowerCase();
          const missing = item.required.filter(term => !text.includes(term.toLowerCase()));
          const forbidden = item.forbidden.filter(term => text.includes(term.toLowerCase()));
          row.lexical[mode] = {pass:!missing.length && !forbidden.length,missing,forbidden};
        }
      }
    } catch { row.error='Generation failed or timed out'; errors++; }
    row.elapsedMs = Math.round(performance.now()-started);
    report.results.push(row);
    await writeFile(output,JSON.stringify(report,null,2)+'\n');
    console.log(`${report.results.length} ${file}/${item.id}: ${row.error ?? (row.integrated.generated ? 'generated' : 'scripted boundary')}`);
  }
}
report.completedAt = new Date().toISOString();
report.summary = {cases:report.results.length, errors, scoredCases:report.results.filter(r=>r.lexical).length, rawLexicalPass:report.results.filter(r=>r.lexical?.raw.pass).length, integratedLexicalPass:report.results.filter(r=>r.lexical?.integrated.pass).length, scripted:report.results.filter(r=>r.integrated && !r.integrated.generated).length};
await writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.summary));
process.exitCode = errors || report.results.some(r=>r.lexical && (!r.lexical.raw.pass || !r.lexical.integrated.pass)) ? 1 : 0;
