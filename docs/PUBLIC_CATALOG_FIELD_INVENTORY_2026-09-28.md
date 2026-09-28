# FundBlick – Public Catalog Field Inventory – 28.09.2026

## Zweck
Vor Einführung einer Public-Field-Allowlist wird hier festgehalten, welche Produktfelder die aktuelle Browser-Runtime tatsächlich benötigt. Die Allowlist darf erst umgesetzt werden, wenn dieser Vertrag durch Regressionstests abgesichert ist.

Grundsatz: Import-/Quellobjekte dürfen nicht pauschal über `...raw` an die öffentliche Kataloggrenze gelangen. Der Public-Katalog soll ausschließlich bewusst freigegebene Felder enthalten.

## Aktueller Risikopunkt
`build-live-catalog.js::enrichProduct()` übernimmt derzeit das komplette Quellobjekt per `...raw`. Dadurch können zukünftige Importer neue interne Felder unbeabsichtigt öffentlich machen.

## Öffentliche Kernfelder – erforderlich

### Identität / Anzeige / Suche
- `id` – stabile Produktidentität, Shard-/Dedupe-/Deal-Zuordnung.
- `name` – Suche, Karten, Tagesangebot.
- `description` – Volltextsuche und Feature-/Facet-Erkennung.
- `brand` – Suche, Brand-Facet, Karten, Tagesangebot.
- `category` – Suche, Kategorieauswahl, Shard-Selektion, Facets.
- `image` – Karten/Tagesangebot.
- `currency` – Preis-/Offer-Vertrag; aktuell EUR, aber für Multi-Merchant nicht hart entfernen.
- `active` – Deal-Verfügbarkeit/Kompatibilität; Public-Builder soll nur aktive Produkte publizieren, Feld kann für Runtime-Kompatibilität zunächst erhalten bleiben.
- `testData` – harte Produktions-/Runtime-Grenze real vs. Testdaten.

### Preis / Versand / Verfügbarkeit
- `price` – aktueller sichtbarer Preis und Deal-Auswahl.
- `sourcePrice` – aktuell Build-/Kompatibilitätsfeld; vor endgültiger Allowlist prüfen, ob Runtime es außerhalb von Tests benötigt. Kandidat für spätere Entfernung.
- `shippingCost` – Karten/Offer-Fallback.
- `totalPrice` – Angebots-/Preislogik.
- `effectiveTotalPrice` – Promotion-/Offer-Kompatibilität.
- `promotionSavings` – Promotion-Kompatibilität; bei realen aktuellen Produkten typischerweise 0.
- `inStock` – Karten, Tagesangebot, Suche.
- `availability` – wird von Deal-/Kartenlogik als Produktfallback gelesen; falls ausschließlich Offer-basiert garantiert, später reduzierbar.
- `deliveryDays` – Karten/Facets/Sortierkompatibilität.
- `priceFrom`, `totalPriceFrom`, `effectiveTotalFrom` – Loader-/Multi-Offer-Kompatibilität.
- `originalPrice`, `referencePrice`, `rrpPrice` – nur soweit ein Importer belastbare Händler-Referenzpreise liefert; für qualifizierte Merchant-Reference-Deals benötigt. Nicht synthetisieren.

### Händler / Affiliate / Angebote
- `merchant` – Karten, Tagesangebot, Merchant-Facet/Anzeige.
- `merchantId` – nur falls produktseitig von Runtime/Gates benötigt; Offer-`merchantId` ist für Multi-Merchant-Deal-Evidenz erforderlich.
- `merchantCount` – Deal-/Such-/Kompatibilitätsmetrik.
- `directUrl` – Produktfallback für Händler-CTA, soweit kein Offer-Ziel vorhanden ist.
- `affiliateUrl` – Produktfallback für Affiliate-CTA, soweit kein Offer-Ziel vorhanden ist.
- `offers` – zentrale öffentliche Angebotsstruktur.
- `bestOffer` – Karten, Tagesangebot, Loader/Runtime.
- `bestEffectiveOffer` – aktuelle Build-/Kompatibilitätsstruktur; vor Entfernung Tests prüfen.
- `simulatedOffers` – harte Deal-Sicherheitsgrenze; reale Produktion muss `false` sein.
- `simulatedPromotions` – Produktions-/Promotion-Sicherheitsgrenze.

