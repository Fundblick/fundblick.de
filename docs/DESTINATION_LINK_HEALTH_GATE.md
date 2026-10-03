# Destination link health gate

Stand: 2026-10-03. Implementation on a dedicated PR branch; no deployment claim.

## Contract

Structural feed validation is necessary but cannot prove live destination health.
`audit-destination-links.js` makes real HTTPS GET requests for every distinct direct
and affiliate URL in a raw normalized merchant artifact (including secondary
offers). It follows at most eight redirects with exact merchant/network host
allowlists, public DNS resolution pinned to the actual request, no cookies or
browser credentials, bounded response size and a 15-second request deadline.
There are no hidden retries. Full audits run separately from ordinary PRs.

Every path must terminate on an allowed merchant HTML product page with HTTP 200
and recognizable Product metadata. HTTP errors, redirect loops, invalid hosts,
obvious title/H1 soft-404s, login/password pages, bot challenges and absent product
evidence fail closed. Direct and affiliate routes must resolve to the same product
path and variant; tracking query parameters can differ. Product metadata is an
additional conservative signal, not a complete browser/checkout/price guarantee.
JavaScript-only redirects and pages without readable product metadata cannot pass
this auditor; investigate them explicitly rather than relaxing the gate silently.

The JSON report binds merchant key, canonical `JSON.stringify(products)` SHA-256,
the host-policy SHA-256, auditor version, product count and complete URL coverage.
Each result records timestamp, redirect statuses, final URL and body digest/size.
Validation checks all rows, not only a summary flag. Evidence must be no older
than seven days from audit start, with no future or inconsistent timestamps.
Partial/interrupted/sample audits are never eligible for production activation.
Any failing target blocks activation (zero failure tolerance). Reports recommend
review/quarantine on failure; auditing does not mutate production configuration.

`build-production-catalog.js` validates the raw artifacts before writing public
output. New or changed merchant artifacts cannot pass with syntax checks alone.
`activate-amazgifts-production.js` requires the same full report in real and dry
run modes; only a verified activation can clear the quarantine flag. Its existing
identity, artifact digest, explicit confirmation and advertiser terms gates remain.

## Safe migration of the existing baseline

Main at `9bffca9a16f4f41ee688b4b20c1492cfa58dabb5` already serves Casa Moro 1,428,
AHIPOS 31 and ANTHBOT 56 products (1,515 total, nine categories). There is no
existing full destination-health evidence for these merchants. The implementation
does **not** invent passing reports or unexpectedly disable this catalog.

Only these exact three pre-gate artifact digests are frozen in
`destination-link-health.js`. This is an explicit migration exemption, not a
health result. Never add merchants or replace digests in that list. Any artifact
mutation, new merchant or quarantined merchant requires real fresh full evidence.
Casa Moro is now explicitly represented in the approval registry so the core
source cannot bypass the same contract. Once an existing merchant has a report
configured, stale/failed/mismatching evidence fails even for its frozen digest.
Audit the existing merchants and remove their migration exemptions in subsequent
reviewed PRs. Activation of Amazgifts has no migration exemption.

## Operating procedure

Run from repository root, on an isolated branch:

```sh
node audit-destination-links.js amazgifts build/destination-health/amazgifts.json development/amazgifts-products.json.gz.b64
node audit-destination-links.js ahipos build/destination-health/ahipos.json development/ahipos-products-1.json development/ahipos-products-2.json
```

Default delay is 1,000 ms between targets; increase it through
`FUNDBLICK_LINK_AUDIT_DELAY_MS`. `FUNDBLICK_LINK_AUDIT_LIMIT` can produce a bounded
diagnostic sample, which always fails activation eligibility. URLs are deduplicated
within each consent mode; identical variant paths are not collapsed.

Alternatively dispatch **Destination link health gate** on the candidate branch
with a merchant choice. It uploads full or interrupted diagnostic evidence as a
GitHub Actions artifact bound to the checkout SHA. Audits have a four-hour limit;
timeout/cancellation cannot yield a passing report. PRs run only offline evidence
validation/tests and a catalog build; they do not crawl merchant catalogs.
The lightweight check always reports for PRs to main, avoiding a paths-based
required-check deadlock for this new check. Existing required checks are preserved.

Review a real passing report, copy it under `destination-health/`, and set that
merchant's `destinationHealthReport` in `production-merchant-approvals.json` to
the reviewed repository-relative path. Do this for the **exact** candidate sources
in manifest order. A report is an operator/CI audit attestation, not a cryptographic
proof of network execution; retain its originating run and review the evidence.
Unit fixtures may never be substituted for this production evidence.
For Amazgifts, then run the existing explicit activation command, all affected
release checks and browser acceptance through a PR. Verify the actual deployed
domain after release before claiming it is live.

Future canary/monitoring work must add reviewed subset artifacts with their own
full evidence and digest, refresh audits, and define automatic quarantine actions.
The current gate deliberately permits no sample-only canary or automatic promotion.

## Incident evidence and validation

`destination-health/amazgifts-2026-10-03-failed-sample.json` records real requests
on 2026-10-03: first three artifact products, both direct and Awin paths, all six
HTTP 404. Awin first returns 302 to the merchant product path. The merchant then
returns 301 with an embedded absolute URL in the path, e.g.
`https://amazgifts.de/https://amazgifts.de/collections/projektionskette?...`.
That malformed merchant destination returns 404. This localizes the observed
failure to the merchant redirect chain; it is not evidence that every product
fails. Another diagnostic cohort had valid direct pages but failed affiliate paths,
which reinforces the requirement to audit both consent modes.

Tests: hard 404/410/429/5xx, valid product/direct and affiliate redirect, redirect
loop/missing Location/invalid host, soft-404, normal storefront captcha asset versus
actual challenge, timeout, public address filtering, consent destination mismatch,
complete coverage, report freshness, artifact/policy digest mutation, frozen baseline
mutation and rejection by the actual activator (dry run and confirmed activation).
Synthetic HTTP responses are unit fixtures only. The checked-in incident sample is
real network evidence and fails. Existing future-promotion tests now assert blocking
without real evidence; they exercise full promotion only with a real passing report.

Repository cross-check also found `verify-affiliate-readiness.js` still asserting
the pre-Awin `prepared` state despite production `live-awin`. Its assertions now
match the actual state while keeping ADCELL disabled and requiring Awin consent
and active disclosure. This obsolete verifier was not part of current CI workflows.
