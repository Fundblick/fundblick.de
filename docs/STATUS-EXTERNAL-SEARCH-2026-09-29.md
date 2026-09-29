# FundBlick – Statusbericht externe Suche / Suchfeldeingabe

**Stichtag:** 29.09.2026  
**Arbeitsbranch:** `development`  
**Produktivbranch:** `main` unverändert  
**Status:** Vorbereitung abgeschlossen; nächster Arbeitsblock am Desktop / Cloudflare.  
**Letzter geprüfter Search-Stand:** Commit `b7588c74886366e51531f7ee7b9c58546f521483`  
**CI:** External search safety gate = SUCCESS; Development V2 integrity = SUCCESS.

## 1. Zielbild

Ein Nutzer soll bei einer freien Suchfeldeingabe nicht mit einer leeren Seite enden, nur weil FundBlick selbst den gesuchten Artikel noch nicht im angebundenen Händlerkatalog führt.

Die verbindliche Reihenfolge lautet:

1. FundBlick durchsucht zuerst ausschließlich die eigenen Händler-/Produktdaten.
2. Eigene brauchbare Treffer haben immer Vorrang.
3. Nur bei **0 eigenen brauchbaren Treffern** darf die externe Websuche verwendet werden.
4. Externe Treffer werden klar von FundBlick-Händlerangeboten getrennt.
5. Externe Treffer erhalten keine erfundenen Preise, Rabatte oder Affiliate-Zuordnungen.
6. Später soll die Nachfrage datensparsam ausgewertet werden, damit häufig gesuchte Sortimentslücken erkennbar werden.

## 2. Gewählte Architektur

Externer Provider: **Brave Search API**.  
Zwischenschicht: **Cloudflare Worker `fundblick-search`**.

Der Browser bekommt den Brave API Key niemals. FundBlick ruft den eigenen Worker auf; nur der Worker kommuniziert mit Brave. Der Key wird später ausschließlich als Cloudflare Production Secret `BRAVE_SEARCH_API_KEY` hinterlegt. Die erlaubte Website-Origin wird über `ALLOWED_ORIGIN` begrenzt.

Der kanonische Worker-Code liegt in:

`cloudflare/brave-search-worker.js`

## 3. Fertiggestellte Suchlogik

- zentrale External-Search-Fallback-Policy vorhanden;
- Suchbegriffe werden normalisiert und Steuerzeichen/unnötige Leerzeichen bereinigt;
- externe Query-Grenze einheitlich **2 bis 120 Zeichen**;
- diese Grenze wird redundant in Policy, Client und Worker erzwungen;
- ungültige bzw. Ein-Zeichen-Anfragen erzeugen clientseitig **keinen Netzwerkaufruf**;
- externe Suche nur bei 0 sichtbaren eigenen FundBlick-Treffern;
- FundBlick wartet zuerst den Abschluss der lokalen Suche ab;
- hierfür existiert ein expliziter `fundblick:search-rendered`-Signalweg;
- ein zusätzlicher Kompatibilitätsmechanismus beobachtet den lokalen Summary-Zustand;
- beim bloßen Laden der Suchseite wird keine Brave-Anfrage erzeugt;
- taucht während einer laufenden externen Anfrage doch ein lokaler Treffer auf, wird die externe Antwort verworfen;
- lokale Ergebnisänderungen invalidieren veraltete externe Darstellungen;
- gleiche Suchanfrage wird innerhalb der Sitzung gecacht;
- parallele identische Requests werden zusammengeführt;
- Filter-/Sortierbewegungen sollen keine unnötigen Brave-Aufrufe erzeugen.

## 4. Externe Ergebnisdarstellung

Vorbereitet sind:

- eigener, klar getrennter Web-Ergebnisbereich;
- Ladezustand;
- Leerzustand;
- Fehlerzustand;
- Titel, Beschreibung und Ziel-URL;
- nur `http`/`https` als zulässige Ergebnislinks;
- externe Links mit `target="_blank"` und `rel="noopener noreferrer"`;
- ungültige URLs werden verworfen;
- bei ausschließlich unbrauchbaren externen URLs entsteht keine irreführende leere Trefferhülle;
- keine Übernahme nicht vertrauenswürdiger Preis-/Affiliate-Felder aus externen Daten;
- UI-Texte für die 20 vorgesehenen FundBlick-Sprachen vorbereitet.

