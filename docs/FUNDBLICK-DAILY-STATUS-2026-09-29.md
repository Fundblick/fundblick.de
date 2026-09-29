# FundBlick – Tagesstatus 2026-09-29

## Status

Stabiler Development-Zwischenstand erreicht. Fokus heute: External Search, Preis-/Währungsrobustheit, erster universeller Intent-Router und Absicherung des realen Händlerkatalogs in der Development-Preview.

Wichtige Development-Stände heute:
- Universal-/Intent-Zwischenstand: `cce528e70690509fd0631bac8a9ec207bb37ce23`
- Tagesdokumentation: `dc6280c2b3a048f7fce7981c3c5bfd871f877342`
- Fix der Development-Katalogpipeline: `612e5f660922c40393e2487fb44b47cb5764ffbe`
- verbindlicher Pre-Flight-/Catalog-Integrity-Vertrag: `f04ee979f5f544242ded772dbe99016bfc63c561`

`main` wurde heute nicht verändert.

## Heute erreicht

### 1. External Search / Wrapper-Suche stabilisiert
- Brave Search Worker als externer Fallback aktiv.
- Bilder, Händler, Produkt-URL, Preis, Währung und Produktstatus werden normalisiert.
- Web-/Wrapper-Ergebnisse bleiben klar von Affiliate-/Händlerergebnissen getrennt.
- Externe Treffer dienen als Ergänzung, wenn eigene Händlerdaten fehlen oder wenn die Suchabsicht breiter ist.

### 2. Mehrsprachigkeit
- Suchoberfläche unterstützt mehrere Sprachen, u. a. Deutsch, Russisch und Rumänisch.
- Sprache der Suchanfrage wird getrennt von der UI-Sprache betrachtet.
- Russische, rumänische und andere nicht-deutsche Eingaben können dadurch gezielter in ihrer Sprache an die Websuche übergeben werden.
- Query-Sprache bleibt getrennt von Markt und Währung.

### 3. Preis- und Währungslogik
- Preisformatierung wurde sprachunabhängig vereinheitlicht.
- Währung wird nicht mehr pauschal aus der UI-Sprache abgeleitet.
- Erkennung berücksichtigt explizite Währung, Preistext und als Fallback die Domain/TLD der Quelle.
- RUB/₽ wurde ergänzt; weitere Währungen wie EUR, USD, GBP, CHF, PLN, CZK, RON und MDL werden unterstützt.
- Wenn keine belastbare Währung ableitbar ist, soll keine erfundene Währung angezeigt werden.

### 4. Schutz gegen falsche Preiszuordnung
- Sichtbar belegbarer Preis aus Titel/Beschreibung erhält Vorrang vor widersprüchlichen verschachtelten Strukturwerten.
- Beispiel: Ein Titel `Ab 11.205 €` darf nicht durch einen unpassenden Strukturwert wie `112050` überschrieben werden.
- Regressionstest für solche Konflikte ergänzt.

### 5. Universal Search Intent – erste Stufe
Neue Datei: `universal-search-intent.js`.

Erkennt erste Suchabsichten:
- konkretes Produkt / Modell
- breite Produktsuche / Discovery
- Information / Ratgeber / Frage
- Vergleich / Test / Review
- Video
- lokale Suche

Beispiele:
- `Bosch GSR 18V-55` → fokussierte Produktsuche
- `Winterreifen` → breite Suche mit möglichen Produkten, Guides, Videos und Vergleichen
- `Wie funktionieren Winterreifen?` → Informations-/Guide-Intent
- `Winterreifen Video` → Video-Intent
- `Ich brauche Zündkerzen in Rottweil` → Local-Intent
- `bujii în Brașov` → rumänische Local-Suche
- `какие зимние шины лучше` → russische Informationssuche

### 6. Ergebnis-Ranking nach Intent
Externe Ergebnisse werden erstmals typisiert und nach Suchabsicht priorisiert:
- product
- guide
- video
- comparison
- local

