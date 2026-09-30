# FundBlick – Architektur-Konsolidierung vor neuer Feature-Phase

Stand: 29.09.2026

## Verbindliches Arbeitsprinzip
Bevor nach Abschluss der aktuell bereits begonnenen Arbeiten ein neuer größerer Funktionsblock begonnen wird, wird der bestehende FundBlick-Stand technisch konsolidiert. Ziel ist nicht kosmetisches Umsortieren, sondern die Verringerung von Wartungsrisiken bei vollständig grüner Regression.

## Ausgangslage
Der Produktionsstand ist bereits deutlich über einem einfachen Hobby-/HTML-Prototypen: CI/CD, Produktions-Gates, Händlerfreigaben, Katalog-Build, Affiliate-Routing, SEO/Indexability und Datenqualitätsprüfungen sind vorhanden. Gleichzeitig ist der Anwendungscode organisch gewachsen und benötigt vor stärkerer Skalierung eine strukturelle Bereinigung.

## Konsolidierungsblock
1. Repository-Struktur ordnen (`src`, `scripts`, `tests`, `config`, `docs`, Datenbereiche), ohne funktionale Änderungen mit Strukturänderungen unnötig zu vermischen.
2. `search.js` nach Verantwortlichkeiten zerlegen: Query-Normalisierung, Kategorie-/Intent-Erkennung, Facetten, Produktmerkmale, State, Rendering und i18n sauber trennen.
3. Sprach-/Aliasdaten aus Anwendungslogik herauslösen und zentralisieren.
4. Händleradapter/Normalizer auf einen einheitlichen Vertrag bringen, damit weitere Händler nicht jeweils Sonderarchitektur erzeugen.
5. Build-/Deployment-Dateilisten soweit sinnvoll manifest- bzw. konfigurationsgetrieben machen.
6. README/Developer-Onboarding ergänzen: Architektur, Branch-/Release-Modell, lokaler Testweg, Produktionspipeline und Sicherheitsregeln.
7. Teststruktur vereinheitlichen und Abdeckung der kritischen Verträge dokumentieren.
8. Tote/duplizierte/überholte Dateien und Übergangscode identifizieren; Entfernung nur mit Regression und nachvollziehbarem Nachweis.
9. Produktions-, Datenschutz-, Affiliate-, SEO- und Indexability-Gates während der Bereinigung unverändert erhalten.
10. Nach jedem sinnvollen Teilblock vollständige Regression; `main` erst nach grünem Nachweis und bewusster Freigabe.

## Reihenfolge
Aktuell bereits begonnene Arbeiten sauber abschließen → Bestand vollständig glattziehen → Architektur-Konsolidierung durchführen → Regression/CI grün → erst danach neue größere Feature-/Händlerphase.

## Nicht-Ziel
Kein Big-Bang-Rewrite. Kein Framework-Wechsel nur aus kosmetischen Gründen. Keine funktionierende Produktionslogik ohne konkreten Wartungs-/Sicherheitsnutzen ersetzen.
