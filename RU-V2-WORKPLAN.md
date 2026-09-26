# FundBlick RU V2 – Safe implementation workplan

Branch: `dev/ru-v2-safe`
Baseline: production `main` at `81415310c9f794dc728de4f51262476cb449b1ea`
Production changes: FORBIDDEN until all gates below pass.

## Incident finding from RU V1
RU V1 mixed localization with runtime/navigation changes. Static/regression CI was green but did not exercise the actual browser journey. Production deployment success therefore did not prove usable navigation. The recovery restored `index.html`, `search.html`, `language-links.js` and `live-catalog-ui.js` to the known-good runtime behavior.

## Separation of responsibilities
- Navigation/history: URLs, browser history, back/forward behavior only.
- i18n: FundBlick-owned labels/copy and locale formatting only.
- Merchant data: source product/merchant text is preserved; no invented localization.
- Taxonomy/facets: stable internal values/IDs; localized display labels only.

## Gate 0 – unchanged baseline
Before RU V2 implementation, the branch must reproduce current stable production behavior.
Required journeys, desktop and mobile viewport:
1. Open homepage.
2. Change language selector without page freeze.
3. Submit a product search.
4. Search page renders and remains interactive.
5. Open/refine filters and execute/refine search.
6. Browser Back returns correctly.
7. Browser Forward returns correctly.
8. Home navigation works.
9. Repeat search after navigation.
10. No uncaught JavaScript errors, navigation loops, duplicate controls, blocking overlays or runaway URL mutation.

## Gate 1 – RU implementation order
Implement and test one layer at a time:
1. Homepage owned copy.
2. Header/footer/navigation labels (without navigation rewrites).
3. Search-page owned copy.
4. Search states/messages.
5. Common filter labels.
6. Product-specific facet labels.
7. Category display labels.
8. Merchant-card FundBlick-owned labels; merchant source text preserved.
9. Impressum.
10. Datenschutz.
11. Empty/error states.
12. 404/remaining public pages.

After every layer rerun Gate 0 plus localization assertions. Do not merge layers merely because static CI passes.

## Gate 2 – RU completeness rules
A Russian view must not contain German FundBlick-owned UI text unless explicitly allowlisted. Original merchant/product source copy is not a localization failure. Tests must distinguish these two classes.

## Gate 3 – release
Required before merge to `main`:
- JavaScript/schema/unit/regression CI green.
- Browser E2E green on mobile and desktop.
- Back/forward/history green.
- Language switching green.
- Search/filter execution green.
- No console errors.
- Diff review confirms no unrelated runtime/navigation rewrite.

Only then: PR -> review -> merge -> production deployment -> live browser smoke test.
If the live smoke test fails: revert to immediately previous known-good production commit; do not patch production iteratively.

## RU V1 reuse policy
RU V1 is reference material only. Reuse isolated translations/dictionaries after review. Do not wholesale copy runtime wiring, navigation mutation or link-rewriting logic.
