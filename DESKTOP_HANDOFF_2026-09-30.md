# FundBlick Desktop-Handoff – 30.09.2026

## Fortschreibung nach autonomer Desktop-Arbeit am 30.09.2026

Aktueller fachlicher Code-Stand: `c4b5f91deef0ece7f8556724c0faade4e5600661` auf development. Die weiter unten enthaltene ursprüngliche Übergabe bleibt als Chronik erhalten. Arbeitsdauer/-methodik gemäß `AUTONOMOUS_WORK_MODE_JENS.md`; Jens hatte zwischenzeitlich den Abschluss und die Vorschau verlangt. Sein neuester Auftrag lautet: „Dann mach jetzt alles fertig. Ich möchte, dass wir heute noch in Live merchen.“ Damit ist der Release einschließlich main/Live ausdrücklich autorisiert; Backup bleibt unangetastet. Nachgewiesene technische und dokumentierte Freigabebedingungen bleiben zu prüfen.

Lokale Development-Startseite: **http://127.0.0.1:4180/** auf Jens' Rechner, Suchseite `/search.html`. Separates Paket in `work/developer-homepage/_site`, 1.515 echte Produkte, neun Kategorien, 14 HTML-Seiten mit noindex/nofollow. Katalog-/Händler-/Kategorieprüfungen und HTTP-Abrufe bestanden. Das ist eine lokale Vorschau; kein öffentliches Deployment. Originalrepository, main, Backup und Live werden dadurch nicht verändert. Direkter localhost-CORS bleibt vom Worker gesperrt. Die lokale Vorschau nutzt nun einen ausschließlich an 127.0.0.1 gebundenen Same-Origin-Relay zum festen vorhandenen Worker, ohne Besucher-Cookies/Origin weiterzugeben. Im tatsächlichen Vorschau-Browser wurden nach ausdrücklicher Aktivierung drei Hausschuhe-Angebote mit Bild, Produktlink und strukturiertem Preis dargestellt. Produktions-HTML bleibt beim HTTPS-Worker; dort wird kein Relay aktiviert.

Nachgewiesene Ergebnisse der Arbeitsserie:

| Fahrplan | Implementiert und geprüft | Weiter offen |
| --- | --- | --- |
| 1 – CI/Dubletten | Händlerbezogene Dubletten; Kennungen/Modellvarianten bleiben erhalten; Regression grün | Weitere reale Händler-/Variantenproben |
| 2 – Trefferqualität | Listings/Informationsrauschen vor Seitenaufteilung; RAM/Storage getrennt; Mini-PC/Laptop-Abgrenzung; belegte Query-Verbesserung für Öl/Bosch; Confidence-Schutz; explizite Fashion-Merkmale | Dünne Schuh-/Laptop-/Reifentreffer, Modellidentität, tatsächliche Verfügbarkeit und Gesamtpreis |
| 3 – Preise/Facetten | Rabatt-/Mindestbeträge nicht als Kaufpreis; kanonische Einheiten; Währungs-/Grundpreisbasis geschützt; LOW-Werte nicht in Standardfacetten | Händler-/Checkout-Abnahme, fachliche Must-have/Nice-to-have-Prioritäten |
| 4 – Skalierung/Sprachen | Shopify v2026-08 isoliert evaluiert, kompakter Snapshot/Adapter; vorhandene kyrillische Klassenbegriffe repariert | Runtime-Migration, geprüfte Attribut-Whitelist, vollständige 20 Sprachfassungen |
| 5 – Development-Abnahme | Ein Erstabruf, weiteres Laden nur per Aktion; Timeout/429/Netzwerk/Wiederholung; mobile Steuerungen; Preview-SEO; 17 Browserfälle mit echten Katalogdaten und kontrollierter Suchantwort; Datenschutz-Datenfluss dokumentiert | Öffentlicher isolierter Dev-Host/CORS, reale Worker-Browserabnahme, rechtliche/vertragliche Belege, vollständige Accessibility/SEO-/Live-Abnahme |

Keine Live-/Main-Freigabe aus grüner Development-CI ableiten. Taxonomie-Evaluation ist keine aktivierte neue Produkttaxonomie. Browsertests mit abgefangenen Antworten sind kein Beweis echter Worker-CORS oder aktueller Händlerpreise.

