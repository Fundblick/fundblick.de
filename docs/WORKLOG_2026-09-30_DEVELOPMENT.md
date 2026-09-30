# FundBlick – Development-Abgleich und Entscheidungsprotokoll, 30.09.2026

## Arbeitsgrundlage

`DESKTOP_HANDOFF_2026-09-30.md` und danach `AUTONOMOUS_WORK_MODE_JENS.md` vollständig gelesen, jeweils vom aktuellen development-Stand `ca0cb4be68cf8c690e5a3a2ef0abfb06276cb25d`. Autonome Fortsetzung ohne Zwischenfreigaben; main, Backup und Live bleiben geschützt.

Eingelesen: technische Product-Intelligence-Grundlage, Catalog-Integrity-Vertrag, Tagesstatus 29.09., External-Search-Arbeitsplan und Status 29.09., Desktop-Checkliste, Architektur-Konsolidierungsbacklog und UX-Rechercheaufzeichnungen. Die separat benannten Originale „Pflichtenheft/Büchlein/Leitfaden“ und „FundBlick – Projektaufwand & Kosten“ waren im zugänglichen Repository/Dateibestand nicht auffindbar. Dieses Protokoll ergänzt die zugänglichen Aufzeichnungen; es beansprucht nicht, diese Originale ersetzt oder gelesen zu haben. Kosten werden separat geführt.

Historische Aussagen zu automatischer Websuche bei null Katalogtreffern und ausgeschalteter Development-Websuche sind durch Tagesstatus, Handoff und aktuellen Code überholt: externe Suche ist ausdrücklich opt-in. Frühere Aufzeichnungen bleiben als Chronik erhalten.

## Tatsächlicher Katalog- und CI-Stand

Development Preview Build 36748669918 und Development V2 integrity 36748669754 für `ca0cb4b` erfolgreich. Preview-Job 110001313696 bestätigt 1.515 echte Produkte, keine Simulationen, neun Kategorien und isolierten Preview-Build ohne Produktionsdeployment.

Lokaler Neubau in ein separates Prüfverzeichnis stimmt damit überein. Quellen: Casa Moro 1.428, AHIPOS 31, ANTHBOT 56. Die früheren 1.459 sind Casa Moro plus AHIPOS; die Differenz von 56 ist durch den bereits vorhandenen ANTHBOT-Bestand erklärt. Alle drei Katalog-/Händler-/Kategorieprüfungen bestanden. Der eingecheckte Sieben-Produkte-Katalog ist ein Entwicklungsfixture, nicht der tatsächlich gebaute Preview-Katalog. Die Suchänderungen verändern keine Katalogquellen.

## Block 2: Referenzfamilien und Speicherangaben

Implementiert und lokal getestet: RAM und Gerätespeicher getrennt; gemeinsamer Parser statt doppelter Logik; mehrdeutige Varianten bleiben unbekannt; GB/TB dezimal normalisiert; explizite Mini-PCs werden bei Laptop-Suchen verworfen; beobachtete Schuh-/TV-Übersichten und redaktionelle Seiten werden vor Facetten und Pagination entfernt. Details und vier echte Suchabrufe stehen in `SEARCH_QUALITY_AUDIT_2026-09-30.md`. Zwanzig lokale Such-/Intelligence-Prüfungen bestanden. CI für diese neuen Änderungen wird nach dem Commit geprüft; vorher keine Behauptung „CI grün“.

Gegenprüfung und Alternativen: keine pauschale Ablehnung aller Lenovo-Seiten, kein Zusammenführen von RAM und Storage, keine Umstellung der Sucharchitektur. Titel und URL dürfen Produktklasse belegen; ein beiläufiger Vergleich im Beschreibungstext darf kein Laptop verwerfen. Kompakte Smartphone-Angaben sind eingeschränkte Heuristik, keine strukturierte Herstellerbestätigung. Dezimale GB/TB sind von GiB/TiB zu unterscheiden; Grundlage: [NIST, binäre und SI-Präfixe](https://physics.nist.gov/cuu/Units/binary.html). Abweichende Speicherwerte werden nicht still gleichgesetzt.

## Weitere nachgewiesene Arbeit

- Block 2 bleibt offen: dünne Trefferlage bei Schuhen/Laptops/Reifen, Modelltreue und echte Händlerpreis-/Verfügbarkeitsprüfung.
- Block 3 bleibt offen: reale Preis-/Grundpreis-Sortierung, unterschiedliche Währungen und Mengenbasis, gleichwertige Facettenwerte. [Schema.org UnitPriceSpecification](https://schema.org/UnitPriceSpecification) führt Währung und Mengenbasis ausdrücklich getrennt; bloße Zahlen sind keine sichere Vergleichsbasis.
- Nachgewiesene Abweichung zur technischen Grundlage: Runtime lädt bei weniger als zehn geeigneten Angeboten automatisch weitere Seiten bis Offset neun. Das verletzt „erste Seite 20; weiteres Laden nur auf Nutzeraktion“. Nächster begrenzter Schritt: erste Antwort sofort anzeigen und weitere Abrufe ausschließlich über den vorhandenen Weiter-Button, mit Gegenproben für leere Seiten, Dubletten und Fehler.
- Blöcke 4/5 bleiben offen: isolierte Taxonomie-Evaluation, Mehrsprachigkeit, Browser-/Mobile-Abnahme, Ausfälle, Datenschutz, vollständige SEO-/Katalogregression und Development-vs-Live-Abgleich.

Keine Live-Freigabe, kein Main-Merge, keine neuen Dienste oder laufenden Kosten aus diesem Stand ableiten.

## Nachweis nach Commit und nächster Schritt

Speicher-/Referenzkorrekturen: Commit `e8405dcd1210fbadda1872c01333d8dd824a48bc`. Alle fünf zugehörigen GitHub-Läufe erfolgreich kontrolliert: Integrity 36750558921, Preview 36750558799, External Search 36750559266, Karten 36750558802, Facetten 36750558881.

Automatisches Nachladen entfernt: erste externe Suchaktion erzeugt genau einen Seitenabruf, auch bei null geeigneten Angeboten oder vielen Dubletten. Weitere Seiten ausschließlich über den vorhandenen Button; Sortierung/Facetten arbeiten mit bereits geladenen Daten. Fehlgeschlagener Folgeabruf bewahrt vorhandene Angebote und Seitenzahl, derselbe Offset bleibt erneut abrufbar. Nach dünnen Seiten wird die angezeigte Seite auf die tatsächlich vorhandene Seite begrenzt. Runtime-Gegenproben bestanden für explizites Opt-in, null Treffer, Dubletten, Informationsergebnisse, Folgeabruf, Fehler und Wiederholung. CI für diesen Folgecommit noch zu kontrollieren.
