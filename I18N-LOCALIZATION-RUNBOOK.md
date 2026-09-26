# FundBlick – Sprach-/Lokalisierungs-Runbook

Stand: 26.09.2026

Dieses Dokument beschreibt den standardisierten Ablauf für neue FundBlick-Sprachen. Russisch (RU V2) ist die Referenzimplementierung. Ziel ist, jede weitere Sprache deutlich schneller, reproduzierbarer und mit geringerem Regressionsrisiko auszurollen.

## 1. Grundprinzip

Eine neue Sprache ist **keine neue Seitenlogik**. Navigation, Suche, Filter, Händlerdaten und URL-Verhalten bleiben technisch stabil. Übersetzt wird nur die jeweilige Darstellungsschicht.

Die wichtigste Regel lautet daher:

> Funktionale Werte bleiben stabil. Nur sichtbare Labels werden lokalisiert.

Beispiel:

- interner Filterwert: `Beistelltisch`
- RU-Anzeige: `Приставной столик`
- EN-Anzeige: `Side table`
- RO-Anzeige: `Masă laterală`

Die Filter-Engine arbeitet weiterhin mit `Beistelltisch`. Dadurch bleibt die Logik händler- und sprachunabhängig.

## 2. Textklassen strikt trennen

### A. FundBlick-UI

Dazu gehören z. B.:

- Startseite
- Suchfeld
- Buttons
- Sortierung
- Filterüberschriften
- Navigation
- Datenschutzhinweise
- Impressum-Rahmentexte
- 404-Seite
- Cookie-/Affiliate-Consent

Diese Texte dürfen und sollen vollständig lokalisiert werden.

### B. FundBlick-Taxonomie / Facettenwerte

Dazu gehören z. B.:

- Beistelltisch
- Bank
- Stuhl
- Sessel / Sofa
- Holz
- Metall
- Leder
- Mosaik
- Marokkanisch

Diese Werte werden **nur in der Anzeige** lokalisiert. Der interne Wert bleibt unverändert.

### C. Händler-Quelldaten

Dazu gehören insbesondere:

- Produkttitel
- Händlerbeschreibung
- Händlername
- vom Händler gelieferte Modell-/Produktbezeichnungen

Diese Inhalte werden aktuell nicht automatisch übersetzt. Beispiel: `Hakenleiste Belluno` bleibt Händler-Originaltext. Das schützt Quelltreue und verhindert erfundene oder semantisch veränderte Produktangaben.

## 3. Referenzarchitektur

Die aktuelle Spracharchitektur verteilt sich auf mehrere klar getrennte Schichten:

- `home-i18n.js` – Startseite
- `search-i18n.js` – Suchseiten-UI
- `search-static-i18n.js` – zusätzliche statische Suchtexte
- `legal-i18n.js` – Impressum / Legal-Texte
- `datenschutz-i18n.js` – Datenschutz
- `error-i18n.js` – 404
- `affiliate-consent.js` – Consent und Affiliate-Laufzeittexte
- `facet-value-i18n.js` – bestehende Facettenübersetzungen
- `taxonomy-value-i18n.js` – skalierbare händlerunabhängige Taxonomie-Anzeige
- `category-display-i18n.js` – Kategorie-Anzeige
- `page-meta-i18n.js` – Seitentitel / Meta
- `language-links.js` – sprachbezogene Links

Wichtig: Keine dieser Dateien darf eigenmächtig Such- oder Navigationslogik umdefinieren.

## 4. Direkteinstieg per `?lang=`

Jede Sprache muss auch bei direktem Einstieg korrekt funktionieren, z. B.:

- `/index.html?lang=ru`
- `/search.html?lang=ru`
- `/datenschutz.html?lang=ru`
- `/404.html?lang=ru`

Lernpunkt aus RU V2: Es reicht nicht, nur den Sprachselektor und `localStorage` zu unterstützen. Direkte Links müssen den URL-Parameter berücksichtigen.

Dabei gilt:

- URL lesen: ja
- History/Navigation ungefragt verändern: nein
- keine Redirect-Kaskaden
- kein unnötiges `pushState`/`replaceState`

## 5. Taxonomie – Standard für alle künftigen Händler

Die Taxonomie darf nicht pro Händler separat gepflegt werden.

Falsch:

- Casa Moro: `Beistelltisch -> RU`
- Händler B: denselben Begriff erneut pflegen

Richtig:

Eine zentrale semantische Ebene:

```text
side_table
  de: Beistelltisch
  ru: Приставной столик
  en: Side table
  ro: Masă laterală
  it: Tavolino
```

