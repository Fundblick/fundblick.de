# FundBlick – Produktionsaudit / Arbeitsbericht – 28.09.2026

## Zweck
Dieser Bericht dokumentiert den vollständigen Read-only-Produktionsaudit nach den Merges von PR #22 und #23 sowie den daraus abgeleiteten Härtungsplan. Er ist verbindlicher Kontext für die nächsten Änderungen auf `development`.

## Geprüfter Produktionsstand
- Geprüfter Merge-/Produktionscommit: `ee37486a65108f73a0e0f46ab0bc058308537c58`
- Zugeordneter Production-Workflow: `Publish FundBlick production`, Run #195
- Ergebnis: `completed / success`
- Checkout, JS-Validierung, Katalog-Build, Production-Wiring, Packaging, Asset-Versionierung, Upload und GitHub-Pages-Deployment liefen erfolgreich.
- Die zuvor offene Annahme „kein Workflow-Run für ee37486“ ist damit widerlegt.

## Live-/Artefaktnachweis
Im Audit wurden die ausgelieferten Produktionsdateien gegen Build `ee37486` geprüft. Die geprüften Produktionsdateien waren erreichbar und entsprachen dem Build. Es wurde kein nachgewiesener Deployment-Drift festgestellt.

Wichtige Einschränkung: Der aktuelle Production-Workflow prüft umfangreich vor bzw. während des Deployments, besitzt aber keinen vollständigen nachgelagerten Browser-/HTTP-E2E-Test gegen die öffentlich ausgelieferte Domain `fundblick.de`. Ein erfolgreicher Build und Deploy ist deshalb noch kein vollständiger Beweis für das Verhalten der anschließend öffentlich ausgelieferten Seite.

## Tagesangebot / CTA / Affiliate-Fallback
Geprüft wurden insbesondere:
- Tagesangebot nur aus realen Produktionsprodukten
- keine simulierten Testprodukte
- erforderliche Produktdaten und Verfügbarkeit
- belastbare Rabatt-/Deal-Regeln
- neutrales Spotlight ohne erfundene Ersparnis, wenn kein belastbarer Deal vorliegt
- Affiliate-URL vor Direct-URL
- interner FundBlick-Suchfallback, wenn keine sichere externe URL vorhanden ist
- externe Affiliate-Links mit `target="_blank"` und `rel="sponsored noopener noreferrer"`
- direkte Händlerlinks mit `target="_blank"` und `rel="noopener noreferrer"`
- Entfernen von `target`/`rel` beim internen Fallback

Ergebnis: kein nachgewiesener P0-/P1-Produktionsfehler.

## Google / Indexability
Geprüft wurden:
- `robots.txt`
- Sitemap
- Canonicals
- Homepage `index,follow`
- Suche `noindex,follow`
- 404 `noindex`
- SEO-Landingpages mit eigenem Canonical und `index,follow`
- Ausschluss ungeeigneter URLs aus der Sitemap

Das Google-Indexability-Gate ist Bestandteil des erfolgreichen Production-Workflows. Ein separater Workflow-Run ist nicht Voraussetzung dafür, dass dieses Gate im Production-Run ausgeführt wurde.

Ergebnis: kein nachgewiesener P0-/P1-Fehler in den geprüften Indexability-Regeln.

## Produktionspaket / Quellcode-Exposition
Der Production-Workflow erzeugt `_site` über eine kontrollierte Auswahl und veröffentlicht nicht einfach das gesamte Repository. Entwicklungsordner und Build-/Audit-/Verifier-Skripte werden nicht pauschal live ausgeliefert. `development` darf im Produktionspaket nicht vorhanden sein.

Es wurde kein Secret, API-Key, Passwort oder privater Token in den geprüften öffentlich benötigten Affiliate-Komponenten festgestellt.

Grundsatz bleibt: proprietäre Ranking-, Händler-, Provisions- oder Monetarisierungslogik nicht unnötig in den Browser verlagern.

## Befund P2-A – dynamische Affiliate-Assets nicht vollständig content-gehasht
`build-versioned-site.js` erkennt primär direkt in HTML referenzierte JS-/CSS-Assets. Dynamisch von `language-links.js` geladene Affiliate-Dateien werden dagegen über unversionierte Basisnamen plus festen Query-Parameter geladen, u. a.:
- `affiliate-config.js`
- `affiliate-consent-version.js`
- `affiliate-consent.js`
- `affiliate-link-policy.js`
- `affiliate-outbound.js`

Der Production-Workflow kopiert diese Dateien zusätzlich unter ihren normalen Namen, daher ist dies aktuell kein Funktionsausfall. Es entsteht aber eine inkonsistente Versionierung und ein Cache-Staleness-Risiko bei künftig nicht passend aktualisiertem Query-Parameter.

Priorität: P2.

## Befund P2-B – Public-Produktdaten brauchen Allowlist
`build-live-catalog.js` übernimmt beim Enrichment zunächst das Quellprodukt breit und ergänzt FundBlick-Felder. Für den öffentlichen Produktionskatalog existiert damit keine streng definierte Public-Field-Allowlist.

Aktuell öffentlich benötigte Daten wie Produktname, Preis, Bild, Händler, Angebote und Ziel-URLs sind erwartbar. Das Risiko liegt in der Skalierung: Neue Importer könnten später interne Feed-IDs, Debug-Felder, Rohdaten, Importstatus, Provisionen, Margen oder Ranking-Metadaten ergänzen, die ohne Sanitization unbeabsichtigt öffentlich werden könnten.

