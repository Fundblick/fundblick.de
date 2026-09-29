# FundBlick – Desktop-Checkliste externe Suche

Diese Checkliste beginnt erst, wenn am Desktop gearbeitet wird. `main` bleibt bis zur ausdrücklichen Freigabe unangetastet.

## 1. Cloudflare Worker
- Worker `fundblick-search` öffnen bzw. anlegen.
- Inhalt von `cloudflare/brave-search-worker.js` aus Branch `development` als kanonischen Worker-Code verwenden.
- Keine API-Schlüssel in den Quelltext kopieren.

## 2. Worker-Konfiguration
Production Secret:
- Name exakt: `BRAVE_SEARCH_API_KEY`
- Wert: vorhandener Brave Search API Key

Variable:
- Name exakt: `ALLOWED_ORIGIN`
- Wert zunächst: `https://fundblick.de`

Falls die echte Development-Vorschau eine weitere Origin benötigt, diese erst nach Feststellung der tatsächlichen HTTPS-Origin kommasepariert ergänzen. Keine Wildcard-Origin verwenden.

## 3. Deploy und Health
Worker deployen.

Dann im Browser aufrufen:
`https://<worker-host>/health`

Erwartung:
```json
{"ok":true,"service":"fundblick-brave-search","keyConfigured":true}
```

Der Key selbst darf niemals in der Antwort erscheinen.

## 4. Direkter Suchtest
Aufrufen:
`https://<worker-host>/search?q=akkuschrauber&lang=de&country=DE`

Erwartung:
- HTTP 200;
- `query` ist `akkuschrauber`;
- `results` ist ein Array;
- Resultate enthalten nur normalisierte Felder wie `title`, `url`, `description`, `age`, `language`, `familyFriendly`;
- kein Brave-Key in Response oder URL.

Hinweis: Ein direkter Browseraufruf ohne `Origin` ist für Diagnose erlaubt. Der produktive Browserzugriff wird zusätzlich über CORS/Origin abgesichert.

## 5. Negativtests
- `/search?q=a` → HTTP 400 `invalid_query`;
- fremde Browser-Origin → HTTP 403 `origin_not_allowed`;
- unbekannter Pfad → HTTP 404;
- falsche HTTP-Methode → HTTP 405;
- `/health` zeigt nur `keyConfigured`, niemals das Secret.

## 6. FundBlick development aktivieren
Erst wenn 1–5 erfolgreich sind:
- realen HTTPS-Worker-Endpunkt in `search.html` als `data-external-search-endpoint` eintragen;
- `data-external-search-enabled="true"` setzen;
- CI-Gate bewusst an den aktivierten Zustand anpassen;
- nur `development`, noch nicht `main`.

## 7. E2E-Test
Mindestens drei Fälle:
1. Suchbegriff mit eigenem FundBlick-Treffer → eigene Ergebnisse, kein externer Fallback.
2. Suchbegriff ohne eigenen Treffer → externer Abschnitt erscheint.
3. Brave/Worker nicht erreichbar → FundBlick bleibt funktionsfähig und zeigt nur den sauberen Fehlerzustand des externen Abschnitts.

Zusätzlich prüfen:
- gleiche Query in derselben Sitzung verursacht keinen unnötigen zweiten externen Request;
- Filter/Sortierung löst keinen unnötigen Brave-Request aus;
- externe Links öffnen sicher;
- keine Preise/Rabatte/Affiliate-Zuordnungen werden für Webtreffer erfunden;
- Darstellung auf Desktop und Smartphone.

## 8. Vor Livefreigabe
- Datenschutztext mit der tatsächlich aktiven Verarbeitung abgleichen;
- Nachfrageanalyse weiterhin separat behandeln und nicht automatisch mit Brave-Aktivierung einschalten;
- alle CI-/Regressionstests grün;
- erst danach Entscheidung über Merge Richtung `main`.
