# AHIPOS Horses – Feed Mapping V1

Stand: 2026-09-26  
Branch: `dev/ahipos-v1`

## Zweck

Dieser Stand dokumentiert ausschließlich die belastbare Normalisierungs- und Identitätslogik für AHIPOS Horses DE (Awin Advertiser 120341). Live bleibt unverändert. Die eigentliche Import-Implementierung folgt erst nach diesem Mapping-Gate.

## Eingangsfeeds

Es liegen zwei reale Awin-Feeds vor:

1. Generic/Awin Feed `data_feed_id=110252`
   - 28 Zeilen
   - 50 Spalten
   - stabile Varianten-ID: `merchant_product_id`
   - Awin Produkt-ID: `aw_product_id`
   - Affiliate-Link: `aw_deep_link`
   - Händler-Link: `merchant_deep_link`
   - Preis: `search_price`
   - Lager: `in_stock`, `stock_quantity`

2. Retail/Google-kompatibler Feed
   - 29 Zeilen
   - 62 Spalten
   - stabile Varianten-ID: `id`
   - Affiliate-Link: `aw_deep_link`
   - Händler-Link: `link`
   - Preis: `price`
   - Lager: `availability`
   - zusätzliche strukturierte Felder u. a. `gtin`, `mpn`, `brand`, `google_product_category`

## Wichtige Korrektur: Die beiden Feeds sind nicht additiv

Die Awin-Anzeige `57 Produkte / 2 Feeds` darf nicht als 57 eindeutige FundBlick-Produkte interpretiert werden.

Gemessene Identität über Varianten-ID:

- Generic Feed: 28 Varianten
- Retail Feed: 29 Varianten
- Überschneidung: 26 Varianten
- nur Generic: 2 Varianten
- nur Retail: 3 Varianten
- eindeutige Varianten nach Merge: **31**

Die Feed-Zeilen müssen deshalb vor Katalogbau nach stabiler Händler-Varianten-ID zusammengeführt werden. Ein einfaches Anhängen beider Feeds würde 26 Dubletten erzeugen.

## Produkt- vs. Variantenidentität

### Varianten-ID

Primärschlüssel für das Roh-Merge:

- Generic: `merchant_product_id`
- Retail: `id`

Beide referenzieren Shopify-Varianten-IDs und stimmen bei 26 Datensätzen exakt überein.

FundBlick-interne Varianten-ID soll deterministisch aus `advertiserId + merchantVariantId` entstehen.

### Produktgruppe

Varianten dürfen nicht pauschal als eigenständige Produkte behandelt werden. Die Händler-URL enthält den stabilen Produktpfad plus `?variant=<id>`.

Produktgruppierung V1:

1. Händler-Link nehmen.
2. Query-Parameter `variant` entfernen.
3. normalisierten Produktpfad als Gruppierungs-Evidenz verwenden.
4. Produktname nur unterstützend, nicht als alleinigen Schlüssel verwenden.

Gemessener Stand aus beiden Feeds:

- 31 eindeutige Varianten
- 25 eindeutige Händler-Produktpfade
- Beispiele echter Variantenfamilien:
  - `ahipos-motion-boost-60ml`: 4 Varianten
  - `ahipos-sulfo-immun-der-kraftvolle-immun-booster-fur-dein-pferd`: 3 Varianten
  - `ahipos-ice-clay`: 2 Varianten

Damit muss der Importer Varianten erhalten und darf gleiche Produktnamen nicht blind deduplizieren.

## Feld-Prioritäten beim Merge

Wenn eine Varianten-ID in beiden Feeds existiert, wird feldweise zusammengeführt. Kein Feed gewinnt global.

### Identität

- `merchantVariantId`: Generic `merchant_product_id`, sonst Retail `id`
- `awinProductId`: Generic `aw_product_id`, falls vorhanden
- `advertiserId`: `120341`
- `merchant`: `Ahipos Horses DE`
- `network`: `awin`

### Name / Beschreibung

- Produkt-/Variantentext bleibt Händler-Quelltext.
- Retail `title` kann Variantenausprägungen enthalten und ist für den Variantennamen nützlich.
- Generic `product_name` ist für den übergeordneten Produktnamen vorzuziehen, wenn der Retail-Titel lediglich Suffixe wie Menge/Packung ergänzt.
- `description` wird nicht von FundBlick umgeschrieben oder medizinisch verstärkt.

### Preis

- Generic `search_price` und Retail `price` stimmen bei den 26 gemeinsamen Varianten numerisch überein.
- Preis wird als numerischer EUR-Wert gespeichert.
- Währung Generic `currency`, sonst aus Retail `price` extrahieren.
- Keine erfundene UVP oder Ersparnis; nur Händler-/Feedwerte verwenden.

### Affiliate-/Direktlink

