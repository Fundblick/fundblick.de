# FundBlick – Current Handoff for ChatGPT Work

**Stand:** 2026-10-03  
**Repository:** `Fundblick/fundblick.de`  
**Purpose:** authoritative short-form handoff for a new ChatGPT Work/Desktop session. Read this before changing code.

## 1. Project goal

FundBlick is a mobile-first affiliate product discovery/search platform. It should scale from a small proof of concept to many merchants without manual per-product maintenance. Core principles:

- fast, clean, no popup-heavy UX;
- real merchant products, not simulated production inventory;
- multilingual search/UI and indexable language/category surfaces;
- affiliate attribution where permitted, with consent-aware routing;
- generic merchant ingestion architecture suitable for 10/100/1000+ merchants;
- automation over manual catalog maintenance;
- privacy/legal/SEO/safety gates must survive growth;
- business logic and connectors should not be exposed unnecessarily.

The user prefers autonomous execution: inspect, research where needed, implement, test, fix failures, and continue as far as safely possible without stopping after every micro-step.

## 2. Branch/release discipline

- Treat `main` as production.
- Do not make blind direct production changes.
- Work on a dedicated branch, open a PR, let relevant gates pass, then merge.
- Do not weaken a safety gate merely to get green CI.
- Preserve rollback/quarantine capability for merchants.
- Before claiming something is live, distinguish repository merge from actual deployment/edge verification.

## 3. Current production baseline

Latest known main after CI optimization:
- PR #48: Amazgifts quarantined because real merchant destinations were broken.
- Merge commit: `7556cf4c92abce08b2737ab6530e4f4c8f58c26f`
- PR #49: first risk-based CI optimization pass.
- Merge commit: `3f069c58c6ba9ed261078c2d858b76266efdbb6a`

Expected production catalog after Amazgifts quarantine:
- Casa Moro: 1,428
- AHIPOS: 31
- ANTHBOT: 56
- total: 1,515 products
- 9 production categories
- Amazgifts must NOT be present in production search/catalog while quarantined.

Verify these numbers from current code/build before relying on them if main has moved.

## 4. Amazgifts incident – important lesson

Amazgifts was imported from Awin and initially activated with 2,964 products. Feed identifiers:
- merchant/advertiser ID: `87569`
- publisher ID: `3106259`
- preferred feed ID: `95497`
- raw feed SHA256: `9dadbc32d81303f38a4d8a92520d9ac29abf5aea3ac8c10d89393e8fd43822bf`
- canonical artifact digest: `32ca063fc6d02a7ba6407175100e7da84f0c75731f097033b6096aff55b2d65a`

The feed passed structural validation and CI, but real product destination pages failed in production. Multiple user-tested Amazgifts links reached an Amazgifts 404 page. Existing older merchants continued to work.

Root gap: `amazgifts-feed-normalizer.js` validated URL structure/host/Awin IDs but did not verify the actual HTTP destination or detect merchant soft-404 pages. Therefore syntactically valid feed URLs were incorrectly treated as production-safe.

Amazgifts is intentionally **quarantined, not deleted**:
- keep normalizer/feed integration/artifact capability for diagnosis and future reactivation;
- `production-merchant-approvals.json`: Amazgifts should remain `approved:false`, `quarantined:true`, with no exposed production sources;
- `production-catalog-sources.json`: Amazgifts artifact excluded;
- do not reactivate until destination health is proven.

Do not ask the user to manually test more Amazgifts links. The failure is already established.

## 5. Next priority: destination-link health gate

This is the next substantive engineering task.

Goal: a merchant must never be promoted to production merely because its feed URLs are syntactically valid.

Design direction:
1. Validate direct merchant URLs by making real requests and following redirects.
2. Validate affiliate URLs by resolving the affiliate redirect and checking the resulting merchant destination.
3. Treat HTTP 4xx/5xx, redirect loops, invalid hosts and obvious merchant soft-404 pages as failures.
4. Produce a machine-readable health report tied to the exact merchant artifact digest.
5. Production activation must require a recent passing health report for that exact digest.
6. Do not hit thousands of URLs on every ordinary PR. Run full/rate-limited link auditing during merchant onboarding/activation and optionally scheduled monitoring.
7. Normal PR/release gates should validate the presence, freshness and digest binding of the report.
8. Support canary activation and automatic/manual quarantine thresholds for later scale.
9. Test both consent modes where relevant: direct merchant URL without tracking consent and affiliate-resolved destination with consent.
10. Keep network auditing deterministic enough to diagnose failures and avoid hiding them with retries.

## 6. CI strategy

PR #49 introduced the first risk-based CI pass. Heavy PR workflows were scoped to relevant paths instead of firing the entire suite for every change.

The principle:
- small/local change -> baseline + affected checks only;
- merchant/catalog change -> merchant/catalog checks;
- CSS/mobile/UI change -> relevant browser/UI E2E;
- affiliate/card change -> Result Card safety;
- SEO change -> SEO/indexability checks;
- full release-sensitive suite -> production/release-risk changes.

Be careful with GitHub Actions `paths` and required checks: a workflow that never starts can remain required/pending depending on branch protection. Do not create a required-check deadlock. Prefer an always-reporting lightweight aggregate/classifier if branch protection requires stable check names.

PR #49 changed at least:
- `.github/workflows/result-card-safety.yml`
- `.github/workflows/seo-landing-audit.yml`
- `.github/workflows/development-v2-integrity.yml`
- `.github/workflows/production-release-check.yml`

