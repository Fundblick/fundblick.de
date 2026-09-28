# FundBlick – Handoff / Arbeitsstand – aktualisiert 28.09.2026

## Zweck
Diese Datei ist der verbindliche Einstiegspunkt für die nächste Arbeitssitzung. Vor neuen Änderungen zuerst diese Datei lesen, danach `docs/WORKLOG_2026-09-28_PRODUCTION_AUDIT.md` und anschließend den aktuellen `main`-/Production-Status frisch prüfen.

FundBlick ist eine produktive Affiliate-Produktsuche mit realen Händlerdaten. Runtime-/Produktionsänderungen laufen grundsätzlich über Development/Dev-Branch → Tests/Gates → PR → Merge → Production-Deploy. Keine direkte Live-Änderung ohne vollständiges Gate.

## Aktueller Produktionsstand
- Live-Domain: `fundblick.de`
- Aktueller geprüfter produktiver `main`-Commit: `ee37486a65108f73a0e0f46ab0bc058308537c58`
- Letzter produktiver Merge: PR #23 – `Harden Google indexing foundation`
- Production-Workflow: Run #195 – erfolgreich
- Vorheriger produktiver Merge: PR #22 – `Fix daily offer direct merchant UX`
- PR #22 Production Run #194 – erfolgreich
- Produktionskatalog: 1.459 reale Produkte, 0 simulierte Produkte
- Händlerbestand:
  - Casa Moro: 1.428 Produkte
  - Ahipos Horses DE: 31 eindeutige Varianten
- `development` wurde am 28.09.2026 per Fast-Forward auf `ee37486...` synchronisiert; kein Force-Push/History-Rewrite.
- Development V2 integrity Run #156 auf `ee37486...`: erfolgreich.
- `main`/Live wurden durch die Synchronisierung von `development` nicht verändert.

## Verbindlicher Release-Prozess
1. Frischen `main` prüfen.
2. Runtime-Änderungen nur auf `development` bzw. davon abgeleitetem Dev-Branch.
3. Änderung implementieren.
4. Passende Regression-/Browser-/Produktionsgates ergänzen oder aktualisieren.
5. PR öffnen.
6. Alle relevanten Gates auf exakt demselben Head-SHA abwarten.
7. Mergeability und Review-Threads prüfen.
8. Merge nur mit geprüftem Head-SHA.
9. Production-Workflow auf exakt dem Merge-Commit bis zum vollständigen Deploy prüfen.
10. Wo sinnvoll zusätzlich die tatsächlich öffentlich ausgelieferte Domain nach dem Deploy verifizieren.
11. Erst danach als live/produktiv bezeichnen.

Bei einem echten Release-Fehler nicht iterativ live flicken. Ursache auf Branch sauber beheben oder bekannten guten Stand wiederherstellen.

# Händlerstatus

## Händler 1 – Casa Moro
Casa Moro ist der erste reale Händler und weiterhin der größte Datenbestand. Die ursprüngliche Casa-Moro-Such-/Facet-Architektur wurde in mehreren Schritten auf generische Multi-Merchant-Nutzung vorbereitet.

Aktueller Casa-Moro-Facet-Stand nach PR #21:
- 1.428 reale Produkte
- 0 simulierte Produkte
- bekannte Produktfamilie: 100 %
- Produkttyp: 1.414 / 1.428 = 99,0 %
- Material: 1.335 / 1.428 = 93,5 %
- Stil: 95,4 %
- Raum/Einsatzbereich: 16,2 %
- 44 kanonische Produkttypen insgesamt

PR #21 verbesserte die Materialabdeckung konservativ von 89,4 % auf 93,5 %. Unterstützt wurden zusätzliche explizite Materialsignale/Komposita, ohne Material aus Farbe, Stil oder Produkttyp zu erraten. Die verbleibenden 93 Materiallücken besitzen keinen unterstützten expliziten Materialnachweis und bleiben bewusst unklassifiziert.

Die letzten 14 Produkte ohne Typ werden ebenfalls bewusst nicht künstlich klassifiziert. Keine 100-%-Quote auf Kosten schlechter Taxonomie erzwingen.

