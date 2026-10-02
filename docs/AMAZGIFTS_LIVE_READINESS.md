# Amazgifts DE – Live-Readiness

Stand: 2026-10-02

## Verifizierter Datenstand

- Awin Advertiser: 87569
- FundBlick Publisher: 3106259
- bevorzugter Feed: 95497
- Rohfeed: 5.922 Zeilen
- Produktionsprodukte: 2.964
- Schlüsselanhänger: 2.271
- Schmuck: 605
- Fotogeschenke: 74
- Schmuckzubehör: 14
- ungeklärte Taxonomie: 0
- Bestand: bei allen 2.964 Produkten UNKNOWN
- Versandkosten: bei allen 2.964 Produkten unbekannt
- Awin-Affiliate-Link: 2.964/2.964
- Amazgifts-Direktlink: 2.964/2.964
- Rohfeed SHA-256: 9dadbc32d81303f38a4d8a92520d9ac29abf5aea3ac8c10d89393e8fd43822bf
- kanonischer Node-Produktdigest: 32ca063fc6d02a7ba6407175100e7da84f0c75731f097033b6096aff55b2d65a

## Sicherheitsverträge

Amazgifts bleibt bis zur expliziten Aktivierung in production-merchant-approvals.json auf approved=false. Solange dies so ist, darf die Amazgifts-Quelle nicht in production-catalog-sources.json erscheinen.

Bei Aktivierung verlangt verify-production-merchants.js exakt 2.964 eindeutige Produkte, Awin als Netzwerk, Publisher 3106259, Advertiser 87569, Amazgifts-Direktziele, ausschließlich registrierte FundBlick-Kategorien sowie weiterhin unbekannten Bestand und unbekannte Versandkosten. Der isolierte Amazgifts-Katalog darf deshalb keine Homepage-Tagesangebote erzeugen.

## Noch erforderliche Aktivierungsschritte

1. Das verifizierte Artefakt als development/amazgifts-products.json.gz.b64 in den Development-Branch übernehmen.
2. Isolierten Development-Build und Preview mit diesem Artefakt ausführen.
3. Suche, Produktkarten, mobile Darstellung und Affiliate-Outbound im Browser prüfen.
4. Die Advertiser-Regel zu Deeplinks/automatisierten Systemen vor Produktionsaktivierung schriftlich klären. Der Feed enthält Awin-aw_deep_link, dennoch wird aus den Advertiser-Bedingungen keine automatische Produktionsfreigabe abgeleitet. Nach dokumentierter Klärung termsCleared auf true setzen.
5. Danach node activate-amazgifts-production.js ausführen. Das Skript verweigert die Aktivierung bei fehlendem Artefakt, falscher Produktzahl, falschem Digest, falschen Awin-IDs oder ungeklärten Advertiser-Bedingungen und aktualisiert erst danach approved sowie production-catalog-sources.json.
6. Production release check vollständig grün abwarten.
7. Erst danach Merge/Live-Freigabe.

Main/Live wird durch diese Vorbereitung nicht verändert.
