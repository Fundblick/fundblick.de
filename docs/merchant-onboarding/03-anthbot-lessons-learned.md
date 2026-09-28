# Händler-Onboarding Nr. 3 – ANTHBOT (Lessons Learned)

Stand: 28.09.2026  
Status: **Production approved und erfolgreich live veröffentlicht**  
Live-Merge: PR #31, Merge-Commit `b895c1a20945860c7c50571bfb421d1107736494`

## Zweck

ANTHBOT ist der dritte Händler und der Referenzfall für die Standardisierung künftiger Händler-Onboardings. Ziel war nicht nur, diesen Händler zu integrieren, sondern jede gefundene Fehlerklasse dauerhaft in wiederverwendbare Regeln, Tests und CI-Gates zu überführen.

Grundsatz: **Ein einmal verstandenes Onboarding-Problem soll bei Händler Nr. 4+ möglichst automatisch erkannt werden, bevor Produkte veröffentlicht werden.**

## Finaler Produktionsstand

- Händler: ANTHBOT DE
- Affiliate-Netzwerk: Awin
- Advertiser-ID: `125144`
- 56 ANTHBOT-Produkte im Produktionskatalog
- 33 Produkte in `home.garden.robot-mowers`
- 23 Produkte in `home.garden.robot-mower-accessories`
- Gesamtbestand FundBlick nach Release: 1.515 Produktionsprodukte
- 9 produktive Homepage-Kategorien
- Production-Publish nach Merge erfolgreich
- Nutzerseitige Live-Sichtprüfung: System, Kategorien, Kartengrößen und Darstellung ohne erkennbare Abweichung; Größen identisch zum bisherigen Layout.

## Programmregeln – dokumentierter Stand

Die vorliegenden ANTHBOT-DE-Programmbedingungen waren mit „Last updated at: 13 Mar 2026“ gekennzeichnet. Für das Onboarding relevant:

- mindestens 10 % Provision auf gültige Verkäufe laut Zusatzbedingungen,
- 30 Tage Cookie-Dauer laut Zusatzbedingungen,
- keine Produkt-/Produktkategorien pauschal von der Provisionsberechnung ausgeschlossen,
- Content-Websites, Blogs, Produktreviews, Coupon-/Discount-Seiten und Preisvergleich/CSS als mögliche Promotion-Typen,
- direkte Verlinkung und Comparison Engine in den erlaubten Partnertypen,
- Brand-PPC eingeschränkt,
- nicht erlaubte Gutscheincodes können zur Ablehnung einer Provision führen,
- faire und korrekte Darstellung; bevorzugt freigegebene Marken-/Marketingmaterialien,
- Bedingungen, Provisionen und Promotions können geändert werden.

Konsequenz: Programmbedingungen sind versionierte Händlerdaten. Gutscheine dürfen nicht allein deshalb veröffentlicht werden, weil ein Code technisch bekannt ist; seine Affiliate-Nutzung muss zulässig sein.

## Lessons Learned

### 1. Feed niemals blind importieren
Händlerfeeds enthalten nicht zwingend ausschließlich verkäufliche Hauptprodukte. Gebühren, Services, Shipping Protection, Geschenkkarten oder vergleichbare Nicht-Warenpositionen müssen vor dem Katalogbau selektiert werden. Der Händler-Normalizer ist die erste fachliche Qualitätsgrenze.

### 2. Provenienz maschinenprüfbar machen
Die Merchant Registry bindet Händler an Netzwerk, Advertiser-ID, Dateimuster, Normalizer und erlaubte Kategorien. Ein technisch ähnlicher Feed eines anderen Advertisers muss abgewiesen werden.

### 3. Neue Händler dürfen die zentrale Taxonomie erweitern – nicht umgehen
Für ANTHBOT wurde die kanonische Familie `robot-mowers` mit den Typen `Mähroboter` und `Mähroboter-Zubehör` eingeführt. Händler-Sonderkategorien außerhalb der zentralen Logik sind zu vermeiden.

### 4. Kanonische Kategorie vor unsicherem Text-Raten
Wenn ein Produkt bereits sauber normalisiert ist, darf unsicheres Titel-/Beschreibungsmatching die bekannte Produktfamilie nicht wieder überschreiben.

### 5. Produkttypen exklusiv klassifizieren
Bei Robotermähern muss Zubehör vor Hauptprodukt geprüft werden. Ein Zubehörartikel mit Modellnamen darf nicht gleichzeitig als Mähroboter klassifiziert werden.

### 6. Parser gegen reale Feed-Schreibweisen bauen
`1500m²` und `1500 m²` sind semantisch gleich. Parser müssen reale Formatvarianten tolerieren. Tests werden nicht abgeschwächt, um einen Feed künstlich grün zu bekommen.

