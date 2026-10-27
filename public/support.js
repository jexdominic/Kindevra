import { adaptiveReply } from './session.js';
import { preferenceSignal, preferredPractice, practiceDeclined, clearProfile } from './profile.js';
import { needsBeliefSupport, beliefSupport } from './belief-support.js';
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
// Narrow self-report/request routing; never infer or store an identity.
// Guidance and limitations: knowledge/identity-support.md.
function needsIdentitySupport(text) {
  if (/["“”]/.test(text)) return false;
  const selfReport = /(?:^|[.!?]\s*)(?:i am|i'm)\s+(?:gay|lesbian|bisexual|transgender|non-binary|nonbinary|queer)\b/i.test(text);
  const pressure = /\b(?:cure me|fix me|need to be cured|change my (?:sexual orientation|gender identity))\b/i.test(text);
  const changeRequest = /^(?:please\s+)?(?:help me|how (?:can|do) i)\s+(?:stop being|stop feeling)\s+(?:gay|lesbian|bisexual|transgender|queer)\b/i.test(text.trim());
  const conversionQuestion = /^(?:can|could|will|does)\s+conversion therapy\s+change my\s+(?:sexual orientation|gender identity)\b/i.test(text.trim());
  return (selfReport && pressure) || changeRequest || conversionQuestion;
}

function mentionsPersonalGrief(text) {
  if (/["“”]/.test(text)) return false;
  return /(?:^|[.!?]\s*)(?:i am|i'm)\s+(?:grieving|bereaved)\b/i.test(text.trim())
    || /(?:^|[.!?]\s*)my\s+(?:mother|father|mom|mum|dad|parent|partner|wife|husband|sister|brother|child|son|daughter|grandmother|grandfather|friend|dog|cat|pet)\s+(?:died|passed away)\b/i.test(text.trim());
}

function declinesExercise(text) {
  const unquoted = text.replace(/["“][^"”]*["”]/g, ' ').replace(/["“”].*$/g, ' ');
  const practice = '(?:(?:this|the|that)\\s+)?(?:(?:grounding|breathing|thought)\\s+)?exercises?|grounding|breathing';
  const request = new RegExp('^(?:please\\s+)?(?:stop|skip)\\s+(?:' + practice + ')\\b', 'i');
  const decline = new RegExp('^i\\s+(?:do not|don\'t)\\s+want\\s+(?:to\\s+(?:do|try|continue)\\s+)?(?:' + practice + ')\\b', 'i');
  const discomfort = new RegExp('^(?:' + practice + ')\\s+makes?\\s+me\\s+(?:feel\\s+)?worse\\b', 'i');
  return unquoted.split(/[.!?\n]+|,|\bbut\b/i).some(part => {
    const clause = part.trim();
    return request.test(clause) || decline.test(clause) || discomfort.test(clause);
  });
}

export function replyTo(text, turn = 0, session = null) {
  // Normalize punctuation without treating a wording match as a risk assessment.
  text = String(text).normalize('NFKC').replace(/[’‘]/g, "'");
  // Exercise consent persists even when another concern determines the reply.
  const stopExercise = declinesExercise(text);
  if (stopExercise && session) session.exercisesPaused = true;
  // Only a complete, unqualified opening self-report is exempted from the
  // keyword scan. Scan the remaining message; never store a "safe" state.
  // This narrow product rule is not a clinical risk assessment.
  const denial = text.match(/^\s*i(?: am|'m) not suicidal(?:\.(?=\s|$)|$)/i);
  const riskText = denial ? text.slice(denial[0].length) : text;
  // Explicit requests for harmful instructions must not reach mood-based replies.
  // This bounded pattern is not a general intent or emergency classifier.
  if (/\b(?:tell me how to|how (?:can|do) i|help me|instructions to|ways to)\s+(?:(?:secretly|quietly)\s+)?(?:poison|injure|attack|kill|hurt)\s+(?:my\s+\w+|someone|somebody|a person|people)\b/i.test(text))
    return {
      text: 'I can’t help with instructions to harm anyone. If this relates to something you might do, move away from the person and anything that could be used to hurt them, if you can do so safely. ' + urgentSupport,
      urgent: true,
    };
  if (/\b(suicid\w*|kill myself|end my life|hurt myself|self.?harm|overdos\w*|kill someone|hurt someone|don't want to live|do not want to live|want to die)\b/i.test(riskText))
    return { text: urgentSupport, urgent: true };
  // Indirect distress needs a direct question, not an assumed diagnosis or reassurance.
  if (/\b(better off without me|no reason to live|wish i (?:would|could) not wake up|wish i wouldn't wake up)\b/i.test(text))
    return {
      text: "That sounds painful, and I want to take it seriously. Are you thinking about suicide or harming yourself right now? Please reach out to a trusted person who can be with you. " + urgentSupport,
      source: 'https://www.nimh.nih.gov/health/publications/warning-signs-of-suicide',
      label: 'NIMH · Warning Signs of Suicide',
      urgent: true,
    };
  const medicationQuestion = /\b(medicat\w*|dose|prescri\w*)\b/i.test(text);
  if (medicationQuestion || /\bdiagnos\w*\b/i.test(text))
    return {
      text: (stopExercise ? 'We can stop the exercise. ' + (session ? 'Automatic exercises are paused for this visit. ' : '') : '') + 'I can’t diagnose conditions or recommend medication or doses. A qualified clinician can help with those decisions. If you already take medication, contact your prescriber before changing it.',
      source: medicationQuestion ? 'https://www.nimh.nih.gov/health/topics/mental-health-medications' : exercises.support.source,
      label: medicationQuestion ? 'NIMH · Mental Health Medications' : exercises.support.label,
    };
  if (stopExercise) {
    return { text: 'We can stop the exercise. You do not have to continue or explain why. Would you prefer to talk about what you need, reach out to someone you trust, or take a break?' + (session ? ' Automatic exercises are paused for this visit. Say “resume exercises” if you want suggestions again. You can still choose a library practice yourself.' : '') };
  }
  if (/\b(?:you are the only (?:friend|support) i need|i only need you|replace my (?:therapist|friends|family) with you)\b/i.test(text))
    return {
      text: 'It sounds like this space matters to you. Kindevra cannot replace relationships with people or professional support. You deserve support beyond this chat. Is there someone you trust whom you would feel comfortable contacting?',
      source: 'https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health',
      label: 'NIMH · Caring for Your Mental Health',
    };
  // Preserve earlier crisis, exercise-refusal, medical and dependency boundaries.
  if (needsIdentitySupport(text)) return {
    text: 'Being LGBTQ+ does not need a cure. If you are facing pressure to change, you deserve support and respect. I cannot help with attempts to change or suppress sexual orientation or gender identity. A qualified professional who respects your identity can help you explore your feelings without pushing a particular outcome. What you share, and with whom, is your choice. What kind of support would feel helpful now?',
    source: 'https://www.psychotherapy.org.uk/policy-and-research/public-policy/conversion-therapy/',
    label: 'UKCP · Conversion therapy',
  };
  // Offer uncertainty and human support before generic thought exercises.
  // Earlier crisis, refusal, medical and dependency boundaries still apply.
  if (needsBeliefSupport(text)) return { ...beliefSupport };
  if (session && /^(?:please )?forget (?:my )?practice preferences[.!]?$/i.test(text.trim())) {
    clearProfile(session);
    return { text: 'Practice preferences forgotten. Earlier messages, your check-in, support mode and any exercise pause remain. New practice feedback can set preferences again.' };
  }
  if (session && preferenceSignal(text)) return {
    text: 'Thanks for telling me what fits. I’ll use that preference for suggestions during this visit. You can say “forget practice preferences” to reset these choices, or clear the conversation. Library practices remain available at any time.',
  };
  if (mentionsPersonalGrief(text)) return {
    text: 'I’m sorry you’re facing this loss. Grief can feel different for different people; you do not have to feel a particular way. If you want, you can tell me what feels hardest right now. If coping is difficult, support from someone you trust, a bereavement counsellor or a qualified health professional may help. You can choose how much to share.',
    source: 'https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/grief-bereavement-loss/',
    label: 'NHS · Grief after bereavement or loss',
  };
  if (session && /^(?:please )?resume exercises[.!]?$/i.test(text.trim())) {
    session.exercisesPaused = false;
    return { text: 'Exercise suggestions are available again. Your listening or small-step preference still applies, and you can stop any time.' };
  }
  if (session?.exercisesPaused && /\b(therap\w*|professional|depress\w*)\b/i.test(text)) return exercises.support;
  if (session?.exercisesPaused)
    return { text: 'Automatic exercises are still paused, as you asked. What would you like me to understand about what is happening? You can take a break, or say “resume exercises” if you want suggestions again.' };
  if (denial && !/\b(therap\w*|professional|depress\w*)\b/i.test(text))
    return { text: /\b(work|job)\b/i.test(riskText)
      ? 'Thanks for clarifying. What has been difficult at work, and what kind of support would help right now?'
      : 'Thanks for clarifying. What would you like support with right now?' };
  if (session?.preference === 'listen' && !/\b(therap\w*|professional|depress\w*)\b/i.test(text)) return adaptiveReply(session);
  if (/\b(anxi\w*|panic|stress\w*|overwhelm\w*)\b/i.test(text))
    return session && practiceDeclined(session, 'grounding') ? adaptiveReply(session) : exercises.grounding;
  if (/\b(thought\w*|worr\w*|overthink\w*)\b/i.test(text))
    return session && practiceDeclined(session, 'thoughts') ? adaptiveReply(session) : exercises.thoughts;
  if (/\b(therap\w*|professional|depress\w*)\b/i.test(text)) return exercises.support;
  if (session?.preference === 'steps' && preferredPractice(session)) return exercises[preferredPractice(session)];
  if (session) return adaptiveReply(session);
  const prompts = [
    'Thank you for putting that into words. What feels most important for you to talk about right now?',
    'What has this been like for you today? Share only what feels comfortable.',
    'Would it help to pause with a grounding exercise, or think of one person you could reach out to?',
  ];
  return { text: prompts[turn % prompts.length] };
}
