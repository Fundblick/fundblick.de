# Amazgifts verified selection, 2026-10-03

The user authorized production activation of only the usable unique products,
with real images and working destinations. This supersedes the earlier audit-only
scope. The original raw gzip could not be recovered; the user explicitly accepted
the retained, digest-verified 2,964-row normalized incident snapshot as input.
Its original registry/digest and artifact are preserved for provenance and remain
excluded from production. No original feed destination or Awin URL was invented.

## Exhaustive page audit

All 414 canonical inputs were fetched, with final HTML inspected for Product
evidence, stable Shopify identity and 404/Hoppla/error content, including redirects:

| Classification | Inputs |
| --- | ---: |
| Valid product, without redirect | 185 |
| 404/Hoppla/soft-404 | 121 |
| Redirect to a valid product | 104 |
| Redirect to shop/category/home | 4 |
| Other error | 0 |

289 valid input pages collapse to 288 unique merchant product IDs. The page audit
made 562 HTTP responses, without retries/rate limits. Full results and final URLs
are in `destination-health/amazgifts-page-audit.json`.

## Additional production qualification

Every one of those 288 families was checked using current Shopify product JSON.
Selection requires an available, positive-price variant present in the retained
real Awin mapping, without mandatory subscription. The lowest-priced qualifying
feed variant represents the family once. Actual EUR currency, merchant product ID
and variant identity were also checked against both final HTML destinations.

- **280 eligible unique products**; eight have no currently available feed variant.
- **560 verified consent routes**: 280 original merchant deep links and 280 original
  Awin `pclick.php` links. Both resolve to the same correct current product/variant.
- The browser uses direct links before a decision, Awin `cons=1` after granting
  consent, and Awin `cons=0` after explicit denial. All **560 additional actual
  consent-signal URLs** are also individually fetched and verified. The existing
  gate now derives those routes using the actual shared outbound policy/config,
  requiring **1,128 targets** including original feed links and eight browser-normalized
  Unicode direct URLs; every variant matches. The eight encoded representations
  were additionally fetched, retaining the original source strings separately.
- **280 real current product images**, downloaded with HTTP 200/image MIME, SHA-256
  checked, fully decoded by Pillow 12.3.0, at least 200×200 and nonblank. All images
  were additionally inspected in four contact sheets; no error-page placeholders.
- Current live names, selected-variant prices and images replace stale feed values.
  Categories use the current product title and merchant product type, avoiding descriptions containing links to
  unrelated keychains. No identical live-title/image duplicates were found.
- Categories: jewelry 266, keychains 14.
- Public stock remains UNKNOWN and shipping remains unknown: no delivery guarantee
  or fabricated shipping price is derived from selection-time availability.

Full selection/rejections and all retained source associations are in
`destination-health/amazgifts-clean-selection.json`. The original snapshot remains
available, but none of its 2,964 variant records is directly activated. Only the
280-record `development/amazgifts-verified-products.json.gz.b64` may enter production.

## Safety and operation

`production-merchant-artifacts.json` independently pins source, count, artifact
digest, stable merchant identity field and category counts. The original feed
registry keeps its historical 2,964-row contract for ingestion and diagnosis.

Activation and production builds require the existing full fresh destination
gate plus `merchant-product-quality.js` metadata/decoded-image evidence, both bound
to the exact cleaned artifact digest. Negative checks cover mutated data, old
unreviewed feeds, missing/stale evidence, price/variant/image mismatch, corrupt or
blank/tiny images and duplicate merchant families. No legacy exemption was added.

Evidence is valid for seven days, matching the destination gate. Freshness refers
to the real audit start; future activation/release needs refreshed evidence.
This is point-in-time availability, not a promise that a merchant never changes.

Reproduction with the saved exhaustive whitelist:

```text
node audit-amazgifts-production-candidates.js <audit-directory>
node audit-amazgifts-runtime-consent.js <audit-directory>
python decode-merchant-product-images.py <audit-directory>
node prepare-verified-amazgifts.js <audit-directory>
node verify-amazgifts-activation-dry-run.js development/amazgifts-verified-products.json.gz.b64
node verify-merchant-product-quality.js
```

The audit directory must contain `whitelist-products.json` and `url-audit.json`
from the exhaustive page audit. Delete/archive the candidate progress report
before a fresh audit, otherwise the resumable auditor reuses completed results;
stale evidence will be rejected by the production gate. Requests use two workers,
350 ms global spacing, pinned public DNS, bounded bodies, timeouts, and up to
three explicitly logged transient retries/backoff. Evidence bodies and decode
contact sheets are retained locally under `audits/amazgifts-2026-10-03` in the
Desktop workspace. They are never copied into the public site.

Rollback/quarantine remains available: set Amazgifts `approved:false`,
`quarantined:true`, `sources:[]`, document the reason and remove the cleaned source
from `production-catalog-sources.json`, then branch/PR/release. Historical quality
regression checks do not force expired merchant evidence during quarantine.

The candidate build contains Casa Moro 1,428 + AHIPOS 31 + ANTHBOT 56 + Amazgifts
280 = **1,795 real products, 11 categories**. Deployment and public-edge verification
must be checked separately from a merge; see the release PR and Desktop receipt.
