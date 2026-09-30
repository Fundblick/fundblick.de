# FundBlick – Tagesstatus 2026-09-29

## Gesamtstatus am Tagesende

FundBlick wurde heute technisch und konzeptionell deutlich weiterentwickelt. Der wichtigste Fortschritt ist die klare Trennung zwischen dem eigenen Commerce-Katalog und externen Web-Ergebnissen. Gleichzeitig wurden mehrere echte Such- und Preisfehler gefunden und behoben bzw. abgesichert.

Branch-Regel bleibt verbindlich:
- Entwicklung ausschließlich auf `development`.
- `main` wurde nicht angefasst.

Letzter dokumentierter Development-Stand am Tagesende:
- aktueller UX-/WWW-Gate-Stand: `3013fd32e5eda0449a226c34b076f585f96817c8`
- vorheriger Fix der korrekten Erkennung sichtbarer FundBlick-Produkte: `8444dd6db1953c1fcf67504bc77c29d11b7f76f9`
- Category-Intent-Routing für Mähroboter: `4829f762dac39acdcc5a3ae7c18393d613afb0a6`
- Local-Search-Ausbau: bis `f7c6e3ee8527bb6204b042b9a97625954e8a629d`
- Preis-/Listen-Seiten-Schutz: `6681f2395e647966c63eaeb011457d55384049fe`
- Catalog-Preview-Fix: `612e5f660922c40393e2487fb44b47cb5764ffbe`
- Pre-Flight-/Catalog-Integrity-Vertrag: `f04ee979f5f544242ded772dbe99016bfc63c561`

Hinweis: GitHub-Actions für die allerletzten Commits waren beim jeweiligen letzten Abruf teilweise noch queued/in progress bzw. noch nicht gestartet. Deshalb ist der dokumentierte Code-Stand aktuell, aber nicht jede letzte Änderung als vollständig deployed bestätigt.

---

## 1. Grundarchitektur: eigener Katalog zuerst, Web nur bewusst

Die zentrale Architekturentscheidung des Tages wurde präzisiert:

### Eigene FundBlick-Produkte
- FundBlick-eigene Händler-/Affiliate-Produkte bleiben der primäre Produktbestand.
- Facetten, Filter, Kategorien und Sortierungen beziehen sich auf diesen Commerce-Katalog.
- Externe Webtreffer dürfen diesen Bestand nicht automatisch vermischen oder verwässern.

### World Wide Web
- Web-Ergebnisse bleiben als bewusste Erweiterung verfügbar.
- Sie werden nicht mehr automatisch unter oder zwischen FundBlick-Produkten eingemischt.
- Der Nutzer entscheidet aktiv über einen Button, ob er zusätzlich im Web suchen möchte.

Damit bleibt die Seite auch bei künftig 100, 1.000 oder 100.000 eigenen Produkten sauber skalierbar.

### Aktuelle UX-Regel
Wenn eigene Produkte vorhanden sind:

**Noch mehr finden?**

`Du kannst deine Suche auch auf das World Wide Web erweitern.`

Button:

**Im Web weitersuchen**

Wenn keine eigenen Produkte vorhanden sind:

**Aktuell keine Produkte vorhanden.**

`Du kannst deine Suche stattdessen auf das World Wide Web erweitern.`

Button:

**Im Web weitersuchen**

Wichtig:
- Die Websuche startet erst nach bewusstem Klick.
- Externe Ergebnisse bleiben separat von FundBlick-Produkten.
- Die frühere Formulierung „keine Produkte vorhanden“ darf niemals erscheinen, wenn eigene Produkte sichtbar sind.

---

## 2. Fehler: WWW-Fallback erkannte sichtbare Produkte zunächst nicht

### Symptom
Bei Mähroboter-Suchergebnissen wurden mehrere FundBlick-Produkte sichtbar angezeigt. Darunter erschien trotzdem:

`Aktuell keine Produkte vorhanden.`

Das war logisch widersprüchlich.

### Ursache
Die neue WWW-Fallback-Logik zählte:

`.product-card`

Die tatsächlichen Produktkarten auf der Seite verwenden jedoch:

`.product`

Damit sah die Fallback-Logik intern 0 Treffer, obwohl Produkte gerendert waren.

### Fix
Commit:
`8444dd6db1953c1fcf67504bc77c29d11b7f76f9`

Aktuelle Erkennung berücksichtigt:
- `.product:not([hidden])`
- `.product-card:not([hidden])` als Kompatibilitäts-Fallback
- ausgeblendete Karten werden nicht gezählt
- `display:none` und `visibility:hidden` werden berücksichtigt

