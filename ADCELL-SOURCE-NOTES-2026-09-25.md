# ADCELL source notes — 2026-09-25

Source basis: user-provided screenshots of ADCELL public pages. These notes record only what was visible in those screenshots; architectural implications are marked separately.

## 1. ADCELL 3rd Party Tracking

Confirmed from screenshots:

- ADCELL offers a 3rd Party Tracking feature for publishers.
- A publisher can work with its own tracking pixel and use necessary data in real time in its own system.
- ADCELL states that third-party pixels can come from services such as Google Ads/Analytics, Yahoo Search, Bing, an own ad server, contextual advertising networks, retargeting pixels, ad networks and social networks.
- Setup is done after login via Publisher-Tools → 3rd Party Tracking by storing the relevant tracking code for the partner program.
- ADCELL states that the tracking code is then checked and approved by the ADCELL Publisher Team.
- A tracking code can be stored at partner-program level and, according to the page, also specifically for individual advertising media.
- ADCELL states that instead of the classic Sub-ID transfer, a variable value can be appended to the advertising-media code and then called at any point in the tracking code.
- Listed benefits include real-time reporting in the publisher's own system, faster reaction to program changes, optimization of SEM campaigns and own ad servers, scalability and improved partner-program performance.

FundBlick implication:

- Do not build or activate ADCELL 3rd Party Tracking merely because it exists. It is optional and separate from the core product-feed/deeplink integration.
- If used later, it must remain behind the existing consent/tracking gate and must not bypass FundBlick's consent decision.
- Treat any ADCELL-side approval of a tracking code as a separate activation prerequisite.
- Keep a future `subId` / `trackingVariable` field available in the outbound architecture without exposing personal data or secrets in the browser unnecessarily.

## 2. ADCELL Publisher Dashboard / Affiliate-Dashboard interface

Confirmed from screenshots:

- ADCELL describes an integration with the external service Affiliate-Dashboard.
- The purpose is to combine ADCELL statistics with statistics from other partner-program networks and display/evaluate them in one place.
- To use it, the publisher first registers with Affiliate-Dashboard.
- ADCELL then allows access data for external access to be generated on the ADCELL page.
- Those access data are entered in Affiliate-Dashboard under network management.
- Stated benefits include managing network figures in one tool, comparing network performance and simpler handling/usability.

FundBlick implication:

- This is optional operational/reporting infrastructure, not required for the first ADCELL feed integration.
- Any generated access credentials must be treated as secrets and must never be committed to the public FundBlick repository.
- FundBlick should keep its own internal reporting data model network-neutral so ADCELL can later be compared with other networks without redesigning the core schema.

## 3. ADCELL CSV-Mapper

Confirmed from screenshots:

- ADCELL explicitly positions product data from partner programs and online shops as useful for building a product price comparison or advertising a larger quantity of products.
- The data are provided as structured datasets in CSV files.
- ADCELL's CSV-Mapper allows the publisher to create an individualized selection of those product data.
- Data from advertiser CSV files / data feeds / product data can be exported and downloaded in a publisher-defined collection.
- The exported data can be adapted to the requirements of the publisher's website and imported into the publisher's own database.
- ADCELL states that product data can also be individualized from an SEO perspective.
- After configuration, the publisher receives a unique link / special export URL for the own CSV file.
- That export URL can be used to download/process feeds repeatedly and update product data automatically.
- Listed benefits include integration of product data from partner programs and online shops, free use based on advertiser-provided data, individual CSV creation, simple operation, individual product presentation and standardized updates via the unique export link.

FundBlick implication:

- This strongly confirms that the ADCELL CSV-Mapper is a suitable first real product-data source for FundBlick's price/product-comparison architecture.
- The existing generic mapping-driven ADCELL normalizer is the correct direction: actual field names should be mapped only after the real export has been inspected.
- The unique export URL must be treated as a secret credential. It must never be committed to the public repository, logged publicly or exposed in client-side JavaScript.
- Automated import should fetch the export server-side / CI-side, validate it, normalize it into the FundBlick schema and publish only sanitized catalog output.
- Do not assume that every partner program supplies all fields or that all advertiser feeds use identical columns.

## 4. ADCELL tool overview

Confirmed from screenshots:

ADCELL publicly presents the following tools/features in the Publisher/ADCELL-Tools area:

- Publisher Arena
- Seasonal calendar
- Partner-program optimization tools
- 3rd Party Tracking
- Publisher Dashboard / Affiliate-Dashboard integration
- CSV-Mapper

ADCELL states that its tools are free, partner-program based, individually configurable, implementable without major technical effort and continually extended.

FundBlick implication:

- Core priority remains CSV/product-feed integration + approved publisher/deeplinks + consent-safe outbound routing.
- Seasonal calendar, dashboard aggregation and 3rd-party tracking are secondary modules and should not delay first productive merchant/feed onboarding.

## 5. ADCELL Seasonal Calendar

Confirmed from screenshot of the ADCELL tools overview:

- ADCELL describes a year-round seasonal calendar with offers, e-commerce highlights and seasonal peaks.
- Partner programs can present their promotions and advertising materials there and can be applied to directly.

FundBlick implication:

- Potential later source for promotion discovery and seasonal merchandising ideas.
- It must not become an unverified coupon source; FundBlick's existing rule remains that promotions/coupons should be tied to an authoritative network or merchant source and verified before affecting the effective total price.

## 6. Publisher Arena

Confirmed from screenshots:

- ADCELL describes the Publisher Arena primarily as a tool for advertisers/agencies to find and recruit publishers for their partner programs.
- The page states that ADCELL has more than 135,000 publishers in this context.
- Advertisers can filter/search publishers, including by network ranking and partner-program categories.
- The system can show publishers with whom no partnership yet exists but who are successful in the advertiser's partner-program category.
- Results can be sorted by different properties such as name or turnover.
- Advertisers can invite publishers to apply/join, send direct messages and offer special conditions or commission increases.

FundBlick implication:

- FundBlick may potentially be discoverable by advertisers once active as an ADCELL publisher.
- Invitations, special conditions and increased commissions should be treated as program-specific commercial metadata and documented per partner program rather than hard-coded globally.
- Publisher Arena is not required for the technical first integration.

## 7. Priority order for FundBlick after registration

1. Complete publisher registration and obtain real ADCELL publisher access.
2. Inspect available partner programs and their specific participation conditions.
3. Use the CSV-Mapper / product-feed capability for the first real product-data pilot where suitable.
4. Keep the unique export URL and all access credentials outside the public repository.
5. Inspect real CSV columns before defining production mappings.
6. Keep direct merchant destinations and ADCELL tracking/deeplinks separated in the FundBlick data model.
7. Activate real outbound affiliate routing only after legal disclosure and consent behavior match the actual technical integration.
8. Consider Publisher Dashboard, Seasonal Calendar and 3rd Party Tracking only after the core feed/deeplink path is stable.

## 8. Non-negotiable architecture rule

The existence of additional ADCELL tools does not change FundBlick's activation discipline: no guessed API, no guessed feed schema, no public secrets, no tracking before consent, and no real affiliate routing before the actual ADCELL program/feed/deeplink data have been verified.
