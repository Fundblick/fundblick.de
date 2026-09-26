# FundBlick Merchant Onboarding Playbook

## Ziel
Jeder neue Händler soll weniger manuelle Sonderlogik benötigen als der vorherige. Händlerbegriffe werden nicht als neue FundBlick-Kategorien übernommen. Zuerst wird gegen die bestehende kanonische FundBlick-Taxonomie gemappt.

## Verbindlicher Ablauf
1. Feed isoliert einlesen; Live bleibt unverändert.
2. Datenqualität messen: Anzahl, IDs, Duplikate, URLs, Preis, Bilder, Händler-/Brand-/Offer-Semantik.
3. `audit-merchant-onboarding.js` gegen den vollständigen realen Feed ausführen.
4. Wiederverwendungsquote bestimmen: bekannte Familie, vorhandener Produkttyp, Material, Stil, Raum.
5. Nur den unbekannten Rest clustern und prüfen.
6. Händler-Synonyme möglichst auf vorhandene kanonische Typen mappen.
7. Neue kanonische Typen nur ergänzen, wenn tatsächlich eine neue Produktart vorliegt – niemals nur wegen anderer Händlerbezeichnung.
8. Eigenschaften wie Material, Stil, Farbe, Größe oder Raum als Facetten behandeln; keine Kombinationskategorien erzeugen.
9. Regression, Taxonomie-Konsistenz, Produktionskatalog, Coverage und Gap-Audit ausführen.
10. Gerenderte UI/E2E auf Mobile und Desktop prüfen.
11. Erst danach PR nach `main` und Production-Deployment.

## Stop-Gates
- Keine numerischen Offer-Counts als Händlername.
- Keine simulierten Produkte in Production.
- Keine unbekannten Taxonomiewerte ohne Registry-Eintrag.
- Keine automatische Gleichsetzung ähnlicher Stile, z. B. Orientalisch != Marokkanisch.
- Keine Freigabe nur aufgrund grüner Unit-/CI-Tests; die gerenderte Suche muss geprüft sein.
- Bei ungewöhnlich niedriger Wiederverwendungsquote zuerst Mapping/Quelldaten prüfen, nicht hunderte neue Kategorien erzeugen.

## Lernmetriken pro Händler
Für jeden Import festhalten:
- Produktanzahl
- Anteil bekannte FundBlick-Familie
- Anteil vorhandener Produkttyp
- Material-/Stil-/Raum-Coverage
- Zahl wirklich neuer kanonischer Produkttypen
- Zahl benötigter Händler-Synonyme/Mappingregeln
- Zahl manueller Sonderfälle
- Fehler aus Feed, Klassifikation, UI und Deployment

Das Ziel über mehrere Händler ist eine steigende Wiederverwendungsquote und eine sinkende Zahl händlerspezifischer Sonderregeln.

## Architekturregel
FundBlick besitzt die Taxonomie. Der Händler liefert Rohdaten und Begriffe. Händlerkategorien sind Evidenz für die Klassifikation, aber nicht die öffentliche Informationsarchitektur von FundBlick.