Damit wird der WWW-Gate-Text jetzt auf Grundlage der tatsächlich sichtbaren eigenen Produkte gewählt.

---

## 3. Kategorie-Klick vs. Freitextsuche: Mähroboter

### Beobachtung
Beim Klick auf die Kategorie **Mähroboter** erschienen viele passende Mähroboter.

Bei Eingabe von `Mähroboter` im Suchfeld erschienen dagegen:
- weniger Geräte,
- teilweise Zubehör,
- teilweise weniger relevante Treffer.

### Ursache
Kategorie-Klick und Freitextsuche verwendeten unterschiedliche Pfade:

Kategorie-Klick:
- exakte Kategorie-ID,
- vollständiger Kategorienbestand.

Freitextsuche:
- Titel-/Beschreibung-/Keyword-Ranking,
- dadurch können Geräte verloren gehen,
- Zubehör mit dem Wort „Mähroboter“ kann hineingeraten.

### Neue Category-Intent-Regel
Wenn ein Suchbegriff exakt oder eindeutig einer bekannten Kategorie entspricht, wird er intern auf den Kategoriepfad geroutet.

Beispiele:
- `Mähroboter` → `home.garden.robot-mowers`
- `Maehroboter` → `home.garden.robot-mowers`
- `Rasenroboter` → `home.garden.robot-mowers`
- `Mähroboter Zubehör` → `home.garden.robot-mower-accessories`
- `Mähroboter Ersatzteile` → Zubehör-Kategorie

Commit:
`4829f762dac39acdcc5a3ae7c18393d613afb0a6`

Neue Datei:
`category-query-router.js`

### Wichtige Begrenzung
Nur exakte/eindeutige Kategoriebegriffe werden geroutet.

Beispiel:
- `Mähroboter` → Category Search
- `Mähroboter 1000 m²` → weiterhin spezifische Freitext-/Facettensuche

Der ursprünglich eingegebene Suchbegriff bleibt über `rawq` erhalten und sichtbar.

---

## 4. External Search: Intent-Auswahl und bewusste Suchmodi

Die Universal Search wurde heute um eine nicht-blockierende Intent-Auswahl erweitert.

Unter dem Suchfeld stehen Modi wie:
- Angebote
- Erklärung
- Videos
- In meiner Nähe

Ziel:
- FundBlick soll verstehen, was der Nutzer eigentlich möchte.
- Die Auswahl darf nicht zum nervigen Pflichtdialog werden.
- Standard bleibt eine sinnvolle Annahme, aber der Nutzer kann direkt umschalten.

### Mode-spezifische externe Queries
Ein früher Fehler war, dass die Buttons nur das Ranking änderten, aber immer dieselbe externe Anfrage sendeten.

Das wurde geändert.

Beispiele:
- Angebote → `Bleistift kaufen Preis Angebot`
- Erklärung → `Bleistift Erklärung Ratgeber`
- Videos → `Bleistift Video`
- In meiner Nähe → lokale Sucherweiterung

Der sichtbare ursprüngliche Suchbegriff bleibt unverändert.

Wichtige Dateien:
- `search-intent-ui.js`
- `search-intent-query.js`
- `universal-search-intent.js`
- `external-search-runtime.js`

---

## 5. Local Search / „In meiner Nähe“

„In meiner Nähe“ wird künftig nicht einfach als normaler Webtreffer behandelt.

### Neue Local-Eingabemaske
Beim Local-Modus wurden folgende Eingaben vorgesehen bzw. implementiert:
- Ort oder PLZ
- Standort verwenden
- Umkreis: 5 / 10 / 25 / 50 / 100 km
- Jetzt geöffnet
- Produkt vor Ort verfügbar
- Abholung möglich
- Button: `Lokale Angebote finden`

### Grundprinzip
Local Search ist ein bewusst ausgelöster eigener Suchpfad.

Er soll langfristig strukturierte lokale Daten berücksichtigen:
- Händlername
- Adresse
- Distanz
- Öffnungszeiten
- Telefonnummer
- Website
- Verfügbarkeit vor Ort
- Abholung / Click & Collect
- ggf. Werkstatt statt nur Händler

### Wichtige Einschränkung
Die aktuelle Local-Suche ist noch keine vollwertige strukturierte POI-/Maps-/Händlerdatenbank.

Der derzeitige Stand ist eine kontrollierte lokale Sucherweiterung. Später sollte dafür ein eigener Local-Provider bzw. strukturierter Datenpfad verwendet werden.

---

## 6. Externe Preise: mehrere reale Fehlerfälle gefunden

### 6.1 Mercedes-Fehler
Sichtbarer Titel:
`Ab 11.205 €`

