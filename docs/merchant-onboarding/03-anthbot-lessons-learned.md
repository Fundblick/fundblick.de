# Händler-Onboarding Nr. 3 – ANTHBOT (Lessons Learned)

Stand: 28.09.2026  
Branch: `development`  
Status: technische Vorbereitung und Gates; keine automatische Live-Freigabe durch dieses Dokument.

## Zweck

ANTHBOT ist der dritte Händler und zugleich der Referenzfall für die Standardisierung künftiger Händler-Onboardings. Ziel ist nicht nur, diesen Händler zu integrieren, sondern jede gefundene Fehlerklasse dauerhaft in wiederverwendbare Regeln, Tests und CI-Gates zu überführen.

Grundsatz: **Ein einmal verstandenes Onboarding-Problem soll bei Händler Nr. 4+ möglichst automatisch erkannt werden, bevor Produkte veröffentlicht werden.**

## Händler- und Feed-Vertrag

- Händler: ANTHBOT DE
- Affiliate-Netzwerk: Awin
- Advertiser-ID: `125144`
- Feed-Eingang: `125144-retail-de_DE.csv` bzw. `.csv.gz`
- Der Originalfeed wird nicht als öffentlicher Repository-Inhalt benötigt.
- Erwarteter aktueller Feedvertrag: 161 Advertiser-Zeilen, daraus 56 freigegebene Warenpositionen, davon 36 als lieferbar erkannt.
- Zulässige FundBlick-Kategorien:
  - `home.garden.robot-mowers`
  - `home.garden.robot-mower-accessories`

Diese Zahlen sind bewusst als Drift-Gate hinterlegt. Ändert der Händler die Feedstruktur oder das Sortiment erheblich, soll der Build stoppen und eine Prüfung erzwingen, statt unbemerkt falsche Daten zu veröffentlichen.

## Programmregeln – dokumentierter Stand

Die vorliegenden ANTHBOT-DE-Programmbedingungen sind mit „Last updated at: 13 Mar 2026“ gekennzeichnet. Für das Onboarding relevante Punkte:

- mindestens 10 % Provision auf gültige Verkäufe laut Zusatzbedingungen,
- 30 Tage Cookie-Dauer laut Zusatzbedingungen,
- keine Produkt-/Produktkategorien pauschal von der Provisionsberechnung ausgeschlossen,
- Content-Websites, Blogs, Produktreviews, Coupon-/Discount-Seiten und Preisvergleich/CSS werden ausdrücklich als mögliche Promotion-Typen genannt,
- direkte Verlinkung und Comparison Engine sind in den erlaubten Partnertypen aufgeführt,
- Brand-PPC ist eingeschränkt: ANTHBOT-Markenbegriffe und Varianten dürfen nicht einfach als normale bezahlte Suchbegriffe behandelt werden,
- nicht erlaubte Gutscheincodes können zur Ablehnung einer Provision führen,
- ANTHBOT verlangt faire und korrekte Darstellung; bevorzugt sollen freigegebene Marken-/Marketingmaterialien verwendet werden,
- Bedingungen, Provisionen und Promotions können vom Händler geändert werden.

Konsequenz für FundBlick: Programmbedingungen sind **versionierte Händlerdaten** und müssen vor einer späteren Änderung des Traffic-/Werbemodells erneut geprüft werden. Insbesondere darf ein Gutschein nicht allein deshalb veröffentlicht werden, weil ein Code technisch bekannt ist; seine Nutzung muss für das Partnerprogramm zulässig sein.

## Erkenntnis 1 – Feed niemals blind importieren

### Beobachtung
Der Händlerfeed enthält nicht ausschließlich normale verkäufliche Hauptprodukte. Nicht jede Feedzeile darf automatisch als FundBlick-Produkt interpretiert werden.

### Konsequenz
Vor dem Katalogbau erfolgt eine Händler-spezifische Selektion und Normalisierung. Gebühren, Services, Shipping Protection, Geschenkkarten oder vergleichbare Nicht-Warenpositionen dürfen nicht versehentlich als reguläre Suchprodukte erscheinen.

### Dauerhafte Verbesserung
Der Normalizer besitzt eine eigene Validierung. Der generische Feed-Builder akzeptiert nur normalisierte Produkte, die die Provenienz- und Kategorieverträge erfüllen.

