# Local conversations

Experimental English-only conversations use Qwen3 8B through a local Ollama installation. No paid inference service or model training is involved. Generated text is not clinically validated; Contextual specificity and listening-only adherence require further evaluation.

## Start

Install Ollama from its official distribution, then download the local model:

```sh
ollama pull qwen3:8b
node server.mjs
```

Open http://127.0.0.1:4173 and enable Local conversation. English is currently the only supported conversation language. If another preview uses that port, set PORT before starting (the isolated development preview uses 4175).

The server fixes the model to qwen3:8b, uses only 127.0.0.1:11434, rejects redirects and cloud-model metadata, and never accepts a user-supplied provider URL or key. Local model weights are downloaded separately, not committed. Model registry: https://ollama.com/library/qwen3:8b (Q4_K_M, approximately 5.2 GB, Apache 2.0). API reference: https://docs.ollama.com/api/chat . The first load may take substantially longer than warm requests.

## Conversation controls and privacy

Local mode is off on refresh. The explicit choice sends recent conversation turns and explicit visit preferences/check-ins to the loopback server and installed model. The application has no transcript logging or persistent chat storage. Up to five completed exchanges plus the current message are retained for model context, further trimmed to 12,000 characters. Replies may therefore forget older context. The model runtime can retain working memory/cache; app reset is not a secure memory-erasure guarantee.

Stop, clear, mode changes, navigation and page hiding cancel pending generation. Clear and disabling local mode discard model history. Practice-preference forgetting also clears model context so old preference statements are not resent. Scripted boundaries bypass generation; they are not comprehensive risk classifiers. Paused exercise suggestions use a scripted response rather than relying on model compliance.

Host and Origin checks restrict API requests to the local app. JSON size, role, message and context limits apply; one generation runs at a time with a 90-second deadline. No tools or web retrieval are supplied to the model. The retrieval adapter includes only matching original summaries whose clinical and rights approvals pass the catalog checks. All nine current records are pending, so no research summaries are currently sent to the model. This setup is for local development, not public hosting.

## Verification

Run `node --test`, `node evaluation/run.mjs` and `node knowledge/check.mjs`. `node evaluation/local-smoke.mjs` separately invokes the installed model with synthetic messages, prints generated responses and latency, and does not provide a clinical pass score. Live speech integration remains separate.

## English model evaluation and preferences

Explicit declined/preferred practices and an optional selected check-in now accompany recent messages. These remain visit-only settings; a check-in is not a diagnosis. Controls and recognized scripted boundaries take priority. Generated compliance with preferences remains imperfect and needs review.

Run `node evaluation/local-regression.mjs evaluation/local-results.json` to exercise the real local model on all nine existing scenario files. Only synthetic fixture text is saved. The runner writes model-only and stateless integrated results separately, with fixture hashes and original expectations. The 13 original cases retain their narrow phrase checks; the other route/consent expectations require manual response review. A nonzero exit reports generation errors or lexical mismatches; it is not a clinical verdict. The broader scripted tests still verify session sequences separately.

Evaluation fixtures are not included in model instructions or retrieved context. This work changes runtime context and evaluates an existing model; no weights were trained or fine-tuned. Independent held-out evaluation and qualified clinical review remain outstanding.
