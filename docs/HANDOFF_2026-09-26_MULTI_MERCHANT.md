# FundBlick – Handoff / Arbeitsstand – 26.09.2026

## Zweck
Diese Datei ist der verbindliche Einstiegspunkt für die nächste Arbeitssitzung. Sie dokumentiert den heute erreichten Stand nach Integration des zweiten Händlers, den dabei stabilisierten Multi-Merchant-/Facet-/Kategorie-Mechanismus sowie die wichtigsten Lernregeln. Vor neuen Änderungen zuerst diese Datei lesen.

## Aktueller Produktionsstand
- Live-Domain: `fundblick.de`
- Aktueller produktiver `main`-Commit nach PR #15: `d9e0da6816f11e5bf28e43c2d558d6fcc2c6745e`
- Production-Workflow nach diesem Merge: Run #184, erfolgreich.
- Nutzer hat den Live-Stand anschließend manuell geprüft und bestätigt, dass die Änderungen sichtbar und funktionsfähig sind.
- Produktionskatalog: 1.459 reale Produkte, 0 simulierte Produkte.
- Händlerbestand:
  - Casa Moro: 1.428 Produkte
  - Ahipos Horses DE: 31 Varianten

## Händlerstatus
### Händler 1 – Casa Moro
Casa Moro ist der erste reale Händler und war der Ausgangspunkt für die ursprüngliche Such-/Facet-Architektur. Die dort gefundenen Probleme wurden als dauerhafte Regeln in Tests, Audits und Onboarding-Dokumentation überführt.

### Händler 2 – Ahipos Horses DE
Ahipos ist produktiv integriert und war der erste Händler, der nach dem verbesserten Onboarding-Prozess vollständig eingebaut wurde.

Verifizierte Ahipos-Struktur:
- 2 Awin-Feeds dürfen nicht einfach addiert werden.
- 28 Generic-Feed-Zeilen + 29 Retail-Feed-Zeilen.
- 26 Varianten überschneiden sich zwischen beiden Feeds.
- 31 eindeutige Varianten insgesamt.
- 25 eindeutige Produktgruppen nach Gruppierung über den direkten Händler-Produktpfad ohne `variant`-Query.
- 2 Generic-only-Varianten.
- 3 Retail-only-Varianten.
- 2 gemeinsame Varianten mit widersprüchlicher Verfügbarkeit; diese werden konservativ als nicht verfügbar behandelt.
- Preise der 26 gemeinsamen Varianten waren numerisch konsistent.

## Ahipos-Datenregeln
- Stabile Varianten-ID: Händler-/Advertiser-Kontext + `merchant_product_id`.
- Produktname ist niemals Dedupe-Key.
- Affiliate-Link und direkter Händlerlink bleiben strikt getrennt.
- Generic `delivery_cost=0` darf als 0 EUR übernommen werden.
- Retail-only ohne Versandnachweis bleibt `shippingCost=null`; niemals kostenloser Versand erfinden.
- Widersprüchliche Verfügbarkeit -> konservativ `OUT_OF_STOCK` / nicht kaufbar + Konfliktkennzeichnung.
- Händlertexte werden nicht automatisch in eigene FundBlick-Claims umgeschrieben.
- Insbesondere Gesundheits-/Heilversprechen nicht verstärken, nicht neu formulieren und nicht als eigene FundBlick-Aussage ableiten.
- Produktbeschreibungen werden aktuell nicht künstlich gekürzt/umgeschrieben, solange kein sauberer Source-Text-Mechanismus besteht.

## Ahipos-Kategorien
Die Ahipos-Daten sind nicht komplett Pferd/Reitsport. Aktuelle reale Zuordnung:
- 29 Produkte: `pet.equestrian` -> sichtbare Kategorie `Pferd & Reitsport`
- 1 Produkt: `pet.dog` -> sichtbare Kategorie `Hund`
- 1 Produkt: `health.supplements` -> sichtbare Kategorie `Gesundheit & Nahrungsergänzung`

Nicht alle Ahipos-Produkte pauschal in `pet.equestrian` zwingen.

## Startseiten-Kategorien
Die Startseite ist nicht mehr Casa-Moro-only.

Der Production-Build erzeugt jetzt ein kleines Manifest:
- `catalog/categories.json`

`home-categories.js` liest dieses Manifest und baut die sichtbaren Kategorien daraus. Statische Fallback-Links bleiben in `index.html`, falls das Manifest nicht geladen werden kann.

Aktuell erwartete 7 Kategorien:
1. `home.living`
2. `home.furniture`
3. `home.lighting`
4. `home.decor`
5. `pet.equestrian`
6. `pet.dog`
7. `health.supplements`

Die neuen Kategorien sind mindestens in DE/RU geprüft; zusätzliche Sprachlabels sind in `home-categories.js` hinterlegt.