Für breite oder erklärende Suchanfragen kann External Search auch dann zugeschaltet werden, wenn interne Produkte vorhanden sind.

## Kritischer Incident heute: Development-Preview verlor den realen Händlerkatalog

### Symptom
Der Nutzer stellte fest:
- Mähroboter-/Zubehör-Kategorien waren von der Startseite verschwunden.
- Kategorien wie Haushalt und Möbel lieferten keine passenden Händlerprodukte mehr.
- Der Eindruck war, dass die Universal-/Websuche die Händlerangebote abgeschnitten hätte.

### Tatsächliche Ursache
Die Händlerquellen waren weiterhin vorhanden. Der Fehler lag in der Development-Preview-Pipeline:

- Der Root-Katalog `catalog/manifest.json` enthielt nur 4 Produkte.
- Die Production-Pipeline baut den vollständigen realen Händlerkatalog vor dem Deploy neu.
- Die Development-Preview kopierte dagegen den Repository-Inhalt direkt nach `_site`.
- Dadurch wurde der veraltete 4-Produkte-Katalog ausgeliefert.

Die Search-/Intent-Arbeit hat die Händlerdaten nicht gelöscht. Sie hat jedoch durch häufige Development-Deploys einen bereits vorhandenen Pipeline-Unterschied sichtbar gemacht.

### Fix
Commit: `612e5f660922c40393e2487fb44b47cb5764ffbe`

Development Preview baut jetzt vor jedem Deploy den vollständigen realen Händlerkatalog.
Zusätzliche Schutzbedingungen:
- realer Händlerkatalog wird vor Packaging erzeugt,
- Mindestbestand wird geprüft,
- `catalog/categories.json` muss vorhanden sein,
- der alte 4-Produkte-Root-Katalog darf nicht mehr still als Preview-Wahrheit ausgeliefert werden.

Der zugehörige Development-Deploy lief erfolgreich durch. Der Schritt `Build full real merchant catalog` sowie das eigentliche Pages-Deployment waren grün.

## Neue verbindliche Arbeitsregel

Neue Dokumentation:
`docs/FUNDBLICK-PREFLIGHT-CATALOG-INTEGRITY.md`

Diese Datei ist künftig vor größerer Feature-/Search-/Deployment-Arbeit zusammen mit dem Handoff zu lesen.

Verbindliche Reihenfolge:

`Handoff lesen → Pre-Flight lesen → Branch/Head prüfen → realen Katalogbestand prüfen → erst dann ändern.`

Wenn dokumentierter Händler-/Produktbestand und ausgeliefertes Artefakt stark voneinander abweichen, gilt STOP. Erst Ursache klären, dann Feature-Arbeit fortsetzen.

Beispiel:
- dokumentiert ca. 1.459 reale Produkte
- ausgeliefert 4 Produkte
→ kein weiterer Feature-Bau, bis die Diskrepanz geklärt ist.

## Architektur-Grundsatz nach dem Incident

FundBlick wird in zwei klar getrennte Verantwortungsbereiche gedacht:

### FundBlick Search Engine
- Intent-Erkennung
- Mehrsprachigkeit
- External Search
- Guides / Videos / Vergleiche
- Local Intent
- Ranking / Result-Mixer

### FundBlick Commerce Catalog
- reale Händler
- Affiliate-Produkte
- Preise
- Kategorien
- Feeds
- Händler-Metadaten
- Monetarisierungsrouting

Die Search Engine darf den Commerce Catalog lesen und priorisieren, aber ein Search-Deployment darf niemals implizit bestimmen, welcher Händlerkatalog veröffentlicht wird.

## Verifizierter Gate-/Deploy-Status

Für Commit `cce528e70690509fd0631bac8a9ec207bb37ce23` waren grün:
- external-search
- verify
- deploy
- browser-e2e

