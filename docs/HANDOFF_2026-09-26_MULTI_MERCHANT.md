# FundBlick – Handoff / Arbeitsstand – aktualisiert 27.09.2026

## Zweck
Diese Datei ist der verbindliche Einstiegspunkt für die nächste Arbeitssitzung. Vor neuen Änderungen zuerst diese Datei lesen und danach den aktuellen `main`-Stand frisch prüfen.

FundBlick ist eine produktive Affiliate-Produktsuche mit realen Händlerdaten. Änderungen an Runtime/Produktion werden grundsätzlich über Dev-Branch → PR → vollständige Gates → Merge → Production-Deploy ausgerollt. Keine direkte Live-Änderung ohne vollständiges Gate.

## Aktueller Produktionsstand
- Live-Domain: `fundblick.de`
- Aktueller produktiver `main`-Commit: `1a2148b036405a41aa9e2e7748bdcbd88c0ffdaa`
- Letzter produktiver Merge: PR #20 – `Improve Casa Moro facet coverage`
- Letzter Production-Workflow: Run #191 – erfolgreich
- Produktionskatalog: 1.459 reale Produkte, 0 simulierte Produkte
- Händlerbestand:
  - Casa Moro: 1.428 Produkte
  - Ahipos Horses DE: 31 eindeutige Varianten

## Verbindlicher Release-Prozess
1. Frischen `main` prüfen.
2. Runtime-Änderungen nur auf Dev-Branch.
3. Änderung implementieren.
4. Passende Regression-/Browser-/Produktionsgates ergänzen oder aktualisieren.
5. PR öffnen.
6. Alle relevanten Gates auf exakt demselben Head-SHA abwarten.
7. Mergeability und Review-Threads prüfen.
8. Merge mit `expected_head_sha`.
9. Production-Workflow auf exakt dem Merge-Commit bis zum vollständigen Deploy prüfen.
10. Erst danach als live/produktiv bezeichnen.

Bei einem echten Release-Fehler nicht iterativ live flicken. Entweder Ursache auf Branch sauber beheben oder bekannten guten Stand wiederherstellen.

# Händlerstatus

## Händler 1 – Casa Moro
Casa Moro ist der erste reale Händler und weiterhin der größte Datenbestand. Die ursprüngliche Casa-Moro-Such-/Facet-Architektur ist inzwischen deutlich gehärtet und wurde in mehreren Schritten auf generische Multi-Merchant-Nutzung vorbereitet.

Aktueller Casa-Moro-Facet-Stand nach PR #20:
- 1.428 reale Produkte
- 0 simulierte Produkte
- bekannte Produktfamilie: 100 %
- Produkttyp: 1.414 / 1.428 = 99,0 %
- Material: 89,4 %
- Stil: 95,4 %
- Raum/Einsatzbereich: 16,2 %
- 44 kanonische Produkttypen insgesamt
- 31 positive Klassifizierungs-Regressionsfälle

Die letzten 14 Produkte ohne Typ werden bewusst nicht künstlich klassifiziert. Typische Restfälle: Papierkorb, Königszelt, Duftstein/Räucherwerk, Pflanzenbox, Deko-Leiter, Strandtasche und ein unspezifischer Tisch. Keine 100-%-Quote auf Kosten schlechter Taxonomie erzwingen.

Neue bzw. verbesserte sichere Erkennung umfasst u. a.:
- Kamelhocker → Hocker
- Esszimmerstuhl / Polsterstuhl / Klappstuhl → Stuhl
- Pflanzenregal → Regal
- Teetisch / Tee-Tisch / Tee- Tisch → Beistelltisch
- Tablett → Schale / Tablett
- Sitzkissen / Samtkissen → Kissen / Sitzkissen
- Wandhaken / Hakenleiste → Haken / Hakenleiste
- Wandverkleidung → Wanddekoration
- Mosaikbrunnen → Brunnen
- Fernsehkommode → Kommode / Schrank
- Wäschekorb / Eckwäschekorb / Aufbewahrungskorb → Korb / Aufbewahrung
- Aufsatzbecken / Waschschale → Waschbecken

