import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { generateReply, validateChat } from './local-model.mjs';
import { localBoundary } from './public/local-boundary.js';
const files = Object.fromEntries(['app.js','support.js','belief-support.js','session.js','profile.js','local-boundary.js','local-chat.js','style.css'].map(name => ['/'+name,[name,name.endsWith('.css')?'text/css':'text/javascript']]));
files['/'] = ['index.html','text/html'];
export function createApp({generate = generateReply} = {}) {
  let busy = false;
  return createServer(async (req,res) => {
    const headers = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"};
    const json = (status,data) => {res.writeHead(status,{...headers,'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
    const address = req.socket.localPort;
    const hosts = [`127.0.0.1:${address}`,`localhost:${address}`];
    if (!hosts.includes(req.headers.host)) return json(403,{error:'Host rejected'});
    if (req.url === '/api/chat') {
      if (req.method !== 'POST') return json(405,{error:'POST required'});
      if (!hosts.map(h=>'http://'+h).includes(req.headers.origin) || req.headers['content-type'] !== 'application/json') return json(403,{error:'Same-origin JSON required'});
      if (busy) return json(429,{error:'A local reply is already running'});
      let body;
      try {
        let chunks=[],size=0;
        for await (const chunk of req) {size+=chunk.length;if(size>50000) {json(413,{error:'Message too large'});return;} chunks.push(chunk);}
        body=validateChat(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {return json(400,{error:'Invalid chat request'});}
      const boundary=localBoundary(body.messages.at(-1).content,body.language,body.preference,body.exercisesPaused);
      if (boundary) return json(200,{...boundary,generated:false});
      if (busy) return json(429,{error:'A local reply is already running'});
      busy=true;
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),90000);
      res.on('close',()=>{if(!res.writableEnded)controller.abort();});
      try {json(200,await generate(body,{signal:controller.signal}));}
      catch {if(!res.destroyed)json(503,{error:'Local model unavailable or reply cancelled. Try again or turn off local conversation.'});}
      finally {clearTimeout(timeout);busy=false;}
      return;
    }
    const file=files[new URL(req.url,'http://localhost').pathname];
    if(!file || !['GET','HEAD'].includes(req.method)){res.writeHead(404,headers);res.end('Not found');return;}
    try {const body=await readFile(new URL('public/'+file[0],import.meta.url));res.writeHead(200,{...headers,'Content-Type':file[1]+'; charset=utf-8'});res.end(req.method==='HEAD'?undefined:body);}
    catch {res.writeHead(500,headers);res.end('Unable to load the app');}
  });
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){const port=Number(process.env.PORT||4173);createApp().listen(port,'127.0.0.1',()=>console.log(`Kindevra: http://127.0.0.1:${port}`));}
