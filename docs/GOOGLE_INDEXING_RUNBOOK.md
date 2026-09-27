# FundBlick – Google Indexing Runbook

Stand: 2026-09-27

## Ziel

FundBlick soll Google eine kleine, kontrollierte Menge hochwertiger, kanonischer und tatsächlich indexierbarer URLs anbieten. Interne Suchparameter und Utility-Seiten bleiben bewusst außerhalb des Index.

## Technischer Vertrag

- `robots.txt` erlaubt Crawling und verweist auf `https://fundblick.de/sitemap.xml`.
- Die Sitemap wird ausschließlich im Produktionsbuild aus dem SEO-Landing-Manifest erzeugt.
- Es gibt keine zweite statische Sitemap-Quelle im Repository.
- Startseite: `index,follow` + Canonical `https://fundblick.de/`.
- Themen-Landingpages: `index,follow` + eigene kanonische HTTPS-URL.
- `search.html`: `noindex,follow`, damit Such- und Filterparameter keinen Index-Spam erzeugen.
- `404.html`: `noindex`.
- `verify-google-indexability.js` prüft diese Regeln automatisiert.
- Der Production-Deploy führt den Indexability-Gate vor dem Packaging aus.

## Aktuell erwartete Sitemap-URLs

1. `https://fundblick.de/`
2. `https://fundblick.de/themen/wohnen/`
3. `https://fundblick.de/themen/moebel/`
4. `https://fundblick.de/themen/beleuchtung/`
5. `https://fundblick.de/themen/dekoration/`
6. `https://fundblick.de/themen/pferd-reitsport/`
7. `https://fundblick.de/themen/pferde-ergaenzungsfutter/`

Die Liste darf sich künftig nur über die datengetriebene SEO-Landing-Konfiguration ändern und muss den Qualitätsgrenzwert des Builders erfüllen.

## Search Console – nach produktivem Deploy

### 1. Sitemap prüfen und einreichen

Search Console → Sitemaps → `https://fundblick.de/sitemap.xml` einreichen bzw. bestehenden Eintrag prüfen.

Erwartung:
- Sitemap abrufbar
- Status erfolgreich
- sieben aktuell eingereichte Content-URLs

### 2. URL-Prüfung

Zuerst diese URLs prüfen:
- Startseite
- jede der sechs Themen-Landingpages

Für jede URL:
- Indexierungsstatus ansehen
- Live-URL testen
- prüfen, ob Crawling erlaubt ist
- prüfen, ob Google die erwartete Canonical-URL erkennt
- falls URL noch nicht indexiert ist und der Live-Test erfolgreich ist: Indexierung beantragen

### 3. Seitenindexierung beobachten

Im Bericht „Seiten“ insbesondere unterscheiden zwischen:
- indexiert
- URL ist Google nicht bekannt
- gefunden, derzeit nicht indexiert
- gecrawlt, derzeit nicht indexiert
- Duplikat / andere Canonical ausgewählt
- durch `noindex` ausgeschlossen

`search.html` und ihre Parameter sollen wegen `noindex,follow` nicht als normale Content-Seiten indexiert werden.

### 4. Keine künstliche Massenindexierung

Für normale FundBlick-Seiten wird keine allgemeine Google Indexing API verwendet. Neue Content-URLs werden über interne Links, Sitemap und bei Bedarf einzelne URL-Prüfungen bekannt gemacht.

## Freigaberegel für neue Händler

Ein neuer Händler darf zusätzliche SEO-Landingpages nur erzeugen, wenn:
- genügend echte Produkte bzw. Produktgruppen vorhanden sind,
- die Seite einen stabilen kanonischen Themen-/Kategoriebezug hat,
- sie nicht nur eine dünne Händler- oder Filterseite ist,
- sie vom bestehenden Sitemap-/Indexability-Gate erfasst wird.

Das Händler-Onboarding selbst darf nicht automatisch hunderte oder tausende Suchparameter-URLs in den Google-Index drücken.