## Erkenntnis 2 – Provenienz muss maschinenprüfbar sein

### Risiko
Ein Feed des falschen Awin-Advertisers könnte technisch ähnlich aussehen und versehentlich dem falschen Händler zugeordnet werden.

### Verbesserung
Die Merchant Registry bindet ANTHBOT fest an:

- Netzwerk `awin`
- Advertiser-ID `125144`
- erwartetes Dateinamensmuster
- ANTHBOT-Normalizer
- erlaubte Katalogkategorien

Ein Feed eines anderen Advertisers, z. B. `120341-retail-de_DE.csv.gz`, muss vom Registry-Gate abgewiesen werden.

## Erkenntnis 3 – Händlerkategorien reichen nicht als gesamte Taxonomie

### Beobachtung
Vor ANTHBOT kannte die zentrale FundBlick-Taxonomie noch keine eigenständige Mähroboter-Familie.

### Verbesserung
Neue kanonische Familie:

- `robot-mowers`
- Typ `Mähroboter`
- Typ `Mähroboter-Zubehör`

Damit wird ANTHBOT nicht als Sonderfall außerhalb der zentralen Produktlogik geführt.

## Erkenntnis 4 – Kanonische Kategorie hat Vorrang vor unsicherem Text-Raten

### Fehlerklasse
Titel, Beschreibung und Produktattribute können Begriffe enthalten, die mehrere Familien treffen. Ein bereits sauber normalisiertes Produkt darf dadurch nicht wieder in eine falsche Familie geraten.

### Verbesserung
Für die kanonischen Kategorien `home.garden.robot-mowers` und `home.garden.robot-mower-accessories` wird die bekannte Familie `robot-mowers` priorisiert.

## Erkenntnis 5 – Produkttypen müssen exklusiv sein

### Gefundener Fehler
Ein Zubehörprodukt wie „Garage Zubehör für Genie“ enthält sowohl ein Zubehörsignal als auch den Modellnamen eines Mähroboters. Die erste Klassifizierungsfassung konnte deshalb gleichzeitig `Mähroboter-Zubehör` und `Mähroboter` liefern.

### Verbesserung
Für die Familie `robot-mowers` gilt eine exklusive Reihenfolge:

1. Zubehörsignale prüfen.
2. Bei Treffer ausschließlich `Mähroboter-Zubehör` zurückgeben.
3. Erst danach auf den Haupttyp `Mähroboter` prüfen.

Diese Regel verhindert Mehrfachtypen bei Zubehör, das im Titel einen kompatiblen Roboternamen trägt.

## Erkenntnis 6 – Feed-Schreibweisen sind nicht zuverlässig formatiert

### Gefundener Fehler
Eine Flächenangabe wie `1500m²` ohne Leerzeichen wurde zunächst nicht erkannt, obwohl `1500 m²` verarbeitet werden konnte.

### Verbesserung
Der Normalizer muss reale Schreibvarianten tolerieren, ohne die Semantik aufzuweichen. Das Flächen-Parsing akzeptiert deshalb relevante Varianten wie `m²`/`m2` mit oder ohne Leerzeichen.

### Allgemeine Regel
Parser werden gegen echte Feedvarianten getestet; Tests werden nicht abgeschwächt, nur damit ein Händlerfeed „grün“ wird.

## Erkenntnis 7 – Suchfacetten gehören zum Onboarding, nicht in eine spätere Nacharbeit

ANTHBOT hat gezeigt, dass neue Produkttypen unmittelbar neue Suchmerkmale benötigen. Für Mähroboter müssen technische Merkmale wie Flächenleistung und relevante Konnektivitäts-/Modellinformationen bereits beim Onboarding strukturiert erhalten bleiben.

Die Feedprüfung und die Suchfacettenprüfung sind deshalb getrennte Gates: Ein formal gültiger Feed ist noch kein ausreichend gut durchsuchbarer FundBlick-Katalog.

## Erkenntnis 8 – Merchant-Onboarding-Audit und Taxonomie müssen synchron erweitert werden

### Gefundene Lücke
Nach Einführung der Mähroboter-Taxonomie kannte der allgemeine Merchant-Onboarding-Audit die neuen Kategorien zunächst noch nicht.