- `affiliateUrl`: bevorzugt Generic `aw_deep_link`, sonst Retail `aw_deep_link`
- `directUrl`: Generic `merchant_deep_link`, sonst Retail `link`
- Affiliate-Link niemals aus Direktlink selbst konstruieren, solange Awin einen gültigen Deeplink liefert.

### Bilder

- Hauptbild bevorzugt aus Händler-/Retail-Quelle (`merchant_image_url` bzw. `image_link`).
- zusätzliche Bilder nur aus bereitgestellten Feedfeldern übernehmen.
- keine Bildmanipulation und keine frei erfundenen Produktbilder.

### GTIN / MPN / Brand

- Retail ist primäre Quelle für `gtin`, `mpn`, `brand`.
- GTIN ist bei 25 von 29 Retail-Zeilen vorhanden.
- MPN ist nur schwach befüllt und darf daher kein Pflichtfeld sein.

## Verfügbarkeit: Konfliktregel zwingend

Bei zwei gemeinsamen Varianten widersprechen sich die Feeds:

- `Ahipos Immun & Detox Bundle`: Generic meldet `in_stock=1`, Retail meldet `out_of_stock`
- `Ahipos Gelenk-Bundle`: Generic meldet `in_stock=1`, Retail meldet `out_of_stock`

Deshalb darf Verfügbarkeit nicht nach dem Prinzip "irgendein Feed sagt lieferbar" zusammengeführt werden.

V1-Sicherheitsregel:

- bei widersprüchlicher aktueller Feed-Evidenz konservativ `OUT_OF_STOCK` / nicht kaufbar setzen
- Konflikt als Datenqualitätsflag speichern
- keine Variante aufgrund eines einzelnen positiven Flags als kaufbar darstellen, wenn ein zweiter aktueller Awin-Feed sie explizit als `out_of_stock` kennzeichnet

Retail-only Varianten sind derzeit drei und alle `out_of_stock`; sie bleiben im Katalog grundsätzlich als reale Varianten erhalten, aber nicht als kaufbare Angebote.

## Taxonomie

AHIPOS-Händlerkategorien sind Evidenz, nicht FundBlick-Informationsarchitektur.

Die bisherige Registry deckt vor allem Casa-Moro-Familien ab (`furniture`, `lighting`, `decor`, `living`). Pferdeprodukte dürfen daher **nicht** künstlich in diese Familien gezwungen werden, nur um das bestehende 70%-Onboarding-Gate zu erfüllen.

Für AHIPOS ist eine neue echte FundBlick-Familie fachlich gerechtfertigt, z. B. `pet.equestrian` / öffentliche Familie Pferd & Reitsport. Produkttypen und Facetten müssen aus realen Feeddaten abgeleitet werden und dürfen keine medizinischen Wirksamkeitsbehauptungen erzeugen.

Geeignete strukturierte Ausgangsevidenz:

- `merchant_category`
- `google_product_category`
- `product_type`, falls befüllt
- Händlername/Brand
- Produktname
- vorhandene strukturierte Attribute

Freitextbeschreibung darf Suche unterstützen, soll aber nicht automatisch neue Gesundheitsclaims oder klinische Kategorien erzeugen.

## Gesundheits-/Claim-Sicherheitsregel

AHIPOS-Texte enthalten gesundheitsbezogene Händlerformulierungen. FundBlick übernimmt diese nur als gekennzeichneten Händler-Quelltext und formuliert sie nicht selbst stärker um.

Insbesondere:

- keine Heilversprechen generieren
- keine Diagnose-/Therapieaussagen aus Freitext ableiten
- keine eigene Wirksamkeitsbewertung
- keine automatische Übersetzung, die Claims semantisch verstärkt
- FundBlick-eigene Taxonomie sachlich halten, z. B. Produktart/Form/Packungsgröße statt behaupteter Wirkung

## Import-Gates vor UI-Integration

Der nächste Implementierungsblock muss automatisiert prüfen:

1. 28 Generic + 29 Retail Rohzeilen werden eingelesen.
2. Merge ergibt 31 eindeutige Varianten, nicht 57.
3. 26 Überschneidungen werden erkannt und nicht dupliziert.
4. 25 Produktpfade werden als Gruppierungs-Evidenz erkannt.
5. Preisgleichheit gemeinsamer Datensätze wird geprüft.
6. Availability-Konflikte werden erkannt und konservativ behandelt.
7. Affiliate- und Direktlinks bleiben getrennt.
8. Händler-Quelltexte werden nicht umgeschrieben.
9. keine Casa-Moro-Familie wird als Fallback für AHIPOS erzwungen.
10. Live-Katalog und `main` bleiben bis zu grünen Regression-/UI-Gates unangetastet.

## Nächster Block

Implementierung eines isolierten `ahipos-feed-normalizer` plus Verifier/Testfixture auf `dev/ahipos-v1`. Erst wenn dieses Daten-Gate reproduzierbar grün ist, wird AHIPOS in den gemeinsamen Development-Katalog und anschließend in Suche/Facetten/Handoff integriert.