Ein Händler liefert einen bekannten Quellwert bzw. wird auf eine stabile Taxonomie-ID normalisiert. Die sichtbare Sprache wird erst danach angewendet.

### Aktuell bewährtes Verhalten

Bei RU werden sichtbare Filterwerte, aktive Filter-Chips und Taxonomie-Tags lokalisiert. Die Checkbox-`value` bleibt unverändert.

Das ist zwingend, weil sonst Filterzustand, URL-State, Suche oder zukünftige Händler-Mappings brechen können.

## 6. Reihenfolge für eine neue Sprache

### Phase 1 – Vorbereitung

1. Neue Dev-Branch von aktuellem `main` erstellen.
2. Sprachcode festlegen, z. B. `ro`, `it`, `tr`, `uk`.
3. Prüfen, ob die Sprache bereits im Sprachselektor existiert.
4. Keine Live-Änderung direkt auf `main`.

### Phase 2 – Kern-UI

In dieser Reihenfolge lokalisieren:

1. Startseite
2. Suchseite
3. Such-/Sortier-/Filterüberschriften
4. Footer / Navigation
5. 404
6. Impressum
7. Datenschutz
8. Consent-/Affiliate-Laufzeittexte
9. Meta-Titel / Beschreibungen

### Phase 3 – Taxonomie

1. vorhandene sichtbare Facettenwerte einsammeln
2. zentrale Sprachlabels ergänzen
3. keine internen Werte ändern
4. aktive Filter-Chips prüfen
5. Produkt-Tags prüfen
6. Marken/Händlernamen nicht übersetzen

### Phase 4 – Browserprüfung

Desktop und Mobile mindestens prüfen:

- direkter Einstieg `?lang=<code>`
- Startseite
- Suche
- Ergebnisliste
- Feinsuche
- Filter setzen
- Filter-Chip
- Sortierung
- Zurück/Vorwärts
- Navigation zurück zur Startseite
- Datenschutz
- 404
- keine ungefangenen JS-Fehler

### Phase 5 – Release

1. statische Safety-Gates grün
2. Product-Copy-Regression grün
3. Development V2 Integrity grün
4. Browser-E2E Desktop + Mobile grün
5. Diff prüfen
6. PR erstellen
7. nur geprüften Head-SHA mergen
8. Produktionsworkflow bis `SUCCESS` verfolgen
9. Live-Smoke-Test

## 7. Was bei RU V2 schiefging bzw. was wir gelernt haben

### Problem 1 – Lokalisierung und Navigation vermischt

Frühere Sprachversuche änderten zu viel gleichzeitig. Statische Tests konnten grün sein, obwohl Browsernavigation kaputtging.

**Regel:** i18n und Navigation getrennt behandeln. Eine Sprachdatei soll Texte darstellen, nicht Routing neu erfinden.

### Problem 2 – Datenschutz wurde nachträglich wieder deutsch

`datenschutz-i18n.js` übersetzte korrekt, danach schrieb `affiliate-consent.js` Awin-/ADCELL-Statuszeilen erneut auf Deutsch.

**Regel:** Auch asynchron erzeugte Laufzeittexte müssen sprachbewusst sein. Nicht nur statisches HTML prüfen.

### Problem 3 – 404 und Startseite ignorierten direkte `?lang=ru`-Links

Sprachzustand wurde teilweise nur aus Auswahl/localStorage gelesen.

**Regel:** Direkte URL-Sprache ist ein eigener Testfall.

### Problem 4 – Mobile Filter funktionieren anders als Desktop

Der Desktop-Filter war per `<details>` zugänglich, Mobile verwendet eigene Filtersteuerung.

**Regel:** E2E muss die echte mobile Bedienung verwenden; Desktop-Interaktion darf nicht einfach auf Mobile kopiert werden.

### Problem 5 – Browser-E2E war zunächst von lokalen Katalogdaten abhängig

Der erste Taxonomie-Test erwartete Casa-Moro-Werte im lokalen CI-Katalog. Das ist unnötig fragil.

**Regel:** Komponenten-/Darstellungstests sollen repräsentative Quellwerte deterministisch einspeisen, wenn die eigentliche Produktpipeline bereits separat geprüft wird.

### Problem 6 – Testfehler nicht mit Produktfehler verwechseln

Ein mobiler Test versuchte eine versteckte Checkbox anzuklicken. Desktop war korrekt, Mobile-UI musste im Test geöffnet werden.

**Regel:** Bei einem roten E2E zuerst Ursache unterscheiden: Produktbug, Datenproblem oder falsches Testszenario.

## 8. Safety-Gates

