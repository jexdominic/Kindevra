// Internal, visit-only profiles. No transcripts, identifiers or inferred traits.
// Weak keys keep separate visits isolated and let abandoned sessions be collected.
const profiles = new WeakMap();
// Shared cancellation tokens belong to sessions, independently of updater instances.
const generations = new WeakMap();

export function preferenceSignal(text) {
  if (typeof text !== 'string') return null;
  // Apply the same normalization as reply routing so acknowledgment and learning
  // cannot disagree. Keep whole-message matching to abstain on quoted/ambiguous text.
  const normalized = text.normalize('NFKC').replace(/[’‘]/g, "'").trim();
  const match = /^(grounding|thought exercises) (helps? me|does not help me|do not help me|doesn't help me|don't help me)[.!]?$/i.exec(normalized);
  if (!match) return null;
  return Object.freeze({
    practice: match[1].toLowerCase() === 'grounding' ? 'grounding' : 'thoughts',
    helpful: /^helps? me$/i.test(match[2]),
  });
}

export function createProfileUpdater(schedule = queueMicrotask) {
  return {
    observe(session, text) {
      // Extract before scheduling: queued work never retains conversation text.
      const signal = preferenceSignal(text);
      if (!signal || !session) return;
      const observedGeneration = generations.get(session);
      schedule(() => {
        if (observedGeneration !== generations.get(session)) return;
        const profile = profiles.get(session) ?? { grounding: null, thoughts: null, preferred: null };
        profile[signal.practice] = signal.helpful;
        if (signal.helpful) profile.preferred = signal.practice;
        else if (profile.preferred === signal.practice) profile.preferred = null;
        profiles.set(session, profile);
      });
    },
    clear(session) {
      clearProfile(session);
    },
  };
}

export function clearProfile(session) {
  generations.set(session, {});
  profiles.delete(session);
}

export function preferredPractice(session) {
  return profiles.get(session)?.preferred ?? null;
}

export function practiceDeclined(session, practice) {
  return profiles.get(session)?.[practice] === false;
}
