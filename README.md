# Kindevra

A calm space for everyday mental wellness.

## Run

Requires Node.js 22 or newer. No dependencies or API keys needed.

```sh
node server.mjs
```

Open http://127.0.0.1:4173. Run checks with `node --test`.

## Version 0.1

- Responsive conversation interface with scripted, clearly labeled replies.
- Session-only mood check-in; clear conversation also clears the mood.
- Three sourced psychology practices and an always-accessible urgent support panel.
- No accounts, analytics, chat storage, or external chat requests.
- Text-only message rendering and a restrictive content security policy.

This is an adult-oriented prototype, not psychotherapy, a clinical product, or a trained language model. The response rules cannot reliably recognize emergencies or understand context. It must not be used as a sole source of crisis support. The local server binds only to loopback and is not a production hosting setup.

## Psychology foundation

Original short educational prompts are informed by:

- [WHO: Doing What Matters in Times of Stress](https://www.who.int/publications-detail-redirect/9789240003927)
- [NIMH: Psychotherapies](https://www.nimh.nih.gov/health/topics/psychotherapies)

Sources checked October 20, 2026. Referencing resources does not imply endorsement, clinical validation, or permission to copy entire publications. Knowledge ingestion must verify licensing and undergo clinician review. Future model integration should retrieve reviewed material with traceable citations, rather than claim therapist-level expertise.

See [ROADMAP.md](ROADMAP.md) for next milestones and [SAFETY.md](SAFETY.md) for evaluation requirements.

## Response evaluation

Run `node evaluation/run.mjs` for the broader scenario suite. It currently reports 10/13 passing and exits with a failure status for three known gaps. See [the dated report](evaluation/2026-10-21.md) and [scoring limitations](evaluation/README.md). Unit tests and scenario checks are not clinical validation. [Source metadata](knowledge/sources.json) records pending review and licensing restrictions.

## Adaptive support prototype
See [requirements and research](REQUIREMENTS.md). Optional check-ins now influence small-step replies; listen-first is the default. Simple first-person phrases can suggest a check-in, which must be accepted before it changes context. Check-in changes prompt clarification rather than a clinical interpretation. Forgetting active check-in context leaves earlier visible messages until Clear conversation is used.
