# Nächster Arbeitsblock – Messbarkeit, Search Console und Affiliate-Funnel

Stand: 28.09.2026
Status: **Nächster priorisierter Arbeitsblock nach erfolgreichem ANTHBOT-Produktionsrelease**

## Ausgangslage

ANTHBOT wurde erfolgreich produktiv veröffentlicht. Der nächste Schwerpunkt ist nicht sofort Händler Nr. 4, sondern zuerst die Messbarkeit von FundBlick. Ziel ist eine belastbare Datenbasis ab der frühen Wachstumsphase, damit zusätzliche Händler, Produkte und SEO-Maßnahmen später anhand ihrer Wirkung beurteilt werden können.

## Zielbild

FundBlick soll möglichst ohne laufende Zusatzkosten eine nachvollziehbare Messkette erhalten:

Google-Impression -> organischer Klick -> FundBlick-Besuch -> Suche/Filter -> Produkt-/Affiliate-Klick -> Affiliate-Transaktion -> Provision.

Nicht jede Stufe lässt sich technisch und datenschutzrechtlich zwingend 1:1 personenbezogen verknüpfen. Wo eine direkte Attribution nicht sauber möglich oder nicht erforderlich ist, werden aggregierte Kennzahlen verwendet.

## Priorität 1 – Google Search Console API

Die Search Console API soll automatisiert und ausschließlich mit minimal erforderlichen Rechten angebunden werden.

Geplante Kennzahlen:
- Klicks aus der Google-Suche
- Impressionen
- CTR
- durchschnittliche Position
- Suchanfragen
- Landingpages
- Länder
- Geräte
- zeitliche Entwicklung und Vergleiche

Technischer Rahmen laut Google-Dokumentation:
- Search Analytics wird über `searchAnalytics.query` abgefragt.
- Für reine Auswertung genügt der Scope `https://www.googleapis.com/auth/webmasters.readonly`.
- Die Property kann als URL-Prefix oder Domain-Property (`sc-domain:fundblick.de`) adressiert werden.
- Die API liefert aufgrund interner Search-Console-Grenzen nicht zwingend jede einzelne Datenzeile; Top-Daten und aggregierte Kennzahlen sind daher entsprechend zu interpretieren.
- Abfragen sollen inkrementell erfolgen und historische Zeiträume nicht unnötig wiederholt komplett laden, um Quota und Laufzeit zu schonen.

## Authentifizierung / Sicherheit

Grundsätze:
- Keine Google-Passwörter im Repository.
- Keine OAuth-Client-Secrets, privaten Schlüssel oder Refresh-Tokens im öffentlichen Repository.
- Geheimnisse ausschließlich in geeigneten GitHub-Secrets bzw. geschützter Laufzeitumgebung.
- Read-only-Zugriff bevorzugen.
- Berechtigungen so klein wie technisch möglich halten.
- Keine Veröffentlichung roher Search-Console-Daten, wenn diese für den öffentlichen Betrieb nicht benötigt werden.

Die einmalige Google-Autorisierung bleibt ein manueller Eigentümer-/Kontoschritt. Danach soll der Abruf automatisiert laufen.

## Priorität 2 – FundBlick-interne Ereignismessung

Zu prüfen und anschließend datenschutzkonform zu entwerfen:
- Seitenaufrufe bzw. Sessions nur soweit erforderlich
- interne Suchvorgänge
- Suchbegriffe in FundBlick
- Filter-/Facettennutzung
- Produktkarten-/Detailinteraktionen
- Affiliate-/Outbound-Klicks
- Händler, Produkt, Kategorie und Zielnetzwerk des Outbound-Klicks

Leitlinie: so datensparsam wie möglich. Keine unnötigen personenbezogenen Profile, Fingerprinting-Mechanismen oder kostenpflichtigen Analytics-Dienste einführen. Vor Live-Schaltung Datenschutz/Consent-Anforderungen gesondert prüfen.

## Priorität 3 – Affiliate-Reporting