### Verbesserung
Beide Mähroboter-Kategorien werden im zentralen Audit auf `robot-mowers` gemappt. Neue Familien gelten künftig erst dann als vollständig integriert, wenn mindestens folgende Schichten zusammenpassen:

1. Feed-Normalisierung
2. kanonische Kategorien
3. Taxonomie-Registry
4. Facet-/Produkttyp-Klassifizierung
5. Merchant-Onboarding-Audit
6. Suche/Facetten
7. CI-Gates

## Erkenntnis 9 – Sondercode pro Händler skaliert nicht

### Ausgangslage
Der erste ANTHBOT-Katalogbau war Händler-spezifisch verdrahtet.

### Verbesserung
Einführung einer generischen Pipeline:

- `merchant-feed-registry.js`
- `build-merchant-feed-catalog.js`
- Händler-spezifischer Normalizer
- Händler-spezifische Vertragswerte

`build-anthbot-development-catalog.js` ist nur noch ein dünner Einstieg in die allgemeine Pipeline.

### Ziel für Händler Nr. 4+
Ein neuer Händler soll überwiegend aus Konfiguration + Normalizer + Datenqualitätsregeln bestehen. Gemeinsame Katalog-, Provenienz- und CI-Logik darf nicht erneut kopiert werden.

## Erkenntnis 10 – CI muss neue Fehlerklassen dauerhaft behalten

Im Verlauf des ANTHBOT-Onboardings wurden zusätzliche Gates eingeführt bzw. erweitert:

- ANTHBOT Feed Gate
- ANTHBOT Search Facet Gate
- ANTHBOT Catalog Integration Gate
- Robot Mower Classifier Gate
- Merchant Feed Registry Gate
- allgemeines Development V2 Integrity Gate

Wichtig: Ein Gate, das einen echten Fehler gefunden hat, bleibt Teil des Systems. Es wird nicht nach erfolgreicher Fehlerbehebung wieder entfernt.

## Erkenntnis 11 – Fehlerbehebung: Ursache statt Test abschwächen

Während des Onboardings haben neue Gates mehrere reale Probleme sichtbar gemacht, unter anderem:

- nicht erkannte `1500m²`-Schreibweise,
- fehlende Mähroboter-Familie in der zentralen Taxonomie,
- fehlendes Mapping im Merchant-Onboarding-Audit,
- Syntaxfehler beim Erweitern des Klassifizierers,
- konkurrierende Hauptprodukt-/Zubehör-Treffer.

Arbeitsregel: Bei rotem CI zuerst Ursache und Datenvertrag prüfen. Assertions oder erwartete Werte werden nur geändert, wenn der zugrunde liegende Geschäfts-/Datenvertrag nachweislich geändert wurde.

## Erkenntnis 12 – Development-Freigabe ist keine Production-Freigabe

### Festgestellter Produktionsstand
Der aktuelle Produktionskatalog wird aus einer expliziten Quellenliste gebaut. ANTHBOT ist in dieser Liste noch nicht enthalten. Damit kann ein grünes ANTHBOT-Development-Gate allein keine ANTHBOT-Produkte live schalten.

### Dauerhafte Verbesserung
Für neue Händler werden künftig zwei getrennte Freigaben dokumentiert:

1. **Integration ready:** Normalizer, Taxonomie, Suche, Provenienz und Development-Gates sind grün.
2. **Production approved:** realer End-to-End-Feed-Build wurde geprüft und die konkrete, geprüfte Produktquelle wurde ausdrücklich in den Produktionskatalog aufgenommen.

Die zweite Stufe darf nicht automatisch aus der ersten folgen. Das verhindert, dass ein technisch vorbereiteter Händler versehentlich veröffentlicht wird.

## Erkenntnis 13 – Fehlender Originalfeed ist ein harter Nachweis-Stopp

Am 28.09.2026 wurde zusätzlich in den verfügbaren Gesprächs-/Library-Dateien nach dem ANTHBOT-Originalfeed `125144-retail-de_DE.csv(.gz)` gesucht. Verfügbar waren die ANTHBOT-DE-Programmbedingungen, aber kein eindeutig auffindbarer Originalfeed unter diesem Namen.

