# Local conversations

Experimental English-only conversations use Qwen3 4B Instruct through a local Ollama installation. No paid inference service or model training is involved. Generated text is not clinically validated; Contextual specificity and listening-only adherence require further evaluation.

## Start

Install Ollama from its official distribution, then download the local model:

```sh
ollama pull qwen3:4b-instruct
node server.mjs
```

Open http://127.0.0.1:4173 and enable Local conversation. English is currently the only supported conversation language. If another preview uses that port, set PORT before starting (the isolated development preview uses 4175).

The server fixes the model to qwen3:4b-instruct, uses only 127.0.0.1:11434, rejects redirects and cloud-model metadata, and never accepts a user-supplied provider URL or key. Local model weights are downloaded separately, not committed. Model registry: https://ollama.com/library/qwen3:4b-instruct (Q4_K_M, approximately 2.5 GB, Apache 2.0). API reference: https://docs.ollama.com/api/chat . The first load may take substantially longer than warm requests.

## Conversation controls and privacy

Local mode is off on refresh. The explicit choice sends recent conversation turns and explicit visit preferences/check-ins to the loopback server and installed model. The application has no transcript logging or persistent chat storage. Up to five completed exchanges plus the current message are retained for model context, further trimmed to 12,000 characters. Replies may therefore forget older context. The model runtime can retain working memory/cache; app reset is not a secure memory-erasure guarantee.

Stop, clear, mode changes and navigation cancel pending generation. Switching tabs or minimizing the browser does not cancel a reply. Leaving or closing the page clears model history and cancels pending generation. Clear and disabling local mode discard model history. Practice-preference forgetting also clears model context so old preference statements are not resent. Scripted boundaries bypass generation; they are not comprehensive risk classifiers. Paused exercise suggestions use a scripted response rather than relying on model compliance.

Host and Origin checks restrict API requests to the local app. JSON size, role, message and context limits apply; one generation runs at a time with a 90-second deadline. No tools or web retrieval are supplied to the model. The retrieval adapter includes only matching original summaries whose clinical and rights approvals pass the catalog checks. All nine current records are pending, so no research summaries are currently sent to the model. This setup is for local development, not public hosting.

## Verification

Run `node --test`, `node evaluation/run.mjs` and `node knowledge/check.mjs`. `node evaluation/local-smoke.mjs` separately invokes the installed model with synthetic messages, prints generated responses and latency, and does not provide a clinical pass score. Live speech integration remains separate.

## English model evaluation and preferences

Explicit declined/preferred practices and an optional selected check-in now accompany recent messages. These remain visit-only settings; a check-in is not a diagnosis. Controls and recognized scripted boundaries take priority. Generated compliance with preferences remains imperfect and needs review.

Run `node evaluation/local-regression.mjs evaluation/local-results.json` to exercise the real local model on all nine existing scenario files. Only synthetic fixture text is saved. The runner writes model-only and stateless integrated results separately, with fixture hashes and original expectations. The 13 original cases retain their narrow phrase checks; the other route/consent expectations require manual response review. A nonzero exit reports generation errors or lexical mismatches; it is not a clinical verdict. The broader scripted tests still verify session sequences separately.

Evaluation fixtures are not included in model instructions or retrieved context. This work changes runtime context and evaluates an existing model; no weights were trained or fine-tuned. Independent held-out evaluation and qualified clinical review remain outstanding.

## Generated-response checks

The integrated server path checks generated text for selected exercise invitations that conflict with listening/paused settings, declined practices, unsupported safety conclusions and dependency promises. It allows one local revision within the same request deadline. If the revised reply still matches those checks, the app displays a labeled withheld-reply notice; it does not store that notice in model history. Failed inference remains an explicit error. The raw generation function remains separately available to evaluation tooling.

These narrow phrase checks are not a safety classifier: they can miss paraphrases or flag benign language. They do not resolve clinical competence, all dangerous requests or semantic context. Existing scripted boundaries still run first. The regression runner records raw versus integrated responses; an extra synthetic multi-turn probe is available through `node evaluation/model-context-run.mjs evaluation/model-context-results.json`.