Verbindliche Härtungsrichtung: Öffentlichen Produktdatensatz explizit aus erlaubten Feldern aufbauen; keine pauschale Rohdatenübernahme an die Public-Grenze.

Priorität: P2, vor starkem Multi-Merchant-Ausbau umsetzen.

## Befund P2-C – Outbound-URL-Validierung
`affiliate-link-policy.js` akzeptiert nur `http:` und `https:`, besitzt aber keine Händler-/Provider-Domain-Allowlist. Damit kann grundsätzlich jede syntaktisch gültige HTTP(S)-Ziel-Domain akzeptiert werden, falls sie in einen Feed bzw. Produktdatensatz gelangt.

Aktuell wurde kein missbräuchlicher Link nachgewiesen. Für die Skalierung auf Amazon/Awin/ADCELL/weitere Händler soll jedoch eine kontrollierte Zielvalidierung vorgesehen werden.

Priorität: P2.

## Befund P2-D – Clientseitige Affiliate-/Routinglogik
`affiliate-outbound.js` liest Angebotsdaten aus DOM-`data-*`-Attributen und entscheidet clientseitig über Linkmodus und Ziel. Eigene DOM-Manipulation durch den Besucher ist keine serverseitige Sicherheitslücke, zeigt aber die Architekturgrenze.

Langfristig sensible Monetarisierungs-/Attributions-/Redirectlogik soll nicht zu einer clientseitigen Vertrauensgrenze werden. Bei wachsender wirtschaftlicher Relevanz kontrollierten Redirect-/Routing-Layer prüfen.

Priorität: P2 / Architektur.

## Consent-Audit
Consent wurde separat geprüft.

Positiv:
- Default ohne gespeicherte Entscheidung: kein Tracking.
- Tracking nur bei exakt `granted`.
- `denied` hält Tracking blockiert.
- Zustimmen und Ablehnen laufen über denselben Persistenzmechanismus.
- Consent-Versionierung besitzt Metadaten mit Entscheidung, Version, Zeitpunkt und Netzwerkmodus.
- Bei Versionsabweichung bzw. inkonsistenten Metadaten wird die alte Entscheidung verworfen und eine neue Auswahl erforderlich.
- Awin behandelt verweigerte Zustimmung explizit mit dem vorgesehenen Consent-Signal.

P2-Härtung:
- `readDecision()` sollte bereits beim Einlesen nur die erlaubten Werte `granted`/`denied` akzeptieren. Manipulierte andere Werte aktivieren derzeit zwar kein Tracking, sollten aber früh normalisiert/verworfen werden.

## Gesamtrisiko nach Audit
- P0: 0 nachgewiesene Befunde
- P1: 0 nachgewiesene Befunde
- P2: mehrere Härtungspunkte, siehe oben

Der geprüfte Produktionsstand `ee37486...` besitzt nach diesem Audit keinen nachgewiesenen kritischen Fehler bei Deployment, Tagesangebot, Affiliate-Fallback, `target`/`rel`/`sponsored`, robots, Sitemap, Canonicals, `noindex` oder Consent.

## Branch-Stand nach Audit
Am 28.09.2026 wurde festgestellt, dass `development` noch auf `cb86367ebf3dc519c1282aa0b94124af00dca199` stand und der geprüfte Produktionscommit `ee37486...` 415 Commits davor lag.

Da `ee37486...` ein Fast-Forward-Nachfolger des alten `development`-Stands war, wurde `development` ohne Force und ohne History-Rewrite auf `ee37486a65108f73a0e0f46ab0bc058308537c58` fast-forwarded.

`main`/Live wurden dadurch nicht verändert.

## Verbindlicher nächster Arbeitsblock
Änderungen ausschließlich auf `development` bzw. einem davon abgeleiteten Arbeitsbranch. Reihenfolge:

1. Public-Field-Allowlist für Produktionskatalog entwerfen und mit Regressionstests absichern.
2. Consent-Input beim Lesen strikt auf `granted`/`denied` normalisieren.
3. Outbound-URL-Validierung gegen bekannte Händler-/Affiliate-Provider härten, ohne legitime Redirectketten vorschnell zu brechen.
4. Dynamisch geladene Affiliate-Assets in die echte Content-Versionierung integrieren; manuellen festen Cache-Buster vermeiden.
5. Post-Deployment-Live-Gate gegen `fundblick.de` ergänzen: HTTP/HTML/Canonical/robots/Sitemap sowie zentrale CTA-/Affiliate-Semantik soweit robust prüfbar.
6. Erst nach vollständigen Gates PR/Review/Merge nach dem bestehenden Release-Prozess.

## Nicht tun
- `main` nicht direkt bearbeiten.
- Keine Live-Flicks ohne Gate.
- Keine pauschale Domain-Allowlist einführen, die legitime Affiliate-Redirects zerstört; zuerst reale Provider-Zielketten verifizieren.
- Keine Public-Field-Allowlist einführen, bevor alle tatsächlich von Suche, Facets, Karten, Tagesangebot und SEO benötigten Felder inventarisiert sind.
- Keine internen Provisionen, Margen, Feed-Secrets oder proprietäre Rankingparameter in öffentliche Katalogdaten aufnehmen.

## Audit-Fazit
Der Produktionsstand ist belastbar und ohne nachgewiesenen kritischen Befund. Der nächste Schritt ist keine Notfallreparatur, sondern kontrollierte Härtung für die geplante Multi-Merchant-/Amazon-Skalierung. Die größte strukturelle Priorität ist eine saubere Public-Datengrenze für den Katalog; danach URL-Vertrauensgrenzen, Asset-Versionierung und ein echter Post-Deployment-Live-Nachweis.