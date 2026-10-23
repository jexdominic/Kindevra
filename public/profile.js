// Internal, visit-only profiles. No transcripts, identifiers or inferred traits.
// Weak keys keep separate visits isolated and let abandoned sessions be collected.
const profiles = new WeakMap();

export function preferenceSignal(text) {
  if (typeof text !== 'string') return null;
  const match = /^(grounding|thought exercises) (helps? me|does not help me|do not help me)[.!]?$/i.exec(text.trim());
  if (!match) return null;
  return Object.freeze({
    practice: match[1].toLowerCase() === 'grounding' ? 'grounding' : 'thoughts',
    helpful: /^helps? me$/i.test(match[2]),
  });
}

export function createProfileUpdater(schedule = queueMicrotask) {
  let generation = 0;
  return {
    observe(session, text) {
      // Extract before scheduling: queued work never retains conversation text.
      const signal = preferenceSignal(text);
      if (!signal || !session) return;
      const observedGeneration = generation;
      schedule(() => {
        if (observedGeneration !== generation) return;
        const profile = profiles.get(session) ?? { grounding: null, thoughts: null, preferred: null };
        profile[signal.practice] = signal.helpful;
        if (signal.helpful) profile.preferred = signal.practice;
        else if (profile.preferred === signal.practice) profile.preferred = null;
        profiles.set(session, profile);
      });
    },
    clear(session) {
      generation++;
      profiles.delete(session);
    },
  };
}

export function preferredPractice(session) {
  return profiles.get(session)?.preferred ?? null;
}

export function practiceDeclined(session, practice) {
  return profiles.get(session)?.[practice] === false;
}
