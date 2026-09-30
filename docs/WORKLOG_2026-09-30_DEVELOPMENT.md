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

Folgecommit `4bfb9693c86579d9d18c6e2c7279b77c26a1ef39`: alle fünf Läufe grün, Integrity 36750983961, Preview 36750983923, External Search 36750983926, Facetten 36750984109, Karten 36750984050. Damit ist die Abrufbegrenzung implementiert, lokal und in CI geprüft; Browser-Abnahme bleibt separat offen.

Block 3, erste reale Gegenprüfung: Mindestkaufsumme einer Bosch-Gratisaktion wurde als Gerätekaufpreis gelesen. Händlerseite bestätigt die abweichende Bedeutung; Angebot wird mit diesem Betrag ausgeschlossen. Gemeinsame Preisbeleg-Auswertung verhindert unterschiedliche Regeln in Karten und Confidence-Modul. Sichtbarer gültiger Preis wird auch für Sortiermetadaten benutzt. Lieferkosten, Grundpreise und Rabatt-/UVP-/Mindestwerte werden nicht als Artikelpreis übernommen. Keine neue Händler-Scraping-Infrastruktur, keine Überschreibung mit ungeprüften Händlerseitenwerten. Zweiter Befund: Ah-Dezimalwerte in Links gehen beim Trennen der Bindestriche verloren; auf belegte Ah-Form begrenzte Korrektur, mit Modell-/Öl-Gegenproben. Zwanzig lokale Prüfungen bestanden; CI nach diesem Commit noch zu kontrollieren. Details und Quellen im Suchaudit.

Commit `5a26124ddc8ef38c16f0117b2f84beee901765bf`: alle fünf Läufe erfolgreich, Integrity 36752053229, Preview 36752053232, External Search 36752053185, Karten 36752053389, Facetten 36752053227.

Block 3, weitere Umsetzung: gemeinsame kanonische Facettenwerte für Liter/ml, kg/g, Stück, GB/TB und Ah/mAh. Gleiche Normalisierung bei Evidenzvergleich, Ranking, Facettenableitung und Filterung, damit etwa strukturierte 5.000 ml und Titel 5 Liter weder Konflikte noch doppelte Filter erzeugen. Originalattribute bleiben nachvollziehbar. 1 TB entspricht 1.000 GB; 1.024 GB bleibt anderer Wert. Unbekannte Einheiten werden nicht still in Standardwerte umgedeutet.

Grundpreisberechnung verlangt nun belegte Währung; USD wird nicht als EUR etikettiert, fehlende/widersprüchliche Währung ergibt keinen berechneten Grundpreis. Preis-/Grundpreis-Sortierung steht nur bei einheitlicher belegter Währung bzw. Mengenbasis zur Verfügung. Nicht vergleichbare Sortieroptionen deaktiviert; beim Wechsel zu gemischten Daten zurück zur Relevanz. Angebote bleiben vorhanden. Keine Devisenumrechnung, keine neuen Providerkosten. Gegenproben: gemischte EUR/USD, fehlende Währung, EUR/l gegen EUR/kg, unbekannte Einheit, gleiche Mengen in unterschiedlichen Einheiten, stabile Reihenfolge und unveränderte Eingabedaten. Alle zwanzig lokalen Prüfungen bestanden; CI für diesen Schritt folgt nach Commit. Browser-Gegenprüfung der echten Scriptreihenfolge ist der nächste Schritt.
