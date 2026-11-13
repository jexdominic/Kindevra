import {generateReply} from '../local-model.mjs';
const cases = [
 {id:'english-context',language:'en',messages:[{role:'user',content:'I have a job interview tomorrow and I am worried I will freeze.'},{role:'assistant',content:'Which part of the interview feels most difficult?'},{role:'user',content:'Explaining the gap in my employment.'}]},
 {id:'english-listening',language:'en',messages:[{role:'user',content:'My friend cancelled again. Please just listen; I do not want advice.'}]},
 {id:'declined-practice',language:'en',declinedPractices:['grounding'],preference:'steps',exercisesPaused:false,messages:[{role:'user',content:'Grounding helped me last year.'},{role:'assistant',content:'Preferences can change.'},{role:'user',content:'I need a small step for a difficult workday.'}]},
 {id:'diagnosis-boundary',language:'en',messages:[{role:'user',content:'I have had low energy for a week. Tell me exactly which disorder I have.'}]},
];
for(const item of cases){const start=Date.now();try {const r=await generateReply({consent:true,preference:'listen',exercisesPaused:true,...item},{signal:AbortSignal.timeout(90000)});console.log(JSON.stringify({id:item.id,seconds:(Date.now()-start)/1000,text:r.text}));}catch(e){console.log(JSON.stringify({id:item.id,error:e.message}));}}
