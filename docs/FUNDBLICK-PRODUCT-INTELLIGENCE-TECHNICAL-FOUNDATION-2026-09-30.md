# FundBlick Product Intelligence & Dynamic Faceting — Technische Grundlage

**Stand:** 30.09.2026  
**Status:** verbindliche Arbeits- und Wiederanlaufgrundlage für `development`  
**Produktionsregel:** `main`/Live bleibt unangetastet, bis Implementierung, Tests und Gates ausdrücklich freigegeben sind.

## 1. Warum dieses Dokument existiert

Dieses Dokument konserviert Zielbild, Rechercheergebnisse, Architekturentscheidungen, Risiken und Umsetzungsreihenfolge, damit die Entwicklung nach Chat-/Tool-Unterbrechungen ohne Wissensverlust fortgesetzt werden kann. Vor weiteren Arbeiten am Product-Intelligence-/Faceting-System ist dieses Dokument als Ausgangspunkt zu lesen.

## 2. Ausgangslage

FundBlick ist jung und der eigene/monetarisierbare Produktbestand ist noch klein (zuletzt ca. 1.500 Produkte). Deshalb ergänzt `development` die eigene Produktsuche um eine externe Websuche. Grundregel:

1. Eigene/Affiliate-Produkte haben Priorität.
2. Externe Websuche verhindert Nulltreffer und erhöht Nutzwert, auch wenn externe Treffer zunächst nicht monetarisiert werden.
3. Externe Ergebnisse bleiben von FundBlick-Produkten klar getrennt.
4. Websuche soll nicht unnötig Traffic erzeugen.
5. `Angebote` ist streng: konkrete Produktangebote statt News/Ratgeber/Announcements/Kategorie- oder Suchseiten.
6. Videos/Erklärungen/Local Search sind eigene Intents und dürfen andere Quellen verwenden.

Bereits implementierte Websuche-Gates in `development` verlangen für `Angebote` Produktcharakter, Bild, belastbaren Preis und gültige Produkt-URL; redaktionelle/listingartige Quellen werden zunehmend ausgeschlossen. CI enthält inzwischen eigene External-Search-/Offer-Quality-Tests.

## 3. Produktvision

FundBlick soll nicht nur Webtreffer anzeigen, sondern vor der Suche verstehen, **welche Produktart gemeint ist und welche Eigenschaften für diese Produktart kaufrelevant sind**.

Zielpipeline:

`Query -> Normalisierung -> Sprache/Marke/Modell/Einheiten -> Kategorieklassifikation -> erwartete Facetten -> Suche -> erste Produktkandidaten -> strukturierte Daten/Text extrahieren -> Attribute normalisieren -> Confidence -> dynamische Facetten -> Varianten/Dubletten -> Ranking/Sortierung -> UI`

Beispiele:

- `10W40` -> Motoröl -> Viskosität, Gebindegröße, Marke, Spezifikation/Freigabe, Preis, Preis/Liter.
- `Adidas Schuhe` -> Schuhe + Adidas -> Größe, Zielgruppe, Farbe, Modell/Schuhart, Preis.
- `Samsung 65 Zoll Fernseher` -> Fernseher + Samsung + 65 Zoll -> Displaytechnik, Auflösung, Modell, Preis.

## 4. Zentrale Architekturentscheidung: keine hunderten Sonderlösungen

Nicht 500 handgeschriebene unabhängige Produktklassen bauen. Stattdessen eine hierarchische Taxonomie mit Vererbung und FundBlick-Overrides.

### Primäre Taxonomie-Basis: Shopify Standard Product Taxonomy

Recherche bestätigt:

- Open Source / MIT-Lizenz.
- Kategorien, Attribute und Attributwerte.
- 25+ Verticals.
- Lokalisierungen.
- Mappings zu anderen Taxonomien.
- stabile, versionierte Release-Assets in JSON/TXT.
- Releases werden regelmäßig gepflegt; 2026-05 enthielt laut Release Notes >2.000 neue Kategorien und >4.000 neue Attribute.
- WICHTIG: Shopifys committed `dist/` wird laut README am **31.10.2026** entfernt. Integration deshalb über **versionierte Release-Assets**, nicht über `dist/` auf `main`.

FundBlick soll eine kompakte, gepinnte Snapshot-Version importieren und intern normalisieren. Keine Runtime-Abhängigkeit von Shopify/GitHub für jede Nutzersuche.

### Ergänzende Referenzen