Für Commit `612e5f660922c40393e2487fb44b47cb5764ffbe` war der Development Preview Deploy erfolgreich; insbesondere:
- Build full real merchant catalog → success
- Build current development preview → success
- Upload preview artifact → success
- Deploy preview → success

Damit besteht ein belastbarer Development-Zwischenstand mit wiederhergestelltem Händlerkatalog.

## Bewusste Restpunkte

1. Local Search ist noch keine echte strukturierte Händler-/Werkstatt-/POI-Suche.
2. Intent-Erkennung ist derzeit primär regelbasiert und muss weiter ausgebaut werden.
3. Ergebnis-Mischung zwischen Affiliate, Web, Guide, Video und Local kann später feiner gewichtet werden.
4. Der Cloudflare Worker besitzt weiterhin keinen automatischen Deploy aus GitHub; Worker-Änderungen müssen manuell in Cloudflare veröffentlicht werden.
5. Währungserkennung per Domain ist nur Fallback und muss bei widersprüchlichen Quellen vorsichtig behandelt werden.
6. Mehrsprachige Suchlogik braucht weitere reale E2E-Tests mit gemischten Sprachen und Märkten.
7. Das aktuelle globale Mindestbestands-Gate ist nur ein kurzfristiger Schutz; bei vielen Händlern reicht es nicht.

## Anknüpfpunkte für morgen

### Priorität A – Catalog Integrity skalierbar machen
Nicht bei `>= 1000 Produkte` stehen bleiben.

Nächste Härtungen:
- Gesamtprodukt-Delta gegen letzten guten Build.
- Produktzahl pro Händler prüfen.
- unerwartet verschwundene Händler blockieren.
- Kategorie-Deltas prüfen.
- Feed-/Source-Vollständigkeit prüfen.
- eindeutige Catalog-Build-ID / Hash einführen.
- Katalog-Builds unveränderlich behandeln.
- atomaren Catalog-Pointer vorbereiten.
- Rollback auf letzten guten Build statt manueller Rekonstruktion.

### Priorität B – Development und Production Pipeline angleichen
Ziel: möglichst dieselbe reale Katalog-Build- und Integrity-Logik für Preview und Production verwenden, damit Preview und Production nicht wieder unterschiedliche Wahrheiten ausliefern.

### Priorität C – Post-Deploy Smoke Tests
Automatisch prüfen:
- Startseiten-Kategorien vorhanden,
- Möbel/Haushalt liefern reale Händlerprodukte,
- mindestens eine konkrete Produktsuche liefert Händlerergebnis,
- Affiliate-/Händlerpfad funktioniert,
- External Search bleibt Ergänzung und ersetzt den Commerce Catalog nicht.

### Priorität D – Universal Search weiterbauen
Danach weiter mit:
- Local Intent / Ortsextraktion,
- lokale Händler-/Werkstattquellen,
- gemischte Spracheingaben,
- Result-Mixer für Produkt/Guide/Video/Vergleich/Local,
- Affiliate-first ohne Informationsverlust.

### Priorität E – Worker-Deploy-Prozess
Reproduzierbaren Cloudflare-Deploy vorbereiten.

## Tagesfazit

Heute wurde aus dem bisherigen Produkt-Fallback eine deutlich allgemeinere Sucharchitektur. Gleichzeitig wurde ein wichtiger Skalierungs- und Deploymentfehler gefunden: Search-/Frontend-Fortschritt darf niemals unbemerkt den realen Händlerkatalog ersetzen oder verkleinern.

Der Fehler ist für den heutigen Maßstab behoben und als dauerhafte Arbeitsregel dokumentiert. Für die nächste Session ist der wichtigste Architekturpunkt: Catalog Integrity so ausbauen, dass ein solcher Verlust bei 10, 100, 1.000 oder 10.000 Händlern automatisch erkannt, blockiert und über einen bekannten guten Katalog-Build schnell zurückgerollt werden kann.
