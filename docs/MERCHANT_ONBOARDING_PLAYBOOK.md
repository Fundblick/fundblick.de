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


## Amazgifts DE – Development-Stand 2026-10-02
- Awin Advertiser-ID: `87569`; Publisher-ID: `3106259`; bevorzugter Feed: `95497`.
- Vollfeed geprüft: 5.922 Rohzeilen; 2.964 Produkte im bevorzugten Feed; 2.964 eindeutige Händler-Produkt-IDs.
- Der Händler-Feedwert `Women's Accessories` wird nicht als FundBlick-Taxonomie übernommen.
- Aktuelle belegte Zuordnung aus Titel/Beschreibung: 2.271 Schlüsselanhänger, 605 Schmuck, 74 Fotogeschenke, 14 Schmuckzubehör.
- Alle 2.964 Produkte erhalten `rawAttributes.productType`; die Suchfacette verwendet denselben kanonischen Schlüssel `productType`.
- Affiliate-Ziel bleibt der vom Awin-Feed gelieferte `aw_deep_link`; Direktziel bleibt `merchant_deep_link`.
- Fehlende Lieferkosten und Verfügbarkeit werden nicht erfunden: im geprüften Vollfeed sind bei 2.964/2.964 Produkten die Lieferkosten unbekannt und bei 2.964/2.964 Produkten der Lagerstatus unbekannt. `shippingCost` und `inStock` bleiben daher `null`, Availability bleibt `UNKNOWN`.
- Reproduzierbarer normalisierter Development-Bestand nach diesen Evidence-Regeln: 2.964 Produkte; SHA-256 des entpackten JSON: `1525723cff8652b1822d522a9fe7b7443d0dbf77ca4ba28300b860da642fb9e8`.
- Ohne belastbaren Referenz-/Vergleichspreis werden keine Rabatte konstruiert. Der Homepage-Fallback wird deterministisch über Kategorien diversifiziert.
- Normaler Development-Preview-Build bleibt beim production-approved Katalog. Amazgifts kann nur explizit über `FUNDBLICK_AMAZGIFTS_FEED` oder `FUNDBLICK_AMAZGIFTS_ARTIFACT` zugeschaltet werden.
- Amazgifts bleibt aus `production-catalog-sources.json` und `production-merchant-approvals.json` ausgeschlossen, bis eine ausdrückliche Production-Freigabe erfolgt.
- Vor Production-Aktivierung muss die Awin/Amazgifts-Vertragsformulierung zur Nutzung automatisierter Systeme bzw. Deeplinks schriftlich geklärt werden.


- Development-Preview und Production-Freigabe bleiben getrennte Schritte.
- Gepinnte Händler-Snapshots werden vor dem Parsen bytegenau per SHA-256 geprüft. Ein neuer Awin-Feed ist deshalb zunächst ein neuer, ungeprüfter Snapshot und darf den bisherigen Digest nicht automatisch ersetzen; erst Datenqualitätsprüfung, Normalisierung und Freigabe erzeugen einen neuen erwarteten Digest.
