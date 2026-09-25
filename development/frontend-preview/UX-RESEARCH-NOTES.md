# FundBlick Frontend UX research notes — 2026-09-25

## Applied decisions
- Search is the primary product-finding path. Support exact models, product types, features, synonyms and spelling variants rather than requiring catalogue vocabulary.
- Autocomplete must reduce effort, not add duplicate noise. Suggestions stay short, relevant, keyboard-operable and visibly scoped when useful.
- Search results are a comparison workspace: one product family/list item, multiple merchant offers behind it, total price including shipping prominent, relevant attributes scannable.
- Desktop filters remain beside results; mobile gets a dedicated filter interaction and visible applied filters.
- Homepage is sparse but deliberately spacious: few elements, dominant search, one immediate visual proof of FundBlick's value.
- Avoid fake urgency, persuasive clutter and sponsored-ranking ambiguity. Affiliate monetization must not masquerade as relevance.
- Accessibility baseline: semantic labels, visible keyboard focus, no focus-obscuring overlays, sufficiently large controls, reduced-motion support and robust combobox semantics.
- Performance baseline: system font, minimal JS, no hero-image dependency, stable layout, small DOM and no third-party frontend payload in the preview.

## International / SEO target
Production target: crawlable language URLs `/de/`, `/ru/`, `/tr/`, `/uk/`, `/en/`; localized content and metadata; self-referencing canonicals; reciprocal hreflang clusters plus x-default where appropriate; language-local internal links; localized query dictionaries/synonyms; localized category/product slugs where maintainable; sitemap generation from the same locale/product source of truth.

The static development preview remains `noindex,nofollow`; its JavaScript language switcher is a UX prototype, not the final SEO implementation.

## Sources reviewed
- Google Search Central: localized versions / hreflang documentation, updated 2026-09-22.
- W3C WAI: WCAG 2.2 Understanding docs, especially focus visibility, focus not obscured and target size.
- Baymard Institute: 2026 ecommerce search query-type research; ecommerce search UX; product lists/filtering; mobile ecommerce usability and applied-filter research.
- web.dev: LCP, INP and CLS optimization guidance.

## Self-critique checklist
1. First visitor: purpose clear within seconds without reading marketing prose?
2. Mobile: search, filter, compare and merchant exit usable one-handed without tiny targets?
3. Desktop: width used for comparison rather than stretched prose?
4. Non-German user: language treated as content/URL architecture, not translated chrome?
5. Google: localized pages crawlable, internally linked, canonicalized and reciprocally hreflang-linked?
6. Accessibility: complete search flow keyboard-operable and understandable without color alone?
7. Performance: does every loaded byte help product finding or comparison?
8. Affiliate revenue: merchant exit clear at the decision point without manipulating ranking?
9. Scale: product/offer rendering data-driven without DOM or UI patterns exploding with catalogue size?