Wichtige Klassifizierungsregeln:
- englisches `table` darf deutsches `Tablett` nicht als Möbel matchen.
- deutsche Komposita müssen nach vorhandener Normalisierung korrekt erkannt werden.
- neue Taxonomie-Werte gemeinsam in Registry, Klassifizierer, sichtbarer i18n-Schicht und Regressionstests pflegen.

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
- `delivery_cost=0` nur dann als kostenloser Versand anzeigen, wenn die Quelle dies belegt.
- Fehlender Versandnachweis bleibt `shippingCost=null`.
- Widersprüchliche Verfügbarkeit → konservativ behandeln.
- Händlertexte nicht automatisch als eigene FundBlick-Claims umformulieren.
- Gesundheits-/Heilversprechen niemals verstärken oder neu erfinden.

# Händler vs. Hersteller/Marke – verbindliche Semantik
Händler und Hersteller/Marke sind verschiedene Filterdimensionen.

Aktuelle Händler:
- Casa Moro
- Ahipos Horses DE

Ahipos-Brand-Normalisierung führt `AHIPOS Horses`, `ahipos-horses` und `Fast Bundle` im Ahipos-Kontext sichtbar als `Ahipos Horses` zusammen. `Equinox Equine` bleibt eigenständig. Die beiden Awin-Feeds sind Datenquellen desselben Händlers und dürfen niemals als zwei Händler erscheinen.

# Dynamische Facet-Orchestrierung
Die Feinsuche ist ergebnisabhängig.

Verbindliche Regeln:
- Nach jeder Filteränderung übrige Facet-Optionen aus der verbleibenden Ergebnismenge neu berechnen.
- 0-Treffer-Optionen nicht anbieten, außer ein bereits gewählter Wert muss sichtbar bleiben.
- Händler = Ahipos Horses DE → keine Möbeltypen.
- Marke = Equinox Equine → nur passende Produktfamilie/Produkttypen.
- Händler = Casa Moro → keine Pferdeprodukttypen.
- Händler bleibt eigenes gemeinsames Facet und darf nicht als Marke dargestellt werden.

# Suchrelevanz – produktiv seit PR #17
PR #17: `Harden production search relevance`
- Merge: `e94b701d793fd8a1f3e1f38d40a4ecae36d3a508`
- Production Run #188: erfolgreich.

Enthält semantische Kategoriebegriffe, konservative Tippfehlerkorrektur, Exact-/Prefix-Title-Intent-Ranking und stabileres Zusammenspiel von Marke, Produkttyp und Wortreihenfolge.

Wichtige Suchfälle: Mosaiktisch, Mosaiktisch Stern, Equinox Gelenke, Ahipos Gelenk, Pferd Gelenke.

# Produkt-/Ergebniskarten – produktiv seit PR #18
PR #18: `Improve production result cards`
- Merge: `117b5ca36e9de4b448df0e0b21fe5a8f24b68dd9`
- Production Run #189: erfolgreich.

Verbindliche Kartenhierarchie:
1. Hersteller / Marke
2. Händler
3. Produkttyp
4. Verfügbarkeit
5. Preis / Versandlogik
6. CTA zum Händler

Versand = 0 nur mit belastbarem Nachweis als kostenlos. Versand unbekannt bleibt unbekannt. Out-of-stock-Produkte dürfen einen Händler-CTA zeigen, weil der Händler die aktuelle Verfügbarkeit darstellen kann.

# SEO-/Landingpages – PR #19 + Härtung PR #23
PR #19: `Add data-driven SEO landing pages`
- Merge: `a7f710e1656fb8eeb8c5e515753758747672e9e0`
- Production Run #190: erfolgreich.

Produktive statische SEO-Seiten:
- `/themen/wohnen/`
- `/themen/moebel/`
- `/themen/beleuchtung/`
- `/themen/dekoration/`
- `/themen/pferd-reitsport/`
- `/themen/pferde-ergaenzungsfutter/`