- eBay Taxonomy/Aspects: Inspiration/Gewichtung für kategoriespezifische kaufrelevante Attribute.
- GS1 GPC: neutrale Klassifikations-/Mappingreferenz.
- Schema.org Product/Offer: bevorzugte strukturierte Quelle auf Produktseiten.

## 5. FundBlick-interne Datenstruktur

Zielmodell pro Kategorie (schematisch):

```json
{
  "id": "automotive.motor_oil",
  "parent": "automotive.fluids",
  "labels": {"de":"Motoröl","en":"Engine oil","ru":"Моторное масло"},
  "synonyms": {"de":["Motoröl","10W40","5W30"]},
  "expectedFacets": ["brand","viscosity","volume","approval","specification","price","unitPrice"],
  "units": {"volume":"l"},
  "sourceMappings": {"shopify":"..."}
}
```

Eigenschaften sollen vererbt werden. Allgemeine Attribute (Preis/Marke) können von Oberklassen kommen, Spezialattribute von Leaf-Kategorien.

## 6. Query Understanding ohne laufende KI-Kosten

Primär lokal/regelbasiert:

- Unicode-/Whitespace-/Schreibweisen-Normalisierung.
- Sprache erkennen bzw. UI-Sprache berücksichtigen.
- Synonyme.
- Markenlexikon.
- Modell-/MPN-/GTIN-Muster.
- Einheiten und dimensionsabhängige Regex.
- kategoriespezifische Parser.
- Taxonomie-Matching + Score.

Beispiele der Normalisierung:

- `10w40`, `10W-40`, `SAE 10W40` -> Viskosität `10W-40`.
- `5 Liter`, `5L`, `5 L`, `5ltr` -> `volume=5 l`.
- `EU 39`, `Gr. 39`, `Größe 39` -> Schuhgröße 39 **nur im passenden Kategorie-Kontext**.

KI ist optionaler späterer Fallback für unbekannte/mehrdeutige Queries, nicht Voraussetzung für normale Suchen.

## 7. Confidence Engine

Mindestens drei Stufen:

- `HIGH`: Händlerfeed, valide strukturierte Product/Offer-Daten, GTIN/EAN/MPN, eindeutiger Titel/Einheit.
- `MEDIUM`: Beschreibung, robuste Textmuster, wiederkehrende Evidenz über mehrere Treffer.
- `LOW`: mehrdeutige/heuristische Ableitung.

Grundsatz: **Unsicherheit -> weniger Facetten, nicht mehr Raten.** LOW darf intern gespeichert werden, aber soll standardmäßig keine sichtbare Facette erzeugen.

## 8. Quellenpriorität für Produktattribute

1. Händler-/Affiliate-Feed.
2. strukturierte Product/Offer-Daten (Schema.org/JSON-LD etc.).
3. bekannte Taxonomie-/Mappingdaten.
4. Produkttitel.
5. Produktbeschreibung.
6. heuristische Ableitung.

Konflikte müssen zugunsten höherwertiger Quellen bzw. höherer Confidence aufgelöst werden.

## 9. Dynamic Faceting

Taxonomie bestimmt, **welche Facetten theoretisch sinnvoll sind**. Die tatsächlichen ersten Ergebnisse bestimmen, **welche davon ausreichend belegt und sichtbar werden**.

Beispiel Motoröl, erste 20 brauchbare Treffer:

- Marke 20/20
- Viskosität 19/20
- Gebinde 18/20
- Freigabe 9/20
- Spezifikation 7/20

UI könnte zunächst Marke, Viskosität, Gebinde, Preis zeigen; Rest unter `Weitere Filter` oder zunächst verbergen.

Keine fixe Schwelle blind festschreiben. Schwellen nach realen Tests kalibrieren. Ziel: 4–6 primäre Facetten statt UI-Überladung.

Universelle Kandidaten, sofern sinnvoll: Preis, Marke; Bewertung/Farbe/Größe nur wenn Datenlage und Kategorie passen.

## 10. Ergebnisumfang, Pagination und Traffic

Aktuelle Produktentscheidung:

- erste Seite: **20 Webangebote**.
- keine 100 Ergebnisse vorsorglich laden.
- weitere Ergebnisse nur auf Nutzeraktion (`Weitere 20`/nächste Seite).
- Cache vor erneuter externer Abfrage nutzen.
- externe API-/Worker-Kosten und Traffic beobachten.

Zwei getrennte Cache-Schichten:

### Search Cache
Schlüssel z.B. `query|language|country|intent|filters|page`.

### Intelligence Cache
Schlüssel z.B. normalisierte Query -> Kategorie + erkannte Attribute + Confidence. Längere TTL als Suchtreffer möglich.

