# Local conversations

Experimental English-first conversations with Turkish selection use Qwen3 8B through a local Ollama installation. No paid inference service or model training is involved. Generated text is not clinically validated; Turkish phrasing, contextual specificity and listening-only adherence require further evaluation.

## Start

Install Ollama from its official distribution, then download the local model:

```sh
ollama pull qwen3:8b
node server.mjs
```

Open http://127.0.0.1:4173 and enable Local conversation. English is selected initially. Select Türkçe for Turkish replies; most navigation and library copy remains English. If another preview uses that port, set PORT before starting (the isolated development preview uses 4175).

The server fixes the model to qwen3:8b, uses only 127.0.0.1:11434, rejects redirects and cloud-model metadata, and never accepts a user-supplied provider URL or key. Local model weights are downloaded separately, not committed. Model registry: https://ollama.com/library/qwen3:8b (Q4_K_M, approximately 5.2 GB, Apache 2.0). API reference: https://docs.ollama.com/api/chat . The first load may take substantially longer than warm requests.

## Conversation controls and privacy

Local mode is off on refresh. The explicit choice sends only recent conversation turns to the loopback server and installed model. The application has no transcript logging or persistent chat storage. Up to five completed exchanges plus the current message are retained for model context, further trimmed to 12,000 characters. Replies may therefore forget older context. The model runtime can retain working memory/cache; app reset is not a secure memory-erasure guarantee.

Stop, clear, mode/language changes, navigation and page hiding cancel pending generation. Clear and disabling local mode discard model history. English practice-preference forgetting also clears model context so old preference statements are not resent. Turkish supports narrow pause/resume and forgetting commands but does not implement equivalent preference-learning coverage. Scripted English boundaries and limited Turkish boundaries bypass generation; they are not comprehensive risk classifiers. Paused exercise suggestions use a scripted response rather than relying on model compliance.

Host and Origin checks restrict API requests to the local app. JSON size, role, message and context limits apply; one generation runs at a time with a 90-second deadline. No tools or web retrieval are supplied to the model. The corpus remains unapproved for retrieval. This setup is for local development, not public hosting.

## Verification

Run `node --test`, `node evaluation/run.mjs` and `node knowledge/check.mjs`. `node evaluation/local-smoke.mjs` separately invokes the installed model with synthetic messages, prints generated responses and latency, and does not provide a clinical pass score. Live speech integration remains separate.