Weitere aktuelle Aufzeichnungen vollständig einlesen: `docs/WORKLOG_2026-09-30_DEVELOPMENT.md`, `SEARCH_QUALITY_AUDIT_2026-09-30.md`, `docs/TAXONOMY-EVALUATION-2026-09-30.md`, `docs/EXTERNAL-SEARCH-PRIVACY-REVIEW-2026-09-30.md`, `docs/FUNDBLICK-PRODUCT-INTELLIGENCE-TECHNICAL-FOUNDATION-2026-09-30.md` und separate `docs/FUNDBLICK-PROJEKTAUFWAND-KOSTEN-2026-09-30.md`. Separat benannte Originalaufzeichnungen, die im verfügbaren Bestand fehlen, nicht als gelesen behaupten. Bei Wiederaufnahme tatsächlichen HEAD und CI zuerst abgleichen.

## Auftrag

Diese Datei ist die verbindliche Übergabe für die Fortsetzung der FundBlick-Websuche/Product-Intelligence-Arbeit in einem neuen Chat bzw. auf dem Desktop.

**Repository:** `Fundblick/fundblick.de`  
**Arbeitsbranch:** `development`  
**WICHTIG:** `main` und Live/Produktion NICHT verändern, solange keine ausdrückliche Freigabe des Nutzers nach vollständiger Development-Abnahme erfolgt.

## Arbeits- und Berichtsprotokoll für Jens – VERBINDLICH

Der technische Stand allein reicht nicht. Die Zusammenarbeit mit Jens soll auf dem Desktop genauso fortgesetzt werden wie im bisherigen mobilen FundBlick-Chat.

### Grundmodus

- Jens steuert häufig nur mit kurzen Nachrichten wie `Weiter`, `Los`, `Los geht's` oder `Attacke`.
- Das bedeutet: autonom am aktuell vereinbarten Arbeitsblock weiterarbeiten, ohne für jeden kleinen technischen Schritt Rückfragen zu stellen.
- So viel sinnvoll zusammenhängende Arbeit wie möglich am Stück erledigen.
- Nicht nach jedem einzelnen Dateizugriff oder Test auf eine neue Bestätigung warten.
- Nur nachfragen, wenn eine echte fachliche Entscheidung von Jens nötig ist, ein erhebliches Risiko besteht oder eine ausdrücklich geschützte Grenze betroffen wäre.
- `development` ist der Arbeitsbereich. `main`, Backup und Live/Produktion bleiben unangetastet, bis Jens ausdrücklich etwas anderes freigibt.

### Wie Jens informiert werden möchte

Nach einem sinnvollen Arbeitsblock eine kurze, aber konkrete Zusammenfassung in normalem Deutsch geben. Nicht nur Agenten-/Terminalstatus wie `Block 2`, `3 files changed` oder `commands executed` ausgeben.

Jens soll nachvollziehen können:

1. **Was wurde geprüft?**
2. **Was wurde konkret gefunden?**
3. **Was wurde geändert?**
4. **Warum war die Änderung notwendig bzw. was verbessert sie für FundBlick?**
5. **Wie wurde sie abgesichert/getestet?**
6. **Ist CI/Gate tatsächlich grün oder noch nicht geprüft?**
7. **Welche Commits wurden erzeugt?**
8. **Was ist der nächste sinnvolle Schritt?**

Dabei streng zwischen folgenden Zuständen unterscheiden:

- **gefunden** = Problem/Beobachtung ist nachgewiesen;
- **implementiert/geändert** = Code wurde tatsächlich geändert;
- **getestet** = konkrete Tests wurden ausgeführt;
- **CI grün** = zugehöriger GitHub-Actions-Lauf wurde tatsächlich erfolgreich kontrolliert;
- **noch offen/nicht bewiesen** = nicht als erledigt darstellen.

Keine Formulierungen wie „sauber erledigt“ oder „vollständig grün“, solange der relevante Lauf nicht wirklich kontrolliert wurde.

### Gewünschter Berichtsstil

Beispiel für einen guten Zwischenbericht:

> Weiter. Das neue Gate hat einen echten Fehler gefunden: Bei Laptop-Treffern wurde eine RAM-Angabe teilweise als Gerätespeicher interpretiert. Dadurch konnten falsche Speicher-Facetten entstehen.
>
> Ich habe die Extraktion so geändert, dass RAM-Kontexte und Storage-Kontexte getrennt bewertet werden. Dazu kam ein Regressionstest mit typischen Laptop-Titeln.
>
> Commit: `...`
>
> Der Code ist implementiert und lokal/testseitig abgesichert. Den zugehörigen CI-Lauf prüfe ich als Nächstes; bis dahin bezeichne ich den Stand nicht als vollständig grün.