### 7. Suchfacetten sind Bestandteil des Händler-Onboardings
Ein formal gültiger Feed ist noch kein guter FundBlick-Katalog. Neue Produktdomänen benötigen passende strukturierte Merkmale und eigene Facet-/Suchprüfungen.

### 8. Alle Integrationsschichten synchron erweitern
Bei einer neuen Produktfamilie müssen mindestens zusammenpassen:
1. Feed-Normalisierung
2. kanonische Kategorien
3. Taxonomie-Registry
4. Facet-/Produkttyp-Klassifizierung
5. Merchant-Onboarding-Audit
6. Suche/Facetten
7. CI-Gates
8. Homepage-/UI-Kategorien und Übersetzungen

### 9. Sondercode pro Händler skaliert nicht
Wiederverwendbarer Unterbau:
- `merchant-feed-registry.js`
- `build-merchant-feed-catalog.js`
- Händler-spezifischer Normalizer
- Händler-spezifische Vertragswerte

Händler Nr. 4+ soll überwiegend Konfiguration + Normalizer + Datenqualitätsregeln benötigen. Gemeinsame Logik wird nicht kopiert.

### 10. Ein echtes Fehler-Gate bleibt dauerhaft
Während ANTHBOT wurden Feed-, Search-Facet-, Catalog-Integration-, Robot-Mower-Classifier-, Merchant-Registry- und allgemeine Integrity-Prüfungen erweitert. Ein Gate, das eine echte Fehlerklasse gefunden hat, wird nach der Reparatur nicht entfernt.

### 11. Ursache reparieren, nicht Tests weichmachen
Gefundene reale Fehlerklassen waren u. a.:
- `1500m²` zunächst nicht erkannt,
- Mähroboter-Familie fehlte zentral,
- Mapping im Merchant-Onboarding-Audit fehlte,
- konkurrierende Hauptprodukt-/Zubehör-Treffer,
- veraltete feste Händler-/Kategorie-/Produktanzahlen in bestehenden Tests,
- UI-Touch-Höhe unter dem vereinbarten Mindestmaß.

Assertions werden nur geändert, wenn sich der zugrunde liegende Geschäfts-/Datenvertrag nachweislich geändert hat.

### 12. Integration ready ist nicht Production approved
Zweistufige Freigabe:
1. **Integration ready:** Normalizer, Taxonomie, Suche, Provenienz und Development-Gates grün.
2. **Production approved:** konkrete Produktionsquelle eingebunden, realer Production-Build geprüft, Production-Gates grün und kontrollierter Merge nach `main`.

ANTHBOT hat beide Stufen erfolgreich durchlaufen.

### 13. Komprimierte Produktionsquellen brauchen einen gemeinsamen Reader
ANTHBOT wurde als komprimierte Produktionsquelle geführt. Ältere Search-/SEO-/Ranking-Audits versuchten diese Quelle direkt mit `JSON.parse()` zu lesen und scheiterten am gzip/Base64-Inhalt (`H4sI...`).

Dauerhafte Verbesserung: `production-source-reader.js` ist die gemeinsame Quellenleselogik und unterstützt JSON sowie `.b64`, `.gz` und `.gz.b64`. Neue Audits dürfen Produktionsquellen nicht wieder individuell parsen.

### 14. Produktanzahlen sind Verträge – Händlerwachstum muss bewusst eingepflegt werden
Der Production-Category-Test erwartete zunächst noch 1.459 Produkte. Nach ANTHBOT sind es korrekt 1.515. Statt nur die Gesamtsumme zu erhöhen, wurden Händler- und Kategorienverträge getrennt geprüft:
- Casa Moro: 1.428
- AHIPOS: 31
- ANTHBOT: 56
- Gesamt: 1.515

So kann eine zufällig richtige Gesamtsumme keine falsche Händlerverteilung verdecken.

### 15. Neue Händler verändern bestehende UI-/E2E-Verträge
Mehrere Tests waren noch auf zwei Händler bzw. sieben Homepage-Kategorien fest verdrahtet. Nach ANTHBOT sind drei Händler und neun Kategorien korrekt. Solche Erwartungen müssen bewusst als Teil des Händlervertrags aktualisiert werden.

### 16. Mehrsprachigkeit gehört zur Definition of Done
Neue Kategorien wurden in allen bereits vorhandenen 12 Oberflächensprachen ergänzt. Besonders DE/RU wurde im E2E-Pfad geprüft. Technische Kategorie-IDs dürfen dem Nutzer nicht als Fallback erscheinen, wenn eine unterstützte UI-Sprache aktiv ist.

### 17. Mobile Kartengröße darf durch neue Händlerfunktionen nicht wachsen
Die Gutschein-/Code-Darstellung wurde so angepasst, dass die bestehende Produktkartengröße erhalten bleibt. Gleichzeitig muss der Copy-Bereich auf dem Kartenhintergrund lesbar sein. Der mobile Copy-Button wurde auf mindestens 44 px Touch-Höhe abgesichert, ohne das Desktop-Layout unnötig zu verändern.