Neue kanonische Produkttypen seit PR #20:
- `Paravent / Raumteiler`
- `Organizer / Stiftehalter`

Wichtiger behobener Klassifizierungsfehler:
- englisches `table` darf deutsches `Tablett` nicht als Möbel matchen.
- deutsche Komposita müssen nach der vorhandenen NFKD-/Umlaut-Normalisierung passend erkannt werden (`Wäschekorb` → intern normalisiert).

## Händler 2 – Ahipos Horses DE
Ahipos ist vollständig produktiv integriert.

Verifizierte Datenstruktur:
- 2 Awin-Feeds dürfen nicht einfach addiert werden.
- 57 Feedzeilen ergeben nicht 57 eindeutige Produkte.
- 31 eindeutige Varianten insgesamt.
- 25 eindeutige Produktgruppen nach Gruppierung über den direkten Händler-Produktpfad ohne `variant`-Query.
- 26 Varianten überschneiden sich zwischen den beiden Feeds.
- Widersprüchliche Verfügbarkeit wird konservativ behandelt.

Ahipos-Kategorien:
- 29 Produkte: `pet.equestrian` → Pferd & Reitsport
- 1 Produkt: `pet.dog` → Hund
- 1 Produkt: `health.supplements` → Gesundheit & Nahrungsergänzung

Nicht alle Ahipos-Produkte pauschal in Pferd/Reitsport zwingen.

### Ahipos-Datenregeln
- Stabile Varianten-ID = Händler-/Advertiser-Kontext + `merchant_product_id`.
- Produktname niemals als Dedupe-Key verwenden.
- Affiliate-Link und direkter Händlerlink strikt trennen.
- `delivery_cost=0` darf nur dann als kostenloser Versand erscheinen, wenn die Quelle das belegt.
- Fehlender Versandnachweis bleibt `shippingCost=null`.
- Widersprüchliche Verfügbarkeit → konservativ `OUT_OF_STOCK` / Konfliktkennzeichnung.
- Händlertexte nicht automatisch als eigene FundBlick-Claims umformulieren.
- Gesundheits-/Heilversprechen niemals verstärken oder neu erfinden.

# Händler vs. Hersteller/Marke – verbindliche Semantik
Händler und Hersteller/Marke sind zwei verschiedene Filterdimensionen.

Aktuelle Händler:
- Casa Moro
- Ahipos Horses DE

Ahipos-Brand-Normalisierung:
- `AHIPOS Horses`
- `ahipos-horses`
- `Fast Bundle` im Ahipos-Kontext

werden sichtbar als `Ahipos Horses` zusammengeführt.

`Equinox Equine` bleibt eine eigenständige Marke.

Die beiden Awin-Feeds sind Datenquellen desselben Händlers und dürfen niemals als zwei Händler erscheinen.

# Dynamische Facet-Orchestrierung
Die Feinsuche ist ergebnisabhängig.

Verbindliche Regeln:
- Nach jeder Filteränderung werden übrige Facet-Optionen aus der verbleibenden Ergebnismenge neu berechnet.
- 0-Treffer-Optionen werden nicht angeboten, außer ein bereits gewählter Wert muss sichtbar bleiben.
- Händler = Ahipos Horses DE → keine Möbeltypen.
- Marke = Equinox Equine → nur passende Produktfamilie/Produkttypen.
- Händler = Casa Moro → keine Pferdeprodukttypen.
- Händler ist ein eigenes gemeinsames Facet und darf nicht als Marke dargestellt werden.

# Suchrelevanz – produktiv seit PR #17
PR #17: `Harden production search relevance`

Produktiver Merge-Commit:
`e94b701d793fd8a1f3e1f38d40a4ecae36d3a508`

Production Run #188: erfolgreich.