PR #23: `Harden Google indexing foundation`
- Merge: `ee37486a65108f73a0e0f46ab0bc058308537c58`
- Production Run #195: erfolgreich.

Verbindlicher Indexability-Vertrag:
- `robots.txt` erlaubt Crawling und verweist auf die kanonische Sitemap.
- Sitemap wird aus dem Produktions-/SEO-Build erzeugt; keine konkurrierende statische Sitemap-Quelle.
- Homepage: `index,follow` + Canonical `https://fundblick.de/`.
- Themen-Landingpages: `index,follow` + eigene kanonische HTTPS-URL.
- `search.html`: `noindex,follow`.
- `404.html`: `noindex`.
- `verify-google-indexability.js` erzwingt diese Regeln.
- Production-Deploy führt den Indexability-Gate vor Packaging/Deploy aus.
- Keine künstliche Massenindexierung von Such-/Filterparameter-URLs.

# Casa-Moro-Facet-Coverage – PR #20 und #21
PR #20: `Improve Casa Moro facet coverage`
- Merge: `1a2148b036405a41aa9e2e7748bdcbd88c0ffdaa`
- Production Run #191: erfolgreich.
- Produkttyp-Coverage: 99,0 %.
- Material damals: 89,4 %.

PR #21: `Improve Casa Moro material coverage`
- Merge: `a7a7c4fceab86d1564a8c63551abc9f007824432`
- Material-Coverage: 93,5 % = 1.335 / 1.428.
- Produkttyp bleibt 99,0 %, Stil 95,4 %, Raum 16,2 %.
- Verbleibende Materiallücken bewusst nicht geraten.

# Tagesangebot / Homepage – PR #16 und #22
FundBlick unterscheidet strikt zwischen qualifiziertem Deal mit belastbarer Evidenz und täglichem Spotlight ohne behaupteten Rabatt.

Qualifizierter Deal nur bei belastbarer Vergleichsevidenz und zusätzlich mindestens 15 % sowie 10 EUR absolute Ersparnis. Ohne belastbare Rabattbasis kein erfundener Referenzpreis, keine erfundene Ersparnis und kein erfundener Rabattprozentsatz.

PR #22: `Fix daily offer direct merchant UX`
- Merge: `8836a18f5779fe9b793773a0ef70e4c2ee919462`
- Production Run #194: erfolgreich.
- redundanten Drei-Schritt-Homepage-Abschnitt entfernt.
- Tagesangebot-CTA führt direkt zum ausgewählten realen Angebot.
- sichere Affiliate-URL wird bevorzugt.
- direkte Händler-URL ist externer Fallback.
- interne FundBlick-Suche nur letzter Fallback, wenn kein sicheres externes Ziel existiert.
- Affiliate-Ziel: `target="_blank"`, `rel="sponsored noopener noreferrer"`.
- direkter Händlerlink: `target="_blank"`, `rel="noopener noreferrer"`.

# Startseiten-Kategorien
Production-Build erzeugt `catalog/categories.json`.

Aktuell erwartete 7 Kategorien:
1. `home.living`
2. `home.furniture`
3. `home.lighting`
4. `home.decor`
5. `pet.equestrian`
6. `pet.dog`
7. `health.supplements`

Die Startseite darf nicht auf Casa Moro fest verdrahtet werden.

# Produktionsaudit 28.09.2026
Vollständiger Bericht: `docs/WORKLOG_2026-09-28_PRODUCTION_AUDIT.md`.

Geprüfter Stand: `ee37486a65108f73a0e0f46ab0bc058308537c58`.

Audit-Ergebnis:
- P0: 0 nachgewiesene Befunde.
- P1: 0 nachgewiesene Befunde.
- P2: mehrere kontrollierte Härtungspunkte.
- Kein nachgewiesener kritischer Fehler bei Deployment, Tagesangebot, Affiliate-Fallback, `target`/`rel`/`sponsored`, robots, Sitemap, Canonicals, `noindex` oder Consent.
- Production Run #195 ist dem Merge-Commit `ee37486...` zugeordnet und erfolgreich; die frühere Annahme eines fehlenden Production-Runs ist widerlegt.

