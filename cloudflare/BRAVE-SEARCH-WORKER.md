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