Verbesserungen:
- semantische Kategoriebegriffe, speziell Pferd/Reitsport (`Pferd`, `Pferde`, `Reitsport`)
- konservative Tippfehlerkorrektur für längere bekannte Produkttypen
- Beispiel: `Mosaiktih` → `Mosaiktisch`
- Exact-/Prefix-Title-Intent-Ranking
- stabileres Zusammenspiel von Marke + Produkttyp + Wortreihenfolge

Relevante Dateien:
- `search-relevance.js`
- `search-intent.js`
- `equestrian-search-extension.js`
- `audit-search-relevance.js`
- `audit-search-ranking.js`
- `search-relevance-e2e.spec.js`

Wichtige Suchfälle wurden produktiv abgesichert, u. a.:
- Mosaiktisch
- Mosaiktisch Stern
- Equinox Gelenke
- Ahipos Gelenk
- Pferd Gelenke

# Produkt-/Ergebniskarten – produktiv seit PR #18
PR #18: `Improve production result cards`

Produktiver Merge-Commit:
`117b5ca36e9de4b448df0e0b21fe5a8f24b68dd9`

Production Run #189: erfolgreich.

Verbindliche Kartenhierarchie:
1. Hersteller / Marke
2. Händler
3. Produkttyp
4. Verfügbarkeit
5. Preis / Versandlogik
6. CTA zum Händler

Aktuelle Semantik:
- Marke und Händler getrennt.
- Produkttyp sichtbar aus realen Produktattributen.
- Verfügbarkeit sichtbar (`Lieferbar`, `Derzeit nicht lieferbar`, sprachlokalisiert).
- Versand = 0 → `Gesamtpreis · Kostenloser Versand`.
- Versand unbekannt → `Produktpreis · Versandkosten beim Händler prüfen`.
- Keine erfundenen Versandwerte.
- Out-of-stock-Produkte dürfen weiterhin einen Händler-CTA zeigen, weil der Händler aktuelle Verfügbarkeit darstellen kann.

Browser-E2E deckt ab:
- Ahipos lieferbar
- Equinox nicht lieferbar
- Casa Moro
- Mobile 390 px
- Russische Kartenansicht

Permanent relevant:
- `live-catalog-ui.js`
- `result-card.css`
- `result-card-e2e.spec.js`
- `.github/workflows/result-card-safety.yml`

## RU-Verifier-Lernregel aus PR #18
Ein roter RU-Gate war kein Unicodeproblem, sondern eine veraltete erwartete Formulierung:
- korrekt bei 3: `3 рабочих дня`
- alter Gate erwartete fälschlich `3 рабочих дней`

Keine unnötigen Normalisierungs-Hacks einführen, wenn zuerst die konkrete Zeichen-/Textdifferenz geprüft werden kann.

# SEO-/Landingpages – produktiv seit PR #19
PR #19: `Add data-driven SEO landing pages`

Produktiver Merge-Commit:
`a7f710e1656fb8eeb8c5e515753758747672e9e0`

Production Run #190: erfolgreich.

Aktuell produktive statische SEO-Seiten:
- `/themen/wohnen/`
- `/themen/moebel/`
- `/themen/beleuchtung/`
- `/themen/dekoration/`
- `/themen/pferd-reitsport/`
- `/themen/pferde-ergaenzungsfutter/`

Prinzip:
- nur datengetriebene Seiten mit ausreichend realer Substanz erzeugen
- keine tausenden dünnen Keyword-Seiten
- Produktanzahl und Produktgruppen werden aus Produktionsdaten gezählt
- echte HTML-URLs statt nur clientseitig erzeugter Ansichten
- Canonical, Title, Description und `index,follow` pro Seite
- CTA zurück in die FundBlick-Suche mit stabilem Kategorie-/Produkttyp-Filter
- Startseite besitzt zusätzlich sichtbare `Themen entdecken`-Links
- normale Produktkategorie-Links bleiben weiterhin direkte Suchlinks
- Sitemap wird produktiv aus den tatsächlich erlaubten Landingpages erzeugt

Explizit ausgeschlossen wegen zu dünner Datenbasis:
- `pet.dog`
- `health.supplements`

