# FundBlick – Handoff / Arbeitsstand – 26.09.2026

## Zweck
Diese Datei ist der verbindliche Einstiegspunkt für die nächste Arbeitssitzung. Sie dokumentiert den heute erreichten Stand nach Integration des zweiten Händlers, den stabilisierten Multi-Merchant-/Facet-/Kategorie-Mechanismus sowie das jetzt produktive Tagesangebot. Vor neuen Änderungen zuerst diese Datei lesen.

## Aktueller Produktionsstand
- Live-Domain: `fundblick.de`
- Produktiver Feature-Stand nach PR #16: `4c9aba7d6f714a593dee2dee5d55782ae4b6e6a7`
- Production-Workflow nach diesem Merge: Run #186, erfolgreich.
- Nutzer hat den vorherigen Multi-Merchant-/Facet-/Kategorie-Stand manuell geprüft und bestätigt.
- Tagesangebot wurde anschließend produktiv ausgerollt und der Production-Workflow vollständig grün bestätigt.
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
- Retail-only ohne Versandnachweis bleibt `shippingCost=null`; niemals kostenlosen Versand erfinden.
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

Der Production-Build erzeugt ein kleines Manifest:
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
Die Feinsuche ist ergebnisabhängig.

Verbindliche Regel:
Nach jeder Filteränderung müssen die übrigen Facet-Optionen aus der noch sinnvollen Ergebnismenge neu berechnet werden.

Beispiele:
- Händler = Ahipos Horses DE -> keine Möbelprodukttypen anzeigen.
- Marke = Equinox Equine -> 5 Ergebnisse und nur relevanter Produkttyp `Ergänzungsfutter`.
- Händler = Casa Moro -> Möbelprodukttypen bleiben sichtbar, Pferdeprodukttypen verschwinden.
- Optionen mit 0 Treffern werden nicht angeboten, außer ein bereits ausgewählter Wert muss für den Zustand sichtbar bleiben.

Die Schema-Auswahl darf nicht mehr pauschal aus der alten Casa-Moro-Dominanz kommen, sondern muss aus dem aktuellen Kontext / der gefilterten Produktfamilie bestimmt werden.

# Tagesangebot – produktiver Stand
Das Tagesangebot auf der Startseite ist jetzt aktiv und produktiv.

## Grundprinzip
FundBlick unterscheidet strikt zwischen:
1. einem **qualifizierten Deal** mit belastbarer Vergleichsevidenz und
2. einem **täglichen Spotlight / Heutigen Angebot** ohne behaupteten Rabatt.

Wenn kein belastbarer Rabatt nachweisbar ist, darf trotzdem ein echtes, lieferbares Produkt als Tagesangebot erscheinen. In diesem Fall werden **kein Streichpreis, keine Ersparnis und kein Rabattprozentsatz erfunden**.

## Qualifizierter Deal
Ein Produkt darf als echter Deal ausgezeichnet werden, wenn eine der zugelassenen Evidenzarten vorliegt:
- belastbarer Mehrhändler-Vergleich oder
- echter Händler-/Feed-Referenzpreis.

Zusätzliche Mindestschwellen:
- mindestens 15 % Ersparnis
- mindestens 10 EUR absolute Ersparnis

Nur dann dürfen Vergleichspreis, Ersparnis und Rabatt sichtbar werden.

## Tages-Spotlight-Fallback
Wenn aktuell kein qualifizierter Deal vorliegt:
- echtes Produktionsprodukt
- `testData=false`
- nicht simuliert
- lieferbar
- positiver Preis
- Produktname vorhanden
- Bild vorhanden
- tägliche deterministische Rotation
- aktueller Händlerpreis wird angezeigt
- `reference=null`
- `saving=null`
- `discountPct=null`

Der Fallback ist bewusst ein **Tagesangebot**, kein behauptetes Schnäppchen.

## Ahipos-Preisprüfung für Tagesangebote
Ahipos lieferte zwar Felder wie `rrp_price`, `saving`, `savings_percent`, `product_price_old` bzw. Retail-`sale_price`, aber im geprüften Feed bestand aktuell keine belastbare Rabattbasis:
- `rrp_price` war bei den Generic-Zeilen identisch zum aktuellen Preis.
- `saving`, `savings_percent`, `product_price_old` waren leer.
- Retail-`sale_price` war leer.

