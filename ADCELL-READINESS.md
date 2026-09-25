# ADCELL readiness for FundBlick

Status: prepared, intentionally inactive.

## Already implemented

- Central ADCELL feature flags in `affiliate-config.js`.
- Tracking, outbound affiliate links and live disclosure remain disabled independently.
- Site-wide consent UI for all FundBlick interface languages.
- Versioned consent metadata so a materially changed consent version can invalidate an older decision.
- Consent-aware outbound link policy: affiliate tracking URLs are only eligible when ADCELL, outbound routing and tracking are enabled and consent is granted.
- Safe fallback to a direct merchant URL when a user declines tracking and a direct URL is available.
- Affiliate-only URLs are blocked when consent is missing or denied instead of silently tracking.
- Simulated FundBlick offers can never navigate to an external merchant.
- Only HTTP/HTTPS outbound URLs are accepted by the policy.
- `rel="sponsored noopener noreferrer"` is applied to eligible affiliate links.
- Generic mapping-driven normalizer prepared for future ADCELL CSV product feeds without hard-coding unknown feed column names.
- ADCELL privacy/opt-out information prepared in `datenschutz.html`; inactive wording remains visible while ADCELL is disabled.
- CI verifies that no ADCELL tracking script is preloaded while the integration is inactive.

## Activation checklist after ADCELL registration

1. Obtain the actual Publisher account data and join only partner programs whose participation conditions FundBlick fulfils.
2. Inspect the real CSV/deeplink fields delivered by the selected program(s) and define a field mapping for `adcell-feed-normalizer.js`.
3. Store feed/export credentials outside the public repository. Never commit tokens, private export URLs or passwords.
4. Preserve both a direct merchant destination URL and the ADCELL publisher/deeplink URL whenever the source provides both.
5. Validate image rights/usage and FundBlick image-quality rules before importing products.
6. Validate price, shipping, availability, coupon conditions and update timestamps before publishing an offer.
7. Update the active wording in the privacy notice to the actual integration in use.
8. Set `liveDisclosure:true` only when the active privacy wording matches production.
9. Set `enabled:true` only when the ADCELL provider is ready.
10. Set `outboundEnabled:true` only when real approved publisher/deeplinks may be used.
11. Set `trackingEnabled:true` only after the consent path has been tested end-to-end.
12. Run all CI checks and manually test accept, reject, withdrawal/settings, mobile layout and direct-link fallback before treating the integration as production-ready.

## Architecture rule

FundBlick must keep merchant destination data separate from affiliate tracking data. A generic `url` field is not assumed to be safe. Imports should explicitly identify `directUrl` and `affiliateUrl` (or `urlType`) so a tracking URL can never be used accidentally as a non-tracking fallback.

## Current production rule

Until the activation checklist is complete, all ADCELL flags stay false and no real ADCELL tracking or publisher link is served by FundBlick.
