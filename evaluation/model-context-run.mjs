import {readFile,writeFile} from 'node:fs/promises';
import {generateReply} from '../local-model.mjs';
import {generateConversation,reviewReply} from '../response-review.mjs';
const cases=JSON.parse(await readFile(new URL('./model-context-cases.json',import.meta.url),'utf8'));
const results=[];
if(!process.argv[2])throw new Error('Output path required');
for(const item of cases){
 const body={consent:true,language:'en',exercisesPaused:false,...item};
 try {
 const raw=await generateReply(body,{signal:AbortSignal.timeout(90000)});
 const integrated=await generateConversation(body,{initialReply:raw,signal:AbortSignal.timeout(90000)});
 results.push({id:item.id,raw,integrated,remaining:reviewReply(integrated.text,body),semanticReview:'pending'});
 } catch {results.push({id:item.id,error:'Generation failed or timed out'});}
 await writeFile(process.argv[2],JSON.stringify(results,null,2)+'\n');
}
await writeFile(process.argv[2],JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
process.exitCode=results.some(r=>r.error || r.remaining.length)?1:0;
