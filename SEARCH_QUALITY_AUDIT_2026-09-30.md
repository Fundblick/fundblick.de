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

## Follow-up: attribute evidence

Implemented on development after the runtime correction:

- Query and result brand detection now requires Unicode token boundaries; `Modell`, `Hochpreisiges`, `Shellac`, `Mobilität` and `Trekking` cannot establish Dell, HP, Shell, Mobil or Trek. Hyphenated LIQUI-MOLY remains recognized.
- Extract title, product URL path and description independently. Do not use URL hostname/query parameters as product evidence.
- Preserve the source for each attribute. Structured attributes, title and URL are stronger evidence; description-only values have MEDIUM confidence. A description alone cannot establish the linked product's brand.
- When strong sources disagree, omit the disputed attribute and record the conflict. Multiple volume/viscosity variants in strong sources also remain unknown. Equivalent `5000 ml` / `5 l` agree.
- Unit normalization must not recover rejected quantities from the original snippet or publish their derived unit price. Preserve quantity confidence in derived fields.
- Do not deduplicate disputed variants into an unambiguous offer merely because their titles match.
- Do not extract wattage from motor-oil viscosity.

Replayed the saved real-search responses without additional upstream requests: the OBI URL now yields 1 litre and EUR 9.99/l instead of 5 litres and EUR 1.998/l; it no longer inherits Castrol. The Fortuna tire URL no longer inherits Continental from its snippet. The Bosch candidates retain Bosch.

Added regression coverage in the existing core, extractor, deduper and pipeline tests. All 19 local search/intelligence gates pass. Product-page validation, query improvement and low eligible-offer counts remain open.

## Follow-up: measured query refinement (roadmap block 2)

Compared three variants for each of the three reference queries: existing query, product-aware query plus `kaufen`, and product-aware query plus `kaufen -preisvergleich -site:idealo.de -site:geizhals.de`. Nine requests total; count=20, offset=0, country=DE, lang=de. No additional automatic searches or request limit increases were introduced in the frontend.

Counts below use the current offer filter and attribute reconciliation. “Exact” means all attributes extracted from the user's query are known and agree, with no attribute evidence conflicts. It does not confirm stock, checkout price, every model feature, or successful purchase on the merchant page.

| Query | Existing eligible / exact | Focused eligible / exact | Decision |
| --- | --- | --- | --- |
| 10W40 5 Liter | 1 / 0 | 6 / 5 | Enable focused query |
| Bosch Akkuschrauber 18V | 3 / 3 | 4 / 4 | Enable focused query |
| Winterreifen 205/55 R16 | 1 / 1 | 0 / 0 | Keep existing query |

The tire variants surfaced a size-selection page (`/winterreifen/groesse/205-55-r16/`), not a direct product offer. Added this listing pattern to the offer filter; it is excluded from the reported focused tire counts.

Implemented `buildOffers` and connected it to Offers in the browser runtime. Focused queries apply only to the two tested product categories in German. Other categories, languages, and information/video/local views retain their existing query behavior. If focus operators exceed the worker's 120-character query budget, retain the existing strategy instead of appending operators that would be truncated.

Added query strategy and runtime regressions for category/language scope, query preservation, request budget, browser dependency wiring, consistent pagination queries and unchanged information search. Updated script versions so the development page loads the corrected modules.

Block 2 remains in progress: tire retrieval, wider reference-query coverage, merchant-page price checks, ranking and model fidelity still need work. Blocks 3–5 and Development acceptance remain open as recorded in the Desktop handoff.

## Follow-up: remaining reference-query families (roadmap block 2)

Four additional worker requests using the existing offer queries, count=20 and offset=0: `Adidas Damen Schuhe EU 39`, `Samsung Fernseher 55 Zoll`, `Samsung Smartphone 256 GB`, and `Lenovo Laptop 512 GB`. Replayed the saved responses after corrections; no extra upstream requests during replay.

Findings fixed:

