// Narrow English wording routes, not a diagnosis or a credibility assessment.
// See knowledge/belief-support.md for provenance and limitations.
export function needsBeliefSupport(text) {
  return text.split(/[.!?\n]+|\b(?:and|but)\b/i).some(sentence => {
    // Abstain on explicit fiction, reported speech, denial and metaphor.
    // This intentionally cannot resolve every quotation or mixed clause.
    if (/\b(?:novel|story|movie|fiction|imagine|hypothetical|used to|no longer|not|never|cannot|can't|isn't|aren't|don't|doesn't|like|as if)\b|["“”]|\b(?:said|says|told me)\b/i.test(sentence)) return false;
    return /\b(?:neighbors?|neighbours?|someone|they|government)\s+(?:have\s+)?(?:implanted|put|placed)\s+(?:a\s+)?(?:chip|microchip|transmitter|device)\s+(?:in|inside)\s+my\s+(?:brain|head)\b/i.test(sentence)
      || /\b(?:tv|television|radio)\s+(?:is\s+sending|sends)\s+(?:secret\s+|special\s+)?messages\s+(?:just\s+)?(?:to|for)\s+me\b/i.test(sentence)
      || /\b(?:people|everyone|neighbors?|neighbours?)\s+(?:can\s+read|are\s+reading)\s+my\s+(?:thoughts|mind)\b/i.test(sentence);
  });
}

export const beliefSupport = {
  text: 'I cannot confirm what is happening from this chat. How is this making you feel? If this feels frightening or is disrupting your day, a mental health professional can help you make sense of the experience. Is there someone you trust who could support you while you arrange help?',
  source: 'https://www.nimh.nih.gov/health/publications/understanding-psychosis',
  label: 'NIMH · Understanding Psychosis',
};
