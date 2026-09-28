# FundBlick – Amazon-Integrationsfahrplan

Stand: 28.09.2026
Status: VORBEREITET / NICHT AKTIV / KEINE AMAZON-LIVESCHALTUNG

## Ziel
Amazon wird technisch vorbereitet, aber bis zur PartnerNet-/Creators-API-Berechtigung nicht weiter zum Hauptentwicklungsstrang gemacht. FundBlick soll keinen Amazon-spezifischen Umbau benötigen, wenn die Integration später aktiviert wird.

## Verbindliche Erkenntnisse aus der Amazon-Dokumentation

1. FundBlick ist vorsorglich als DE-Preissuchmaschine zu behandeln, weil Nutzer produktbezogene Suchbegriffe eingeben und Preise verschiedener Anbieter vergleichen können.
2. Amazon-Preise/Verfügbarkeit dürfen nur unter den Amazon-Regeln angezeigt werden. Bei Preisvergleich gelten zusätzliche Anforderungen, u. a. Versandkosten und Aktualitätshinweise.
3. Creators API ist die Zielarchitektur; keine neue PA-API-5-Integration bauen.
4. Creators API setzt ein geprüftes/final akzeptiertes Amazon-Associates-Konto voraus. Die aktuelle Einführung nennt zusätzlich mindestens 10 qualifizierende Verkäufe in den letzten 30 Tagen für PA-API-Zugang über Creators API.
5. Vor API-Zugang erfolgt der Bootstrap über offizielle, getaggte Amazon-Partnerlinks (z. B. SiteStripe), nicht über Scraping oder erfundene API-Daten.
6. Keine Amazon-Secrets im Browser, Repository oder öffentlichen Build. OAuth/Creators-API-Aufrufe müssen serverseitig bzw. in einer geeigneten geschützten Laufzeit erfolgen.
7. Von Amazon ausgegebene Affiliate-URLs/Trackingparameter dürfen nicht eigenmächtig verändert werden.
8. Amazon-Programminhalte dürfen nicht durch Scraping/Data-Mining eingesammelt oder als eigener dauerhafter Amazon-Katalog gespiegelt werden.
9. Amazon-Daten müssen mit kontrollierter Aktualität/TTL behandelt werden. Preise, Angebote und Verfügbarkeit sind kurzlebige Daten; keine dauerhafte GitHub-Konservierung als Wahrheitsquelle.
10. Amazon-Programminhalte dienen der Weiterleitung zu Amazon. Lizenz-, Marken- und Kennzeichnungspflichten sind vor Aktivierung erneut gegen den dann aktuellen Regelstand zu prüfen.
11. Bei Amazon-Preisvergleich muss FundBlick die von Amazon gelieferten Versandkosten klar darstellen; Amazon kann abweichende/häufigere Aktualisierung verlangen.
12. SearchItems, GetItems, GetVariations und GetBrowseNodes bilden die spätere Datenquelle. SearchItems liefert maximal 10 Items pro Request und unterstützt dynamische Refinements.

## Bereits vorbereitet

- `amazon-product-normalizer.js`: provider-spezifische Normalisierung in das FundBlick-Katalogformat.
- `verify-amazon-adapter.js`: Regressionstest für ASIN, Domain, HTTPS, Deduplizierung, inaktive Foundation und fehlenden erfundenen Affiliate-Link.
- Amazon ist standardmäßig `active:false`.
- Es wird kein Affiliate-Link erfunden.
- Datenquelle und FundBlick-Normalisierung bleiben getrennt.
- Die bereits produktive Public-Field-Allowlist schützt später zusätzlich vor unbeabsichtigter Veröffentlichung interner Providerfelder.

## Vor Amazon noch vorzubereiten – aber nur provider-neutral, soweit möglich

### Muss vor einer Amazon-Aktivierung vorhanden sein