Das ist besser als reine interne Meldungen wie „Block 2 abgeschlossen“ oder eine Liste von ausgeführten Befehlen.

### Technische Tiefe

- Fachbegriffe dürfen und sollen verwendet werden, aber kurz erklären, was die Änderung praktisch für die FundBlick-Suche bedeutet.
- Nicht jeden Quellcodeblock an Jens ausgeben.
- Bei Fehlern die Ursache nennen, nicht nur den fehlgeschlagenen Test.
- Bei CI-Fehlern möglichst den konkreten failing Test und dessen fachliche Bedeutung nennen.
- Commit-SHAs nennen, wenn tatsächlich committed wurde.
- Wenn mehrere kleine Commits zusammen einen Block bilden, zusammenhängend erklären.

### Fortschritt und Checklisten

- Bei längeren Entwicklungsphasen regelmäßig einordnen, wo das Gesamtprojekt steht.
- Erledigt, implementiert-aber-noch-zu-validieren und offen sauber trennen.
- Prozentangaben nur als grobe Arbeitsstandsschätzung kennzeichnen; nicht als exakte Messung ausgeben.
- Bereits erledigte Arbeit nicht unnötig erneut implementieren.

### Sicherheits- und Qualitätsprinzip

- Gates niemals abschwächen oder Tests löschen, nur damit CI grün wird.
- Ein rotes Gate als Hinweis auf einen möglichen echten Fehler behandeln und ursächlich untersuchen.
- Reale Trefferqualität ist wichtiger als bloß eine formal funktionierende Pipeline.
- Keine stillen Änderungen an Live/`main`.
- Wenn ein Schritt Live/Produktion berühren würde, vorher Jens' ausdrückliche Freigabe einholen.

### Kommunikationskontinuität

Der Desktop-Chat soll sich nicht wie ein neues, fremdes Projekt verhalten. Jens kennt die technischen Details inzwischen teilweise und möchte die Entwicklung nachvollziehen können. Deshalb bei einem `Weiter` nicht wieder Grundlagen erklären, sondern am letzten nachgewiesenen Stand fortsetzen und anschließend verständlich berichten.

## Unmittelbarer Stand bei Übergabe

Letzter fachlicher Code-Fix vor dieser Übergabedatei:

`c57b1ca1f7a9ebfa711544b27f4f7df8a3412f6f` – `fix(intelligence): avoid collapsing numbered product variants`

Der Fix korrigiert einen vom neuen Deduper-Gate gefundenen Fehler: Zahlen/Modellvarianten in Produkttiteln durften nicht irrtümlich wie Preise entfernt werden, da sonst unterschiedliche Produktvarianten als Dubletten zusammenfallen konnten.

Direkt davor:

- `ca8026c…` – stabile GTIN/EAN/SKU/MPN-Kennungen im Deduper erhalten.
- Deduper wurde in `product-intelligence-pipeline.js` vor Ranking/Conflict-Filter/Facetten integriert.
- `product-result-deduper.js` wird in `search.html` vor der Intelligence-Pipeline geladen.
- `verify-product-result-deduper.js` wurde in das Development-Integrity-Gate aufgenommen.

## ERSTER SCHRITT IM NEUEN CHAT

1. Repository `Fundblick/fundblick.de`, Branch `development` lesen.
2. Aktuellen HEAD feststellen und NICHT davon ausgehen, dass diese Datei selbst der letzte Commit ist.
3. GitHub-Actions/CI-Läufe für den Stand nach `c57b1ca…` prüfen.
4. Falls ein Gate rot ist: exakten Fehler/Log untersuchen und ausschließlich in `development` korrigieren.
5. Falls alles grün ist: mit der untenstehenden offenen Websuche-/Product-Intelligence-Arbeit fortfahren.

## Bereits umgesetzt

### Externe Websuche

- Websuche als Ergänzung/Fallback zum noch kleinen eigenen FundBlick-Katalog.
- Websuche bewusst von den eigenen Affiliate-/Katalogtreffern getrennt.
- Nutzer kann Websuche gezielt aktivieren.
- Intent/Ansichten für Angebote, Informationen, Videos und lokale Ergebnisse.
- 20 Treffer pro Ergebnisseite; weiteres Nachladen möglich.
- Begrenztes Nachladen zur Traffic-Kontrolle.
- Sortiergrundlagen für Relevanz, Preis und Grundpreis.

### Angebotsqualität

Die Ansicht `Angebote` soll möglichst nur tatsächlich kaufbare Produktangebote zeigen.

