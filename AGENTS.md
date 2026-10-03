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
- Reuse the existing clean checkout for sequential tasks. Create another worktree only when isolation or simultaneous work actually requires it; inspect attached worktrees first.
- Keep reproducible output/dependencies in ignored `build/`, `_site/`, `node_modules/` and test-result directories. Retain real audit evidence separately; never add workspace copies, raw responses or generated packages to a PR.
- Production and Development Preview use `public-site-files.json` through `package-site.js`. Never publish a recursive repository copy; preserve exact catalog, image/link and indexing gates.