### Offer-Felder – erforderlich bzw. bewusst öffentlich
Je `offers[]` / `bestOffer`:
- `id`
- `merchantId`
- `merchant`
- `price`
- `shippingCost`
- `shippingKnown`
- `totalPrice`
- `totalPriceKnown`
- `effectiveTotal`
- `currency`
- `deliveryDays`
- `availability`
- `inStock`
- `simulated`
- `promotions` – derzeit bei realen Offers leer; für generisches Offer-Schema beibehalten, aber separat sanitizen.
- `network` – Affiliate-Policy/Outbound benötigt Provider-Kontext.
- `directUrl`
- `affiliateUrl`
- `updatedAt` – Deal-Freshness bei Multi-Merchant-Evidenz.

### Taxonomie / dynamische Facets
Diese Felder dürfen nicht versehentlich durch eine zu enge Allowlist verloren gehen:
- `family`
- `taxonomy`
- `rawAttributes`
- `attributes`
- weitere kanonische, vom Facet-Enrichment bewusst erzeugte öffentliche Facetfelder nur nach Inventar/Tests.

`live-catalog-ui.js` liest insbesondere `rawAttributes.productType`. `search.js` nutzt Produktname/Beschreibung sowie Taxonomie-/Facetdaten für dynamische Erkennung und Filterung.

### Source-Metadaten
`source` darf NICHT pauschal öffentlich übernommen werden.

Aktuell existiert Runtime-Fallback auf `product.source.network`. Ziel der Härtung ist, den benötigten Provider explizit über `offer.network` bzw. ein bewusstes öffentliches `network`-Feld bereitzustellen. Interne Source-Metadaten wie Feed-Datei, Importpfad, Rohzeilennummer, Debugdaten, Importstatus oder Credentials dürfen niemals wegen eines `source`-Spread öffentlich werden.

## Felder, die standardmäßig NICHT öffentlich werden dürfen
Nicht in die Public-Allowlist aufnehmen, sofern nicht später ausdrücklich begründet und getestet:
- interne Feed-Dateinamen/-pfade
- Rohfeed-Zeilen / Raw Payloads
- Import-Status / Import-Fehler / Debugdaten
- interne Dedupe-/Matching-Hilfsfelder
- interne Qualitäts-/Confidence-Scores
- Provisionen / Margen / EPC / Revenue-Daten
- interne Ranking-/Scoringparameter
- API-Keys, Tokens, Secrets, Zugangsdaten
- interne Notizen
- Supplier-/Partnerdaten ohne Frontend-Zweck
- personenbezogene oder operative Kontaktinformationen

## Suchindex ist eigener Public-Vertrag
Der kompakte Suchindex darf nur enthalten:
- `i` Produkt-ID
- `n` Name
- `b` Marke
- `c` Kategorie
- `q` normalisierter Suchtext
- `p` Produktpreis
- `t` Gesamtpreis soweit bekannt
- `r` derzeit identisch zu Gesamtpreis; Zweck vor späterer Schemaänderung prüfen
- `o` Händleranzahl
- `u` Währung
- `s` Shard-ID

Keine Affiliate-URLs, Source-Rohdaten, Provisionen oder internen Importmetadaten in den Suchindex aufnehmen.

## Home-Deal-Pool
`home-deals.*.json` enthält derzeit vollständige angereicherte Produktobjekte. Die künftige Allowlist muss daher sowohl Shards als auch Home-Deal-Pool schützen. Es darf keine zweite ungesäuberte Public-Grenze entstehen.

## Implementierungsplan
1. Regressionstest/Gate anlegen, das verbotene Sentinel-Felder in einem Test-Quellprodukt setzt und beweist, dass sie im Public-Output nicht erscheinen.
2. `publicProduct(raw/enriched)` als explizite Projektion einführen; kein `...raw` im finalen Public-Objekt.
3. `publicOffer()` und bei Bedarf `publicPromotion()` separat definieren.
4. Taxonomie-/Facetfelder explizit übernehmen und vorhandene Such-/Facet-/Karten-/Deal-Gates laufen lassen.
5. `source` auf notwendige öffentliche Providerinformation reduzieren bzw. Runtime auf `offer.network` umstellen.
6. Shards und `home-deals` gegen verbotene Feldnamen/Secrets prüfen.
7. Search-Index-Vertrag separat unverändert absichern.
8. Erst nach grünen Gates PR vorbereiten.

## Abnahmekriterien
- 1.459 reale Produktionsprodukte bleiben vollständig nutzbar.
- Keine Änderung an Produktanzahl, Händleranzahl oder real/simulated-Zählung.
- Suchrelevanz, dynamische Facets, Karten und Tagesangebot bleiben funktional identisch.
- Affiliate-/Direct-Fallbacks bleiben funktional identisch.
- Keine verbotenen Sentinel-/Rohfelder in Shards oder Home-Deal-Pool.
- Keine neuen simulierten Daten.
- `main`/Live bleiben bis zum vollständigen Release-Gate unangetastet.
