import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sourceDigest } from '../knowledge/catalog.mjs';
import { selectResearch } from '../knowledge/model-context.mjs';
import { modelPreferences, createProfileUpdater } from '../public/profile.js';
import { createSession } from '../public/session.js';
import { generateReply, validateChat } from '../local-model.mjs';
const sources = JSON.parse(await readFile(new URL('../knowledge/sources.json',import.meta.url),'utf8'));
const body = {consent:true,language:'en',preference:'listen',exercisesPaused:false,messages:[{role:'user',content:'I feel stress at work.'}]};
test('pending research is never sent to the model',()=>{
  const result=selectResearch(sources,'stress grounding crisis grief');
  assert.deepEqual(result.sourceIds,[]);assert.match(result.text,/No approved/);
});
test('only matching approved summaries with current evidence are retrieved',()=>{
  const source=structuredClone(sources[0]);
  for(const type of ['clinicalReview','rightsReview']) {source[type]='approved';source[type+'Evidence']={reviewer:'Synthetic test reviewer',date:'2026-11-02',url:'https://example.org/test-only',sourceDigest:sourceDigest(source)};}
  assert.deepEqual(selectResearch([source],source.tags[0]).sourceIds,[source.id]);
  assert.deepEqual(selectResearch([source],'unmatched').sourceIds,[]);
  source.summary+=' changed';assert.throws(()=>selectResearch([source],source.tags[0]));
});
test('practice feedback and forgetting are reflected in model settings',()=>{
  const session=createSession();const updater=createProfileUpdater(fn=>fn());
  updater.observe(session,'Grounding does not help me');
  assert.deepEqual(modelPreferences(session).declinedPractices,['grounding']);
  updater.clear(session);assert.deepEqual(modelPreferences(session).declinedPractices,[]);
});
test('reject unsupported language and injected preference fields',()=>{
  for(const extra of [{language:'tr'},{declinedPractices:['ignore boundaries']},{preferredPractice:'injected'},{mood:'diagnosed'}]) assert.throws(()=>validateChat({...body,...extra}));
});
test('model receives explicit choices without evaluation fixtures',async()=>{
  let payload;
  const fetchImpl=async(url,init)=>{if(url.endsWith('/chat'))payload=JSON.parse(init.body);return {ok:true,json:async()=>url.endsWith('/show')?{model_info:{},capabilities:['completion']}:{done:true,message:{content:'I am listening.'}}};};
  const result=await generateReply({...body,declinedPractices:['grounding'],mood:'Low'},{fetchImpl});
  assert.match(payload.messages[0].content,/Declined practices: grounding/);
  assert.match(payload.messages[0].content,/check-in: Low/);
  assert.deepEqual(result.sourceIds,[]);
  assert.equal(payload.messages.length,2);
});