- Shoe brand/size category pages from eschuhe and Sizeer were counted as products. Exclude their observed listing paths.
- Samsung's 55-inch TV overview was counted as a direct offer. Exclude the observed overview path while retaining specific product pages.
- A Netzwelt deal article and a mydealz group page leaked into offers. Exclude these editorial/group paths.
- RAM was read as storage: e.g. `16 GB RAM 512 GB SSD` became 16 GB storage. Use one shared parser in query analysis and result extraction to keep RAM and disk/phone storage separate.
- The Samsung A26 URL contained `8256GB` alongside `256 GB`. Recognize the phone-specific concatenated RAM/storage form instead of flagging a false 8256-vs-256 conflict.
- Multiple storage variants remain ambiguous. Equivalent decimal GB/TB capacities agree in evidence and ranking (1 TB = 1000 GB); different units cannot cause a false numeric match.
- The only remaining Lenovo candidate was a ThinkCentre mini-PC. Category schemas can now declare explicit incompatible product kinds. The laptop schema rejects clearly named desktop/mini-PC products using title or URL evidence; unrelated description text does not reject a laptop. These exclusions have their own quality count and are not counted as duplicates.

| Query | After correction, first upstream page | Remaining work |
| --- | --- | --- |
| Adidas Damen Schuhe EU 39 | 0 suitable candidates; both apparent offers were listings | Improve direct-product retrieval; validate actual product sizes |
| Samsung Fernseher 55 Zoll | 2 matching direct-offer candidates | Check merchant prices and model details |
| Samsung Smartphone 256 GB | 2 matching direct-offer candidates | Check merchant prices and availability |
| Lenovo Laptop 512 GB | 0 suitable candidates; explicit mini-PC excluded | Improve laptop retrieval |

Candidate counts are not a final confirmation of stock, checkout price or every model requirement. The original 20 product classes and earlier regression cases remain covered. The storage parser adds one automated gate, bringing local search/intelligence checks to 20. Browser dependency wiring for the new module is covered by the existing runtime harness; the full Development browser acceptance remains open.

## Follow-up: merchant-page price checks and real-data sorting

Read-only merchant-page checks through the web tool (cached/indexed page extraction, not a checkout session): [OBI 5L oil](https://www.obi.de/p/5805247/liqui-moly-nr-1-leichtlaufmotoroel-10w-40-5-l), [Böttcher Bosch drill](https://www.bueromarkt-ag.de/akku-bohrschrauber_bosch_gsr_18v-65_professional,p-06019n3203.html), [MediaMarkt A26](https://www.mediamarkt.de/de/product/_samsung-galaxy-a26-5g-8256gb-black-256-gb-black-dual-sim-152441604.html).

OBI confirms EUR 34.99 for 5L and displayed EUR 7.00/L, consistent with the calculated 6.998 rounded to two decimals. Shipping is separate; this is not a landed-price comparison. The A26 page confirms the 8+256GB variant; the saved EUR 319.35 price was not confirmed by the retrieved text.

Böttcher's EUR 236.81 is a qualifying minimum spend for a promotional gift. It is not this drill's purchase price. The retrieved page also contains tiered prices and business/private-customer VAT modes; do not substitute one of these values automatically. Added shared visible-price evidence for cards and confidence assessment: skip explicitly marked minimum spend, shipping, coupon/discount amounts, crossed-out/UVP context and per-unit prices; reject metadata matching only such amounts. Independent different verified prices remain usable. When a valid visible offer price exists, sort metadata uses that same amount.

Saved Bosch data exposed URL-decimal loss: `1-5ah` and `4-0-ah` became 5Ah and 0Ah. Normalize the demonstrated Ah slug form before decoding separators. Keep model `18V-65` and motor-oil `10w-40-5-l` unchanged. Do not generalize all numeric hyphens to decimals.

Replayed all saved samples without another provider search. Current suitable counts in first 5/10/20 upstream results: focused oil 3/6/6; focused Bosch 2/3/3 (one false promotional price removed); baseline tires 0/1/1; shoes 0/0/0; TV 1/2/2; smartphones 2/2/2; laptops 0/0/0. Counts are pipeline-eligible candidates, not confirmed complete offers. Ascending oil prices: 9.99, 20.95, 20.99, 21.35, 26.54, 34.99 EUR; ascending unit prices: 4.19, 4.198, 4.27, 5.308, 6.998, 9.99 EUR/L. The 1L result remains a marked query conflict under the existing thin-result fallback.

Open: mixed-currency/unit-basis sorting, equivalent storage facets, full browser acceptance, all merchant stock/checkout prices, stronger model fidelity and sparse-query retrieval.