Daraus darf FundBlick keinen künstlichen Rabatt ableiten.

## Tagesangebot-Pool
Die Startseite lädt nicht den vollständigen Katalog mit 1.459 Produkten.

Stattdessen erzeugt `build-live-catalog.js` einen kleinen `home-deals`-Kandidatenpool:
- qualifizierte Deals zuerst
- danach reale, lieferbare Spotlight-Kandidaten mit Bild
- maximal 60 Einträge

Damit bleibt die Startseite schnell und erhält trotzdem immer eine reale Auswahlbasis.

## Tagesrotation
`deal-of-day.js` wählt das Spotlight deterministisch anhand von Datum + Produkt-ID. Dadurch:
- bleibt das Tagesangebot innerhalb eines Tages stabil,
- kann es am Folgetag automatisch wechseln,
- ist keine manuelle Redaktion erforderlich.

## Tagesangebot-CTA
Der CTA führt zunächst in die FundBlick-Suche und nicht ungeprüft direkt aus der Startseite zum Händler. Dadurch bleibt die bestehende Händler-/Affiliate-Handoff-Logik zentral wirksam.

Beim Sprachwechsel wird die gewählte Sprache im Suchlink mitgeführt, z. B. `lang=ru`.

## Tagesangebot-i18n
- Deal-/Spotlight-Texte sind mehrsprachig hinterlegt.
- DE/RU wurden im Browser-Gate geprüft.
- Händler-Produktname bleibt Source-Text und wird nicht künstlich übersetzt.
- Hinweistext auf der Startseite wurde angepasst, damit ein normales Tagesangebot nicht fälschlich wie ein Rabattversprechen wirkt.

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
- `deal-of-day.js`
  - Dealqualifikation, Händler-Referenzpreis, tägliches Spotlight, Rotation
- `home-deal.js`
  - Rendering der Tagesangebot-Karte, Sprache, Preisformatierung, CTA
- `build-live-catalog.js`
  - Produktionskatalog + kleiner Homepage-Tagesangebot-Pool
- `verify-deal-of-day.js`
  - Deal-Engine-Vertrag
- `verify-production-deal.js`
  - Tagesangebot gegen echten Produktionskatalog
- `home-deal-e2e.spec.js`
  - Chromium-E2E der Startseitenkarte

## Produktions-/CI-Gates
Wichtige Gates, die vor Live grün sein müssen:
- Development V2 integrity
- Production merchant catalog gate
- Facet orchestration safety
- Daily offer safety
- Ahipos normalizer gate
- Ahipos catalog integration gate
- Ahipos data quality gate
- Taxonomy-i18n / RU-Gates, wenn Sprache/Taxonomie betroffen ist

Für PR #16 wurden auf dem finalen Head `934d3d194af8fb598b94c607b6dfe91c7b2844bb` erneut grün bestätigt:
- Development V2 Integrity
- Production Merchant Catalog Gate
- Facet Orchestration Safety
- Daily Offer Safety inklusive Playwright/Chromium

## Browser-E2E – aktuell abgesicherte Fälle
### Multi-Merchant / Facets
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

### Tagesangebot
- Tagesangebot-Inhalt sichtbar.
- Empty-State ausgeblendet, wenn Kandidat vorhanden.
- Produktname vorhanden.
- Preis sichtbar.
- Händler vorhanden.
- Produktbild mit HTTP(S)-Quelle.
- CTA führt auf `search.html?...`.
- `data-deal-kind` ist `deal` oder `spotlight`.
- Beim Spotlight bleiben Vergleichspreis, Rabatt und Ersparnis verborgen.
- Beim echten Deal werden Vergleichspreis, Rabatt und Ersparnis angezeigt.
- Sprachwechsel auf RU ändert UI-Texte, nicht den Händler-Produktnamen.
- CTA übernimmt nach RU-Wechsel `lang=ru`.
- Keine JavaScript-Pageerrors im E2E.

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

Merge-Commit:
`d9e0da6816f11e5bf28e43c2d558d6fcc2c6745e`

### PR #16 – echtes Tagesangebot auf der Startseite
Ziel:
- Tagesangebot aus echten Produktionsprodukten befüllen
- bestehende qualifizierte Deal-Logik erhalten
- Händler-/Feed-Referenzpreis als zweite legitime Evidenzart ermöglichen
- täglichen realen Spotlight-Fallback einführen
- keine Fake-Rabatte
- kleinen Homepage-Kandidatenpool bauen
- CTA in FundBlick-Suche führen
- DE/RU + Sprachparameter prüfen
- Produktions- und Browser-Gates ergänzen

