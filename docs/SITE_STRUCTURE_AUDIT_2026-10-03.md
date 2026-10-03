# Live, Development and workspace audit, 2026-10-03

Audited production baseline: PR #52 merge
`3c8cf86b2ac37ba97b725e56ce19f825e54d02d1`; production run `37140189810`
completed successfully. This report describes findings and the follow-up PR;
its merge, new deployment and public verification must be checked independently.

## Actual public inventory

Real HTTP audit at `2026-10-03T18:00:32.235Z`: all 367 catalog shards and all
1,795 public product records match the reviewed local build, including every
public field. Casa Moro 1,428, AHIPOS 31, ANTHBOT 56, cleaned Amazgifts 280;
11 categories, zero simulated products. All 76 original hashed browser assets
have matching bytes/digests; six SEO landing pages are reachable and indexable.
Homepage indexability and search noindex are intact. Eight tested private/legacy
paths return 404, including original merchant artifacts, approvals, health reports,
server worker source, `.git/HEAD` and `products.json`.

This is a complete public artifact check, not a fresh exhaustive merchant-side
destination/image audit. The real Amazgifts evidence is retained and remains
enforced. Casa Moro, AHIPOS and ANTHBOT still use the existing exact-digest
migration exemptions; they have no full destination-health attestation. Do not
describe their syntactically valid feed URLs as freshly audited merchant pages.

## Findings and repairs

1. Category selection stopped after 12 shards. Real live jewelry navigation
   displayed 64 of 266 indexed products. Exact category navigation now selects all
   relevant shards, fetching at most six concurrently. Precise free-text searches
   keep their existing bounded shard policy; the homepage still uses its small pool.
2. Search rendering stopped permanently after 100 cards, despite the existing
   24-result reveal control. Every loaded result is now represented and reachable
   through that control. Category browser tests assert exact counts for every
   category and reveal all 516 living-category results beyond the old ceiling.
3. A new search on an existing category page searched only the old loaded pool.
   Submitting a new query now reloads its appropriate shards and prevents older
   asynchronous results from overwriting the latest request. Browser regression
   switches from jewelry to Casa Moro's Mosaiktisch products.
4. Live diagnostics reported `degraded` because they required the removed
   `FundBlickOfferComparison` API. The executed presence/absence regression now
   checks the actual `FundBlickMerchantOffers` API, without hiding missing modules.
5. Preview recursively copied internal files. Reproduced package: 712 files,
   23,900,697 bytes, including raw merchant artifacts, 4.4 MB of evidence, server
   worker source and a 2 MB unused legacy image. Both environments now share an
   explicit reviewed public-file manifest and package builder. Unknown files,
   evidence, docs, server code, dependencies and source aliases fail isolation.
   Preview additionally has no CNAME/sitemap/canonicals and every HTML page is
   noindex/nofollow, including the same generated category landings as production.
6. Dynamically loaded consent dependencies used fixed query strings. Their actual
   bytes are now content-hashed, and the loader itself is hashed after embedding
   their URLs. All 82 browser assets use content hashes; redundant original aliases
   and four unused scripts are absent from the package. Source/audit history stays
   recoverable in Git rather than being deleted indiscriminately.
7. Deployment checkout previously selected mutable branch tips. It now builds the
   triggering revision. Production deploy additionally requires the main ref;
   preview PRs only build and cannot publish. Preview packaging changes get their
   own PR build before any Development integration.
8. Production now runs an actual post-deploy HTTP comparison of all public
   products/shards/assets/pages against the exact packaged release. A bounded
   retry handles propagation; persistent mismatch fails the run. Receipt retained
   for seven days, clearly separate from merge/build success.

## Development and hosting evidence

At audit start `development` was `f748cf859bedac5d318e036d0602b98943db4cea`,
25 commits behind main, with zero unique commits. Synchronize it by ordinary
fast-forward only after the follow-up PR's final checks/merge; never force push.
Old backup refs and `development-preview` are historical pointers, not additional
workspaces or an instruction to deploy their old contents.

Cloudflare's independent `Workers Builds: fundblick-development` check remains
failed on the old PR #52 head. Its linked dashboard redirects to sign-in in the
connected browser, so the actual build logs/settings are unavailable here. A green
portable preview build proves package readiness, not Cloudflare publication or
an up-to-date public Development host. Do not bypass this distinction or fabricate
a successful preview deployment.

Main currently has no server-enforced branch protection/required checks according
to the GitHub branch endpoint. No protection was disabled here. Continue to merge
only the exact tested head after all applicable GitHub Actions checks pass. Changing
repository access/protection settings requires a separate deliberate decision.

## Workspace and merge discipline

- One existing FundBlick checkout in `work/fundblick`, one Git worktree, no attached
  managed worktree. Reuse it for sequential tasks instead of copying the repository.
- Additional worktrees only for actual isolation or simultaneous independent work.
  Inspect tracked/untracked/ignored work and preserve unique changes before cleanup.
- Generated catalog/SEO/packages/tests/dependencies remain ignored in `build/`,
  `_site/`, `node_modules/` and test output. `.gitignore` prevents accidental staging.
- Real Amazgifts HTTP bodies, decoded-image evidence and final whitelists remain in
  the external Desktop `audits/amazgifts-2026-10-03` folder; necessary for reproduction.
- Reviewed merchant inputs, digest pins, safety reports and useful documentation are
  intentional repository content. None belongs to the published site.
- A PR contains source changes, affected checks and concise evidence; never local
  workspace copies, generated bundles, raw bodies, dependency trees or screenshots.
- Retain backup/unique remote branch history until its owner/purpose is understood.
  Branch refs are tiny metadata, not full duplicated directories.

## Reproduction

```text
node build-production-catalog.js build/catalog
node verify-user-flows.js build/catalog
node verify-live-health.js
node verify-site-packaging.js
node package-site.js production
node development/verify-production-package.js _site
node development/build-cloudflare-preview.js
node verify-deployed-site.js https://fundblick.de/ build/catalog build/deployed-site-verification.json
```

The last command actually requests the deployed site. Supplying `_site` as a fifth
argument additionally requires exact release asset/page bytes. Run it only against
the corresponding production package, not a protected preview package.

Historical `verify-search-state-v2.js` contains pre-migration inline-script/cache
token assertions and fails already on audited main. It is not a current CI gate;
current query/category/mobile semantics are covered by the active browser suites.
No old assertion was silently removed just to label the audit green.
