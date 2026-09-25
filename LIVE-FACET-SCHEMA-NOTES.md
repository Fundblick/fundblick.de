# Live-Facet-Schema

Stand: 2026-09-25

Die produktive Suche nutzt ab jetzt einen separaten Schema-Baustein für produktspezifische Filter. Technische Filterwerte bleiben sprachunabhängig; nur Beschriftungen werden lokalisiert. Dadurch können Kopfhörer, Fernseher, Schuhe, Smartphones, Heißluftgeräte und Kaffeemaschinen unterschiedliche Detailfilter erhalten, ohne separate Suchlogiken oder Datenmodelle pro Sprache aufzubauen.

Der Schema-Baustein ist bewusst separat von `search.js`, damit weitere Produktklassen ergänzt werden können, ohne den Suchkern unnötig zu vergrößern.
