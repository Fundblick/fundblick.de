# FundBlick – Arbeitsplan externe Suche

Stand: 29.09.2026
Branch: `development`
Produktivstand: `main` bleibt unangetastet, bis der komplette Such-Fallback geprüft und ausdrücklich freigegeben ist.

## Ziel

FundBlick soll einen Nutzer auch dann nicht mit einer leeren Ergebnisliste stehen lassen, wenn der eigene Händlerkatalog für eine freie Suchanfrage keine brauchbaren Treffer enthält.

Priorität bleibt immer:

1. Eigene, normalisierte FundBlick-Händlerangebote durchsuchen.
2. Eigene brauchbare Treffer prominent anzeigen.
3. Nur wenn der eigene Katalog keine ausreichenden Treffer liefert, eine externe Websuche als Fallback anfragen.
4. Externe Treffer klar von FundBlick-Händlerangeboten trennen und nicht als eigene Händler-/Affiliate-Angebote ausgeben.
5. Suchnachfrage anonymisiert/aggregiert erfassbar machen, damit häufig fehlende Produkte, Kategorien und Händler später gezielt ergänzt werden können.

## Gewählter externer Provider

Aktueller Weg: Brave Search API über einen serverseitigen Cloudflare Worker `fundblick-search`.

Der Browser darf den Brave API Key niemals erhalten. `BRAVE_SEARCH_API_KEY` liegt ausschließlich als Cloudflare Production Secret. Der Worker-Code im Repository ist die kanonische Implementierung; ein manueller Mobile-Editor-Versuch wurde wegen beschädigtem Clipboard/Paste abgebrochen und darf nicht als Release-Stand betrachtet werden.

## Fallback-Entscheidung

Die Entscheidung muss zentral erfolgen und darf nicht pro Kategorie dupliziert werden.

Vorgesehene Regeln:

- Leere/ungültige Suchbegriffe lösen keine externe Anfrage aus.
- Eigene Treffer werden zuerst berechnet.
- Externe Suche wird zunächst nur bei `0` brauchbaren eigenen Treffern ausgelöst.
- Die Architektur soll später einen konfigurierbaren Mindestschwellwert erlauben, ohne die Suchansichten einzeln umzubauen.
- Filter- oder Sortieränderungen dürfen nicht jeweils neue externe API-Aufrufe auslösen.
- Gleiche Suchanfrage innerhalb einer laufenden Seitensitzung soll nicht unnötig mehrfach extern angefragt werden.
- Timeout oder Providerfehler darf die lokalen FundBlick-Ergebnisse niemals beschädigen.

## Ergebnisdarstellung

Eigene und externe Treffer bleiben zwei unterschiedliche Datenklassen.

Eigene FundBlick-Angebote:

- vorhandene Händlerdaten, Preise, Verfügbarkeit, Versandinformationen und Affiliate-/Tracking-Regeln wie bisher;
- bestehende Facetten, Sortierung und Produktkarten bleiben maßgeblich.

Externe Webtreffer:

- eigener Abschnitt unterhalb der FundBlick-Ergebnisse;
- sichtbare Kennzeichnung als Ergebnisse aus dem Web;
- keine erfundenen Preise, Verfügbarkeiten, Rabatte, Händlerzuordnungen oder Affiliate-Parameter;
- externe URL nur aus der Providerantwort verwenden;
- Links sicher mit `target="_blank"` und `rel="noopener noreferrer"`; `sponsored` nur wenn fachlich/rechtlich tatsächlich zutreffend;
- keine externen Suchresultate dauerhaft als Produktdatenbank speichern.

## Datenschutz und Nachfrageanalyse

Ziel der Nachfrageanalyse ist Produkt-/Sortimentsplanung, nicht Nutzerprofiling.

Zu erfassen ist nur das für die Sortimentsanalyse erforderliche Minimum, vorzugsweise aggregiert:

- normalisierter Suchbegriff;
- Anzahl/Suchhäufigkeit;
- Zeitpunkt in grober Form;
- Anzahl eigener Treffer;
- ob der externe Fallback benötigt wurde.

Nicht vorgesehen:

- Brave API Key im Client oder Repository;
- IP-Adressen in einer FundBlick-Suchstatistik;
- personenbezogene Profile;
- dauerhafte Speicherung kompletter Brave-Ergebnislisten;
- Weitergabe unnötiger FundBlick-Nutzerdaten an den Suchprovider.

Vor produktiver Aktivierung müssen Datenschutzhinweise und tatsächliche technische Datenerhebung übereinstimmen.

## Kosten- und Missbrauchsschutz

- Externe Suche nur bei echtem Fallback-Bedarf.
- Eingabelänge begrenzen und normalisieren.
- Serverseitige Rate-/Abuse-Schutzstrategie vor Livebetrieb prüfen.
- Providerfehler und HTTP 429 sauber behandeln.
- Keine automatische Wiederholungsschleife bei Providerfehlern.
- Das beim Provider eingerichtete Kostenlimit bleibt zusätzliche Sicherung, ersetzt aber keinen technischen Request-Schutz.

## Technische Arbeit ohne Cloudflare-Dashboard

Folgende Punkte können im Repository autonom vorbereitet werden:

1. zentrale Fallback-Policy als eigenständiges Modul;
2. Provider-unabhängiger Client-Vertrag für externe Suchergebnisse;
3. DOM-/UI-Container für klar getrennte Webtreffer;
4. Lade-, Leer-, Timeout- und Fehlerzustände;
5. Session-Deduplizierung gleicher externer Queries;
6. Query-Normalisierung;
7. sichere Linkattribute;
8. Tests, dass lokale Treffer niemals durch externe Fehler verschwinden;
9. Tests, dass bei lokalen Treffern keine externe Anfrage erfolgt;
10. Tests gegen erfundene Preis-/Affiliate-Daten;
11. Dokumentation der späteren Suchnachfrage-Erfassung.

## Desktop-Gate

Manuell erst am Desktop:

1. Cloudflare Worker `fundblick-search` öffnen.
2. kanonischen Repository-Code sauber deployen;
3. `/health` prüfen, ohne Secret offenzulegen;
4. echte `/search`-Anfrage gegen Brave testen;
5. CORS und Fehlerstatus prüfen;
6. erst danach den realen Worker-Endpunkt in `development` aktivieren;
7. vollständige Regressionstests durchführen;
8. erst nach ausdrücklicher Freigabe Übergang Richtung `main`.

## Release-Gates

Vor einer Livefreigabe müssen mindestens gelten:

- kein Secret in HTML/JS/GitHub;
- eigene Treffer funktionieren unverändert;
- Fallback nur gemäß zentraler Policy;
- externe Treffer eindeutig gekennzeichnet;
- keine erfundenen Produkt-/Affiliate-Daten;
- Fehler/Timeout/429 degradieren sauber;
- Mobile-Ansicht geprüft;
- Datenschutztext entspricht der realen Verarbeitung;
- Kosten-/Missbrauchsschutz geprüft;
- Regressionstests grün;
- `main` wurde bis zur Freigabe nicht verändert.