Nicht nur technische Existenz einer Kategorie genügt für eine indexierbare Landingpage.

# Casa-Moro-Facet-Coverage – produktiv seit PR #20
PR #20: `Improve Casa Moro facet coverage`

Finaler PR-Head:
`64f17e383d6b6f92f994f1ebd5c8ceb9b8f36f2c`

Produktiver Merge-Commit:
`1a2148b036405a41aa9e2e7748bdcbd88c0ffdaa`

Production Run #191: erfolgreich.

Finale produktive Kennzahlen:
- 1.428 reale Casa-Moro-Produkte
- 1.414 mit Produkttyp
- Produkttyp-Coverage: 99,0 %
- Material: 89,4 %
- Stil: 95,4 %
- Raum: 16,2 %
- 44 kanonische Typen
- 31 positive Klassifizierungsfälle

Relevante Dateien:
- `home-facet-classifier.js`
- `taxonomy-registry.js`
- `taxonomy-value-i18n.js`
- `verify-home-facets.js`
- `verify-taxonomy-i18n.js`
- `.github/workflows/facet-coverage-audit.yml`

Neue Taxonomie-Werte müssen künftig gemeinsam in Registry, Klassifizierer, sichtbarer i18n-Schicht und Regressionstests gepflegt werden.

# Tagesangebot – produktiv seit PR #16
FundBlick unterscheidet strikt zwischen:
1. qualifiziertem Deal mit belastbarer Evidenz und
2. täglichem Spotlight ohne behaupteten Rabatt.

Qualifizierter Deal nur bei belastbarer Vergleichsevidenz und zusätzlich:
- mindestens 15 % Ersparnis
- mindestens 10 EUR absolute Ersparnis

Ohne belastbare Rabattbasis:
- echtes Produktionsprodukt
- nicht simuliert
- lieferbar
- positiver Preis
- Bild vorhanden
- tägliche deterministische Rotation
- kein erfundener Referenzpreis
- keine erfundene Ersparnis
- kein erfundener Rabattprozentsatz

Der Homepage-Pool enthält maximal 60 geeignete Kandidaten.

# Startseiten-Kategorien
Der Production-Build erzeugt das Kategorienmanifest `catalog/categories.json`.

Aktuell erwartete 7 Kategorien:
1. `home.living`
2. `home.furniture`
3. `home.lighting`
4. `home.decor`
5. `pet.equestrian`
6. `pet.dog`
7. `health.supplements`

Die Startseite darf nicht auf Casa Moro fest verdrahtet werden.

# Wichtige Runtime-/Build-Dateien
- `search.js` – Suche, Filterzustand, Kartenbasis, URL-State
- `search-relevance.js` – Relevanzlogik
- `search-intent.js` – Suchintention
- `equestrian-search-extension.js` – Pferde-/Reitsport-Semantik
- `common-facet-defs.js` – gemeinsame Facets inkl. Händler
- `facet-schemas.js` – kategoriedynamische Schemas
- `search-facet-engine-v2.js` – Facet-Enrichment / Schemata
- `home-facet-classifier.js` – Casa-Moro-/Home-Taxonomieklassifizierung
- `taxonomy-registry.js` – kanonische Typen/Facets
- `taxonomy-value-i18n.js` – sichtbare Taxonomieübersetzung ohne Filterwerte zu verändern
- `live-catalog-ui.js` – reale Produktkartendekoration
- `result-card.css` – Kartenlayout
- `home-categories.js` – Startseiten-Kategorien
- `deal-of-day.js` – Deal-/Spotlight-Logik
- `home-deal.js` – Homepage-Rendering Tagesangebot
- `build-production-catalog.js` – produktiver Multi-Source-Katalog
- `build-live-catalog.js` – Live-Katalog / Homepage-Pool
- `production-catalog-sources.json` – produktive Händlerquellen

