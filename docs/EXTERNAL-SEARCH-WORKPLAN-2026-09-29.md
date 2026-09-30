# FundBlick – Arbeitsplan externe Suche

Stand: 29.09.2026
Branch: `development`
Produktivstand: `main` bleibt unangetastet, bis der komplette Such-Fallback geprüft und ausdrücklich freigegeben ist.

## Ziel
FundBlick soll Nutzer auch dann nicht mit einer leeren Ergebnisliste stehen lassen, wenn der eigene Händlerkatalog für eine freie Suchanfrage keine brauchbaren Treffer enthält.

Priorität:
1. eigene normalisierte FundBlick-Händlerangebote;
2. eigene brauchbare Treffer prominent anzeigen;
3. nur bei 0 brauchbaren eigenen Treffern externe Websuche;
4. externe Treffer klar getrennt und niemals als eigene Affiliate-Angebote darstellen;
5. Suchnachfrage später datensparsam aggregieren.

## Gewählter Weg
Brave Search API über serverseitigen Cloudflare Worker `fundblick-search`. Der Brave-Key darf niemals in Browser oder Repository gelangen. `BRAVE_SEARCH_API_KEY` wird ausschließlich als Worker-Secret gesetzt. Der Repository-Worker ist die kanonische Implementierung.

## Abgehakt im Repository
- [x] zentrale Fallback-Policy;
- [x] Query-Normalisierung und einheitliche Grenze 2–120 Zeichen;
- [x] externe Suche nur bei 0 sichtbaren eigenen Treffern;
- [x] lokaler Suchabschluss wird vor Fallback abgewartet;
- [x] laufende externe Antwort wird verworfen, falls inzwischen eigene Treffer vorhanden sind;
- [x] Session-Deduplizierung identischer Queries;
- [x] parallele identische Requests werden zusammengeführt;
- [x] HTTPS-only Worker-Endpunkt im Client;
- [x] Client sendet keine Credentials und keinen Referrer;
- [x] externe Ergebnisse als getrennte Datenklasse;
- [x] keine Übernahme erfundener Preise/Affiliate-Felder;
- [x] nur HTTP(S)-Ergebnislinks;
- [x] `target=_blank` plus `noopener noreferrer`;
- [x] Lade-, Leer- und Fehlerzustände;
- [x] UI-Texte für alle 20 FundBlick-Sprachen;
- [x] Worker `/health`;
- [x] Worker-Origin/CORS-Schutz;
- [x] SafeSearch moderate und Family-Friendly-Filter;
- [x] Providerfehler, Netzwerkfehler, ungültiges JSON und 429 sauber behandelt;
- [x] keine automatische Retry-Schleife;
- [x] maximale Ergebniszahl serverseitig begrenzt;
- [x] Secret-Leak-Gate in CI;
- [x] Worker-Contract-Test;
- [x] Query-Policy-, Client- und Übersetzungstests;
- [x] expliziter Test: ungültige/1-Zeichen-Queries erzeugen 0 Netzwerkaufrufe;
- [x] Nachfrageanalyse-Datenvertrag vorbereitet: Query, grober Tag, lokale Treffer, Fallback ja/nein;
- [x] Nachfrageanalyse enthält keine IP/User-Agent/Profile;
- [x] Nachfrageanalyse ist noch NICHT produktiv eingebunden;
- [x] Brave-Fallback ist in `search.html` weiterhin hart deaktiviert;
- [x] CI erzwingt beide OFF-Gates bis zur bewussten Aktivierung.

## Bewusst noch offen
- [ ] Cloudflare Worker am Desktop aus dem kanonischen Repository-Code deployen;
- [ ] `BRAVE_SEARCH_API_KEY` als Cloudflare Production Secret setzen;
- [ ] `ALLOWED_ORIGIN` passend konfigurieren;
- [ ] `/health` am realen Worker prüfen;
- [ ] echte `/search`-Anfrage gegen Brave prüfen;
- [ ] reales 0-Treffer-E2E FundBlick → Worker → Brave → UI testen;
- [ ] Mobile-Darstellung mit echten externen Treffern prüfen;
- [ ] Datenschutztext gegen die tatsächlich aktivierte Verarbeitung abgleichen;
- [ ] erst danach Worker-Endpunkt in `development` eintragen und External-Search-Gate aktivieren;
- [ ] vollständige Regression durchführen;
- [ ] erst nach ausdrücklicher Freigabe Richtung `main` gehen.

## Fallback-Regeln
- Eigene Treffer werden zuerst berechnet.
- Externe Suche zunächst ausschließlich bei `0` eigenen brauchbaren Treffern.
- Filter-/Sortieränderungen dürfen nicht unnötig neue externe API-Aufrufe erzeugen.
- Gleiche Anfrage innerhalb der Sitzung wird nicht unnötig mehrfach extern angefragt.
- Timeout oder Providerfehler beschädigt niemals lokale Ergebnisse.
- Externe Ergebnisse werden nicht dauerhaft als Produktdatenbank gespeichert.

## Datenschutz / Nachfrageanalyse
Zweck ist Sortimentsplanung, nicht Nutzerprofiling. Vorgesehen sind nur normalisierter Suchbegriff, aggregierte Häufigkeit, grober Tag, Anzahl eigener Treffer und Fallback ja/nein. Nicht vorgesehen sind FundBlick-Suchstatistik mit IP-Adressen, User-Agent-Profiling, personenbezogene Profile oder dauerhafte Brave-Ergebnislisten. Vor Aktivierung müssen Datenschutzhinweise und tatsächliche technische Verarbeitung übereinstimmen.

## Kosten- und Missbrauchsschutz
Fallback nur bei echtem Bedarf; Query-Limits; serverseitige Origin-Prüfung; begrenzte Ergebniszahl; keine Retry-Schleife; 429 wird weitergereicht; Provider-Kostenlimit bleibt zusätzliche Sicherung. Eine weitergehende serverseitige Rate-Limit-Strategie kann erst sinnvoll am real deployten Worker gegen die tatsächlich verfügbare Cloudflare-Konfiguration geprüft werden.

## Desktop-Gate
1. Cloudflare Worker `fundblick-search` öffnen.
2. kanonischen Repository-Code deployen.
3. Secret und erlaubte Origin setzen.
4. `/health` prüfen, ohne Secret offenzulegen.
5. echte `/search`-Anfrage testen.
6. CORS und Fehlerstatus prüfen.
7. realen Worker-Endpunkt in `development` eintragen und Fallback aktivieren.
8. E2E/Regression/Mobile prüfen.
9. Datenschutz final abgleichen.
10. erst nach ausdrücklicher Freigabe Übergang Richtung `main`.

## Release-Gates
Kein Secret in HTML/JS/GitHub; eigene Treffer unverändert; Fallback nur gemäß Policy; externe Treffer eindeutig gekennzeichnet; keine erfundenen Produkt-/Affiliate-Daten; Fehler/Timeout/429 degradieren sauber; Mobile geprüft; Datenschutz entspricht realer Verarbeitung; Kosten-/Missbrauchsschutz geprüft; Regression grün; `main` bis zur Freigabe unverändert.