Wiederholte Queries sollen dadurch schneller und billiger werden.

## 11. Sortierung

Kurzfristig für Webangebote:

- Relevanz (Default).
- Preis aufsteigend.
- Preis absteigend.

Preissortierung nur auf belastbaren normalisierten Preisen. Ergebnisse ohne sicheren Preis gehören im strengen Offer-Modus ohnehin nicht in die sichtbare Angebotsliste.

Später kategoriespezifisch:

- Preis pro Einheit.
- ggf. weitere objektive Attribute.

## 12. Preis pro Einheit

Für unterschiedliche Mengen/Volumina ist Unit Pricing zentral. Beispiel:

- 1 l / 9,99 EUR -> 9,99 EUR/l
- 5 l / 34,99 EUR -> 7,00 EUR/l
- 10 l / 61,90 EUR -> 6,19 EUR/l

Baymard empfiehlt bei vergleichbaren Produkten mit unterschiedlichen Mengen/Volumina Gesamtpreis + Einheitspreis. FundBlick soll dies für geeignete Kategorien unterstützen (Öl, Getränke, Reinigungsmittel, Tierfutter etc.).

Nur berechnen, wenn Menge und Einheit zuverlässig erkannt sind.

## 13. Product Identity, Varianten und Dubletten

Langfristig gleiche Produkte/Varianten gruppieren statt Ergebnisliste zu fluten.

Identity-Signale:

1. GTIN/EAN.
2. MPN + Brand.
3. Brand + Modell.
4. normalisierter Titel/Attribute als schwächerer Fallback.

Beispiele:

- Größen/Farben desselben Schuhmodells möglichst als Varianten eines Produktes.
- identisches Motoröl bei mehreren Händlern als ein Produkt mit mehreren Offers.

Zielstruktur später:

`Product -> Variant(s) -> Merchant Offer(s)`

Dies ermöglicht echten Händler-/Preisvergleich.

## 14. Mehrsprachigkeit

Interne IDs bleiben sprachneutral:

`attribute=color`, `value=black`.

Darstellung wird lokalisiert:

- DE: Farbe / Schwarz
- RU: Цвет / Чёрный
- RO: Culoare / Negru
- IT: Colore / Nero

Eine Produktklasse darf nicht pro Sprache dupliziert werden. Shopify-Lokalisierungen können als Ausgangsbasis dienen; FundBlick braucht eigene Synonyme/Overrides für Suchsprache und typische Schreibweisen.

## 15. Mobile First

FundBlick bleibt mobile-first.

- wenige primäre Facetten.
- weitere Filter einklappbar.
- auf Mobilgeräten Filteränderungen sammeln und mit `Ergebnisse anzeigen` anwenden, wenn dies Requests/Neurendering reduziert.
- aktive Filter immer sichtbar/entfernbar machen.
- keine Pop-up-lastige UX.

## 16. SEO-Sicherheitsregel für Facetten

Kritisches Risiko: Facetten können nahezu unendlich viele URL-Kombinationen erzeugen und Crawl-Budget/Serverressourcen verschwenden. Google dokumentiert Facettennavigation als typische Overcrawl-Ursache.

FundBlick-Grundregel für Phase 1:

- Filter sind für Nutzer, **nicht automatisch neue indexierbare Landingpages**.
- keine unkontrollierte Indexierung beliebiger `?brand=&size=&color=`-Kombinationen.
- Canonical/robots/noindex/Crawl-Strategie vor Rollout festlegen und durch bestehende SEO-Gates absichern.
- nur bewusst kuratierte Such-/Kategorie-Landingpages dürfen später indexierbar werden.

## 17. Analytics / Lernen ohne persönliche Profilierung

Später anonym aggregierte Nutzungssignale verwenden, z.B.:

```text
category=motor_oil
facet_usage.viscosity=427
facet_usage.volume=318
facet_usage.brand=201
```

Damit kann die Reihenfolge der Facetten verbessert werden, ohne personenbezogene Interessenprofile für die Kernfunktion zu benötigen.

## 18. Sicherheits-/Qualitätsregeln

- `main`/Live nicht direkt verändern.
- Implementierung nur `development`.
- neue Module mit Unit-/Regressionstests.
- Development Integrity muss grün sein.
- Development Preview muss grün sein.
- reale Suchbegriffe als Golden-Testset pflegen.
- bei Confidence-Konflikten konservativ handeln.
- externe Daten nie ungeprüft als Wahrheit übernehmen.
- Preise/Währungen/Einheiten besonders streng behandeln.
- Taxonomie-Version pinnen; Updates als kontrollierte Migration, nicht automatisch ungeprüft übernehmen.

