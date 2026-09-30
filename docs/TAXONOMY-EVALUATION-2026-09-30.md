# FundBlick – isolierte Taxonomie-Evaluation, 30.09.2026

## Nachgewiesene Datenbasis

Primärquellen: [Shopify-Release v2026-08](https://github.com/Shopify/product-taxonomy/releases/tag/v2026-08), [Integrationshinweise](https://github.com/Shopify/product-taxonomy/tree/v2026-08), [MIT-Lizenz](https://github.com/Shopify/product-taxonomy/blob/v2026-08/LICENSE). Drei Release-Assets heruntergeladen: englische/deutsche Kategorien und englische Attribute. SHA-256 jeweils gegen GitHub-Release-Metadaten geprüft; Version jeweils 2026-08. URLs und Digests in `development/taxonomy-evaluation/source-manifest.json`. Keine `latest`-/unstable-/dist-Abhängigkeit beim reproduzierbaren Build.

Aus den vollständigen Assets gemessen: 26 Hauptbereiche, 14.606 Kategorien, 8.240 Attributdefinitionen. Englische/deutsche Kategorien haben dieselben Kennungen; keine doppelten IDs, alle Eltern vorhanden und auf niedrigerer Hierarchieebene. Die gzip-Assets zusammen etwa 6,9 MB; entpackte JSONs etwa 179 MB. Deshalb kein Laden dieser vollständigen Daten bei einer Nutzersuche.

Kompakter Evaluationssnapshot: 20 vorgeschlagene Zuordnungen der heutigen FundBlick-Klassen, 52 Knoten einschließlich Eltern, 132 benötigte Attributdefinitionen, circa 53 KB lesbares JSON. Herstellerdaten und Lizenzhinweis bleiben nachvollziehbar. Kein gesamter Fremddatenbestand im Browser oder Repository.

## Was damit bewiesen und nicht bewiesen ist

Ein generischer Adapter löst interne FundBlick-Kennungen auf stabile Taxonomie-Kennungen auf und liefert englische/deutsche Namen, Breadcrumb und mögliche Attribute aus der Elternkette. Unbekannte Klassen bleiben unbekannt; fehlende Eltern/Attribute und Zyklen werden abgelehnt. Lokales Gate deckt alle aktuellen 20 Klassen, Sprache, Vererbungskandidaten und die deaktivierte Runtime ab.

Die Zuordnungsliste ist ein geprüfter technischer Vorschlag zur Evaluation, keine aktivierte Produktklassifikation. Bei Smartphone und Akkuschrauber ist die Taxonomiekategorie breiter: zusätzliche Smartphone-/Akkuabgrenzung erforderlich. Motoröl, Mähroboter, Laptops und weitere heutige Klassen lassen sich stabil in Hierarchien einordnen. Noch nicht bewiesen: Suchsynonyme, automatische Klassifikationsgüte, alle 20 FundBlick-Sprachen, numerische Werte/Einheiten, Facettenrelevanz und Migration ohne Suchregression.

Wichtige Gegenprobe: Eine blinde Vereinigung aller Elternattribute würde beim Mähroboter beispielsweise „Organic certification“ aus Home & Garden übernehmen. Diese Kandidaten dürfen nicht ungeprüft als Facetten erscheinen. Die Taxonomie liefert Ordnung und verfügbare Eigenschaften, keine Belege dafür, dass ein konkretes Angebot einen Filterwert hat. FundBlick braucht weiterhin fachlich begrenzte Vererbung/Overrides, Evidenz, Coverage, Währung-/Einheitenlogik und seine produktspezifischen numerischen Erweiterungen, etwa Liter, Fläche, Spannung und Speichergröße.

## Entscheidung

Die versionierte Taxonomie ist für eine datengetriebene Basisschicht geeignet. Keine Erweiterung um Hunderte handgeschriebene Einzelklassen, keine sofortige Runtime-Umstellung und keine neue Shopify-Abfrage pro Suchanfrage. Vor Aktivierung: bestehende Verantwortlichkeiten konsolidieren, benötigte Attributzuordnungen prüfen, Ausschlüsse/Vererbung regeln, mehrsprachige Klassifikations- und Unknown-Fälle gegen aktuelle Golden Queries messen. Erst danach einen kleinen freigabefähigen Entwicklungsvergleich planen.

Reproduzierbarer Offline-Build nach separat verifiziertem Download: `node development/taxonomy-evaluation/build-snapshot.js <Asset-Verzeichnis>`. Prüfung ohne Netzwerk: `node development/verify-taxonomy-evaluation.js`. Snapshot/Adapter sind in keiner HTML-Scriptliste geladen; `runtimeEnabled` ist false. main, Backup und Live bleiben unverändert.
