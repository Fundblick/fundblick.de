# FundBlick – verbindlicher Pre-Flight- und Catalog-Integrity-Vertrag

Stand: 29.09.2026

## Zweck

Diese Datei ist vor jeder größeren Runtime-, Search-, Deployment-, Katalog- oder Händleränderung zusammen mit dem aktuellen Handoff zu lesen. Ziel ist, dass neue Such-/Frontend-Arbeit niemals unbemerkt den realen Händlerkatalog, Kategorien oder Monetarisierungsdaten abschneidet.

## Incident 29.09.2026 – verbindliche Lehre

Am 29.09.2026 wurde in der Development-Preview zeitweise ein alter Root-Katalog mit nur 4 Produkten ausgeliefert, obwohl der dokumentierte produktive Händlerbestand 1.459 reale Produkte umfasste. Ursache war nicht die Universal-/External-Search-Logik selbst, sondern ein Unterschied zwischen den Deployment-Pipelines:

- Production baute den vollständigen realen Händlerkatalog vor dem Deploy neu.
- Development Preview kopierte den Repository-Inhalt direkt nach `_site` und veröffentlichte dadurch den veralteten Root-Katalog.
- Folge: Kategorien verschwanden und Suchfälle wie Haushalt/Möbel wirkten leer, obwohl die Händlerquellen weiterhin vorhanden waren.

Der Fix vom 29.09.2026: Die Development-Preview baut vor jedem Deploy ebenfalls den vollständigen realen Händlerkatalog und prüft Mindestbestand sowie `catalog/categories.json`.

## Verbindlicher Pre-Flight vor Änderungen

Vor jeder größeren Arbeit sind mindestens folgende Punkte zu prüfen und mit der aktuellen Dokumentation abzugleichen:

1. Branch
   - Runtime-Arbeit grundsätzlich in `development` bzw. freigegebenem Dev-Branch.
   - `main` nicht direkt verändern.

2. Händler-/Produkt-Baseline
   - dokumentierte reale Produktzahl prüfen.
   - dokumentierte Händlerzahl und bekannte Händlerbestände prüfen.
   - auffällige Abweichungen vor Feature-Arbeit klären.

3. Katalog-Pipeline
   - prüfen, welcher Katalog tatsächlich ausgeliefert wird.
   - niemals einen statischen/stalen Root-Katalog als Produktions- oder Preview-Wahrheit annehmen, wenn der reale Katalog aus Quellen gebaut wird.

4. Kategorien
   - `catalog/categories.json` muss aus dem realen Build stammen.
   - bekannte aktive Kategorien dürfen nicht still verschwinden.

5. Gates
   - relevante Händler-, Katalog-, Search-, Browser- und Deployment-Gates auf demselben Head-SHA prüfen.

6. Post-Deploy
   - mindestens zentrale reale Nutzerpfade gegen die ausgelieferte Preview/Produktion prüfen: Startseiten-Kategorien, eine breite Händlerkategorie, eine konkrete Produktsuche und ein Affiliate-/Händlerergebnis.

## Harte Regel

Wenn Dokumentation und ausgeliefertes Artefakt widersprechen, gilt: STOP.

Beispiel:

- Dokumentation: ca. 1.459 reale Produkte
- ausgelieferter Katalog: 4 Produkte

Dann keine weitere Feature-Arbeit und kein „wird schon stimmen“. Zuerst Ursache des Katalog-/Deployment-Konflikts klären.

## Skalierungsziel – nicht auf absolute Mindestzahl verlassen

Das aktuelle Gate `>= 1000 reale Produkte` ist nur ein kurzfristiger Schutz für den heutigen Maßstab. Bei hunderten oder tausenden Händlern reicht ein globaler Mindestwert nicht.

Zielarchitektur für größere Skalierung:

- Gesamtprodukt-Delta gegen letzten guten Build prüfen.
- Händlerbestand pro Händler prüfen.
- unerwartet verschwundene Händler blockieren.
- Kategorie-Bestand und Kategorie-Deltas prüfen.
- erwartete Datenquellen/Feeds vollständig verifizieren.
- ungewöhnliche Massenlöschungen oder starke Bestandsabfälle blockieren.
- jeder Katalog-Build bekommt eine eindeutige Build-ID / Hash.
- Kataloge werden unveränderlich gespeichert.
- Deployment wird atomar auf einen vollständig geprüften Build umgeschaltet.
- Rollback bedeutet Zeiger zurück auf letzten guten Build, nicht manuelle Rekonstruktion einzelner Händler.

## Architekturtrennung

FundBlick Search Engine und FundBlick Commerce Catalog sind getrennte Verantwortungsbereiche:

### Search Engine
- Intent-Erkennung
- Mehrsprachigkeit
- External Search
- Guides / Videos / Vergleiche
- Local Intent
- Ranking / Result-Mixer

### Commerce Catalog
- reale Händler
- Affiliate-Produkte
- Preise
- Kategorien
- Feeds
- Merchant-Metadaten
- Monetarisierungsrouting

Die Search Engine darf den Commerce Catalog lesen und priorisieren, aber ein Search-Deployment darf nicht implizit entscheiden, welcher Händlerkatalog ausgeliefert wird.

## Verbindliche nächste Härtungen

1. Catalog-Integrity-Gate mit Delta-Vergleich zum letzten guten Build.
2. Händler-Manifest mit erwarteten Händler-IDs und Produktzahlen/Spannen.
3. Kategorie-Integrity-Gate.
4. Build-ID / Hash für jeden vollständigen Katalog.
5. atomarer Catalog-Pointer (`CURRENT`) statt losem Dateiaustausch.
6. schneller Rollback auf letzten guten Katalog-Build.
7. Development- und Production-Katalogpipeline so weit wie möglich vereinheitlichen.
8. automatisierter Post-Deploy-Smoke-Test für Kategorien + Händlerergebnisse.

## Arbeitsregel für künftige Sessions

Vor Feature-Arbeit zuerst:

`Handoff lesen → Pre-Flight lesen → aktuellen Branch/Head prüfen → realen Katalogbestand prüfen → erst dann ändern.`

Diese Reihenfolge ist verbindlich, damit Search-/Frontend-Fortschritt nicht auf Kosten des Händlerbestands geht.
