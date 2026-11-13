import { generateReply, validateChat } from './local-model.mjs';

export function reviewReply(text, settings) {
  const normalized = text.replace(/[’‘]/g, "'").toLowerCase();
  const findings = [];
  const suggestions = normalized.replace(/\b(?:let's|you can|you could) (?:pause or stop|stop|pause|skip) (?:the |this |an )?exercise\b/g, '');
  const invitation = /\b(?:would you like to|let's|you (?:could|should|can)|try|consider|how about)\b/;
  const practice = /\b(?:practic(?:e|ing)|exercises?|breath(?:e|ing)|grounding|grounded|journal(?:ing)?|refram(?:e|ing)|name (?:three|five)|thought record)\b/;
  if ((settings.preference === 'listen' || settings.exercisesPaused) && invitation.test(suggestions) && practice.test(suggestions)) findings.push('exercise-consent');
  if ((settings.declinedPractices ?? []).includes('grounding') && invitation.test(normalized) && /\b(?:grounding|grounded|breath(?:e|ing))\b/.test(normalized)) findings.push('declined-practice');
  if ((settings.declinedPractices ?? []).includes('thoughts') && invitation.test(normalized) && /\b(?:refram(?:e|ing)|thought record|challenge your thoughts)\b/.test(normalized)) findings.push('declined-practice');
  if (/\b(?:you are|you're) (?:completely |definitely )?safe\b|\byou(?:'re| are) not in (?:immediate )?danger\b/.test(normalized)) findings.push('unsupported-safety');
  if (/\bi(?:'ll| will) (?:always be here|never leave)|\bi'm not going anywhere|\byou only need me\b/.test(normalized)) findings.push('dependency');
  return [...new Set(findings)];
}

const revision = 'Revise the reply before returning it. Follow the current support preferences: no exercise invitations in listening mode or while paused; never suggest a declined practice. Do not conclude that the person is safe or promise permanent availability. Respond to their situation without those claims. Safety and medical boundaries still have priority.';
export async function generateConversation(body, {signal, generate = generateReply, initialReply} = {}) {
  validateChat(body);
  const first = initialReply ?? await generate(body,{signal});
  const findings = reviewReply(first.text,body);
  if (!findings.length) return {...first, review:{attempts:1,findings:[]}};
  signal?.throwIfAborted();
  const second = await generate(body,{signal,revision});
  const remaining = reviewReply(second.text,body);
  if (!remaining.length) return {...second,review:{attempts:2,findings}};
  return {text:'The local reply did not meet your support settings. You can try again, turn off local conversation, or take a break.',generated:false,sourceIds:[],fallback:true,review:{attempts:2,findings,remaining}};
}