- Provider-Abstraktion: Quelle -> Normalizer -> internes Produktmodell -> Public-Allowlist -> UI.
- Felder für `sourceFetchedAt`, `offerFetchedAt`, `expiresAt`/TTL und Datenherkunft.
- Versandkostenmodell, das unbekannt/null sauber von 0,00 EUR unterscheidet.
- UI-Vertrag für Preisaktualität und Preisänderungshinweis.
- Affiliate-Handoff, das vom Provider gelieferte Ziel-URLs unverändert transportieren kann.
- Server-/Secret-Grenze: Credential ID/Secret niemals in statischen GitHub-Pages-Dateien.
- Rate-Limit-/Cache-Schnittstelle provider-neutral vorbereiten; konkrete Amazon-Limits erst bei Aktivierung konfigurieren.
- Variantenmodell mit Parent-/Child-Identifiern und dynamischen Dimensionswerten.
- Kennzeichnungs-Slot pro Händler/Netzwerk für bezahlte/Partnerlinks.
- Tests: keine Amazon-Daten in Live, solange Provider deaktiviert ist; keine Preis-/Verfügbarkeitsanzeige aus abgelaufenen Amazon-Daten.

### Erst nach Amazon-Anmeldung/Berechtigung

- Amazon Partner Tag eintragen (nur als Secret/geschützte Konfiguration, soweit erforderlich).
- Offizielle Bootstrap-Partnerlinks für erste qualifizierende Verkäufe.
- Amazon-spezifische Pflichttexte/Kennzeichnung mit dann aktueller Teilnahmevereinbarung abgleichen.
- Nach finaler Aufnahme Creators API registrieren und Credentials erzeugen.
- OAuth-Token-Handling (EU/LwA), Token-Cache und Renewal implementieren.
- Creators-API-Client/SDK anbinden.
- SearchItems/GetItems/GetVariations/GetBrowseNodes gegen echte Responses testen.
- OffersV2, Versandkosten, Verfügbarkeit, Deal-/MAP-Sonderfälle gegen echte Daten abbilden.
- Amazon-spezifische TTLs und Rate Limits nach dann aktueller Dokumentation konfigurieren.
- Partner-URLs unverändert übernehmen und Attribution E2E prüfen.
- Erst danach Amazon `active:true` setzen und über normale FundBlick-Gates nach Produktion bringen.

## Bewusst NICHT jetzt bauen

- Kein PA-API-5-Client.
- Kein Amazon-Scraper/Crawler.
- Kein großer statischer Amazon-Produktdump in GitHub.
- Keine nachgebauten Affiliate-URLs.
- Keine Amazon-Credentials.
- Kein Amazon-spezifischer Server nur auf Verdacht.
- Keine Amazon-Live-Produkte oder Amazon-Preise ohne zulässige Quelle.
- Keine weitere Amazon-Sonderlogik, wenn sie nicht zugleich den allgemeinen Provider-Unterbau verbessert.

## Wiederaufnahme-Gate

Amazon wird erst wieder zum priorisierten Entwicklungsstrang, wenn mindestens einer dieser Punkte eintritt:

1. FundBlick soll beim Amazon-Partnerprogramm angemeldet werden.
2. Ein offizieller Partner Tag liegt vor und Bootstrap-Links sollen live gehen.
3. Die Voraussetzungen für Creators API sind erreicht bzw. Amazon hat API-Zugang bestätigt.
4. Eine provider-neutrale FundBlick-Komponente wird gebaut, die Amazon später ohnehin benötigt.

Vor Wiederaufnahme: aktuelle Amazon-Teilnahmebedingungen, DE-Preissuchmaschinen-Anforderungen, Creators-API-Dokumentation, API-Limits, Caching-/Lizenzregeln und SDK-Version erneut online prüfen. Dokumentation kann sich ändern.

## Nächste Projektpriorität

Amazon wird hier geparkt. Nächster Händler wird über Awin ausgewählt und integriert. Bevorzugt wird ein Händler mit geeignetem Produktfeed, ausreichend breitem/andersartigem Sortiment und sauberer Datenqualität, damit FundBlick-Kategorien, Facets und Multi-Merchant-Suche weiter real getestet werden können.
