# Websuche: technischer Datenschutz-Prüfstand, 30.09.2026

Arbeitsbranch development. Kein Deployment, keine Änderung an Live-Datenschutzerklärung oder Worker-Konfiguration. Die folgenden Befunde sind technische Nachweise und offene Freigabepunkte; keine abschließende rechtliche Bewertung.

## Nachgewiesener Datenfluss

1. Eigene Katalogsuche ohne Suchprovider-Anfrage. Websuche nur nach ausdrücklicher Aktivierung; `web=1` erhält diesen Zustand in der Suchadresse. Keine Cookie-Einwilligung oder rechtliche Rechtsgrundlage aus diesem technischen Opt-in ableiten.
2. Browser sendet GET `/search` an den vorhandenen Cloudflare Worker: gegebenenfalls produktspezifisch ergänzter Suchtext, Sprache, Land, Anzahl und Offset. Cloudflare erhält dabei die Browseranfrage einschließlich der IP-Adresse. `credentials:omit` und `referrerPolicy:no-referrer` unterdrücken Cookies und Referrer für diesen Client-Abruf.
3. Worker setzt eine neue Anfrage an Brave auf, mit Suchparametern und eigenen API-Headern. Im Repository-Code kein Weiterreichen von Besucher-IP-/Cookie-Headern und kein explizites Query-Logging. API-Schlüssel nur serverseitig; Health zeigt lediglich, ob er konfiguriert ist. Daraus folgt keine Aussage über tatsächlich aktivierte Cloudflare-Protokollierung.
4. Client hält erfolgreiche Antworten und laufende Anfragen im Speicher der geöffneten Seite. Keine persistente Speicherung durch diese Maps. Cache-Schlüssel jetzt zusätzlich an die Suchdienst-Origin gebunden: ein Wechsel des Dienstes kann keine Antwort des alten Dienstes übernehmen. Seiten-/Browser-/Host-Historie und Hosting-Logs sind damit nicht ausgeschlossen.
5. Ergebnisbilder werden von externen Hosts geladen, ohne Referrer; diese Hosts sehen trotzdem die Abruf-IP. Ergebnislinks öffnen externe Händler/Quellen mit `noopener noreferrer`.

Quellen im Code: `external-search-client.js`, `external-search-runtime.js`, `external-search-ui.js`, `cloudflare/brave-search-worker.js`. Worker-Deploymentstand und Kontoeinstellungen sind nicht vollständig aus dem Repository beweisbar.

## Primärquellen und Gegenprüfung

[Brave API Privacy Notice](https://api-dashboard.search.brave.com/app/documentation/general/privacy-policy), aktualisiert 25.08.2026: grundsätzlich bis zu 90 Tage Query-Aufbewahrung, ZDR als Enterprise-Option. Kundenseitige Datenschutzhinweise bleiben erforderlich. Für FundBlick fehlen Tarif-/Vertragsnachweise; daher keine Behauptung „keine Speicherung“ oder „ZDR aktiv“. Braves eigene rechtliche Einordnung der Queries ersetzt keine Prüfung für FundBlick.

[Cloudflare Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/): Invocation Logs können die Anfrage-URL erfassen; aktuelle Dokumentation nennt planabhängige Aufbewahrung und Konfigurationsmöglichkeiten. Auch ohne `console.log` ist Protokollierung möglich. Tatsächliche FundBlick-Einstellungen, Logpush/Tail/Exporte und Retention sind nicht nachgewiesen. Kein automatisches Abschalten des vorhandenen Workers oder seiner Logs im Rahmen dieser Arbeit.

## Development-Änderung

Vor dem Web-Button steht nun ein knapper Hinweis zu Cloudflare/Brave und externen Bildern. Link führt zum konkret ergänzten Abschnitt in `datenschutz-preview.html#websuche`. Der Abschnitt nennt technischen Stand und verbleibende Prüfungen ausdrücklich. Bestehende öffentliche `datenschutz.html` und ihre Übersetzungen unverändert; vollständige Freigabe und alle Sprachfassungen bleiben offen.

Alternativen: Ein versteckter Techniktext allein im Repository informiert Nutzer nicht rechtzeitig. Ein neues Consent-Popup wäre ohne geklärte Rechtsgrundlage vorschnell und widerspräche dem Ziel ohne unnötige Pop-ups. Gewählt: verständlicher Hinweis unmittelbar bei der bestehenden ausdrücklichen Aktion plus prüfbarer Development-Text, ohne rechtliche Freigabe zu behaupten.

## Noch erforderlich vor öffentlicher Freigabe

- Kontotarif, Query-Retention/ZDR und Vertragsbedingungen von Brave belegen.
- Cloudflare-Betrieb, Protokollierung, Exporte, Löschung und internationale Verarbeitung belegen.
- Rollen, Rechtsgrundlage, Verträge und Übermittlungsgrundlagen verbindlich prüfen; technische Aktivierung ist kein Ersatz.
- Endgültige Datenschutzerklärung und erforderliche Sprachfassungen konsolidieren, einschließlich externer Bilder und Händlerlinks.
- Öffentlichen Development-Host, CORS und Zugangsschutz getrennt von Live festlegen und real im Browser abnehmen.

Kosten: keine neuen Dienste oder Suchprovider-Aufrufe für diese Prüfung. Lokale Cache-Gegenprobe mit kontrollierten Antworten bestanden; Browserprüfung des vor dem ersten Abruf sichtbaren Hinweises nach Commit in CI zu kontrollieren.

## Fortschreibung für den ausdrücklich autorisierten Release

Jens hat main/Live nun ausdrücklich freigegeben. Öffentliche datenschutz.html enthält den nachgewiesenen Web-Datenfluss und DE/RU-Hinweise; keine Nullspeicherung, kein bestätigter ZDR-Tarif und keine abgeschlossene Rechtsprüfung werden zugesagt. Der vor Aktivierung sichtbare Link führt auf den öffentlichen Abschnitt #websuche. Diese technische Text-/Linkkorrektur ist erledigt. Die oben genannten Nachweise zu Kontotarif, Logs, Rechtsgrundlage, Rollen und Übermittlung sind weiterhin nicht verfügbar und dürfen nicht als erledigt markiert werden. Live-CORS ist technisch geprüft, die echte öffentliche Browser-Abnahme folgt erst nach einem tatsächlichen Deployment.

### Entscheidung nach Rückmeldung von Jens

Die Konto-/Tarifdetails sind Jens nicht bekannt. Ein besonderer ZDR-Tarif ist für eine vorsichtige technische Beschreibung nicht erforderlich; es wird deshalb die veröffentlichte Brave-Obergrenze von 90 Tagen genannt und Cloudflare-Protokollierung nicht ausgeschlossen. Die frühere pauschale Vorab-Anforderung aller Kontonachweise wird als interner Prüfplan fortgeführt, ohne diese Angaben als erledigt zu behaupten. Keine neue Vertragsannahme, keine Account-/Logänderung und keine Aussage juristischer Gesamtfreigabe. Öffentlicher Text bleibt bei belegten technischen Fakten. Jens' ausdrücklicher Merge-/Live-Auftrag gilt; offene betriebliche/rechtliche Nachweise bleiben dokumentiert.