Bereits implementiert:

- Produktsignal erforderlich.
- Bild erforderlich.
- vertrauenswürdiger bzw. sichtbar belegter Preis erforderlich.
- News/Blogs/Ratgeber/Announcements herausfiltern.
- Tests/Vergleiche/Reviews aus der Angebotsansicht herausfiltern.
- Suchseiten, Kategorien, Kataloge, Collections, Deal-/Angebotslisten herausfiltern.
- Manuals, Datenblätter und typische Informationsseiten reduzieren.
- Gebraucht-/Kleinanzeigen-/Forum-Rauschen reduzieren.
- YouTube/Videos nicht mit normalen Angeboten vermischen.
- Nested `/search/...`- und Kategoriepfade werden erkannt.

Relevante Dateien u. a.:

- `external-search-ui.js`
- `verify-external-offer-quality.js`
- `external-search-runtime.js`
- `external-result-page.js`

### Product Intelligence

Aktueller Ablauf:

`Nutzereingabe -> Intent -> Product Query Strategy -> externe Suche -> Attributextraktion -> Einheiten-Normalisierung -> Deduper -> Constraint-Ranking -> adaptiver Conflict-Filter -> dynamische Facetten -> Sortierung/Paginierung`

Implementiert sind u. a.:

- Produktklassifikation.
- aktuell rund 20 Basisklassen.
- Attributextraktion.
- dynamische produktspezifische Facetten.
- Facetten nur bei ausreichender Coverage.
- Constraint-Ranking.
- Confidence-/Conflict-Handling.
- adaptiver Conflict-Filter.
- Fallback bei dünner Trefferlage, damit nicht künstlich 0 Treffer entstehen.
- Einheiten-Normalisierung.
- Grundpreisberechnung, z. B. EUR/Liter.
- Product-aware Query Strategy vor dem externen Abruf.
- kanonische Suchattribute, z. B. `10W40` + `10W-40`.
- Reifenmaße wie `205/55 R16`.
- Spannung wie `18V`.
- Speicher/Zoll/Schuhgrößen etc.
- Golden-Query-Matrix über die aktuellen Produktklassen.
- komplette Pipeline-E2E-Tests.

Relevante Dateien:

- `product-intelligence-core.js`
- `product-query-strategy.js`
- `product-result-attribute-extractor.js`
- `product-unit-normalizer.js`
- `product-result-deduper.js`
- `product-constraint-ranker.js`
- `product-conflict-filter.js`
- `product-facet-engine.js`
- `product-intelligence-pipeline.js`
- `external-intelligence-ui.js`

### Deduper – gewünschtes Verhalten

- identische/equivalente Dubletten desselben Händlers zusammenführen.
- gleiches Produkt bei unterschiedlichen Händlern NICHT pauschal entfernen: unterschiedliche Händlerangebote sind für Preisvergleich nützlich.
- GTIN/EAN/SKU/MPN als starke Kennungen nutzen, soweit vorhanden.
- bei Dubletten den qualitativ reicheren Treffer behalten (Bild/Preis/verifizierter Preis/Beschreibung/Händler).
- Modellnummern und Produktvarianten dürfen nicht durch Preisbereinigung verschwinden.

## Aktuelle Regression-/Safety-Gates

Der Development-Integrity-Workflow enthält inzwischen u. a. Tests für:

- externe Search Policy/Client.
- External Price Confidence.
- Universal Search Intent.
- External Offer Quality.
- Product Intelligence Core.
- Product Query Strategy.
- Product Facet Engine.
- Unit Normalizer.
- Result Attribute Extractor.
- Result Deduper.
- Constraint Ranker.
- Conflict Filter.
- komplette Product Intelligence Pipeline.
- Golden Queries.
- External Result Page.
- speziellen `10W40`-Fall.

Die Gates wurden bewusst verschärft. Rote Gates NICHT einfach umgehen; sie haben bereits mehrere echte Fehler gefunden.

## Golden-/Referenzfälle

Wichtige Beispiele:

- `10W40 5 Liter` / `10W40 Motoröl`
- `Winterreifen 205/55 R16`
- `Akkuschrauber 18V`
- `Bosch Akkuschrauber 18V`
- `Adidas Damen Schuhe EU 39`
- Fernseher mit Zollangabe
- Smartphones/Laptops mit Speicherangabe

Erwartung bei Reifen: Wenn ausreichend saubere `205/55 R16`-Treffer vorhanden sind, soll z. B. `225/45 R17` unterdrückt werden.