Nach der Search-Console-Anbindung sollen verfügbare Reporting-Schnittstellen der Affiliate-Netzwerke geprüft werden. Startpunkt ist Awin. Zielkennzahlen:
- messbare Affiliate-Klicks, soweit über die verfügbare Schnittstelle abrufbar
- Transaktionen
- Umsatz/Warenkorb, soweit verfügbar
- Provision
- Händler-/Advertiser-Zuordnung
- Status/Storno, soweit verfügbar

Spätere Netzwerke (z. B. Amazon) werden über Adapter in dasselbe interne Reporting-Modell überführt, soweit deren jeweilige APIs und Bedingungen dies zulassen.

## Architekturziel

Die Reporting-Architektur soll netzwerkunabhängig bleiben. Search Console, internes Event-Tracking und Affiliate-Reporting sind getrennte Datenquellen und werden erst in einer Reporting-Schicht zusammengeführt.

Vorgesehene Bausteine:
1. `search-console` Collector
2. internes Event-/Outbound-Klick-Modul
3. `affiliate-reporting` Adapter pro Netzwerk
4. normalisiertes Analytics-Schema
5. täglicher/regelmäßiger Aggregationsjob
6. maschinenlesbarer Report für spätere automatische Auswertung
7. Tests/Gates für Secrets, Schema, Datenqualität und Datenschutzgrenzen

## Kostenanforderung

Ziel: **0 EUR laufende Zusatzkosten**, solange FundBlick noch keine entsprechenden Einnahmen erzielt. Vor Einführung eines Dienstes mit laufenden Gebühren ist eine ausdrückliche Entscheidung erforderlich.

## Definition of Done für den nächsten Arbeitsblock

- Ist-Analyse der vorhandenen Tracking-/Reporting-Komponenten abgeschlossen.
- Search-Console-Collector auf `development` implementiert und getestet.
- Secrets bleiben vollständig außerhalb des Repository-Inhalts.
- Einmalige Google-Autorisierung ist dokumentiert und auf das notwendige Minimum reduziert.
- Automatischer Report kann Klicks, Impressionen, CTR, Position sowie Top-Queries/Pages ausgeben, sobald Credentials vorhanden sind.
- Datenschutzprüfung für FundBlick-internes Tracking liegt vor, bevor dieses live geht.
- Awin-Reporting-Möglichkeiten sind technisch und vertraglich geprüft.
- Kein direkter Live-Eingriff ohne vollständiges Gate.

## Arbeitsreihenfolge beim Fortsetzen

1. Repository-Iststand Tracking/Analytics prüfen.
2. Search-Console-API-Collector und Datenschema auf `development` bauen.
3. Tests und Secret-Leak-Gate ergänzen.
4. Google-Einrichtung bis zum zwingenden manuellen Autorisierungsschritt vorbereiten.
5. Nutzer führt ausschließlich den erforderlichen Google-Berechtigungsschritt aus.
6. Ersten echten Search-Console-Abruf durchführen und Baseline speichern.
7. Danach internes datensparsames Event-/Outbound-Tracking entwerfen und Datenschutz prüfen.
8. Anschließend Awin-Reporting anbinden.

## Recherchehinweise

Google dokumentiert für Search Analytics hohe Standard-Quoten; für FundBlick ist bei einem täglichen oder wenigen täglichen Abrufen kein Kapazitätsproblem zu erwarten. Trotzdem werden Abfragen sparsam und inkrementell geplant.

Die Search Analytics API kann nach Dimensionen wie Datum, Query, Page, Country und Device ausgewertet werden. Sie garantiert jedoch nicht, sämtliche Detailzeilen zu liefern. Deshalb werden aggregierte KPI-Summen und Top-Listen getrennt behandelt.

Wichtig: Die Google Indexing API ist **nicht** als allgemeines Instrument zur beschleunigten Indexierung normaler FundBlick-Produktseiten einzuplanen. Für die allgemeine Abdeckung bleiben Sitemap, interne Verlinkung, Canonicals und Search-Console-Monitoring die maßgeblichen Mechanismen.