# Wichtige permanente Gates
Vor produktiven Runtime-Merges je nach Scope mindestens berücksichtigen:
- Development V2 integrity
- Production merchant catalog gate
- Facet orchestration safety
- Facet coverage audit
- Daily offer safety
- Search relevance audit
- Result card safety
- Taxonomy i18n safety
- Taxonomy i18n browser safety
- SEO landing candidate audit
- Ahipos Normalizer / Integration / Data Quality Gates bei Ahipos-Datenänderungen

Wichtig: Ein technisch grüner Deploy allein beweist nicht, dass ein Händler oder Feature tatsächlich im ausgelieferten Artefakt vorhanden ist. Produktionsverdrahtung und reale Artefaktinhalte müssen explizit geprüft werden.

# PR-/Release-Historie
- PR #13 – Ahipos als zweiter Händler
- PR #14 – Produktions-Katalogverdrahtung / Multi-Source-Production
- PR #15 – Händler vs. Marke, dynamische Facets, Startseiten-Kategorien
  - Merge: `d9e0da6816f11e5bf28e43c2d558d6fcc2c6745e`
- PR #16 – echtes Tagesangebot
  - Merge: `4c9aba7d6f714a593dee2dee5d55782ae4b6e6a7`
  - Production Run #186: erfolgreich
- PR #17 – Suchrelevanz härten
  - Merge: `e94b701d793fd8a1f3e1f38d40a4ecae36d3a508`
  - Production Run #188: erfolgreich
- PR #18 – Produktkarten verbessern
  - Merge: `117b5ca36e9de4b448df0e0b21fe5a8f24b68dd9`
  - Production Run #189: erfolgreich
- PR #19 – datengetriebene SEO-Landingpages
  - Merge: `a7f710e1656fb8eeb8c5e515753758747672e9e0`
  - Production Run #190: erfolgreich
- PR #20 – Casa-Moro-Facet-Coverage auf 99,0 %
  - Merge: `1a2148b036405a41aa9e2e7748bdcbd88c0ffdaa`
  - Production Run #191: erfolgreich

Hinweis: Run #187 war kein hier relevanter neuer produktiver Feature-Merge; die dokumentierte Feature-Kette läuft in den hier maßgeblichen Releases #186, #188, #189, #190, #191.

# Verbindliche Qualitätsprinzipien
- Keine simulierten Produkte in Produktion.
- Keine erfundenen Preise, Rabatte, Versandkosten oder Verfügbarkeiten.
- Keine künstliche 100-%-Taxonomiequote erzwingen.
- Händlerdaten und FundBlick-eigene Aussagen strikt unterscheiden.
- Brand und Händler getrennt halten.
- Source-Produkttexte nicht unnötig übersetzen oder umschreiben.
- i18n darf sichtbare Labels ändern, nicht interne Filter-/Routingwerte.
- Taxonomie-IDs und Filterwerte stabil halten.
- Neue Händler müssen die bestehende generische Architektur nutzen, nicht neue Sonderpfade erzwingen.
- Mobile-first und schnelle Seite beibehalten.
- Keine Popups als Standard-UX.
- Business-Logik nicht unnötig öffentlich ausbreiten.

# Empfohlener nächster Arbeitsblock
Nach dem aktuellen Stand nicht sofort weitere Casa-Moro-Typen erzwingen. Sinnvoller sind jetzt – jeweils zuerst auf frischem Dev-Branch – einer der folgenden Blöcke:
- Material-Coverage qualitativ verbessern, aber nur mit belastbaren Source-Signalen.
- Merchant-Onboarding für einen dritten realen Händler vorbereiten und die generische Wiederverwendbarkeit der aktuellen Taxonomie/Facets prüfen.
- SEO-Landingpage-Qualität nach realem Live-Stand weiter härten (interne Verlinkung, zusätzliche Kandidaten erst bei ausreichender Produktbasis, keine Thin Pages).
- Suchqualität anhand weiterer realer Nutzerqueries weiter auditieren.

Vor jeder neuen Arbeit: aktuellen `main`-SHA und aktuellen Production-Status frisch prüfen.
