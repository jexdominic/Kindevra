export class LocalChat {
  constructor(fetchImpl = (...args) => fetch(...args)) { this.fetchImpl=fetchImpl;this.history=[];this.controller=null;this.generation=0; }
  cancel() {this.generation++;this.controller?.abort();this.controller=null;}
  clear() {this.cancel();this.history=[];}
  remember(text,reply) {this.history.push({role:'user',content:text},{role:'assistant',content:reply.slice(0,2000)});this.history=this.history.slice(-10);}
  async reply(text,settings) {
    this.cancel();const generation=this.generation;const controller=new AbortController();this.controller=controller;
    const messages=[...this.history,{role:'user',content:text}];
    while(messages.length>1 && messages.reduce((n,m)=>n+m.content.length,0)>12000) messages.shift();
    try {
      const response=await this.fetchImpl('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...settings,consent:true,messages}),signal:controller.signal});
      if(!response.ok)throw new Error('Local model unavailable');
      const result=await response.json();
      if(generation!==this.generation)return null;
      if(typeof result.text!=='string'||!result.text.trim())throw new Error('Empty reply');
      this.remember(text,result.text);return result;
    } catch(error) {if(generation!==this.generation)return null;throw error;}
    finally {if(generation===this.generation)this.controller=null;}
  }
}
