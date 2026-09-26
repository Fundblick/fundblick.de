# FundBlick – Arbeitsstand Suche / Facetten – 26.09.2026

## Zweck
Interne technische Dokumentation des stabil erreichten Zwischenstands. Diese Datei ist Entwicklungsdokumentation und darf nicht in die ausgelieferte Website bzw. den öffentlichen Build kopiert werden.

## Stabiler Stand
- Production-Katalog: 1.428 reale Produkte, 0 simulierte Produkte.
- Erster realer Händlerdatenbestand erfolgreich in die Live-Suche integriert.
- Kategorienavigation von der Homepage in die Suche funktioniert; Rücknavigation funktioniert.
- Mobile Suche lädt Produktkarten und Kategorieergebnisse ohne den zuvor beobachteten Freeze.
- Dynamische Produktklassifizierung und Facetten sind in Production integriert.
- Mobile Filtersteuerung verwendet genau einen sichtbaren „Suche verfeinern“-Button; der native zweite Details-Titel wird mobil ausgeblendet.
- Händleranzeige darf keinen numerischen Offer-Count als Händlernamen darstellen.

## Facettenarchitektur
Relevante Komponenten:
- `home-facet-classifier.js`: gewichtete Produktfamilien-Klassifizierung und Ableitung von Typ, Material, Stil und ggf. Raum.
- `facet-schemas.js`: Facettenschemata.
- `search-facet-engine-v2.js`: Laufzeitintegration der dynamischen Facetten in die Suche.
- `search.js`: Suchzustand, Filterrendering, Produktkarten und Kategorieübergabe.
- `search-mobile.js` / `search-mobile.css`: mobile Filter-/Sortiersteuerung.
- `audit-home-facet-coverage.js`: Coverage-Audit gegen Produktdaten.
- `.github/workflows/facet-coverage-audit.yml`: baut für den Audit zuerst einen produktionsnahen realen Katalog und prüft anschließend die Coverage.

## Gemessene Coverage auf 1.428 realen Produkten
Stand des letzten belastbaren Audits:
- Produkttyp: 1.199 / 1.428 = 84,0 %
- Material: 1.171 / 1.428 = 82,0 %
- Stil: 1.014 / 1.428 = 71,0 %
- Raum/Einsatzbereich: 216 / 1.428 = 15,1 %
- 378 Händler-Kategoriezuordnungen wurden durch die eigene Klassifizierung anders eingeordnet.

Der niedrige Raum-Wert ist nicht automatisch ein Fehler: Raum/Einsatzbereich ist nicht für jedes Produkt sinnvoll oder aus den Quelldaten belastbar ableitbar.

## Heute gefundene Fehler und dauerhafte Lernregeln
### 1. CI-grün ist nicht gleich UI-grün
Ein erfolgreicher Klassifikator-, Katalog- oder Coverage-Test beweist nicht, dass die erzeugten Facetten in der Browseroberfläche sichtbar und bedienbar sind.

**Pflicht ab jetzt vor Live-Freigabe von Suche/UX:**
1. Production-Katalog bauen und validieren.
2. Kategorie über denselben URL-/Navigationsweg wie ein Kunde öffnen.
3. Ergebnisanzahl plausibilisieren.
4. „Suche verfeinern“ öffnen.
5. Kategorie-spezifische Facetten tatsächlich im gerenderten UI kontrollieren.
6. Mindestens einen Facettenwert anwenden und Ergebnisänderung prüfen.
7. Filter zurücksetzen.
8. Sortierung prüfen.
9. Zurücknavigation Homepage → Suche → Homepage prüfen.
10. Mobile Darstellung auf doppelte Controls, leere Panels und falsche Labels prüfen.

### 2. Audit muss echte Produktionsdaten prüfen
Ein Coverage-Audit gegen Testdaten kann technisch grün sein und trotzdem keine Aussage über den realen Händlerbestand liefern. Der Audit muss den realen/produktionsnahen Katalog neu bauen und einen Gate auf `dataMode=real`, `simulatedCount=0` und eine plausible Mindestproduktzahl anwenden.

### 3. Händlerdaten nie semantisch erraten
Numerische Felder wie Offer-Count dürfen nicht als Händlername dargestellt werden. Händlername/ID/Offer-Count müssen getrennte Semantik behalten.

### 4. Reklassifizierung darf gemeinsame Attribute nicht verlieren
Gemeinsame Materialregeln müssen familienübergreifend konsistent sein. Beispiel: Baumwolle muss als Textil erhalten bleiben, auch wenn ein Produkt von einer Händlerfamilie in eine andere FundBlick-Familie reklassifiziert wird.

### 5. Mobile Controls dürfen keine zweite Bedienebene duplizieren
Wenn mobil ein eigener Filter-Toggle erzeugt wird, darf der darunterliegende native `<summary>` nicht als zweiter gleichlautender Button sichtbar bleiben. Geschlossenes Filterpanel soll mobil keinen leeren Platzhalterblock erzeugen.

### 6. Browsercache / Deployment
Statische Assets werden versioniert/content-hashed ausgeliefert. Änderungen an JS/CSS müssen über den Production-Build mit Asset-Versionierung laufen, damit alte Browserstände nicht dauerhaft mit inkompatiblen neuen Dateien gemischt werden.

## Händler-Onboarding – Pflichtcheck für den nächsten Händler
Vor Integration eines weiteren großen Händlerfeeds:
- Quelldatenfelder und Semantik inventarisieren.
- Produktanzahl, IDs, Duplikate und Pflichtfelder prüfen.
- Händler-/Brand-/Offer-Felder explizit mappen.
- Kategorien zunächst analysieren, nicht blind übernehmen.
- Klassifikator/Coverage gegen den vollständigen Feed laufen lassen.
- Unknown-/Unclassified-Gruppen quantitativ auswerten.
- Erst danach neue Regeln ergänzen.
- Production-Katalog separat bauen und validieren.
- End-to-End-UI-Abnahme auf Desktop und Mobile durchführen.
- Erst nach dieser Abnahme nach `main`/Production freigeben.

## Nächste fachliche Arbeit
- Die aktuell nicht typisierten ca. 229 Produkte analysieren und reale fehlende Produkttypen gruppieren.
- Die aktuell ohne Materialklassifizierung verbleibenden ca. 257 Produkte analysieren.
- Stil-Coverage gezielt verbessern, ohne schwache/erfundene Zuordnungen zu erzeugen.
- Raum/Einsatzbereich nur erweitern, wenn die Daten eine belastbare Aussage erlauben.
- Facetten weiterhin kategoriedynamisch halten: Möbel brauchen andere Detailfilter als Schuhe, Elektronik usw.
- Vor dem zweiten Händler den oben beschriebenen Händler-Onboarding-Gate anwenden.

## Release-/Abnahmeprinzip
`Tests grün → produktionsnaher Katalog grün → Coverage plausibel → gerenderte UI/E2E geprüft → erst dann Live-Freigabe.`

Diese Reihenfolge ist verbindlicher Lernpunkt aus den Fehlern dieses Arbeitstags.
