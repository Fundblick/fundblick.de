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

Commit `3308ed93b01a38ece655a5d4ae529e05bde5a67c`: alle fünf Läufe grün, Integrity 36753061338, Preview 36753061250, External Search 36753061274, Karten 36753061280, Facetten 36753061344.

Browserabsicherung begonnen: sieben Playwright-Fälle ergänzen den bestehenden Karten-Workflow mit echtem 1.515-Produkte-Katalog. Prüfen explizites Opt-in trotz eigener Treffer, genau einen Erstabruf, Filter vor Seitenaufteilung, Sortierung/Facetten ohne Abrufe, konsistente Folgeabfrage, gemischte Währungen, HTTP 429, Wiederholung nach Folgefehler, Netzwerkausfall, unveränderte Katalogkarten und mobile Grenzen/Bedienflächen. Worker-Antworten werden ausschließlich im Test abgefangen; keine Änderung am Worker, dessen CORS oder Live. Browserprüfungen hier noch nicht als bestanden ausweisen, bevor CI tatsächlich fertig ist. Lokal ist Playwright nicht vorhanden; Syntax und Runtime-Gegenproben bestanden.

Gefundene UI-Lücke: Filter-/Seitensteuerungen hatten bisher keine eigenen CSS-Regeln. Development erhält umbrechende Steuerungen, sichtbaren Tastaturfokus und mindestens 44px hohe Buttons/Selects. Der Folgebutton ist während eines Abrufs deaktiviert, um doppelte Aktionen zu verhindern; bei Fehler wieder bedienbar. Keine Aussage über vollständige Accessibility-Abnahme aus diesen Einzelprüfungen ableiten.

Browsercommit `404eb09cb2fd23777cefb1f542d646bb3bae73e6`: Integrity/Preview/External/Facetten grün, Browserlauf 36753704631 rot. Von 15 Fällen bestanden 13; Erstabruf bei 429 und Netzwerkausfall wurde zweimal ausgelöst. Ursache: mehrere lokale Fertigmeldungen/pageshow setzen dieselbe externe Abfrage erneut ab; nur erfolgreiche Antworten werden gecacht, daher blieb der Fehler bisher verborgen. Tests bleiben unverändert streng bei einem Erstabruf. Runtime merkt die bereits angestoßene Query-/Sprach-/Ansichtsidentität; unveränderte Katalogmeldungen lösen keinen erneuten Erstabruf aus. Echte neue Suchzustände und explizite Folgeabruf-Wiederholungen bleiben möglich; Rückkehr aus Browsercache wird gesondert behandelt. Neue lokale Gegenprobe: mehrere Fertigmeldungen nach 429, weiterhin genau ein Abruf. CI-Korrekturlauf noch ausstehend.

Korrekturcommit `fe2394596c05948c0cfa3f15b096a3ef9a7d56b8`: alle fünf Läufe grün, Integrity 36754213266, Preview 36754212830, External Search 36754212821, Facetten 36754212886, Karten/Browser 36754212817. Browserlog bestätigt alle 15 Fälle bestanden. Das belegt die reale Seite/Scriptreihenfolge mit echten Katalogdaten und kontrollierten externen Antworten; kein Beweis für eine öffentlich gehostete Development-Umgebung mit realem Suchworker/CORS und Checkout-Preisen.

Preview-SEO-Grenze: Development-Paket enthielt bisher Live-Startseitenmetadaten `index,follow` und Produktions-Canonical. Neuer Schutz ausschließlich nach Packaging in separatem `_site`: alle HTML-Dateien `noindex,nofollow`, Produktions-Canonical entfernt, Produktions-Sitemap nicht mehr in robots.txt beworben. Originale und Production-Workflow bleiben unverändert. Primärquelle: [Google noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing). robots.txt darf die Seiten nicht zugleich blockieren, sonst kann Google noindex nicht lesen; deshalb Allow statt falscher Gleichsetzung von Disallow und Indexierungsschutz. Ein öffentlicher Preview-Host braucht weiterhin bewusste Zugangsschutz-/Header-Konfiguration. Lokal geprüft: Isolation, unveränderte Quelldateien, Sprachunterseiten, fehlender Head, Attributreihenfolge, bestehende Bot-Regeln und wiederholte Anwendung. CI des neuen Paket-Schritts noch offen.

