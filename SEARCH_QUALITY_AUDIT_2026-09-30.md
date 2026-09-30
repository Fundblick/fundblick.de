# External offer quality audit — 2026-09-30

Branch: development. Production/main unchanged.

## Method

Three requests to the configured Brave search worker, count=20, offset=0, lang=de, country=DE. Query refinement, result normalization, price annotation and intent ranking match the frontend. These are search-response checks, not verification of merchant pages, current stock or checkout prices. Only one upstream page per query was fetched to keep traffic low.

## Findings and fixes

- Price-comparison sources (including idealo and Geizhals) with visible prices leaked into Offers. Exclude comparison sources and observed merchant listing paths from Offers; information results remain available.
- Eligibility was applied inside the card renderer, after intelligence and pagination. Rejected results therefore consumed page slots and polluted facets. Filter before the intelligence pipeline and pagination.
- Initial prefetch counted priced product signals rather than eligible, deduplicated offers. Use the prepared intelligence result count to decide whether another page is needed, retaining the existing request ceiling.
- Real rendering paths threw ReferenceError for undeclared `prev`, `title` and `link`. Declare the navigation button and card heading/link variables.
- Add `verify-external-search-runtime.js` to the integrity gate. It executes the actual runtime and card renderer in a DOM harness, checks 20 eligible cards, second page, rejected listing facets, duplicate/listing prefetch and unchanged information view.

## Remaining quality work

The first 20 upstream responses provide very few eligible direct-offer candidates after exclusions: about 1 for `10W40 5 Liter`, 1 for `Winterreifen 205/55 R16`, and 3 for `Bosch Akkuschrauber 18V` in this sample. These counts are not confirmed query-correct purchasable offers.

- Improve refined queries so they retrieve product details instead of category/price-comparison pages.
- Search snippets can describe other products than the destination URL: an OBI 1-litre URL carried a 5-litre/Castrol snippet, and a Fortuna tire URL carried Continental text. Reconcile title/URL/snippet evidence before trusting attributes or calculating unit prices.
- Brand substring extraction can infer Dell from `Modell` or HP from unrelated text. Require token boundaries and prefer product-specific evidence.
- Validate candidate prices against actual merchant pages; headline/snippet prices can refer to other variants or unit prices.
- Check subsequent pages, mobile layout and request budgets in a full browser run before release.

No live release is authorized by this audit.
