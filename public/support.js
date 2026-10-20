export const urgentSupport = 'If you might act on thoughts of harming yourself or someone else, or you have already taken something harmful, contact local emergency services or go to the nearest emergency department now. If possible, ask a trusted person to stay with you and move away from anything you could use to hurt yourself. Kindevra cannot monitor your safety or contact help for you.';
export const exercises = {
  grounding: {
    title: 'Come back to the present',
    text: 'If it feels comfortable, notice the support beneath your feet. Look around and name three things you can see, then notice a sound nearby. Let your breathing stay natural. You can stop whenever you wish. What do you notice now?',
    source: 'https://www.who.int/publications-detail-redirect/9789240003927',
    label: 'WHO · Doing What Matters in Times of Stress',
  },
  thoughts: {
    title: 'Make room for a thought',
    text: 'Try describing a difficult thought with “I’m noticing the thought that…” You don’t need to force it away or decide whether it is true right now. If you want, name one small action that matters to you today.',
    source: 'https://www.who.int/publications-detail-redirect/9789240003927',
    label: 'WHO · Doing What Matters in Times of Stress',
  },
  support: {
    title: 'Explore professional support',
    text: 'A qualified mental health professional can help you understand persistent difficulties and discuss care that fits your circumstances. You might write down what has been difficult, how long it has been happening, and what you hope support could change.',
    source: 'https://www.nimh.nih.gov/health/topics/psychotherapies',
    label: 'NIMH · Psychotherapies',
  },
};
export function replyTo(text, turn = 0) {
  if (/\b(suicid\w*|kill myself|end my life|hurt myself|self.?harm|overdos\w*|kill someone|hurt someone|don't want to live|do not want to live|want to die)\b/i.test(text))
    return { text: urgentSupport, urgent: true };
  if (/\b(diagnos\w*|medicat\w*|dose|prescri\w*)\b/i.test(text))
    return { text: 'I can’t diagnose conditions or recommend medication or doses. A qualified clinician can help with those decisions. If you already take medication, contact your prescriber before changing it.', ...{ source: exercises.support.source, label: exercises.support.label } };
  if (/\b(anxi\w*|panic|stress\w*|overwhelm\w*)\b/i.test(text)) return exercises.grounding;
  if (/\b(thought\w*|worr\w*|overthink\w*)\b/i.test(text)) return exercises.thoughts;
  if (/\b(therap\w*|professional|depress\w*)\b/i.test(text)) return exercises.support;
  const prompts = [
    'Thank you for putting that into words. What feels most important for you to talk about right now?',
    'What has this been like for you today? Share only what feels comfortable.',
    'Would it help to pause with a grounding exercise, or think of one person you could reach out to?',
  ];
  return { text: prompts[turn % prompts.length] };
}