Finaler PR-Head vor Merge:
`934d3d194af8fb598b94c607b6dfe91c7b2844bb`

Merge-Commit:
`4c9aba7d6f714a593dee2dee5d55782ae4b6e6a7`

Production-Workflow:
- Run #186
- SUCCESS
- JavaScript-Syntax ✅
- Produktionskatalog ✅
- Tagesangebot-Gate ✅
- Merchant-/Kategorie-Gates ✅
- Produktionsverdrahtung ✅
- Packaging ✅
- Asset-Versionierung ✅
- GitHub Pages Deployment ✅

## Heute gefundene Fehler / Lernregeln
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

### 7. Kein Tagesdeal erzwingen
Ein leerer Rabatt-Datensatz darf niemals durch erfundene UVP/Streichpreise „verbessert“ werden.

FundBlick-Regel:
- echter Rabatt nur mit Evidenz,
- sonst echtes Tages-Spotlight ohne Rabattbehauptung.

### 8. Alte Gate-Annahmen mit neuer Architektur mitändern
Der bestehende Katalog-Verifier verlangte ursprünglich für jedes `home-deals`-Produkt mindestens zwei Offers. Das war mit dem neuen realen Spotlight-Fallback nicht mehr korrekt.

Der Vertrag wurde deshalb angepasst:
- qualifizierter Vergleich darf mehrere Offers verwenden,
- reales Spotlight darf ein einzelnes echtes Händlerangebot haben,
- Test-/Simulationsprodukte bleiben im Produktionsmodus verboten.

### 9. Lokaler Browser-E2E != finales Packaging
Beim finalen Recheck von PR #16 fiel auf, dass ein lokaler Browser-Test Repository-Dateien direkt serviert, während Produktion Assets versioniert und nach `_site` schreibt.

Der vorhandene `build-versioned-site.js` scannt jedoch die HTML-Referenzen und erzeugt die gehashten Assets selbst, sodass `home-i18n.js` korrekt in `_site` landet.

Lernregel: Bei neuen Frontend-Assets sowohl lokalen Browserlauf als auch Packaging-/Versionierungsweg prüfen.

### 10. Geänderte Runtime-Dateien müssen selbst im Syntax-Gate stehen
`home-i18n.js` war geändert, aber zunächst nicht explizit im neuen Tagesangebot-Syntaxcheck enthalten. Vor Merge wurde das nachgezogen – sowohl im Daily-Offer-Gate als auch im Produktions-Syntaxcheck.

### 11. Sprachwechsel muss auch Navigation/CTA erhalten
Es reicht nicht, nur sichtbare Texte zu übersetzen. Der Browser-Gate prüft jetzt zusätzlich, dass der Tagesangebot-CTA nach RU-Wechsel `lang=ru` mitführt.

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
20. Prüfen, ob neue Händlerdaten echte Referenz-/Altpreise liefern und dadurch für das Tagesangebot qualifizieren können.

## Release-Prinzip
`Feed verstehen -> normalisieren -> deduplizieren -> Taxonomie -> Development-UI -> Browser-E2E -> Gesamtregression -> PR -> Merge -> Production-Artefakt prüfen -> Live-Smoke.`

Keine direkte Live-Bastelei und keine breite Reparatur auf `main`.

## Aktueller sicherer nächster Einstiegspunkt
Der Multi-Merchant-Grundmechanismus ist live, die neuen Kategorien/Facets wurden vom Nutzer manuell bestätigt und das Tagesangebot ist produktiv ausgerollt.

Für die nächste Sitzung zuerst entscheiden, ob:
- Händler 3 onboarded werden soll,
- echte Referenz-/Altpreisfelder weiterer Händler für qualifizierte Tagesdeals erschlossen werden sollen,
- die Casa-Moro-Facet-Coverage weiter verbessert werden soll,
- weitere Kategorien/Sprachen verbessert werden sollen,
- oder Suchqualität/Relevanz weiter verfeinert wird.

Vor jedem neuen Händler zuerst `docs/MERCHANT_ONBOARDING_PLAYBOOK.md`, `docs/AHIPOS_MAPPING_V1.md` und diese Handoff-Datei lesen.
