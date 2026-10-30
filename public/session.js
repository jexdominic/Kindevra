export const moods = ['Heavy', 'Low', 'Okay', 'Good', 'Bright'];
export function createSession() {
  return { mood: null, previousMood: null, preference: 'listen', exercisesPaused: false };
}
export function checkIn(session, mood) {
  if (!moods.includes(mood)) throw new Error('Unknown mood');
  const previousMood = session.mood;
  session.previousMood = previousMood;
  session.mood = mood;
  return previousMood && previousMood !== mood
    ? `Your check-in changed from ${previousMood.toLowerCase()} to ${mood.toLowerCase()}. Does that reflect a change in how you feel, or were you correcting your choice?`
    : `You chose ${mood.toLowerCase()}. What would feel supportive right now?`;
}
// Narrow explicit first-person wording only. Suggestions never update state.
export function suggestMood(text) {
  const normalized = text.trim().toLowerCase().replace(/[’‘]/g, "'");
  if (/[“”"'«»]/.test(normalized.replace(/\bi'm\b/g, 'i am'))) return null;
  const match = /^(?:i feel|i am feeling|i'm feeling|i am|i'm) (sad|low|happy|good|okay|overwhelmed)[.!]?$/.exec(normalized);
  if (!match) return null;
  return { sad: 'Low', low: 'Low', happy: 'Good', good: 'Good', okay: 'Okay', overwhelmed: 'Heavy' }[match[1]];
}
export function adaptiveReply(session, text = '', turn = 0) {
  if (session.preference === 'listen') {
    // Match a direct report without inferring how a busy day felt.
    const busyDay = /^(?:my day (?:was|is|has been) (?:really |very |so )?busy|i had a (?:really |very |so )?busy day)[.!]?$/i.test(text.trim());
    const prompts = busyDay ? [
      'You said your day was busy. What took up most of your time?',
      'What was the busiest part of your day, and how did it feel for you?',
      'Was there a particular moment from that busy day you wanted to talk about?',
    ] : [
      'I can make space for what you want to share without suggesting an exercise. What would you like me to understand about this?',
      'Which part would you like to say more about?',
      'How did that feel for you? You can share as much or as little as you want.',
      'Would you like to stay with this, talk about something else, or pause?',
    ];
    return { text: prompts[turn % prompts.length] };
  }
  if (['Heavy', 'Low'].includes(session.mood))
    return { text: 'You marked this moment as difficult. Would one small step feel manageable—perhaps telling someone you trust what you need? You can also choose to pause.' };
  if (['Good', 'Bright'].includes(session.mood))
    return { text: 'You chose a positive check-in. Would you like to notice one thing that helped today? It is also okay to talk about something difficult.' };
  return { text: 'Would you like to name one thing you need right now, or choose a practice from the library? You can skip either.' };
}