Continue optimizing remaining workflows only after inspecting current branch protection/check behavior.

## 7. Recent UI fixes

- PR #46 fixed category navigation after the Amazgifts catalog expansion. Category clicks had returned zero results; routing/localization was corrected.
- PR #47 removed duplicate mobile sort controls. Desired mobile UI keeps the toolbar `Suche verfeinern | Sortieren` rather than a second permanent sort control.
- Do not regress these behaviors.

## 8. Affiliate/consent behavior

For merchant result cards without tracking consent, FundBlick can use the direct merchant URL instead of the affiliate click URL. Metadata may preserve the affiliate URL for the consented path. For the Amazgifts implementation this was intentionally tested with:
- `data-link-mode="direct"`
- `data-link-reason="tracking-not-consented"`
- `rel="noopener noreferrer"`
- no `sponsored` marker on a non-affiliate direct link.

With consent, affiliate routing must preserve the correct network/publisher/advertiser contract.

Destination health must cover both direct and affiliate-resolved paths, because the Amazgifts incident showed that a structurally valid direct URL can still be dead.

## 9. Existing documentation to read before broad changes

Important files already in `docs/`:
- `MERCHANT_ONBOARDING_PLAYBOOK.md`
- `FUNDBLICK-PREFLIGHT-CATALOG-INTEGRITY.md`
- `AMAZGIFTS_LIVE_READINESS.md` (historical; do not treat old readiness as current truth)
- `HANDOFF_2026-09-26_MULTI_MERCHANT.md`
- `WORKLOG_2026-09-30_DEVELOPMENT.md`
- `WORKLOG_2026-09-28_PRODUCTION_AUDIT.md`
- `FUNDBLICK-WEBSUCHE-SEARCH-UX-ZIELBILD-2026-10-01.md`
- `FUNDBLICK-PRODUCT-INTELLIGENCE-TECHNICAL-FOUNDATION-2026-09-30.md`
- `EXTERNAL-SEARCH-WORKPLAN-2026-09-29.md`
- `EXTERNAL-SEARCH-PRIVACY-REVIEW-2026-09-30.md`
- `GOOGLE_INDEXING_RUNBOOK.md`
- `ADCELL_READINESS.md`

When older documents conflict with current code/main, current code plus this handoff's incident/quarantine status wins. Update stale docs when the discrepancy matters.

## 10. Working style / quality bar

For this project:
- inspect before editing;
- question assumptions and test them;
- prefer primary/current evidence;
- make large coherent progress per turn instead of stopping after each tiny step;
- fix CI failures autonomously when the cause is clear;
- do not fabricate production verification;
- do not silently replace real data with mocks to make tests pass;
- do not expose secrets/tokens;
- retain generic/reusable architecture rather than one-off merchant hacks;
- document material architecture, incident and release decisions in-repo.

## 11. Immediate start procedure for a new Work session

1. Read this file.
2. Fetch current `main` and verify the latest commit/PR history.
3. Inspect `production-merchant-approvals.json` and `production-catalog-sources.json`; confirm Amazgifts is quarantined/excluded.
4. Inspect current GitHub Actions after PR #49.
5. Create a dedicated branch for the destination-link health gate.
6. Implement the smallest durable architecture that binds link-health evidence to merchant + artifact digest.
7. Add unit/integration tests including hard 404, redirect, soft-404, valid direct destination, valid affiliate redirect, stale report and digest mismatch.
8. Integrate the gate into merchant activation/release without making every ordinary PR crawl the entire catalog.
9. Run relevant CI, repair failures, open PR, and report exact status.
10. Do not reactivate Amazgifts merely to test the mechanism in production.

## 12. Source-of-truth rule

This file is a handoff, not a substitute for repository inspection. A new agent must verify current repository state before acting. If a newer handoff exists, use the newest dated handoff together with current code and Git history.

## 13. Destination-health implementation batch, 2026-10-03

Verified starting main: `9bffca9a16f4f41ee688b4b20c1492cfa58dabb5` (PR #50).
Rebuilt baseline: Casa Moro 1,428 + AHIPOS 31 + ANTHBOT 56 = 1,515 real products,
nine categories, zero Amazgifts. Historical 1,459/seven-category documents are
superseded; public-field allowlisting and strict consent normalization are already
present in code. Old Amazgifts terms-clearance steps are superseded by
`termsCleared:true` plus destination quarantine.

Implementation and operating contract: `DESTINATION_LINK_HEALTH_GATE.md`.
Dedicated branch `codex/destination-link-health-gate`; verify its PR/CI state before
assuming merge or deployment. The build and Amazgifts activator now require real
full, fresh, merchant/artifact/policy-bound evidence for new/changed artifacts.
The three existing exact baseline digests have an explicit frozen migration
exemption, not passing health evidence. Never extend this exemption. Next: audit
existing merchants and retire it through reviewed PRs; refresh evidence and design
monitoring/quarantine, with canary subsets requiring their own full artifact audit.

Real six-request sample for the first three Amazgifts products fails with HTTP 404
in both direct and affiliate modes. Merchant 301 embeds an absolute URL in the path;
Awin 302 resolves into that same broken chain. Evidence retained under
`destination-health/amazgifts-2026-10-03-failed-sample.json`. Keep Amazgifts quarantined;
do not rewrite feed destinations or manually promote based on this diagnostic work.