Für Sprachänderungen gelten mindestens:

### Statische Gates

- JavaScript-Syntax
- Sprachvollständigkeit
- direkte `?lang`-Unterstützung
- keine ungewollte History-/Navigation-Mutation
- interne Facettenwerte bleiben unverändert
- Product-Copy-Regression

### Browser-Gates

- Chromium Desktop
- Chromium Mobile
- sichtbare Übersetzung korrekt
- funktionale `value`-Werte unverändert
- Filter bedienbar
- keine `pageerror`

### System-Gates

- Development V2 Integrity
- Katalogprüfung
- Publication-Handoff
- Merchant-Handoff
- Outbound-Click
- UI-/Frontend-Language
- Search-Routing

## 9. Release-Regel

Nie direkt experimentell auf Produktion reparieren.

Standard:

```text
Dev-Branch
  -> Änderungen
  -> statische Tests
  -> Browser-E2E
  -> Systemtests
  -> PR
  -> Diff/Head-SHA prüfen
  -> Merge
  -> Produktionsworkflow
  -> Live-Smoke
```

Wenn Live-Smoke einen echten kritischen Fehler findet, auf den letzten bekannten guten Produktionsstand zurückgehen statt ungeprüfte Hotfix-Ketten auf Live zu bauen.

## 10. Checkliste für die nächste Sprache

Vor dem Merge müssen alle Punkte mit JA beantwortet werden:

- [ ] Startseite vollständig lokalisiert
- [ ] Suchseite vollständig lokalisiert
- [ ] Filterüberschriften lokalisiert
- [ ] Taxonomie-Anzeigewerte lokalisiert
- [ ] interne Filterwerte unverändert
- [ ] Händler-Produkttitel unverändert
- [ ] Händlerbeschreibungen unverändert
- [ ] 404 lokalisiert
- [ ] Impressum-Rahmen lokalisiert
- [ ] Datenschutz lokalisiert
- [ ] Affiliate-/Consent-Laufzeittexte lokalisiert
- [ ] `?lang=<code>` auf allen wichtigen Seiten geprüft
- [ ] Desktop E2E grün
- [ ] Mobile E2E grün
- [ ] Back/Forward grün
- [ ] keine JS-Pageerrors
- [ ] Product-Copy-Regression grün
- [ ] Development V2 Integrity grün
- [ ] finaler Diff geprüft
- [ ] Produktionsworkflow nach Merge grün
- [ ] Live-Smoke durchgeführt

## 11. So wird die nächste Sprache schneller

Bei der nächsten Sprache darf nicht wieder jedes Problem neu gelöst werden. Der Ablauf soll im Wesentlichen nur noch sein:

1. Referenzstruktur von RU übernehmen.
2. neue Übersetzungswerte ergänzen.
3. neue Taxonomie-Labels in derselben zentralen Tabelle ergänzen.
4. vorhandene Tests parametrisieren bzw. auf neuen Sprachcode erweitern.
5. dieselben Gates laufen lassen.

Das Ziel ist, dass neue Sprachen künftig überwiegend **Datenarbeit statt Architekturarbeit** sind.

## 12. Entscheidungen, die vorerst bewusst bestehen bleiben

- Russisch ist Referenzimplementierung, nicht technische Basissprache.
- Deutsch/technische IDs bleiben intern stabil, solange keine vollständige ID-Normalisierung durchgeführt wird.
- Händler-Quelltexte werden nicht automatisch maschinell übersetzt.
- Marken, Händlernamen und Modellbezeichnungen bleiben Quelltext.
- Taxonomie wird zentral und händlerübergreifend gepflegt.
- Sprachänderungen dürfen keine neue Such-/Routinglogik einführen.

## 13. Referenz-Releases

RU V2 Release:

- PR #10
- `main` nach RU V2: `a84814b832996c3e2c030b8aec956c1c4ea2daf9`

Taxonomie-Lokalisierung:

- PR #11
- `main`: `0e0447fe3a349f58b21fd42260e9f459ff82fbe7`

Beide Releases wurden erst nach grünen Safety-/Integrity-/Browser-Gates gemerged.

---

## Kurzfassung für ChatGPT / zukünftige Arbeit

Wenn eine neue FundBlick-Sprache gebaut wird:

**Nicht neu erfinden. RU V2 als Referenz nehmen. UI übersetzen, Taxonomie nur sichtbar übersetzen, Händlertext unangetastet lassen, interne Werte nie wegen Sprache ändern, direkte `?lang`-Links prüfen, Desktop und Mobile separat testen und erst nach komplett grünem Gate mergen.**