Versteckte Strukturmetadaten enthielten dagegen einen unpassenden Wert wie:
`112050`

FundBlick zeigte dadurch ursprünglich:
`112.050,00 €`

Regel danach:
- sichtbarer Preis aus Titel/Beschreibung schlägt widersprüchliche versteckte Metadaten.

---

### 6.2 Dezimalfehler: 15 € wurden 150 €, 50 € wurden 500 €

Beispiele:
- Amazon-Buch: tatsächlicher Preis 15,00 €, FundBlick zeigte 150,00 €
- Stilform Aeon Nano: tatsächlicher Preis 50,00 €, FundBlick zeigte 500,00 €

Ursache:
Ein einzelner Dezimaltrenner mit einer Nachkommastelle wurde fälschlich als Tausendertrennzeichen interpretiert.

Die Zahlenparser-Logik wurde korrigiert.

Regression:
- `15.0` → `15,00 €`
- `50.0` → `50,00 €`

---

### 6.3 Falsche Video-Klassifizierung
Ein Produkt wurde als „Video“ klassifiziert, weil im Beschreibungstext zufällig das Wort Video vorkam.

Neue Klassifizierungsreihenfolge:
1. echter Video-Host wie YouTube/Vimeo
2. Produkt-/Preis-Signal
3. erst danach Textsignal „Video“

Damit schlägt ein starkes Produktsignal zufällige Video-Wörter im Text.

---

## 7. Böttcher-Preis: kein Fehler, sondern MwSt.-Kontext

Ein vermeintlicher Preisfehler wurde durch manuelle Prüfung aufgeklärt.

Böttcher zeigte im Geschäftskundenmodus:
- 14,49 € netto für 1 Packung

FundBlick zeigte:
- 17,24 € brutto

Rechnung:
`14,49 × 1,19 = 17,24 €`

Damit war der FundBlick-Preis korrekt.

### Erkenntnis für die Preis-UX
FundBlick sollte externe Preise künftig möglichst mit Kontext anzeigen:
- brutto / netto
- Einzelpreis / Staffelpreis
- `ab`-Preis
- Mengenbezug

Damit werden korrekte Preise nicht fälschlich als Widerspruch wahrgenommen.

---

## 8. ATU-Fall: echter Preis-Zuordnungsfehler

### Beobachtung
ATU-Kategorieseite `10W40 Öl` zeigte mehrere Produkte:
- Norauto 1 Liter: 5,00 €
- Castrol Magnatec 5 Liter: 49,99 €

FundBlick zeigte aber einen Treffer für Castrol 5 Liter mit 5,00 €.

### Ursache
Ein Mindestpreis der Kategorie-/Listen-Seite wurde einem konkreten Einzelprodukt zugeordnet.

### Neue harte Regel
Kategorie-, Such-, Listen- und Sammelseiten dürfen keinen generischen Mindestpreis als Preis eines konkreten Produkts vererben.

Wenn nur ein Seiten-Mindestpreis bekannt ist, gilt:
- bei generischem Kategorien-Treffer ggf. später `ab 5,00 €`
- bei konkretem Produkt ohne eindeutige Preiszuordnung: Preis ausblenden

### Schutzsignale
Listen-/Kategorie-Kontext wird stärker erkannt, u. a. über Begriffe wie:
- `zum besten Preis kaufen`
- `große Auswahl`
- `Treffer gefunden`
- Preisvergleich
- Suchergebnisse
- Staffel-/Großhandelskontext
- bekannte Aggregator-/Listing-Hosts

Commit:
`6681f2395e647966c63eaeb011457d55384049fe`

---

## 9. Preisvertrauen: aktueller Stand und offene Lücke

Das heutige Preisvertrauensmodell unterscheidet bereits zwischen:
- sichtbar belegbaren Preisen
- strukturierten Preisen
- blockierten Aggregator-/Listing-Kontexten
- verifizierten bzw. als plausibel eingestuften Produktpreisen

Wichtige Dateien:
- `external-price-confidence.js`
- `external-search-ui.js`
- `verify-external-price-confidence.js`

### Offene Lücke: Aktualität
Ein Preis kann korrekt dem richtigen Produkt zugeordnet sein und trotzdem veraltet sein.

Deshalb braucht Preisvertrauen langfristig eine Freshness-Dimension:
- `verified-live`
- `visible-snippet`
- `structured`
- `unknown`

Ein Brave-/Suchmaschinen-Snippet sollte nicht automatisch als live aktueller Händlerpreis gelten.

### Sicherheits-/Architekturhinweis
Eine echte Live-Verifikation fremder Zielseiten darf nicht naiv als beliebiger Server-Fetch implementiert werden.

