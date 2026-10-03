# AGENTS.md – FundBlick working instructions

Before making non-trivial changes, read `docs/HANDOFF_CURRENT.md` and the documentation it points to.

Core rules:
- `main` is production; use a dedicated branch + PR for changes.
- Never claim deployment/live verification from a merge alone.
- Keep Amazgifts quarantined until a real destination-link health gate passes for the exact artifact digest.
- Do not weaken tests or substitute mocks for real production evidence merely to get green CI.
- Use risk-based CI: run affected checks, reserve broad release gates for release-risk changes.
- Preserve mobile-first UX, multilingual behavior, affiliate-consent routing, SEO/indexability safety, and generic multi-merchant architecture.
- Work autonomously in coherent batches: inspect, implement, test, repair, document, then report.