## Verbindliche P2-Härtungsliste
1. **Public-Field-Allowlist für Produktdaten**
   - öffentliche Katalogobjekte explizit aus erlaubten Feldern aufbauen.
   - keine pauschale Rohdatenübernahme an der Public-Grenze.
   - vor Umsetzung alle von Suche, Facets, Karten, Tagesangebot und SEO benötigten Felder inventarisieren.

2. **Consent-Normalisierung**
   - beim Einlesen nur `granted` und `denied` als gültige persistierte Entscheidungen akzeptieren.
   - andere Werte verwerfen; sie aktivieren bereits heute kein Tracking, sollen aber defensiv früh normalisiert werden.

3. **Outbound-URL-Vertrauensgrenze**
   - aktuell werden HTTP(S)-URLs syntaktisch akzeptiert, ohne Händler-/Provider-Domain-Allowlist.
   - vor einer Allowlist reale Affiliate-/Redirectketten von Awin, Amazon, ADCELL usw. prüfen, damit legitime Ziele nicht gebrochen werden.

4. **Dynamische Affiliate-Assets vollständig content-versionieren**
   - `language-links.js` lädt mehrere Affiliate-Dateien dynamisch mit festem Query-Cache-Buster.
   - diese Abhängigkeiten sind nicht vollständig in der Content-Hash-Kette von `build-versioned-site.js` integriert.
   - aktueller Betrieb funktioniert, aber Cache-Staleness-Risiko und inkonsistente Versionierung beseitigen.

5. **Clientseitige Monetarisierungs-/Routinglogik langfristig begrenzen**
   - heutige DOM-/Client-Entscheidung ist kein nachgewiesener Server-Sicherheitsfehler.
   - bei wachsender wirtschaftlicher Relevanz kontrollierten Redirect-/Routing-Layer prüfen.

6. **Post-Deployment-Live-Gate**
   - heutige CI prüft Build/Packaging/Deploy umfangreich.
   - zusätzlich nachgelagerten HTTP-/Browser-Nachweis gegen `fundblick.de` für zentrale Produktionsverträge vorsehen.

# Öffentliche Daten / Business-Logik
Der Production-Workflow veröffentlicht nicht pauschal das gesamte Repository. Entwicklungsordner sowie Build-/Audit-/Verifier-Skripte werden nicht einfach als Live-Inhalt ausgeliefert. Im Audit wurde kein Secret, API-Key, Passwort oder privater Token in den geprüften öffentlich benötigten Affiliate-Komponenten festgestellt.

Trotzdem gilt dauerhaft:
- proprietäre Ranking-, Provisions-, Händler- oder Monetarisierungslogik nicht unnötig in den Browser verschieben.
- keine internen Provisionen, Margen, Feed-Secrets, Debug-/Importfelder oder proprietären Rankingparameter in öffentliche Produktdaten aufnehmen.

# Wichtige Runtime-/Build-Dateien
- `search.js` – Suche, Filterzustand, Kartenbasis, URL-State
- `search-relevance.js` – Relevanzlogik
- `search-intent.js` – Suchintention
- `equestrian-search-extension.js` – Pferde-/Reitsport-Semantik
- `common-facet-defs.js` – gemeinsame Facets inkl. Händler
- `facet-schemas.js` – kategoriedynamische Schemas
- `search-facet-engine-v2.js` – Facet-Enrichment / Schemata
- `home-facet-classifier.js` – Home-/Casa-Moro-Taxonomieklassifizierung
- `taxonomy-registry.js` – kanonische Typen/Facets
- `taxonomy-value-i18n.js` – sichtbare Taxonomieübersetzung
- `live-catalog-ui.js` – reale Produktkartendekoration
- `result-card.css` – Kartenlayout
- `home-categories.js` – Startseiten-Kategorien
- `deal-of-day.js` – Deal-/Spotlight-Logik
- `home-deal.js` – Homepage-Rendering Tagesangebot
- `build-production-catalog.js` – produktiver Multi-Source-Katalog
- `build-live-catalog.js` – Live-Katalog / Homepage-Pool
- `build-versioned-site.js` – Produktions-Asset-Versionierung
- `affiliate-config.js` – öffentliche Affiliate-Konfiguration
- `affiliate-consent-version.js` / `affiliate-consent.js` – Consent
- `affiliate-link-policy.js` / `affiliate-outbound.js` – Affiliate-/Outbound-Policy
- `verify-google-indexability.js` – Google-/Indexability-Vertrag
- `production-catalog-sources.json` – produktive Händlerquellen