## 19. Golden Query Set (Start)

Mindestens folgende Typen für Regressionstests:

1. `10W40`
2. `Castrol 10W40 5 Liter`
3. `Adidas Schuhe`
4. `Adidas Damen schwarz 39`
5. `Samsung 65 Zoll Fernseher`
6. `iPhone 17 256 GB`
7. `Bosch Akkuschrauber 18V`
8. mehrsprachige Äquivalente (DE/EN/RU/RO/IT etc.)
9. mehrdeutige Queries, bei denen das System bewusst wenige Facetten liefern soll.

Für jede Query später Sollwerte definieren: erwartete Kategorie, erkannte Attribute, verbotene Facetten, Confidence.

## 20. Umsetzungsphasen

### Phase 0 — Dokumentation & Safety (jetzt)
- technische Grundlage konservieren.
- keine Live-Änderung.

### Phase 1 — Taxonomy Core
- versionierten Shopify-Snapshot evaluieren/importieren.
- internes kompaktes Format.
- Kategoriehierarchie + Vererbung.
- FundBlick Overrides/Synonyme getrennt halten.

### Phase 2 — Query Intelligence
- Normalizer.
- Units/Brand/Model Parser.
- Category Classifier + Confidence.
- Golden Query Tests.

### Phase 3 — Attribute Extraction
- strukturierte Daten bevorzugen.
- Titel/Beschreibung als Ergänzung.
- Normalisierung von Einheiten/Werten.

### Phase 4 — Dynamic Facet Engine
- expected facets + observed evidence.
- 4–6 primäre Facetten.
- konservative Confidence-Schwellen.

### Phase 5 — Web Result UX / Traffic
- 20 Treffer pro Seite.
- echtes Pagination/Nachladen.
- Search Cache.
- Preis auf/ab.

### Phase 6 — Unit Price
- kategoriespezifische Mengen-/Einheitenlogik.
- Preis pro l/kg/Stück etc.

### Phase 7 — Identity / Dedup / Variants
- GTIN/MPN/Brand/Model.
- Händlerangebote gruppieren.

### Phase 8 — Mehrsprachigkeit
- Taxonomie-Lokalisierung.
- Suchsynonyme pro Sprache.
- gleiche interne IDs für alle Sprachen.

### Phase 9 — Learning
- anonyme Facettennutzung.
- Priorisierung anhand aggregierter Signale.

### Phase 10 — Optional AI Fallback
- nur für unbekannte/mehrdeutige Queries.
- Kostenlimit/Cache zwingend.
- nie notwendiger Bestandteil jeder Suche.

## 21. Noch offene Designfragen

Vor Implementierung jeweils bewusst entscheiden/testen:

- exakte Shopify-Release-Version für ersten Snapshot.
- welche Taxonomie-Teilmenge im Browser benötigt wird und was build-time/serverseitig bleiben kann.
- Facetten-Evidence-Schwellen.
- TTLs für Search/Intelligence Cache.
- Umgang mit Produktseiten ohne auslesbare strukturierte Daten.
- CORS/Worker-Architektur für Page Metadata / JSON-LD, falls benötigt.
- rechtliche/technische Grenzen beim Abruf fremder Produktseiten; Feeds/APIs/strukturierte Suchdaten bevorzugen.
- Ranking zwischen eigenem Affiliate-Angebot und externem, nicht monetarisiertem Angebot: eigene Produkte priorisieren, aber Nutzerrelevanz nicht zerstören.

## 22. Neue Erkenntnisse aus Kontrollrecherche 30.09.2026

1. Shopify ist als Basis stärker als ein manueller 200–500-Klassen-Ansatz: Kategorien + Attribute + Werte + Übersetzungen + Mappings sind bereits vorhanden.
2. Shopify `dist/` im Repository ist keine zukunftssichere Integrationsquelle; Entfernung zum 31.10.2026 angekündigt. Release-Assets verwenden und Version pinnen.
3. Die Taxonomie ist groß und wächst stark. Deshalb **nicht vollständig ungefiltert in jedes Browser-Bundle laden**. Build-time reduzieren, lazy laden oder nur benötigte Indizes ausliefern.
4. Facetten-SEO muss von Anfang an Teil der Architektur sein; Google warnt explizit vor nahezu unendlichen URL-Räumen und Overcrawling.
5. Unit Pricing ist nicht nur Nice-to-have, sondern bei Mengenvarianten ein klarer Vergleichsvorteil.
6. Varianten-/Offer-Gruppierung sollte im Datenmodell früh vorgesehen werden, auch wenn die Funktion später kommt. Sonst müssten wir das Ergebnisdatenmodell später teuer umbauen.
7. Confidence und Provenance (Quelle eines Attributs) müssen gespeichert werden. Ein Wert ohne Herkunft ist für spätere Konfliktauflösung zu schwach.
8. Taxonomie-Updates dürfen FundBlick-Kategorien nicht still brechen. Interne stabile IDs/Mapping-Layer vorsehen.