Erwartung bei `18V`: Bei ausreichend vielen sauberen Treffern sollen erkannte `12V`-Konflikte entfernt werden. Bei sehr dünner Trefferlage greift der Fallback und verhindert künstlich leere Ergebnisse.

## Noch offen / nächste Arbeitsblöcke

Priorität 1:

- CI nach dem Deduper-Fix `c57b1ca…` prüfen und vollständig grün bekommen.
- Deduper mit Pipeline und Golden Queries gegen Überfilterung absichern.

Priorität 2 – echte Trefferqualität:

- reale externe Webresultate mit Golden Queries systematisch prüfen.
- messen/prüfen, wie viele der ersten 5/10/20 Resultate echte relevante Produkte mit Bild und Preis sind.
- verbleibende SEO-/News-/Marketplace-/Listing-Mülltreffer identifizieren.
- Produktrelevanz zur ursprünglichen Query weiter erhöhen.
- Marken-/Modelltreue stärken.
- Must-have- vs. Nice-to-have-Attribute erwägen.
- Ranking der besten echten Angebote verbessern.

Priorität 3 – Facetten/Sortierung:

- Preis auf-/absteigend mit realen externen Daten testen.
- Grundpreis-Sortierung mit realen Daten testen.
- Facetten mit heterogenen Webdaten prüfen.
- äquivalente Facettenwerte normalisieren, z. B. `5 l`, `5L`, `5 Liter`.

Priorität 4 – Skalierung:

- Produktklassen über die heutigen Basisklassen hinaus erweitern.
- generisches Schema für Hunderte Produktklassen entwickeln, statt Sondercode pro Produktklasse.
- weitere Attribute/Einheiten ergänzen.
- Mehrsprachigkeit der Product Intelligence härten.

Priorität 5 – Abschluss vor Live:

- mobile Darstellung prüfen.
- Performance und externe Request-Anzahl prüfen.
- Timeout/Rate-Limit/Ausfall-Fallback testen.
- Datenschutz-/rechtliche Darstellung final prüfen.
- kompletter E2E-Browser-Test auf Development.
- Regression gegen bestehenden FundBlick-Katalog.
- Development-vs-Live-Vergleich.
- vollständiges Safety-/SEO-/Indexability-Gate.
- erst danach, nach ausdrücklicher Freigabe, über Merge nach `main` sprechen.

## Produktziel / Hintergrund

FundBlick ist noch jung und hat aktuell nur einen kleinen eigenen Produktbestand (vom Nutzer zuletzt ca. 1.500 Produkte genannt). Die Websuche soll deshalb verhindern, dass Besucher bei einer Produktsuche fast immer 0 Treffer erhalten. Externe Treffer dürfen auch dann nützlich sein, wenn FundBlick dafür keine Affiliate-Provision erhält.

Der Nutzer möchte jedoch keine beliebige allgemeine Websuche. Insbesondere die Ansicht `Angebote` soll möglichst echte kaufbare Produkte mit Preis und Bild liefern. Informations-/Neuheiten-/Videoergebnisse können separat nützlich sein; insbesondere YouTube-Links zu Produkten und Produktneuheiten sind ausdrücklich erwünscht, aber nicht als vermeintliche Kaufangebote.

## Arbeitsprinzipien

- ausschließlich `development`, bis ausdrücklich anders freigegeben.
- `main`/Live nicht verändern.
- keine Gates abschwächen, nur um grün zu werden.
- gefundene Fehler ursächlich beheben.
- kleine nachvollziehbare Commits.
- nach Änderungen CI kontrollieren.
- reale Ergebnisqualität ist wichtiger als nur technisch grüne Tests.
- Traffic/Kosten niedrig halten.
- mobile-first berücksichtigen.
- keine unnötigen Pop-ups.
- bestehende FundBlick-Funktionalität nicht beschädigen.

## Startkommando für einen neuen Chat

Wenn diese Datei im neuen Chat gefunden wurde, lautet der Arbeitsauftrag sinngemäß:

**`Lies DESKTOP_HANDOFF_2026-09-30.md auf Branch development vollständig, einschließlich des Arbeits- und Berichtsprotokolls für Jens. Prüfe danach HEAD und den aktuellen CI-Stand. Arbeite anschließend autonom am letzten nachgewiesenen FundBlick-Stand weiter. Berichte nach sinnvollen Arbeitsblöcken konkret: geprüft -> gefunden -> geändert -> getestet -> CI-Status -> Commit -> nächster Schritt. main/Live nicht verändern.`**