## Händler vs. Hersteller/Marke – verbindliche Semantik
Händler und Hersteller/Marke sind zwei unterschiedliche Filterdimensionen und dürfen nie wieder vermischt werden.

### Händler
Aktuell genau zwei reale Händler:
- Casa Moro
- Ahipos Horses DE

### Hersteller / Marke
Ahipos enthält mehrere Marken-/Brandwerte. Feed-Schreibweisen werden normalisiert:
- `AHIPOS Horses`
- `ahipos-horses`
- `Fast Bundle` im Ahipos-Kontext

werden in der UI als Marke `Ahipos Horses` zusammengeführt.

`Equinox Equine` bleibt eine eigene Marke.

Die zwei Awin-Sheets sind Datenquellen desselben Händlers und dürfen niemals als zwei Händler erscheinen.

## Dynamische Facet-Orchestrierung
Die Feinsuche ist jetzt ergebnisabhängig.

Verbindliche Regel:
Nach jeder Filteränderung müssen die übrigen Facet-Optionen aus der noch sinnvollen Ergebnismenge neu berechnet werden.

Beispiele:
- Händler = Ahipos Horses DE -> keine Möbelprodukttypen anzeigen.
- Marke = Equinox Equine -> 5 Ergebnisse und nur relevanter Produkttyp `Ergänzungsfutter`.
- Händler = Casa Moro -> Möbelprodukttypen bleiben sichtbar, Pferdeprodukttypen verschwinden.
- Optionen mit 0 Treffern werden nicht angeboten, außer ein bereits ausgewählter Wert muss für den Zustand sichtbar bleiben.

Die Schema-Auswahl darf nicht mehr pauschal aus der alten Casa-Moro-Dominanz kommen, sondern muss aus dem aktuellen Kontext / der gefilterten Produktfamilie bestimmt werden.

## Relevante Runtime-Dateien
- `search.js`
  - Händler-/Brand-Normalisierung
  - Filterzustand
  - dynamische Optionsberechnung
  - effektive Schema-Auswahl
  - Produktkarten / Chips / URL-State
- `common-facet-defs.js`
  - echte gemeinsame Facets, inklusive `merchant`
- `facet-schemas.js`
  - kategoriedynamische Facet-Schemata
- `search-facet-engine-v2.js`
  - Enrichment / dominante Schemata
- `home-categories.js`
  - dynamische Startseiten-Kategorien aus Manifest
- `build-production-catalog.js`
  - Multi-Source-Produktionskatalog + Kategorienmanifest
- `production-catalog-sources.json`
  - zentrale Liste der Produktionsquellen; neue Händler dort sauber ergänzen

## Produktions-/CI-Gates
Wichtige Gates, die vor Live grün sein müssen:
- Development V2 integrity
- Production merchant catalog gate
- Facet orchestration safety
- Ahipos normalizer gate
- Ahipos catalog integration gate
- Ahipos data quality gate
- Taxonomy-i18n / RU-Gates, wenn Sprache/Taxonomie betroffen ist

Für den finalen Facet-/Kategorie-Fix wurden auf PR #15 nach der letzten Korrektur erneut grün bestätigt:
- Development V2 Integrity
- Production Merchant Catalog Gate
- Facet Orchestration Safety inklusive Playwright Browser-E2E

## Browser-E2E – aktuell abgesicherte Fälle
- Ahipos-Händlerfilter vorhanden.
- Händlerliste zeigt Casa Moro + Ahipos Horses DE.
- Ahipos-Händlerfilter -> 31 Ergebnisse.
- Ahipos-Marken -> `Ahipos Horses` + `Equinox Equine`.
- Keine sichtbaren Dubletten wie `ahipos-horses` / `Fast Bundle` als eigene Marken.
- Ahipos-Produkttypen enthalten `Ergänzungsfutter`, `Pferdepflege`, `Bundle`.
- Keine Möbelprodukttypen im Ahipos-Kontext.
- Keine 0-Treffer-Optionen.
- Equinox Equine -> 5 Produkte / `Ergänzungsfutter`.
- Casa Moro -> Möbeltypen ohne Pferde-Leakage.
- Startseite -> 7 Kategorien aus Produktionsmanifest.
- `Pferd & Reitsport` öffnet 29 Produkte.
- RU-Kategorielabels geprüft.

## Wichtige PR-/Release-Historie
### PR #13 – Ahipos als zweiter Händler
Ziel: Normalisierung, Mapping, Taxonomie, Search/Facets/Card-Integration, Datenqualität, Regression.

### PR #14 – Produktions-Katalogverdrahtung
Nach PR #13 zeigte der Live-Smoke, dass der Production-Builder weiterhin nur `development/core-products.json` veröffentlichte. Deployment war technisch grün, aber Ahipos fehlte im finalen Produktionskatalog.