### 18. Affiliate-/Gutscheinlogik ist Teil des Release-Gates
Neue Händler müssen nicht nur Produkte liefern. Zu prüfen sind auch CTA, Affiliate-Fallbacks, `target`, `rel`, `sponsored`, Gutscheingültigkeit und Copy-Verhalten. Ein Händler gilt erst als vollständig integriert, wenn auch diese Oberfläche sicher ist.

### 19. Homepage-Kategorien müssen aus dem Produktionsmanifest folgen
Die Startseite folgt dem produktiven Kategorienmanifest. Nach ANTHBOT sind neun Live-Kategorien korrekt. E2E prüft die beiden neuen Kategorien einschließlich Produktzahlen und Übersetzungen.

### 20. Release erst nach kompletter Gate-Runde
Vor PR #31 nach `main` waren die relevanten Gates grün:
- Development V2 Integrity
- Production Merchant Catalog Gate
- Google Indexability Safety
- Facet Orchestration Safety
- Result Card Safety
- Search Relevance Audit
- Daily Offer Safety
- SEO Landing Candidate Audit

Erst danach wurde `development` nach `main` gemerged. Der anschließende Workflow `Publish FundBlick production` #202 lief erfolgreich durch.

## Verbindlicher Standardablauf für Händler Nr. 4+

1. Händler/Domain/Impressum/Seriosität prüfen.
2. Affiliate-Netzwerk, Advertiser-ID und Programmbedingungen dokumentieren.
3. Originalfeed analysieren; noch keine Veröffentlichung.
4. Nicht-Warenpositionen/problematische Datensätze identifizieren.
5. Händler-Normalizer erstellen.
6. Provenienz- und Feedvertrag definieren.
7. Kanonische Kategorien zuweisen.
8. Fehlende Taxonomie-Familien zentral ergänzen.
9. Produkttypen und Suchfacetten definieren und testen.
10. Merchant Registry ergänzen.
11. Merchant-Onboarding-Audit erweitern.
12. Generischen Feed-Katalogbuilder verwenden.
13. Produktionsquellen ausschließlich über die gemeinsame Reader-Logik konsumieren.
14. Feed-, Klassifizierungs-, Such-, Facet- und Integrations-Gates grün bekommen.
15. Händler-/Produkt-/Kategorie-Erwartungen in bestehenden E2E-Verträgen prüfen.
16. Alle unterstützten UI-Sprachen für neue sichtbare Kategorien/Komponenten ergänzen.
17. Mobile Produktkartengröße, Touch-Ziele und Lesbarkeit kontrollieren.
18. Affiliate-Links, CTA, `target`, `rel`, `sponsored`, Gutscheine und Fallbacks prüfen.
19. Status `integration ready` dokumentieren.
20. Echten Production-Build mit konkreter Quelle durchführen.
21. Händlerzahlen, Kategorienzahlen, Gesamtbestand und Provenienz separat prüfen.
22. Production-/Indexability-/UI-/Search-Gates vollständig grün bekommen.
23. Erst dann kontrollierter PR von `development` nach `main`.
24. Production-Publish prüfen.
25. Live-Sichtprüfung auf Desktop und Mobil durchführen.
26. Neue Erkenntnisse ergänzen und automatisierbare Fehlerklassen als dauerhaftes Gate absichern.

## Referenzwerte nach Händler Nr. 3

Diese Werte beschreiben den Release-Stand vom 28.09.2026 und sind keine ewigen Konstanten. Bei Händler Nr. 4+ müssen Änderungen bewusst und nachvollziehbar erfolgen.

| Kennzahl | Stand nach ANTHBOT |
|---|---:|
| Händler | 3 |
| Produktionsprodukte | 1.515 |
| Casa Moro | 1.428 |
| AHIPOS | 31 |
| ANTHBOT | 56 |
| ANTHBOT Mähroboter | 33 |
| ANTHBOT Zubehör | 23 |
| Homepage-Kategorien | 9 |

## Release-Nachweis

- final geprüfter Development-Stand: `7c5b08166640620502fe1247d880c38dda6ef184`
- PR #31: `development` → `main`
- Merge-Commit: `b895c1a20945860c7c50571bfb421d1107736494`
- Production-Publish Workflow #202: erfolgreich
- Live-Sichtprüfung durch Nutzer: erfolgreich; Kategorien vorhanden, Darstellung sauber, Produktkartengröße identisch.

## Pflegepflicht

Dieses Dokument ist fortlaufend. Jede neue Händler-Erkenntnis wird hier bzw. im Dokument des jeweiligen Händlers ergänzt. **Neue Fehlerklasse = dokumentieren + soweit sinnvoll technisch als Test/Gate absichern.**