Previewcommit `98dbe9088cfde952fe2279cbc268f35cd57c9e8b`: Integrity 36754692565 und Preview 36754692699 grün. Preview-Log bestätigt 14 geschützte HTML-Seiten und weiterhin 1.515 echte Produkte.

Block 4, isolierte Evaluation umgesetzt: Release-Assets v2026-08 mit Digests geprüft, 14.606 Kategorien/8.240 Attribute vermessen, kompakter Snapshot und generischer Hierarchieadapter für 20 aktuelle Klassen. Kein Frontend-Umschalten und keine Providerabhängigkeit pro Suche. Gegenprobe zeigt, dass ungeprüfte Elternvererbung irrelevante Filter erzeugen würde. Daher nur Kandidaten, noch keine Runtime-Facetten aus der Taxonomie. Ausführliche Entscheidung und verbleibende Voraussetzungen in `TAXONOMY-EVALUATION-2026-09-30.md`. Lokale Prüfung grün; CI für diese Ergänzung noch zu kontrollieren.

Taxonomiecommit `db58ee4dafd0448ff4d6c5470f5433350625b10c`: Integrity 36755785477 und Preview 36755785533 erfolgreich kontrolliert. Lokaler Git-Stand gegen development abgeglichen und synchronisiert; Fetch verwendet OpenSSL mit aktiver Zertifikatsprüfung statt des hier fehlschlagenden Windows-Schannel-Zugriffs. Keine Änderung der globalen Git-Konfiguration.

Block 5, Fehlerbehandlung: Timeout-Gegenprobe mit tatsächlichem Abort nach 500 ms, danach erneute erfolgreiche Anfrage derselben Suche; parallele identische Anfragen teilen einen Abruf. Cookie-/Referrer-Unterdrückung geprüft. Erstfehler hat jetzt einen ausdrücklichen Wiederholungsbutton; keine automatische Wiederholung durch Katalogereignisse, Klicks vor dem geplanten Abruf werden zusammengefasst. Eigene Katalogkarten bleiben erhalten. Runtime-/Client-Gegenproben lokal bestanden; zusätzlicher echter Browserfall muss erst in CI bestehen.

Sechs read-only HTTP-Vertragsprüfungen am vorhandenen Worker bestanden: Health, ungültige Query, fremder Origin, unbekannter Pfad, unzulässige Methode, nicht erlaubter localhost-Preflight. Keine gültige Suchquery und damit kein neuer Brave-Suchabruf. Der echte Development-Host mit CORS bleibt offen; localhost ist vom vorhandenen Worker absichtlich nicht zugelassen. Kein Worker-Deployment und keine Live-Konfiguration geändert.

Datenschutzprüfung: Datenfluss bis Cloudflare/Brave und externen Bildern dokumentiert; Brave nennt bis zu 90 Tage Query-Speicherung, ZDR für dieses Konto nicht belegt. Cloudflare kann Invocation Logs auch ohne eigenen console-Code führen. Keine pauschale Null-Speicherungsbehauptung. Development-Hinweis vor Web-Button und ergänzter, ausdrücklich vorläufiger Abschnitt in datenschutz-preview.html; Produktions-Datenschutztext unverändert. Konto-/Vertrags-/Rechtsgrundlagen und Sprachfassungen bleiben offene Freigabepunkte. Details/Primärquellen in `EXTERNAL-SEARCH-PRIVACY-REVIEW-2026-09-30.md`.

Gegenprüfung der Client-Architektur fand einen vom Suchdienst unabhängigen Cache-Schlüssel. Origin nun Teil des Schlüssels; bei Dienstwechsel können keine Antworten des vorherigen Dienstes übernommen werden. Lokale Gegenprobe: zwei Origins erzeugen zwei Abrufe, danach gleicher Origin aus Cache. Keine neue Architektur oder zusätzliche Abrufe im normalen unveränderten Betrieb. CI des Datenschutz-/Cache-Schritts noch offen.