## 5. Worker / Sicherheit / Kostenkontrolle

Der vorbereitete Worker enthält:

- `/health`-Endpunkt;
- `/search`-Endpunkt;
- serverseitige Origin-Prüfung;
- restriktives CORS ohne Wildcard-Origin;
- GET/OPTIONS-Begrenzung;
- SafeSearch `moderate`;
- Filter für Ergebnisse mit `family_friendly=false`;
- maximale Ergebniszahl serverseitig begrenzt;
- Query-Längenbegrenzung;
- keine automatische Retry-Schleife;
- Brave 429 wird als 429 weitergegeben;
- Provider-/Netzwerk-/JSON-Fehler degradieren kontrolliert;
- API-Key wird ausschließlich im `X-Subscription-Token` zum Brave-Upstream verwendet;
- API-Key wird niemals in der FundBlick-Antwort ausgegeben;
- `Cache-Control: no-store`;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: no-referrer`;
- restriktive Content-Security-Policy;
- `X-Frame-Options: DENY`;
- Permissions-Policy;
- CORS-Preflight-Cache begrenzt;
- `/health` unterliegt ebenfalls der Origin-Regel, wenn ein Browser-Origin gesendet wird.

Zusätzlich bleibt das beim Brave-Konto gesetzte Provider-Kostenlimit eine externe Sicherung. Ein weitergehendes serverseitiges Rate-Limit wird erst nach realem Cloudflare-Deployment anhand der dort tatsächlich verfügbaren Konfiguration entschieden.

## 6. Automatische Tests und Gates

Vorhanden bzw. abgesichert sind:

- JavaScript-Syntaxprüfungen;
- External-Search-Policy-Test;
- Client-Test;
- Übersetzungstest;
- Brave-Worker-Contract-Test;
- Test der Query-Grenzen;
- expliziter Nachweis: ungültige/Ein-Zeichen-Queries = 0 Netzwerkrequests;
- HTTPS-only Worker-Endpunkt;
- Session-Cache-Test;
- 429-Test;
- Worker-Origin/CORS-Tests;
- Worker-Security-Header-Tests;
- `/health`-Origin-Test;
- SafeSearch-/Ergebnislimit-/Family-Friendly-Tests;
- Secret darf nicht in Worker-Antwort erscheinen;
- CI-Scan gegen versehentlich committed Brave-Secrets;
- Prüfung, dass der lokale Completion-Signalweg vor der External Runtime eingebunden ist;
- Prüfung, dass die Nachfrageanalyse noch nicht produktiv geladen wird;
- Prüfung, dass External Search weiterhin bewusst deaktiviert bleibt.

**Verifizierter CI-Stand am 29.09.2026:**

- `External search safety gate` – Run 19 – **SUCCESS** – Commit `b7588c7`;
- `Development V2 integrity` – Run 343 – **SUCCESS** – Commit `b7588c7`.

Damit ist der letzte vorbereitete Search-/Worker-Stand aktuell grün.

## 7. Suchnachfrage / spätere Sortimentsanalyse

Der Datenvertrag ist vorbereitet, aber **noch nicht aktiviert**.

Vorgesehen sind nur:

- normalisierter Suchbegriff;
- grober Kalendertag;
- Anzahl eigener FundBlick-Treffer;
- externer Fallback ja/nein;
- aggregierte Häufigkeit gleicher Suchanfragen.

Nicht vorgesehen sind:

- IP-Adressen in der FundBlick-Suchstatistik;
- User-Agent-Profiling;
- personenbezogene Suchprofile;
- dauerhafte Speicherung kompletter Brave-Ergebnislisten.

Zweck ist Sortimentsplanung: Wir wollen erkennen, welche Begriffe häufig gesucht werden und für welche Nachfrage FundBlick noch keine eigenen Händlerprodukte besitzt.

Die Aktivierung der Nachfrageanalyse bleibt bewusst vom Brave-Fallback getrennt und erfordert vorher den finalen Datenschutzabgleich.

## 8. Bewusst NICHT aktiviert

Zum Stichtag gilt weiterhin:

- `data-external-search-enabled="false"`;
- noch kein realer Worker-Endpunkt in der produktiven Suchkonfiguration;
- Nachfrageanalyse nicht in `search.html` geladen;
- Brave API Key nicht im Repository/Frontend;
- kein Merge dieses Arbeitsblocks nach `main`;
- keine Live-Aktivierung.

Diese OFF-Gates sind beabsichtigt und werden durch CI geschützt.

## 9. Nächster Arbeitsblock am Desktop

Die Reihenfolge ist festgelegt:

1. Cloudflare Worker `fundblick-search` öffnen bzw. anlegen.
2. `cloudflare/brave-search-worker.js` aus `development` verwenden.
3. Production Secret exakt `BRAVE_SEARCH_API_KEY` setzen.
4. Variable `ALLOWED_ORIGIN=https://fundblick.de` setzen; weitere Origin nur bei nachgewiesenem Bedarf ergänzen, keine Wildcard.
5. Worker deployen.
6. `/health` testen; Erwartung `ok=true` und `keyConfigured=true`, niemals Ausgabe des Keys.
7. echte `/search?q=akkuschrauber&lang=de&country=DE`-Anfrage prüfen.
8. Negativtests durchführen: Ein-Zeichen-Query, fremde Origin, unbekannter Pfad, falsche HTTP-Methode.
9. erst nach erfolgreichem Worker-Test den realen HTTPS-Endpunkt in `development/search.html` eintragen.
10. `data-external-search-enabled="true"` ausschließlich in `development` aktivieren und CI-Gate bewusst anpassen.
11. E2E: eigener Treffer → kein Fallback.
12. E2E: 0 eigene Treffer → Web-Ergebnisse erscheinen.
13. E2E: Worker/Brave-Ausfall → lokale FundBlick-Suche bleibt intakt.
14. Session-Deduplizierung sowie Filter-/Sortierverhalten real prüfen.
15. externe Links und Ergebnisdarstellung auf Desktop und Smartphone prüfen.
16. Datenschutztext gegen die tatsächlich aktivierte Verarbeitung abgleichen.
17. komplette Regression und CI durchführen.
18. erst nach ausdrücklicher Freigabe Entscheidung über Merge Richtung `main`.