Dauerhafte Lösung:
- Multi-Source-Produktionsverdrahtung
- `production-catalog-sources.json`
- Produktions-Gate, das erwartete Händler im finalen Katalog prüft

Lernregel: CI/Deploy-SUCCESS beweist nicht, dass ein Händler wirklich im ausgelieferten Produktionsartefakt enthalten ist.

### PR #15 – Händler/Marke, dynamische Facets, Startseiten-Kategorien
Ziel:
- Händler und Hersteller/Marke trennen
- Ahipos-Brandwerte normalisieren
- Facets anhand verbleibender Treffer neu berechnen
- 0-Treffer-Optionen ausblenden
- Produktfamilien dynamisch bestimmen
- Kategorienmanifest erzeugen
- neue Startseiten-Kategorien sichtbar machen
- Browser-E2E für Ahipos/Casa Moro/Startseite/RU

Finaler Merge-Commit:
`d9e0da6816f11e5bf28e43c2d558d6fcc2c6745e`

## Heute zusätzlich gefundene Fehler / Lernregeln
### 1. Deployment grün != Feature live
Der erste Ahipos-Release war technisch erfolgreich, aber der produktive Katalog enthielt Ahipos nicht. Deshalb nach jedem Händlerrelease final erzeugtes Artefakt / Katalog prüfen.

### 2. Händler != Marke != Feed
Diese drei Ebenen müssen getrennt modelliert bleiben.
- Händler = Verkäufer/Shop
- Marke = Produktmarke/Hersteller
- Feed = technische Datenquelle

### 3. Facets dürfen keine historische Kategorie-Dominanz behalten
Wenn der User den Ergebniskontext ändert, müssen sich Produkttypen und Detailfilter mit ändern.

### 4. Keine 0-Treffer-Facets
Null-Treffer-Werte erzeugen nur Verwirrung und müssen verschwinden.

### 5. Kleine HTML-/Escapingfehler können trotz E2E durchrutschen
Vor Merge weiterhin finalen Diff manuell/semantisch kontrollieren. Auf PR #15 wurden dadurch noch ein fehlendes `;` in `&quot;` und ein fehlendes `</p>` im Empty-State gefunden und vor Merge korrigiert.

### 6. Neue echte Produktfamilien gehören auf die Startseite
Wenn ein echter Händler Produkte außerhalb bestehender Kategorien liefert, muss FundBlick dafür neue Taxonomie-/Startseiten-Kategorien erzeugen statt sie unsichtbar nur über Suche auffindbar zu lassen.

## Verbindlicher Händler-Onboarding-Ablauf ab Händler 3
1. Feed(s) isoliert einlesen, Production unverändert lassen.
2. Felder/IDs/Links/Preise/Versand/Verfügbarkeit inventarisieren.
3. Cross-Feed-Duplikate und Varianten exakt messen.
4. Händler, Marke und Feedquelle separat normalisieren.
5. Bestehende Taxonomie wiederverwenden, neue Familie nur bei echter fachlicher Notwendigkeit.
6. Keine Attribute/Claims erfinden.
7. Neutralen Produkttyp / belastbare Facets ableiten.
8. Isolierten Normalizer-Gate bauen.
9. Isolierten Katalogintegrations-Gate bauen.
10. Datenqualitäts-Gate bauen.
11. Search-/Facet-/Card-Integration im Development testen.
12. Desktop/Mobile und betroffene Sprachen im Browser prüfen.
13. Gesamtregression gegen bestehende Händler und Sprachen.
14. PR öffnen, Diff prüfen, PR-Gates abwarten.
15. Erst danach Merge.
16. Production-Workflow vollständig abwarten.
17. Finales ausgeliefertes Produktionsartefakt/Katalog prüfen.
18. Live-Smoke aus Kundensicht.
19. Erst dann Händler als produktiv abgeschlossen markieren.

## Release-Prinzip
`Feed verstehen -> normalisieren -> deduplizieren -> Taxonomie -> Development-UI -> Browser-E2E -> Gesamtregression -> PR -> Merge -> Production-Artefakt prüfen -> Live-Smoke.`

Keine direkte Live-Bastelei und keine breite Reparatur auf `main`.

## Aktueller sicherer nächster Einstiegspunkt
Der Multi-Merchant-Grundmechanismus ist jetzt live und vom Nutzer bestätigt.

Für die nächste Sitzung zuerst entscheiden, ob:
- Händler 3 onboarded werden soll,
- die Casa-Moro-Facet-Coverage weiter verbessert werden soll,
- weitere Kategorien/Sprachen verbessert werden sollen,
- oder Suchqualität/Relevanz weiter verfeinert wird.

Vor jedem neuen Händler zuerst `docs/MERCHANT_ONBOARDING_PLAYBOOK.md`, `docs/AHIPOS_MAPPING_V1.md` und diese Handoff-Datei lesen.