Konsequenz: Der echte generische Feed→Katalog-End-to-End-Lauf wird **nicht simuliert und nicht behauptet**. Ohne den tatsächlichen Feed bleibt dieser Produktionsnachweis offen. Ein Testfixture oder aus früheren Ergebnissen rekonstruierter Datensatz ist kein Ersatz für diesen Freigabenachweis.

## Gutschein- und Sprach-Lesson

Im dritten Händler-Onboarding wurde zusätzlich deutlich, dass Händlerangebote/Gutscheine Bestandteil der professionellen Produktdarstellung sein können und nicht als improvisierter Zusatz behandelt werden dürfen.

Für bereits unterstützte Oberflächensprachen gilt: Neue UI-Komponenten dürfen nicht nur auf Deutsch ergänzt werden. Die Gutschein-Darstellung muss insbesondere im bestehenden DE/RU-Kontext konsistent bleiben. Layoutänderungen dürfen die Produktkarten nicht unkontrolliert vergrößern; Code-/Copy-Flächen müssen auch visuell auf dem Kartenhintergrund lesbar bleiben.

Diese UI-Erkenntnis ist von der Feed-Pipeline getrennt, gehört aber zum vollständigen Händler-Onboarding.

## Standardablauf für Händler Nr. 4+

1. Händler/Domain/Impressum/Seriosität vor technischer Aufnahme prüfen.
2. Affiliate-Netzwerk, Advertiser-ID und erlaubte Traffic-/Linkregeln dokumentieren.
3. Originalfeed zunächst nur analysieren; keine automatische Veröffentlichung.
4. Nicht-Warenpositionen und problematische Datensätze identifizieren.
5. Händler-Normalizer bauen.
6. Provenienz und Feedvertrag definieren.
7. Produkte auf kanonische FundBlick-Kategorien mappen.
8. Fehlende Taxonomie-Familien/Produkttypen zuerst zentral ergänzen.
9. Suchfacetten aus der Produktdomäne ableiten und testen.
10. Merchant Registry ergänzen.
11. Merchant-Onboarding-Audit erweitern, falls eine neue Familie entsteht.
12. Generischen Feed-Katalogbuilder verwenden; keine unnötige Händler-Sonderpipeline.
13. Feed-, Klassifizierungs-, Such- und Integrations-Gates grün bekommen.
14. DE/RU bzw. alle bereits unterstützten UI-Sprachen bei neuen Händlerkomponenten prüfen.
15. Affiliate-Links, `target`, `rel`, `sponsored`, Gutscheinlogik und Fallbacks prüfen.
16. Status `integration ready` dokumentieren.
17. Echten Feed end-to-end bauen und resultierenden Katalog prüfen.
18. Erst danach konkrete Quelle ausdrücklich für Production zulassen (`production approved`).
19. Neue Fehlerklasse sofort in diese Lessons Learned und – wenn automatisierbar – in ein dauerhaftes Gate übernehmen.

## Aktueller technischer Nachweis

Am 28.09.2026 ist Development V2 Integrity Run #229 für Commit `abdb5ed18fe236ead725bb6dede515cce4824eb7` erfolgreich abgeschlossen. Dieser Stand enthält das Merchant-Feed-Registry-Gate.

## Offene Punkte vor endgültiger Händlerfreigabe

- Tatsächlichen ANTHBOT-Originalfeed `125144-retail-de_DE.csv(.gz)` für den kontrollierten Build bereitstellen bzw. eindeutig wiederfinden.
- Generische Feed-Pipeline mit diesem Originalfeed end-to-end ausführen.
- Resultierenden Katalog erneut auf Produktzahl, Provenienz, Affiliate-Ziele und Suchbarkeit prüfen.
- UI-/Sprachprüfung der final eingebundenen ANTHBOT-Produkte und Angebote durchführen.
- Programmbedingungen/Gutscheingültigkeit unmittelbar vor Production-Freigabe nochmals prüfen.
- Erst danach den kontrollierten Promotion-/Live-Pfad verwenden.

## Pflegepflicht

Dieses Dokument ist fortlaufend. Jede neue ANTHBOT-Erkenntnis wird ergänzt. Wenn eine Erkenntnis technisch prüfbar ist, soll zusätzlich ein automatisierter Test oder ein CI-Gate entstehen. Dokumentation allein ersetzt keine technische Absicherung.