## 10. Release-Gates vor `main`

Ein Übergang Richtung Live darf erst erfolgen, wenn alle folgenden Punkte erfüllt sind:

- realer Worker funktioniert;
- Secret bleibt serverseitig;
- Origin/CORS korrekt;
- echte Brave-Suche funktioniert;
- eigener Treffer verhindert Brave-Fallback;
- 0-Treffer-Fallback funktioniert;
- Fehler/Timeout/429 beschädigen FundBlick nicht;
- externe Ergebnisse eindeutig gekennzeichnet;
- keine erfundenen Preise/Rabatte/Affiliate-Daten;
- Smartphone und Desktop geprüft;
- Datenschutz entspricht der realen Verarbeitung;
- Kosten-/Missbrauchsschutz geprüft;
- Regression/CI vollständig grün;
- bewusste Freigabe für `main` erfolgt.

## 11. Relevante Dokumentation

- `docs/EXTERNAL-SEARCH-WORKPLAN-2026-09-29.md` – technischer Arbeitsplan und Status der Einzelpunkte;
- `docs/EXTERNAL-SEARCH-DESKTOP-CHECKLIST.md` – konkrete Desktop-/Cloudflare-Schrittfolge;
- `docs/STATUS-EXTERNAL-SEARCH-2026-09-29.md` – dieser konsolidierte Statusbericht.

## 12. Übergabestatus

**Handy-/Vorbereitungsphase: abgeschlossen.**  
**Nächster sinnvoller Einstieg: Desktop, Cloudflare Worker Deployment.**  
**Kein weiterer manueller Schritt am Smartphone erforderlich.**
