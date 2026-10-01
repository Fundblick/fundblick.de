# FundBlick – Websuche & Search-UX Zielbild

**Stand:** 01.10.2026  
**Status:** Verbindliche Arbeitsgrundlage für die nächste Entwicklungsphase  
**Scope:** Produktsuche, externe Webangebote, Facetten, Ergebnisdarstellung und responsive UX

## 1. Leitbild

FundBlick soll keine allgemeine Websuchmaschine mit Produktkarten sein. Der Mehrwert besteht darin, eine freie Nutzereingabe zuerst fachlich zu verstehen und anschließend in eine strukturierte Produktsuche zu übersetzen.

Zielpipeline:

`Freie Eingabe → Query Understanding → Produktfamilie → Constraints → Facetten-Blueprint → eigene Händlerangebote + ergänzende Webangebote → Evidenz/Normalisierung → Filter/Ranking → einheitliche responsive Ergebnisdarstellung`

Eigene Händlerangebote und externe Webangebote sind Datenquellen desselben Product-Finder-Systems und dürfen für den Nutzer nicht wie zwei getrennte Suchmaschinen wirken.

## 2. Query Understanding vor der eigentlichen Ergebnissuche

Nach Enter wird die Eingabe zunächst semantisch klassifiziert:

1. Handelt es sich um eine Produktsuche?
2. Welche kanonische Produktfamilie ist gemeint?
3. Welche Eigenschaften/Constraints nennt der Nutzer bereits?
4. Welche Facetten sind für diese Produktfamilie fachlich relevant?
5. Ist die Zuordnung sicher genug oder wird ein intelligenter Fallback benötigt?

Beispiele:
- `RAM ddr` → Arbeitsspeicher/RAM
- `32 GB DDR5 RAM 6000 MHz` → RAM + 32 GB + DDR5 + 6000 MHz
- `10W40 5 Liter` → Motoröl + SAE 10W-40 + 5 l
- `Bosch Akkuschrauber 18V` → Akkuschrauber + Bosch + 18 V
- `Zündkerze` → Zündkerze; anschließend fachlich sinnvolle Verfeinerung nach Anwendung/Kompatibilität und Produktmerkmalen

Bereits aus dem Suchtext erkannte Eigenschaften werden als gesetzte Constraints übernommen und nicht erneut unnötig abgefragt.

## 3. Keine gigantischen Wortlisten

Die Architektur darf nicht darauf beruhen, jede mögliche Nutzerformulierung manuell zu hinterlegen.

Stattdessen:
- kleine/stabile sprachneutrale kanonische Produkttaxonomie als Gerüst,
- semantische Zuordnung natürlicher Sprache auf Produktfamilien,
- normalisierte Attribute und Einheiten,
- wiederverwendbare Facetten-Blueprints,
- intelligenter Fallback für unbekannte oder unsichere Produktarten,
- Cache/Wiederverwendung bereits zuverlässig abgeleiteter Strukturen.

Deterministische Regeln bleiben dort sinnvoll, wo sie fachlich eindeutig sind: Einheiten, technische Standards, Modell-/Artikelkennungen, Größen, Spannung, Speichergrößen usw.

## 4. Dynamische Facetten

Facetten werden zweistufig erzeugt:

### 4.1 Blueprint aus der Suchintention
Schon vor den endgültigen Treffern kennt FundBlick die für die erkannte Produktfamilie relevanten Attribute.

Beispiel RAM:
- DDR-Generation
- Kapazität
- Takt
- Formfaktor (DIMM/SO-DIMM)
- Kit/Modulanzahl
- Hersteller
- Preis

### 4.2 Evidenz aus realen Angeboten
Händler- und Webresultate bestätigen und befüllen die Facetten mit tatsächlich vorhandenen Werten. FundBlick darf keine konkreten Auswahlwerte erfinden.

Beispiel: DDR5 wird nur als auswählbarer Wert angeboten, wenn Suchintention oder reale Evidenz dies trägt.

Universelle Facetten können u. a. Preis, Marke/Hersteller, Händler, Verfügbarkeit, Versand und Zustand umfassen. Produktspezifische Facetten werden ausschließlich angeboten, wenn sie fachlich zur erkannten Produktfamilie passen.

Aktive Filter:
- sichtbar,
- einzeln entfernbar,
- vollständig zurücksetzbar,
- URL-/History-fähig.

## 5. Umgang mit unbekannten Produktarten

Kennt FundBlick eine Produktfamilie noch nicht:
1. semantisch nächstpassende Familie bestimmen,
2. falls nötig ein vorläufiges strukturiertes Facetten-Blueprint ableiten,
3. reale Produktdaten als Evidenz verwenden,
4. Ergebnis cachen,
5. wiederkehrende belastbare Strukturen später in die dauerhafte Taxonomie überführen.

RAM, Zündkerze usw. sind Acceptance-Tests, keine Sonderprogrammierungen.

## 6. Händler- und Websuche als ein Product Finder

Nicht mehr:
`Händlersuche → 0 Treffer → Fehlermeldung → separate Websuche`

Ziel:
`FundBlick-Produktsuche → eigene Händlerangebote + ergänzende Webangebote → gemeinsame Intelligence/Filter/Sortierung/Darstellung`

Die Herkunft eines Angebots bleibt transparent, bestimmt aber nicht die Bedienphilosophie.

