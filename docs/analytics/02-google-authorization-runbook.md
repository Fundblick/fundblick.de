# Google Search Console – einmalige Autorisierung

Stand: 28.09.2026

## Zweck

Dieser Schritt wird erst ausgeführt, wenn der technische Collector auf `development` bereit ist. Ziel ist ausschließlich lesender Zugriff auf die Search-Console-Daten der Property `sc-domain:fundblick.de`.

## Sicherheitsmodell

- Scope ausschließlich `https://www.googleapis.com/auth/webmasters.readonly`.
- Kein Google-Passwort an FundBlick, GitHub oder Dritte weitergeben.
- `CLIENT_ID`, `CLIENT_SECRET` und `REFRESH_TOKEN` ausschließlich als GitHub Actions Secrets speichern.
- Keine Credentials in Issues, Commits, Logs, Screenshots oder Repository-Dateien einfügen.
- Der Workflow besitzt nur `contents: read` und veröffentlicht den Report nicht auf der Website.
- Der Report wird als privates Workflow-Artefakt mit begrenzter Aufbewahrung gespeichert.

## Einmalige Eigentümer-Schritte

1. In Google Cloud ein Projekt für FundBlick auswählen oder anlegen.
2. Search Console API für dieses Projekt aktivieren.
3. OAuth-Zustimmungsbildschirm konfigurieren.
4. OAuth-Client anlegen.
5. Einmalig mit dem Google-Konto autorisieren, das Zugriff auf `sc-domain:fundblick.de` besitzt, und dabei ausschließlich den Read-only-Scope freigeben.
6. Aus dem OAuth-Flow einen Refresh-Token erhalten.
7. In GitHub unter den Actions-Secrets setzen:
   - `SEARCH_CONSOLE_CLIENT_ID`
   - `SEARCH_CONSOLE_CLIENT_SECRET`
   - `SEARCH_CONSOLE_REFRESH_TOKEN`
8. Optional als Repository-Variable setzen: `SEARCH_CONSOLE_SITE_URL=sc-domain:fundblick.de`.
9. Workflow `Search Console report` einmal manuell starten und Ergebnis prüfen.

## Danach automatisch

Der tägliche Workflow erzeugt einen JSON-Report mit aggregierten KPIs, Tageswerten, Top-Suchanfragen, Top-Landingpages, Geräten und Ländern. Der Access-Token wird bei jedem Lauf aus dem geschützten Refresh-Token erneuert; ein kurzlebiger Access-Token muss nicht manuell gepflegt werden.

## Widerruf

Der Zugriff kann jederzeit im Google-Konto bzw. über die OAuth-Anwendungsberechtigungen widerrufen werden. Danach kann der Workflow keine Search-Console-Daten mehr abrufen.
