# FundBlick – Projektaufwand & Kosten: Development-Ergänzung 30.09.2026

Diese separate Ergänzung ersetzt keine frühere Kostenaufzeichnung. Das benannte Original war im zugänglichen Bestand nicht auffindbar. Keine rückwirkend erfundenen Arbeitsminuten, Stundensätze oder Geldbeträge.

Nachweisbare Arbeit: Dokumenten-/Repository-/CI-Abgleich, Katalog-Neubau und Prüfungen, Suche nach Fehlklassifikationen, Speicherparser und Regressionen, Suchqualität-Dokumentation. Bereits dokumentierte Rechercheabrufe: neun Variantenabrufe für Öl/Reifen/Akkuschrauber sowie vier Abrufe für Schuhe/TV/Smartphone/Laptop über den vorhandenen Suchworker. Wiederholte Auswertung gespeicherter Antworten erzeugt keine weiteren Suchprovider-Abrufe.

Direkte Providerkosten: mangels Abrechnungs-/Cachebelegen unbekannt; keine Behauptung kostenlos oder Betrag null. Keine neuen kostenpflichtigen Dienste, Server oder Abonnements eingerichtet. Laufzeit, CI-Kosten und monetärer Arbeitsaufwand sind hier nicht belastbar beziffert.

Nächste Kostenmaßnahme: automatisches Nachladen der ersten Suchansicht entfernen, um Abrufe von expliziter Nutzeraktion abhängig zu machen. Umgesetzt/validiert erst nach entsprechendem Code- und CI-Nachweis.

Fortschreibung: automatisches Nachladen im Code entfernt und mit Runtime-Gegenproben lokal geprüft. Eine erste externe Suche benötigt nun einen Abruf statt bis zu zehn automatisch gestarteter Abrufe; zusätzliche Seiten bleiben explizite Nutzeraktionen. Diese Gegenproben verwenden gespeicherte/injizierte Antworten und verursachen keine Suchprovider-Aufrufe. CI-Nachweis für den Folgecommit steht noch aus.

Commit `4bfb969`: Abrufbegrenzung auch in allen fünf GitHub-Prüfungen erfolgreich. Weitere Arbeit: drei Händlerseiten read-only geprüft, gespeicherte Suchdaten für Preis-/Facettenprüfung wiederverwendet, Preisbelege und Einheitenbasis abgesichert. Kein zusätzlicher Suchworker-Aufruf und keine Einrichtung eines Scraping-Backends. Direkte Kosten und Arbeitszeit weiterhin nicht belastbar beziffert.

Weitere Arbeiten: Browsergates mit kontrollierten Antworten (15 Fälle), Beseitigung doppelter Erstabrufe bei Fehlern, Preview-SEO-Schutz und isolierte Taxonomie-Evaluation. Drei öffentliche Shopify-Release-Assets (zusammen 6.888.065 Bytes komprimiert) sowie Lizenz gelesen. Downloads ausschließlich für Offline-Evaluation; keine neuen Suchprovider-Abfragen, Runtime-Dienste oder Abonnements. Keine rückwirkende minutengenaue Aufwandsrechnung.
