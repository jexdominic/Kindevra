import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewReply,generateConversation} from '../response-review.mjs';
import {LocalChat} from '../public/local-chat.js';
const body={consent:true,language:'en',preference:'listen',exercisesPaused:false,messages:[{role:'user',content:'My interview is tomorrow.'}]};
test('exercise invitations respect mode, pause and declined practices',()=>{
  assert.deepEqual(reviewReply('Would you like to practice your answer?',body),['exercise-consent']);
  assert.deepEqual(reviewReply('Would you like to practice your answer?',{...body,preference:'steps'}),[]);
  assert.deepEqual(reviewReply('You could try grounding.',{...body,preference:'steps',declinedPractices:['grounding']}),['declined-practice']);
  assert.deepEqual(reviewReply('You said grounding was uncomfortable.',body),[]);
});
test('unsupported safety and dependency claims are flagged',()=>{
 assert.deepEqual(reviewReply("I'm glad you're not in immediate danger.",body),['unsupported-safety']);
 assert.deepEqual(reviewReply("I'm not going anywhere.",body),['dependency']);
 assert.deepEqual(reviewReply('Are you safe right now?',body),[]);
});
test('one repair is allowed and reviewed',async()=>{
 let calls=0;
 const result=await generateConversation(body,{generate:async(_,options)=>{calls++;if(calls===2)assert.match(options.revision,/preferences/);return {text:calls===1?'Would you like to practice?':'What feels difficult about tomorrow?',generated:true};}});
 assert.equal(calls,2);assert.equal(result.review.attempts,2);assert.equal(result.generated,true);
});
test('persistent violations produce a labeled fallback, never a third generation',async()=>{
 let calls=0;const result=await generateConversation(body,{generate:async()=>{calls++;return {text:'Would you like to practice?',generated:true};}});
 assert.equal(calls,2);assert.equal(result.generated,false);assert.equal(result.fallback,true);
});
test('cancellation prevents a repair',async()=>{
 const controller=new AbortController();controller.abort();let called=false;
 await assert.rejects(generateConversation(body,{signal:controller.signal,initialReply:{text:'Would you like to practice?'},generate:async()=>{called=true;}}));assert.equal(called,false);
});
test('withheld replies do not become conversation history',async()=>{
 const chat=new LocalChat(async()=>({ok:true,json:async()=>({text:'Please try again.',fallback:true,generated:false})}));
 await chat.reply('My interview is tomorrow.',body);assert.deepEqual(chat.history,[]);
});

test('permission to stop is not an exercise invitation',()=>{
 for(const text of ["Let's pause the exercise and check in.", 'You can pause or stop the exercise at any time.'])assert.deepEqual(reviewReply(text,body),[]);
 assert.deepEqual(reviewReply("Let's pause the exercise. Would you like to try breathing?",body),['exercise-consent']);
});