Zu berücksichtigen:
- SSRF-Schutz
- Timeouts
- Anti-Bot / JS-Rendering
- Kosten / Latenz
- Provider-/Shopbedingungen
- erlaubte Hosts / Allowlisting

Skalierbarer bleiben Händlerfeeds/APIs für monetarisierte Produktpreise. Webtreffer können ergänzend informativ bleiben.

---

## 10. External Search Pagination / Scroll

Die Websuche wurde von einem kleinen statischen Ergebnisblock auf Pagination/Weiterladen erweitert.

Worker-/Frontend-Prinzip:
- `count=20`
- `offset` 0 bis 9
- Deduplizierung per URL
- IntersectionObserver für weiteres Laden
- theoretisch bis ca. 200 Webtreffer, sofern Provider Ergebnisse liefert

Zusätzlich wurde versucht, im Angebotsmodus zunächst mehrere vertrauenswürdige Produktpreise zu sammeln.

Wichtiger Architekturwechsel heute:
Dieser automatische Web-Block ist jetzt nicht mehr Standardbestandteil der normalen Ergebnisse, sondern liegt hinter der bewussten WWW-Erweiterung.

---

## 11. Cloudflare Brave Worker

Worker:
`https://fundblick-search.frosty-moon-518b.workers.dev`

Aktuelle bekannte Funktionen:
- `/health`
- `/search`
- CORS
- Brave Web Search
- Pagination über count/offset
- Ergebnisnormalisierung

Bekannte Parameter:
- q
- count
- offset
- country
- search_lang
- safesearch
- extra_snippets

Der Worker wurde heute manuell in Cloudflare aktualisiert.

### Offener Prozesspunkt
Es gibt weiterhin keinen reproduzierbaren automatischen GitHub→Cloudflare-Deploy.

Repo-Änderung am Worker bedeutet daher nicht automatisch, dass der Worker live aktualisiert wurde.

---

## 12. Sprachen, Markt und Währung bleiben getrennt

Grundprinzipien:
- UI-Sprache != Suchsprache
- Suchsprache != Markt
- Markt != Währung
- Währung gehört zur Quelle / zum Angebot

Unterstützte UI-/Suchsprachen umfassen aktuell u. a.:
- DE
- EN
- RU
- RO
- TR
- PL
- UK
- IT
- FR
- ES
- PT
- AR
- weitere

Währungsableitung:
1. explizite Metadaten
2. sichtbares Symbol/Code
3. TLD als Fallback
4. sonst unbekannt

Beispiele:
- `.ru` → RUB
- `.ro` → RON
- `.md` → MDL
- `.pl` → PLN
- `.cz` → CZK
- `.ch` → CHF
- `.de/.at` → EUR
- `.uk/.gb` → GBP

`.com` impliziert ausdrücklich nicht automatisch USD.

---

## 13. Kritischer Catalog-Preview-Incident

### Symptom
Zwischenzeitlich waren in Development plötzlich nur noch wenige Produkte/Kategorien sichtbar.

### Ursache
Die Development-Preview kopierte einen alten Root-Katalog mit nur 4 Produkten, statt vor dem Preview-Deploy den vollständigen Händlerkatalog neu zu bauen.

### Fix
Commit:
`612e5f660922c40393e2487fb44b47cb5764ffbe`

Preview baut jetzt den realen Händlerkatalog vor Packaging neu.

Schutzbedingungen:
- realer Katalog muss gebaut werden
- `dataMode=real`
- mindestens ca. 1000 reale Produkte
- `simulatedCount=0`
- Kategorienmanifest muss vorhanden sein
- alter Root-Katalog darf nicht unbemerkt veröffentlicht werden

Der entsprechende Preview-Run war erfolgreich.

---

## 14. Verbindlicher Catalog-Integrity-Preflight

Dokument:
`docs/FUNDBLICK-PREFLIGHT-CATALOG-INTEGRITY.md`

Verbindliche Reihenfolge vor größerer Arbeit:

`Handoff/Doku lesen → Preflight lesen → Branch/Head prüfen → realen Katalog prüfen → erst dann ändern.`

STOP-Regel bei ungeklärter Diskrepanz.

Beispiel:
- erwartet ~1.500 Produkte
- ausgeliefert 4 Produkte

→ keine Feature-Arbeit fortsetzen, bevor die Ursache geklärt ist.

Langfristige Zielarchitektur:
- Produktzahl pro Händler prüfen
- Kategorie-Deltas prüfen
- Feed-Vollständigkeit prüfen
- Catalog Build IDs / Hashes
- immutable Katalogbuilds
- atomischer Pointer
- Rollback auf last-known-good