Wiederholungscommit `f2634717bb98eb09da035d0512dab2792b94c766`: alle fünf Läufe grün, Integrity 36758052384, Preview 36758052317, External 36758052296, Facetten 36758052263, Karten/Browser 36758052288.

Datenschutz-/Cachecommit `2a1e51ec0c7d6723bf500f128347313f71cd253f`: alle fünf Läufe grün, Integrity 36758654618, Preview 36758654689, External 36758654540, Facetten 36758654580, Karten/Browser 36758654546. Rechtliche/vertragliche Freigabe bleibt dadurch nicht bewiesen.

Blöcke 2/3, Confidence-Gegenprüfung: mittlere Beschreibungsbelege wurden genauso wie starke Titel-/Strukturbelege als unterdrückbare Konflikte gezählt; LOW-Werte konnten durch höhere Durchschnittssicherheit anderer Treffer in sichtbare Facetten gelangen. Ranking unterscheidet jetzt starke Belege, schwache Ranghinweise und LOW/unklare Belege. MEDIUM kann die Reihenfolge gering beeinflussen, aber weder harte Konflikte noch saubere Trefferdeckung für das adaptive Ausblenden liefern. LOW beeinflusst keine Constraints. Standardfacetten nehmen nur einzelne Werte oberhalb des Confidence-Schwellwerts auf, nicht bloß einen ausreichend sicheren Durchschnitt. Unmarkierte strukturierte Altwerte behalten aus Kompatibilitätsgründen den bisherigen starken Vertrag; kein nachträgliches Erfinden einer Herkunft.

Gegenproben: 14 titelbelegte 18V-Produkte plus titelbelegtes 12V-Angebot und schwacher 12V-Beschreibungshinweis. Strict-Modus verwirft ausschließlich den belegten Konflikt, der Beschreibungstreffer bleibt erhalten. Gemischte Größenfacette enthält HIGH/MEDIUM, aber keinen LOW-Wert; LOW alleine keine sichtbare Facette. Zwanzig lokale Such-/Intelligence-Prüfungen bestanden. Wiederholung gespeicherter echter Antworten unverändert bei geeigneten Trefferzahlen (Öl fokussiert 6, Bosch fokussiert 3, Reifen 1, Schuhe/Laptop 0); keine Behauptung, diese Regel behebe die fehlende Händlerabdeckung. Keine neuen Providerabrufe. CI folgt nach Commit.

Confidencecommit `cb4996ec3f8fe85daf7e6e3bc001dd7905c25e1e`: alle fünf Läufe erfolgreich, Integrity 36759402785, Preview 36759403062, External 36759402888, Karten/Browser 36759402906, Facetten 36759402848.