Bei 0 eigenen Angeboten soll die Oberfläche kompakt und handlungsorientiert bleiben, z. B.:
- erkannte Produktfamilie anzeigen,
- keine doppelten Nulltreffer-Meldungen,
- keine wirkungslosen Sortier-/Filterelemente,
- Webangebote als klare nächste Aktion,
- sinnvolle Verfeinerung früh sichtbar.

## 7. Desktop-Layout

Die aktuelle einspaltige externe Ergebnisliste nutzt Desktop-Fläche unzureichend.

Ziel:
- responsives Produktkarten-Raster,
- typischerweise 3–4 kompakte Karten nebeneinander auf Desktop, abhängig von verfügbarer Breite und Filterspalte,
- 2 Karten bei geeigneten mittleren Breiten,
- 1 Karte auf kleinen mobilen Displays,
- Bild, Produktname, Preis, Händler/Quelle und CTA schnell vergleichbar,
- lange Beschreibungstexte nicht dominieren lassen,
- wichtige Facetten auf Desktop dauerhaft oder sehr schnell erreichbar.

Die konkrete Spaltenzahl ist responsiv zu bestimmen; keine starre Geräteannahme.

## 8. Mobile Layout

Mobile grundsätzlich einspaltig, aber kompakt.

Zu vermeiden:
- doppelte Nulltreffer-Meldungen,
- große leere Flächen,
- Sortierung ohne Ergebnisse,
- mehrfach redundante Buttons,
- Datenschutztext als dominierendes Hauptelement,
- Websuche erst weit unterhalb irrelevanter UI.

Priorität:
1. Was wurde verstanden?
2. Welche sinnvolle Verfeinerung gibt es?
3. Welche Angebote gibt es / wie kann die Suche erweitert werden?
4. Filter/Sortierung erst dann prominent, wenn sie tatsächlich nutzbar sind.

## 9. Nachladen / Pagination

Die derzeitige Mischform aus Seitenstatus und `Weitere 20 / Next 20` wird nicht als Ziel-UX betrachtet.

Bevorzugtes Produktlisten-Verhalten:
- kontrolliertes Nachladen,
- verständliche Bezeichnung wie `Weitere Angebote anzeigen`,
- bestehende Treffer bleiben sichtbar,
- Fortschritt/Trefferstand anzeigen, soweit belastbar,
- Scroll-/History-Zustand erhalten,
- Rückkehr vom Händlerangebot an die vorherige Position.

Wo echte Pagination fachlich/technisch sinnvoller ist, wird sie konsistent als echte Pagination umgesetzt. Keine Mischung beider Bedienmodelle.

## 10. Performance

Query Understanding muss schnell genug sein, dass die Seite nicht auf eine langsame offene Webrecherche warten muss.

Ziel:
- bekannte Produktfamilien aus Taxonomie/Cache sehr schnell klassifizieren,
- UI-Blueprint unmittelbar rendern,
- Händler-/Webresultate parallel laden,
- unbekannte Fälle über Intelligence-Fallback ableiten und anschließend cachen.

Keine harte Produktiv-Latenz zusichern, bevor sie unter realen Bedingungen gemessen wurde.

## 11. Acceptance-Tests

Mindestens folgende freie Eingaben müssen als generische Systemtests dienen:
- `RAM Speicher`
- `32GB DDR5 RAM 6000 MHz`
- `Damen Laufschuhe Größe 39`
- `Bosch Akkuschrauber 18V`
- `65 Zoll OLED Fernseher`
- `10W40 Motoröl 5 Liter`
- `Zündkerze`
- `Kinderwagen`
- `Mosaiktisch`

Je Test prüfen:
1. Produktfamilie korrekt/vertretbar erkannt?
2. bereits genannte Constraints korrekt extrahiert?
3. fachlich passende Facetten erzeugt?
4. keine unpassenden Facetten?
5. reale Facettenwerte evidenzbasiert?
6. eigene und externe Angebote konsistent dargestellt?
7. Desktop-Raster sinnvoll?
8. Mobile kompakt und ohne Redundanzen?
9. Filter verändern Ergebnisse korrekt?
10. Sortierung korrekt?
11. Nachladen/History/Zurücknavigation korrekt?
12. keine simulierten oder erfundenen Produkt-/Attributdaten?

## 12. Abnahmegrundsatz

Grüne CI-Tests sind notwendig, aber nicht ausreichend.

Für jede wesentliche Search-/UX-Änderung sind zusätzlich reale gerenderte Abnahmen auf mindestens:
- Smartphone,
- typischem Desktop,
- mehreren fachlich unterschiedlichen Suchbegriffen

durchzuführen.

Ein Release gilt hinsichtlich Search-UX nicht als abgeschlossen, solange technische Module zwar vorhanden sind, ihre Funktion aber in der realen Oberfläche nicht wirksam oder nicht sinnvoll bedienbar ist.

## 13. Nächste Entwicklungspriorität

Vor zusätzlichen großen Features:
1. Query-to-Facet-Pipeline generalisieren,
2. Händler- und Websuche UX-seitig vereinheitlichen,
3. dynamische Facetten bis zur realen Oberfläche durchziehen,
4. Desktop-Produktgrid implementieren,
5. Mobile Nulltreffer-/Websuche vereinfachen,
6. Load-More/Pagination konsistent machen,
7. Acceptance-Suite mit den oben genannten heterogenen Suchbegriffen ausbauen,
8. visuelle Endabnahme vor Live-Merge.