---

## 15. Architekturtrennung: Search Engine vs. Commerce Catalog

### FundBlick Search Engine
Verantwortlich für:
- Intent
- Mehrsprachigkeit
- Websuche
- Info/Guide/Video
- Local Search
- Query Routing
- externe Ergebnisdarstellung

### FundBlick Commerce Catalog
Verantwortlich für:
- Händler
- Affiliate-Produkte
- Preise
- Kategorien
- Feeds
- Merchant-Metadaten
- Facetten
- Monetarisierungsrouting

Regel:
Die Search Engine darf den Commerce Catalog lesen und priorisieren, aber niemals stillschweigend dessen Bestand ersetzen oder verkleinern.

---

## 16. Aktuelle UX-Philosophie für Suche

FundBlick soll langfristig nicht nur eine klassische Produktsuche sein, sondern eine universelle Bedürfnis-/Produktsuche.

Leitidee:

**„Sag FundBlick, was du brauchst.“**

Beispiele:
- Modellname → Produkt
- breite Kategorie → Produkte + Facetten
- Frage → Erklärung
- „Video“ → Videos
- „in meiner Nähe“ → Local Search
- keine eigenen Treffer → optional WWW
- eigene Treffer vorhanden → optional WWW-Erweiterung

Wichtig:
Die externen Ergebnisse sind eine Erweiterung, nicht der Kernbestand.

---

## 17. Bekannte offene Punkte

### Hohe Priorität
1. Preis-Freshness: externe Snippetpreise können veraltet sein.
2. Local Search braucht langfristig echte strukturierte Local-Daten.
3. Category-Intent-Routing muss später auf weitere Kategorien und Sprachen ausgeweitet werden.
4. Externe Web-Ergebnisse benötigen weiterhin strikte Preis-/Produktzuordnung.
5. Cloudflare Worker braucht reproduzierbaren automatisierten Deploy.
6. Letzte Commits des Abends müssen nach vollständig grünen Gates noch einmal kontrolliert werden.

### Mittlere Priorität
7. Category Search und Freitextsuche systematisch gegentesten.
8. Zubehör-Abgrenzung pro Kategorie stärken.
9. Brutto/netto, Staffelpreis und `ab`-Preis als UI-Kontext ausbauen.
10. Externe Ergebnisse stärker nach Quelle/Typ kennzeichnen.
11. Weitere Sprachen E2E testen.
12. Local-Filter später mit echten strukturierten Daten verknüpfen.

---

## 18. Empfohlener Start für die nächste Session

1. `development` Head lesen und bestätigen.
2. `docs/FUNDBLICK-PREFLIGHT-CATALOG-INTEGRITY.md` lesen.
3. Diese Tagesdoku lesen.
4. Prüfen, ob alle letzten Actions/Deployments grün sind.
5. Smoke-Test:
   - Mähroboter per Kategorie-Klick
   - Mähroboter per Suchfeld
   - Zubehör-Suche
   - Suche mit eigenen Treffern → `Noch mehr finden?`
   - Suche ohne eigene Treffer → `Aktuell keine Produkte vorhanden.`
   - Klick `Im Web weitersuchen`
   - Local-Modus
6. Erst danach neue Features bauen.

---

## Tagesfazit

Der 29.09.2026 war ein wichtiger Architektur- und Fehlerbereinigungstag.

FundBlick hat jetzt ein klareres Suchmodell:
- eigene Commerce-Produkte zuerst,
- Kategorien werden bei eindeutiger Suchabsicht direkt erkannt,
- Web-Ergebnisse sind bewusst optional,
- Local Search bekommt einen eigenen Pfad,
- Preiszuordnung wird deutlich strenger,
- Commerce-Katalog und Search Engine sind organisatorisch getrennt,
- Catalog Integrity ist verbindlich abgesichert.

Die wichtigsten Erkenntnisse aus den realen Tests waren:
- sichtbarer Preis ist nicht automatisch falscher Preis: Böttcher war ein MwSt.-Fall,
- Kategorienpreis ist kein Produktpreis: ATU war ein echter Zuordnungsfehler,
- Freitextsuche darf bekannte Kategorien nicht schlechter behandeln als Kategorie-Klicks,
- WWW-Fallback darf nie behaupten, es gäbe keine Produkte, wenn Produkte sichtbar sind,
- externe Suche soll nützlich bleiben, aber den eigenen Katalog nicht dominieren.

Damit ist der aktuelle Entwicklungsstand fachlich deutlich sauberer und für die nächste Ausbaustufe besser vorbereitet.
