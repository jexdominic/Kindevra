import { LocalChat } from './local-chat.js';
import { localBoundary } from './local-boundary.js';
import { createSession, checkIn, suggestMood } from './session.js';
import { replyTo, urgentSupport, exercises } from './support.js';
import { createProfileUpdater, modelPreferences } from './profile.js';
const profileUpdater = createProfileUpdater();
const localChat = new LocalChat();
const consent = document.querySelector('#local-consent');
const language = document.querySelector('#reply-language');
const localStatus = document.querySelector('#local-status');
let sending = false; let requestVersion = 0;
function cancelLocal() { requestVersion++; localChat.cancel(); sending=false; document.querySelector('.send').disabled=false; localStatus.textContent='Reply stopped.'; }
consent.addEventListener('change',()=>{cancelLocal();localChat.clear();localStatus.textContent=consent.checked?'Local conversation enabled. No cloud provider.':'Scripted mode. Local conversation off.';});
language.addEventListener('change',()=>{cancelLocal();localChat.clear();localStatus.textContent='English selected. Enable local conversation to begin.';});
document.querySelector('#stop-reply').addEventListener('click',cancelLocal);
const messages = document.querySelector('#messages');
let turn = 0;
let session = createSession();
let pendingMood = null;
function addMessage(text, who = 'kindevra', source, label) {
  const article = document.createElement('article');
  article.className = `message ${who}`;
  const name = document.createElement('span');
  name.className = 'message-name';
  name.textContent = who === 'user' ? 'YOU' : 'KINDEVRA';
  const body = document.createElement('p');
  body.textContent = text;
  article.append(name, body);
  if (source) {
    const a = document.createElement('a');
    a.href = source; a.textContent = label; a.target = '_blank'; a.rel = 'noopener noreferrer';
    article.append(a);
  }
  messages.append(article);
  article.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function reset() { localChat.clear(); cancelLocal(); localStatus.textContent=consent.checked?'Local conversation ready.':'Local conversation off. English is the default.';
  profileUpdater.clear(session);
  messages.replaceChildren(); turn = 0;
  session = createSession(); pendingMood = null;
  document.querySelector('#preference').value = 'listen';
  document.querySelector('#mood-suggestion').hidden = true;
  document.querySelector('#message').value = '';
  document.querySelectorAll('[data-mood]').forEach(b => b.setAttribute('aria-pressed', 'false'));
  document.querySelector('#mood-note').textContent = 'Just for this visit. There’s no right answer.';
  addMessage('Welcome. Scripted replies are the default. You can enable local conversation above for model-generated replies. Both modes can misunderstand you. What would you like to talk about?');
}
async function send(text) {
  text = text.trim().slice(0, 2000);
  if (!text || sending) return;
  const detected=localBoundary(text,language.value,session.preference,session.exercisesPaused);
  addMessage(text, 'user');
  let response = detected?.urgent ? detected : replyTo(text,turn++,session);
  if(response?.paused)session.exercisesPaused=true; if(response?.resumed)session.exercisesPaused=false; if(response?.forgotten){profileUpdater.clear(session);localChat.clear();}
  if(consent.checked && (!response || response.modelEligible)) {
    const requestId=++requestVersion; sending=true;document.querySelector('.send').disabled=true;
    localStatus.textContent='Kindevra is preparing a reply…';
    try {
      response=await localChat.reply(text,{language:language.value,preference:session.preference,exercisesPaused:session.exercisesPaused,...modelPreferences(session)});
      if(!response)return;
      localStatus.textContent=response.fallback?'Local reply withheld · Try again':response.generated?'Local model reply · May be inaccurate':'Scripted boundary response';
    } catch {localStatus.textContent='Local model did not respond. Try again or turn off local conversation.';return;}
    finally {if(requestId===requestVersion){sending=false;document.querySelector('.send').disabled=false;}}
  } else if(consent.checked) {
    if(response?.forgotten || response?.text.startsWith('Practice preferences forgotten'))localChat.clear();
    else localChat.remember(text,response.text);
    localStatus.textContent='Scripted boundary response';
  }
  addMessage(response.text, 'kindevra', response.source, response.label);
  if (!response.urgent) profileUpdater.observe(session, text);
  pendingMood = response.urgent ? null : suggestMood(text);
  document.querySelector('#mood-suggestion').hidden = !pendingMood;
  if (pendingMood) document.querySelector('#suggestion-text').textContent = `Would “${pendingMood.toLowerCase()}” fit as a check-in? I may have misunderstood. You can also select a different mood above.`;
  if (response.urgent) {cancelLocal();document.querySelector('#urgent-text').textContent=urgentSupport;document.querySelector('#support-dialog').showModal();}
}
document.querySelector('#chat-form').addEventListener('submit', e => {
  e.preventDefault(); const input = document.querySelector('#message'); send(input.value); input.value = ''; input.focus();
});
document.querySelectorAll('[data-prompt]').forEach(b => b.addEventListener('click', () => send(b.dataset.prompt)));
document.querySelector('#clear').addEventListener('click', reset);
function showView(id) { cancelLocal();
  document.querySelectorAll('.view').forEach(v => v.hidden = v.id !== id);
  document.querySelectorAll('[data-view]').forEach(b => {
    b.classList.toggle('active', b.dataset.view === id);
    b.setAttribute('aria-current', b.dataset.view === id ? 'page' : 'false');
  });
}
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));
function chooseMood(mood) { cancelLocal();
  const note = checkIn(session, mood);
  document.querySelectorAll('[data-mood]').forEach(m => m.setAttribute('aria-pressed', String(m.dataset.mood === mood)));
  document.querySelector('#mood-note').textContent = note;
  addMessage(note);
  pendingMood = null;
  document.querySelector('#mood-suggestion').hidden = true;
}
document.querySelectorAll('[data-mood]').forEach(b => b.addEventListener('click', () => chooseMood(b.dataset.mood)));
document.querySelector('#preference').addEventListener('change', e => { cancelLocal(); session.preference = e.target.value; });
document.querySelector('#accept-mood').addEventListener('click', () => { if (pendingMood) chooseMood(pendingMood); });
document.querySelector('#dismiss-mood').addEventListener('click', () => {
  pendingMood = null; document.querySelector('#mood-suggestion').hidden = true;
});
document.querySelector('#forget-mood').addEventListener('click', () => {
  cancelLocal(); localChat.clear(); session.mood = null; session.previousMood = null; pendingMood = null;
  document.querySelector('#mood-suggestion').hidden = true;
  document.querySelectorAll('[data-mood]').forEach(m => m.setAttribute('aria-pressed', 'false'));
  document.querySelector('#mood-note').textContent = 'Check-in context forgotten. Earlier chat messages remain until you clear the conversation.';
});
document.querySelector('#urgent-text').textContent = urgentSupport;
document.querySelector('#help').addEventListener('click', () => {cancelLocal();document.querySelector('#support-dialog').showModal();});
document.querySelector('#close-support').addEventListener('click', () => document.querySelector('#support-dialog').close());
Object.values(exercises).forEach(exercise => {
  const card = document.createElement('article'); card.className = 'exercise-card';
  const heading = document.createElement('h2'); heading.textContent = exercise.title;
  const text = document.createElement('p'); text.textContent = exercise.text;
  const source = document.createElement('a'); source.href = exercise.source; source.textContent = exercise.label; source.target = '_blank'; source.rel = 'noopener noreferrer';
  const button = document.createElement('button'); button.textContent = 'Bring into my space ↗';
  button.addEventListener('click', () => { showView('chat'); addMessage(exercise.text, 'kindevra', exercise.source, exercise.label); });
  card.append(heading, text, source, button); document.querySelector('#exercise-list').append(card);
});
reset();

window.addEventListener('pagehide',()=>localChat.clear());
