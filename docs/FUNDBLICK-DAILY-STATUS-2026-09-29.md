# FundBlick – Tagesstatus 2026-09-29

## Status

Stabiler Development-Zwischenstand erreicht. Fokus heute: External Search, Preis-/Währungsrobustheit und erster universeller Intent-Router.

Aktueller geprüfter Development-Stand vor dieser Dokumentation: `cce528e70690509fd0631bac8a9ec207bb37ce23`.

`main` wurde heute nicht verändert.

## Heute erreicht

### 1. External Search / Wrapper-Suche stabilisiert
- Brave Search Worker als externer Fallback aktiv.
- Bilder, Händler, Produkt-URL, Preis, Währung und Produktstatus werden normalisiert.
- Web-/Wrapper-Ergebnisse bleiben klar von Affiliate-/Händlerergebnissen getrennt.
- Externe Treffer dienen als Ergänzung, wenn eigene Händlerdaten fehlen oder wenn die Suchabsicht breiter ist.

### 2. Mehrsprachigkeit
- Suchoberfläche unterstützt mehrere Sprachen, u. a. Deutsch, Russisch und Rumänisch.
- Sprache der Suchanfrage wird künftig getrennt von der UI-Sprache betrachtet.
- Russische, rumänische und andere nicht-deutsche Eingaben können dadurch gezielter in ihrer Sprache an die Websuche übergeben werden.

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

## Verifizierter Gate-Status
Für Commit `cce528e70690509fd0631bac8a9ec207bb37ce23` waren am Tagesende grün:
- external-search
- verify
- deploy
- browser-e2e

Damit besteht ein belastbarer Development-Zwischenstand.

## Bewusste Restpunkte
Nicht alles ist heute fertig. Folgende Punkte bleiben absichtlich offen:

1. Local Search ist noch keine echte strukturierte Händler-/Werkstatt-/POI-Suche.
2. Intent-Erkennung ist derzeit primär regelbasiert und muss weiter ausgebaut werden.
3. Ergebnis-Mischung zwischen Affiliate, Web, Guide, Video und Local kann später feiner gewichtet werden.
4. Der Cloudflare Worker besitzt weiterhin keinen automatischen Deploy aus GitHub; Worker-Änderungen müssen manuell in Cloudflare veröffentlicht werden.
5. Währungserkennung per Domain ist nur Fallback und muss bei widersprüchlichen Quellen vorsichtig behandelt werden.
6. Mehrsprachige Suchlogik braucht weitere reale E2E-Tests mit gemischten Sprachen und Märkten.

## Architektur-Grundsatz
FundBlick wird nicht als reine Produktsuchmaschine weitergebaut, sondern als universelle Bedarfs- und Produktsuche.

Die Suchleiste ist der zentrale Intent-Eingang. Je nach Anfrage soll FundBlick passende Ergebnisarten kombinieren:
- Affiliate-/Händlerprodukte
- externe Web-Ergebnisse
- Ratgeber / Erklärseiten
- Tests / Vergleiche
- Videos
- lokale Händler / Werkstätten / Angebote

Die Monetarisierungsschicht bleibt technisch und visuell getrennt von nicht vergüteten Wrapper-/Web-Ergebnissen.

## Nächster sinnvoller Aufbau
Priorität für die nächste Session:

1. Local Intent ausbauen
   - Ort robuster extrahieren
   - lokale Händler-/Werkstattquellen gezielter priorisieren
   - noch keine automatische Nutzung präziser Standortdaten ohne klare Nutzerabsicht

2. Search Language Detection härten
   - gemischte Spracheingaben
   - lateinische Sprachen besser unterscheiden
   - Query-Sprache weiterhin getrennt von Markt/Währung halten

3. Result-Mixer ausbauen
   - Produkt, Guide, Video, Vergleich und Local nicht nur sortieren, sondern sinnvoll mischen
   - konkrete Modellanfragen weiter produktzentriert halten

4. Affiliate-first ohne Informationsverlust
   - passende Affiliate-Angebote priorisieren
   - externe Treffer weiterhin als nützliche Ergänzung behalten

5. Worker-Deploy-Prozess verbessern
   - möglichst reproduzierbaren Cloudflare-Deploy vorbereiten

## Tagesfazit
Heute wurde aus dem bisherigen Produkt-Fallback eine deutlich allgemeinere Sucharchitektur. FundBlick kann jetzt als Basis für eine universelle, mehrsprachige Such- und Bedarfsschicht weiterentwickelt werden, ohne die Affiliate-Monetarisierung mit nicht vergüteten Webtreffern zu vermischen.