# Wichtige permanente Gates
Je nach Scope mindestens berücksichtigen:
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
- Google indexability safety
- Ahipos Normalizer / Integration / Data Quality Gates bei Ahipos-Datenänderungen

Ein grüner Build/Deploy allein beweist nicht vollständig das Verhalten der danach öffentlich ausgelieferten Domain. Produktionsverdrahtung, Artefaktinhalte und bei kritischen Verträgen der Live-Zustand müssen explizit geprüft werden.

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
- PR #20 – Casa-Moro-Facet-Coverage / Produkttyp 99,0 %
  - Merge: `1a2148b036405a41aa9e2e7748bdcbd88c0ffdaa`
  - Production Run #191: erfolgreich
- PR #21 – Casa-Moro-Material-Coverage auf 93,5 %
  - Merge: `a7a7c4fceab86d1564a8c63551abc9f007824432`
- PR #22 – Tagesangebot direktes Händler-/Affiliate-Ziel
  - Merge: `8836a18f5779fe9b793773a0ef70e4c2ee919462`
  - Production Run #194: erfolgreich
- PR #23 – Google-Indexierungsgrundlage härten
  - Merge: `ee37486a65108f73a0e0f46ab0bc058308537c58`
  - Production Run #195: erfolgreich

# Verbindliche Qualitätsprinzipien
- Keine simulierten Produkte in Produktion.
- Keine erfundenen Preise, Rabatte, Versandkosten oder Verfügbarkeiten.
- Keine künstliche 100-%-Taxonomiequote erzwingen.
- Händlerdaten und FundBlick-eigene Aussagen strikt unterscheiden.
- Brand und Händler getrennt halten.
- Source-Produkttexte nicht unnötig übersetzen oder umschreiben.
- i18n darf sichtbare Labels ändern, nicht interne Filter-/Routingwerte.
- Taxonomie-IDs und Filterwerte stabil halten.
- Neue Händler müssen die generische Architektur nutzen, nicht neue Sonderpfade erzwingen.
- Mobile-first und schnelle Seite beibehalten.
- Keine Popups als Standard-UX.
- Business-Logik nicht unnötig öffentlich ausbreiten.
- Public-Datengrenze explizit halten.
- Keine direkte Änderung an `main`/Live ohne vollständigen Release-Prozess.

# Verbindlicher nächster Arbeitsblock – Stand 28.09.2026
Nicht sofort einen dritten Händler oder Amazon breit anbinden, bevor die öffentliche Datengrenze gehärtet ist.

Reihenfolge:
1. Inventar aller tatsächlich öffentlich benötigten Produktfelder erstellen.
2. Public-Field-Allowlist im Produktionskatalog entwerfen und Regressionen ergänzen.
3. Consent-Input strikt normalisieren.
4. Outbound-URL-Vertrauensmodell anhand realer Provider-/Händlerketten entwerfen und testen.
5. Dynamische Affiliate-Assets in echte Content-Versionierung integrieren.
6. Post-Deployment-Live-Gate gegen `fundblick.de` ergänzen.
7. Gesamte Gates prüfen.
8. Erst danach PR/Review/Merge nach dem verbindlichen Release-Prozess.

Vor jeder neuen Arbeit: aktuellen `development`-, `main`- und Production-Status frisch prüfen. Der ausführliche Audit-Kontext steht in `docs/WORKLOG_2026-09-28_PRODUCTION_AUDIT.md`.