Blöcke 2/4, weitere nachgewiesene Fehler: vorhandene kyrillische Klassenbegriffe mit JavaScript-Wortgrenzen wurden als unbekannt eingestuft (моторное масло, шины, телевизор, ноутбук, кроссовки). Kategorien nutzen jetzt Unicode-Buchstaben/Ziffern/Combining Marks statt ASCII-Wortgrenzen; bestehende lateinische Golden Queries weiterhin geprüft. Primärgrundlage: [ECMAScript WordCharacters](https://tc39.es/ecma262/multipage/text-processing.html#sec-wordcharacters). Das repariert vorhandene Sprachbegriffe, bedeutet noch keine vollständige Abdeckung aller 20 Sprachen.

Schuh-Gegenprobe: „Nike Jordan 40 Schuhe“ erzeugte aus einer möglichen Modellnummer eine EU-Größe und einen zusätzlichen Provider-Suchconstraint. Größenextraktion verlangt jetzt im passenden Kontext ausdrückliches EU/Gr.-Label; bare Zahlen/US-Größen bleiben unbekannt. Unterstützte halbe EU-Größen werden als solche gelesen, nicht auf Integer gekürzt. Gemischte Angaben bleiben mehrdeutig und können nicht durch einen Beschreibungsschnipsel aufgelöst werden. Ausdrücklich unterschiedliche strukturierte Größensysteme sind im Ranking nicht äquivalent.

Zielgruppe/Farbe wurden in Trefferattributen, aber nicht in Nutzerconstraints ausgewertet. Ein gemeinsames Fashion-Modul verhindert unterschiedliche Wörter-/Ambiguitätsregeln in Query und Angebot. Zielgruppen/mehrere Farben konservativ: eindeutiger Titel HIGH, Beschreibung MEDIUM, mehrere verschiedene Werte unbekannt. Wörterlisten werden einmal kompiliert, nicht für jeden Treffer erneut aufgebaut. Bestehende Kleidungsgrößenlogik unverändert. Offene Grenze: vollständige Zielgruppen-/Farbübersetzungen und zusätzliche Größen-/Weitensysteme, explizite Modellidentität sowie fachliche Must-have/Nice-to-have-Prioritäten bleiben separat zu evaluieren.

Lokal zwanzig Prüfungen inklusive Modellnummer, fremdem Größenformat, halber Größe, Mehrdeutigkeit, Unicode-Teilwort-Gegenprobe, alter Golden-Matrix und Browser-VM-Abhängigkeiten bestanden. Ein zusätzlicher Playwright-Fall prüft die tatsächliche Scriptverdrahtung; CI nach Commit noch offen. Keine Suchprovider-Abfragen durch diese Gegenproben.

## Release-Vorbereitung nach ausdrücklichem Auftrag von Jens

Commit c4b5f91: alle fünf Development-Prüfgruppen erfolgreich, 17 Browserfälle. Main-Abgleich f7e597d: drei zusätzliche Merge-Commits, keine abweichenden Inhaltsänderungen im Rückvergleich. Keine Änderung an Backup.

Reale Hausschuhe-Gegenprobe: vorher keine geeigneten Angebote; fokussierte deutsche Suchanfrage ergibt 20 Providerresultate, davon drei nach geltenden Produkt-/Bild-/Preisgates geeignet. Generischer Provider-Titel „online kaufen“ darf eine strukturierte /p/, /dp/, /product/ oder /produkt/-Detailseite nicht allein ausschließen. Listing-URL, blockierter Kontext, fehlendes Bild/Produktsignal und unsichere Preisgrundlage bleiben gesperrt. Gespeicherte Antworten erneut geprüft; keine Garantie für vollständige Markt-/Variantenabdeckung oder Checkoutpreise.

Lokaler Vorschau-Relay: fester HTTPS-Upstream, 127.0.0.1-Bindung, Host-/Origin-Prüfung, GET/HEAD, keine weitergereichten Cookies und keine beliebige Zieladresse. Produktionsclient erlaubt HTTP nur bei ausdrücklich markierter gleichursprünglicher Loopback-Vorschau. Negative Regressionen bestanden. Tatsächlicher Browser zeigte drei Angebote (69,90 / 109,95 / 29,99 EUR). Produktions-CORS mit fundblick.de für Health, ungültige Suche und Preflight erfolgreich; diese drei Checks verursachen keine gültige Provider-Suche.

Öffentlicher Datenschutzhinweis zum tatsächlichen Datenfluss ergänzt (DE/RU); Web-Gate verlinkt die tatsächlich paketierte datenschutz.html#websuche. Keine ZDR-, Vertrags- oder juristische Freigabe erfunden. Verbleibende Kontoeinstellungen/vertragliche Grundlagen stehen im Privacy Review.

Neue Release-CI baut denselben Katalog-/SEO-/Assetpfad wie die Produktion, prüft die finalen SHA-256-Dateien und führt Browserfälle direkt gegen _site aus. Produktion prüft dieses Paket ebenfalls vor Upload. Ein fehlendes lokales Source-Asset bricht den Build ab. Zwanzig lokale Intelligence-/Web-Prüfungen plus Relay-Gegenproben bestanden. Letzte CI nach Veröffentlichung dieses Commits noch abzuwarten; Merge/Deployment nicht als erfolgt dokumentieren.

Releasecommit 12fcd917: alle sechs Development-Läufe erfolgreich; im PR-Mergestand zusätzliche Relevanzprüfung fehlgeschlagen. Ursache: category-query-router verwendete auch enge Produkttypen/Modelle als vollständige Kategorieanfrage und löschte q. Mosaiktisch landete bei home.furniture, eigene passende Mosaiktische entfielen. Router beschränkt auf Kategorienamen/-IDs und dokumentierte breite Aliase; enge Typen/Modelle behalten q. Explizite Mähroboter-Zubehörbegriffe werden vor Vergleich ebenfalls normalisiert. VM-Gegenproben und tatsächlicher lokaler Browser bestanden: Mosaiktisch Rund, Gartentisch zuerst, q erhalten. Bestehender Browsergate nicht gelockert; erweitert um URL-Gegenprobe und in Release-Paket-CI aufgenommen. Neuer finaler CI-Lauf erforderlich.

Datenschutzentscheidung: Jens kennt die Tarif-/Kontoeinstellungen nicht; Nachfrage beendet. Deshalb keine tarifabhängigen Zusagen, kein ZDR-Versprechen und kein bestätigter Vertragsnachweis. Öffentlicher Text beschreibt nachgewiesenen Datenfluss konservativ mit Brave-Aufbewahrung bis 90 Tage und möglichen Cloudflare-Protokollen. Keine Dienste/Verträge neu eingerichtet oder angenommen. Kontobelege und externe rechtliche Prüfung bleiben ausdrücklich nicht nachgewiesene Folgepunkte, kein vorgetäuschtes Prüfergebnis. Der technische Release erfolgt im ausdrücklich autorisierten Umfang, sobald sämtliche technischen Merge-Gates grün sind.

## Live-Abschluss am 30.09.2026

Release-Code: a627acbbabdb0659e11c882551900d5068bca68a. Alle 16 Läufe am finalen Head erfolgreich (13 PR-Gates und drei Development-Läufe); 24 Browserfälle gegen das finale Produktionspaket. Der vorher hängende Taxonomie-Browserlauf wartete über acht Minuten in der Installation. Installationslimit drei Minuten und Abbruch überholter Läufe ergänzt; unveränderte Tests auf frischem Runner erfolgreich. Keine Prüfung entfernt oder Ergebnisanforderung gelockert.

[PR #40](https://github.com/Fundblick/fundblick.de/pull/40) erfolgreich nach main gemergt. Merge: f3f053d42c26e8e4c0b32a50e1bd50a18a1ed3e6. [Production-Pages-Lauf 36773699853](https://github.com/Fundblick/fundblick.de/actions/runs/36773699853) erfolgreich, Deploymentjob 110086188927 erfolgreich. Backup unverändert.

Öffentliche HTTP-Abnahme auf https://fundblick.de: Such-HTML und fünf zentrale veröffentlichte Module stimmen SHA-256-genau mit dem Release überein; öffentlicher Datenschutzanker vorhanden; Katalogmanifest 1.515 echte Produkte, keine Simulationen. Echter Browser direkt auf fundblick.de ohne Relay oder abgefangene Antwort: Hausschuhe erst nach ausdrücklich betätigtem Web-Button drei Angebote mit Bildern, Links und Preisen (69,90 / 109,95 / 29,99 EUR). Preis aufsteigend zeigt 29,99 EUR zuerst; keine Browser-Fehlerlogs. Eigene Mosaiktisch-Suche zeigt Mosaiktisch Rund, Gartentisch zuerst. Screenshot und HTTP-Bericht lokal im Arbeitsordner gespeichert. Keine zusätzliche Behauptung über aktuelle Händler-Checkoutpreise oder vollständige Markt-/Sprach-/Variantenabdeckung.

Live-Adresse: https://fundblick.de/. Die größeren dokumentierten Folgephasen (Taxonomie-Runtime, vollständige Sprach-/Modelltreue, weitere echte Händlerfamilien, betriebliche/rechtliche Kontobelege) bleiben offen. Der aktuelle technische Release ist tatsächlich veröffentlicht; nicht alle langfristigen Fahrplanpunkte sind abgeschlossen.


## 01.10.2026 – Search-UX / Query-to-Facet Phase

Auslöser war die reale mobile Abnahme der Live-Suche: redundanter Nulltrefferzustand, Sortier-/Filterbedienung ohne lokale Treffer, Websuche zu weit unten, externe Desktop-Angebote einspaltig und technische Hybrid-Pagination. Zusätzlich zeigte `RAM ddr`, dass die vorhandene Product Intelligence zwar Trefferattribute auswertet, aber die Produkttyp-/Facettenlogik nicht konsequent bereits aus der Nutzeranfrage vor den Treffern ableitet.

Verbindliches Zielbild in `docs/FUNDBLICK-WEBSUCHE-SEARCH-UX-ZIELBILD-2026-10-01.md` dokumentiert. Neue Query-first-Schicht `query-facet-blueprint.js`: freie Anfrage wird vor der Trefferanalyse einer kanonischen Produktfamilie zugeordnet; erkannte Constraints werden übernommen; das Blueprint liefert erwartete Facetten. Erste heterogene Referenzfamilien: RAM/Arbeitsspeicher, Zündkerze, Motoröl, Akku-Bohrschrauber, Fernseher, Schuhe und Kinderwagen. Unbekannte Produkte bleiben ausdrücklich als Semantic-Fallback offen; keine Behauptung, bereits beliebige Produktarten semantisch zu verstehen.

RAM vertikal durchgezogen: DDR-Generation, Gesamtkapazität, Geschwindigkeit, DIMM/SO-DIMM, Modulanzahl, Marke und Preis. Trefferextraktion erkennt DDR, GB, MHz/MT/s, Formfaktor und Kits; `2x16 GB` wird als zwei Module und 32 GB Gesamtkapazität normalisiert. Query `32GB DDR5 RAM 6000 MHz für Laptop` setzt DDR5, 32 GB, 6000 MHz und SO-DIMM als Nutzerconstraints. Pipeline übernimmt das Query-Blueprint vor Ranking/Facettenableitung. Eigene Integrationsprüfungen ergänzen Query → Blueprint → Trefferattribute → Facetten.

Sichtbare UX: `query-blueprint-ui.js` zeigt erkannte Produktfamilie, bereits verstandene Constraints und relevante Merkmalsgruppen kompakt vor den Ergebnissen und aktualisiert sich bei weiteren Suchen. Null lokale Treffer blenden wirkungslose alte Filter-/Sortierbedienung und die doppelte lokale Leerzustandskarte aus; die Websuche wird zur primären nächsten Aktion, ohne die bestehende explizite Web-Aktivierung/Datenschutzhürde zu umgehen.

Externe Angebotsdarstellung: Desktop responsives Raster (ab großer Breite vier, mittlere Breite drei Karten), Mobile eine kompakte Spalte. Der bisherige Mix aus Zurück/Seite/Weitere 20 wurde auf append-artiges `Weitere Angebote anzeigen` umgestellt; bereits geladene Angebote bleiben sichtbar. Sortierung und evidenzbasierte externe Facetten bleiben oberhalb der Angebote.

UX-Recherche erneut gegengeprüft: Baymard Product Finding/Search stützt produkttypbezogene Kategorie-/Scope-Hinweise, category-specific filtering, sichtbare angewandte Filter und Load-More als belastbares Produktlisten-Muster. Entscheidungen werden nicht allein aus einer einzelnen Quelle abgeleitet; reale FundBlick-Abnahme bleibt erforderlich.

Release-Sicherheit nachgezogen: neue Intelligence-/UI-/CSS-Abhängigkeiten werden in Release- und Production-Pages-Paketierung aufgenommen; Query-to-Facet-Prüfungen in den External-Search-Gate aufgenommen. Ein erster CI-Lauf stoppte korrekt an einem Unicode-RegEx-Syntaxfehler im neuen Bildschirmgrößenmuster; behoben. Zweiter Gate-Lauf erreichte die Integration und deckte einen fehlerhaften Testdatensatz auf: Laptop-Constraint SO-DIMM wurde gegen DIMM-Angebote getestet und vom Conflict Filter erwartungsgemäß unterdrückt. Fixture auf kompatible SO-DIMM-Angebote korrigiert; External Search Safety Gate danach erfolgreich. Weitere final-head Gates nach den letzten UI-/Packaging-Commits noch abzuwarten.

Main/Live seit Beginn dieser Phase unverändert; keine Freigabe oder Live-Schaltung dokumentieren, solange finaler Development-Head nicht vollständig geprüft und ausdrücklich abgenommen ist.


### Fortsetzung 01.10.2026 – Regressionen und Breitenabdeckung

Append-UX gegen den bestehenden Runtime-Testbestand abgeglichen. Alte Assertions erwarteten absichtlich seitenweise Ersetzung und feste 20 sichtbare Ergebnisse; sie wurden nicht blind beibehalten, sondern auf die neue vertragliche Semantik umgestellt: bereits geeignete Angebote bleiben sichtbar, Nachladen hängt neue eindeutige Angebote an, der Nutzer sieht den kumulierten Angebotsstand und keine technische Seitennummer mehr. Provider kann mehr als 20 Rohresultate liefern; geeignete Treffer werden nicht künstlich auf 20 abgeschnitten.

Query-first-Abdeckung von den ersten sieben Referenzfamilien auf weitere Kernfamilien erweitert: Laptop/Notebook, Smartphone, Kopfhörer, Staubsauger, Waschmaschine, Mähroboter und Fahrrad. Für jede Familie liefert das Blueprint eine kanonische Kategorie und fachlich passende erwartete Facetten; deutsche UI-Bezeichnungen ergänzt. Unbekannte Spezialprodukte bleiben weiterhin im Semantic-Fallback statt einer erfundenen Kategorie.

CI-Status während der Arbeit: External Search Safety Gate mehrfach erfolgreich nach RAM-/Blueprint-Änderungen. Development Integrity deckte nacheinander einen veralteten Paging-Test und einen minimalen DOM-Mock auf; DOM-Zugriff gehärtet, Paging-Test auf Append-Semantik aktualisiert. Finaler Head nach den letzten Änderungen erneut vollständig durch CI zu prüfen. Keine Änderung an main/live.


### Finalisierung der Gate-Migration / Query-Constraints

Der vollständige Zwischen-Head `c520a09d` erreichte erstmals gleichzeitig grün: Development Preview Build, Development V2 Integrity und Production Release Check. Die vorherigen roten Läufe waren vollständig auf veraltete Testannahmen der ersetzten Seiten-Pagination zurückzuführen und wurden auf das neue Append-Verhalten migriert; Browser-E2E bleibt die Instanz für reale Button-/Touch-/Layout-Interaktion.

External Search Safety Gate wurde außerdem für Pull Requests auf alle neuen Query-to-Facet-/Product-Intelligence-Dateien erweitert, damit Änderungen nicht nur bei Push auf development, sondern auch vor Integration in einem PR geprüft werden.

Query-first Constraint Extraction über RAM hinaus erweitert: Laptop/Smartphone erkennen explizit genannten RAM, Speicher und Bildschirmgröße; Waschmaschinen Kapazität und Schleuderdrehzahl; Mähroboter Flächenangabe. Neue Regressionen prüfen `Laptop 16 GB RAM 512 GB 15,6 Zoll`, `Waschmaschine 9 kg 1400 rpm` und `Mähroboter 800 m²`. Ziel bleibt: bereits in der Anfrage vorhandene Angaben werden als Constraints übernommen und dem Nutzer nicht erneut als unbeantwortete Verfeinerungsfrage gestellt.

Main/live weiterhin unverändert.