## 23. Quellen / Rechercheanker

- Shopify Product Taxonomy Repository: https://github.com/Shopify/product-taxonomy
- Shopify Taxonomy Explorer: https://shopify.github.io/product-taxonomy/
- Shopify Releases: https://github.com/Shopify/product-taxonomy/releases
- Google: Managing crawling of faceted navigation URLs: https://developers.google.com/crawling/docs/faceted-navigation
- Baymard: Product List UX / Filtering: https://baymard.com/research-articles/current-state-product-list-and-filtering
- Baymard: Ecommerce Filter UI: https://baymard.com/blog/ecommerce-filter-ui

## 24. Wiederanlauf-Anweisung

Wenn die Arbeit unterbrochen wird:

1. `development` aktuellen Head prüfen.
2. dieses Dokument vollständig lesen.
3. aktuelle Websuche-/CI-Gates prüfen.
4. `main` nicht verändern.
5. mit der frühesten noch offenen Phase fortfahren.
6. nach jedem abgeschlossenen Block Tests + Development Integrity prüfen.
7. dieses Dokument bei wesentlichen Architekturentscheidungen aktualisieren.

**Nächster geplanter technischer Schritt:** Phase 1 als isolierten Development-Block beginnen: Shopify-Release-Snapshot und kompaktes FundBlick-Taxonomieformat evaluieren, zunächst ohne bestehende Suche umzuschalten.

## 25. Nachgewiesene Fortschreibung vom 30.09.2026

Die vorstehende Phase-1-Ankündigung ist inzwischen umgesetzt: isolierte Evaluation v2026-08, kompakter Snapshot, Hierarchie-/Mappingadapter, Digests und Offline-Gate. Noch keine Runtime-Migration. Entscheidung und Grenzen in `TAXONOMY-EVALUATION-2026-09-30.md`: Kandidatenvererbung braucht fachliche Whitelist; numerische FundBlick-Merkmale bleiben ergänzungsbedürftig, zwei evaluierte Sprachen ersetzen keine 20 Sprachfassungen.

Weitere verbindliche implementierte Verträge: eigene Katalogsuche zuerst; ein externer Erstabruf ausschließlich nach Aktivierung; weitere Abrufe nur per Aktion; Cache pro Dienst-Origin; ausdrückliche Fehlerwiederholung; Preisvergleich nur bei belegter gleicher Währung bzw. Mengenbasis; gemeinsame Einheitenwerte für Extraktion, Ranking und Facetten. Schwache MEDIUM-Evidenz ist Ranghinweis, kein unterdrückbarer Konflikt; LOW standardmäßig weder Constraint noch sichtbarer Facettenwert. Fehlende Confidence an strukturierten Altwerten behält den bestehenden Vertrag, ist keine neu bewiesene Provenance.

Fashion-Extraktion gemeinsam für Query und Treffer: explizite Größenlabels im Kategorie-Kontext, keine Modellnummer als EU-Größe; mehrdeutige Farben/Zielgruppen/Größen bleiben unbekannt. Vorhandene Klassenwörter mit Unicode-Grenzen repariert; keine Behauptung vollständiger Sprach-/Modellabdeckung. Datenschutzprüfstand und noch fehlende Konto-/Vertragsbelege separat in `EXTERNAL-SEARCH-PRIVACY-REVIEW-2026-09-30.md`.

Aktueller Code-/CI-Nachweis im Handoff und Worklog. Offene Reihenfolge: reale dünne Referenzfamilien und Modelltreue verbessern, Fachregeln evaluieren, öffentliche isolierte Development-Abnahme vorbereiten; größere Erweiterungen weiterhin erst nach Bestandskonsolidierung. Jens hat anschließend ausdrücklich die Fertigstellung und den Merge nach Live für heute verlangt. Aktuelle Release-Vorbereitung im Worklog; die größeren offenen Fahrplanphasen werden dadurch nicht als vollständig erledigt erklärt.
