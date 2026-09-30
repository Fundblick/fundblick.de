# FundBlick Brave Search Worker

Server-side proxy for Brave Search. The Brave API key must never be committed to this repository or exposed to browser JavaScript.

## Cloudflare configuration

Worker: `fundblick-search`

Required production secret:

- `BRAVE_SEARCH_API_KEY` — Brave Search API subscription token.

Optional production variable:

- `ALLOWED_ORIGIN=https://fundblick.de`

The worker exposes:

- `GET /health` — confirms that the worker is running and whether the secret is configured, without returning the secret.
- `GET /search?q=...&count=10&country=DE&lang=de` — server-side Brave Web Search request.

The endpoint deliberately returns only a reduced result shape (`title`, `url`, `description`, `age`, `language`, `familyFriendly`). It does not persist or cache Brave Search results.

## Deployment safety

Keep the Worker URL out of production UI until the endpoint has been deployed and tested. Development integration should use a configurable endpoint rather than embedding the Brave API key. Never put `BRAVE_SEARCH_API_KEY` in GitHub Pages, HTML, client-side JavaScript, query parameters, logs, screenshots, or repository secrets intended for frontend builds.

## Setup status — 2026-09-29

Completed manually in the provider dashboards:

- Brave Search API account/plan activated with the monthly free credits selected.
- A monthly usage cap was enabled by the account owner to prevent uncontrolled API spend.
- Cloudflare Worker `fundblick-search` was created.
- Production runtime secret `BRAVE_SEARCH_API_KEY` was added as a Cloudflare Secret. The secret value is intentionally not stored in this repository.

Current blocker:

- Editing `worker.js` in the Cloudflare mobile browser editor proved unreliable. Clipboard access failed and pasted JavaScript became malformed, producing syntax errors.
- No malformed mobile-editor version should be treated as the canonical FundBlick Worker implementation.
- Do not connect the Worker to FundBlick production and do not expose its endpoint in the live UI until the clean repository version has been deployed and verified.

Desktop continuation checklist:

1. Open the Cloudflare Worker `fundblick-search` on desktop.
2. Replace the editor contents with the canonical repository file `cloudflare/brave-search-worker.js` rather than reconstructing code manually.
3. Confirm that `BRAVE_SEARCH_API_KEY` remains configured as a production Secret.
4. Deploy the clean Worker.
5. Test `/health` first; it must confirm configuration without revealing the secret.
6. Test `/search` with representative German queries and verify status handling and the reduced response schema.
7. Verify CORS/origin restrictions for `https://fundblick.de` before frontend integration.
8. Only after those gates pass, integrate the endpoint in the development branch and add regression tests for local-results-first/external-fallback behavior.
9. Keep `main`/Live untouched until the complete integration has passed its release gate.
