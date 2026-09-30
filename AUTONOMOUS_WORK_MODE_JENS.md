# FundBlick – Autonomer Arbeitsmodus für Jens

Diese Datei ergänzt `DESKTOP_HANDOFF_2026-09-30.md` und hat für die Arbeitsdauer Vorrang, falls dort eine Formulierung so verstanden werden könnte, dass nach jedem Arbeitsblock auf eine neue Nachricht von Jens gewartet werden soll.

## Kernauftrag

**Nicht nach einem sinnvollen Arbeitsblock anhalten und auf `Weiter` warten.**

Wenn Jens `Los`, `Weiter`, `Attacke`, `arbeite weiter`, `mach weiter` oder sinngemäß die autonome Fortsetzung freigibt, soll der Desktop-Agent **so lange wie in der laufenden Sitzung technisch sinnvoll möglich selbstständig weiterarbeiten**.

Ziel: Jens soll den Rechner laufen lassen und z. B. einen Film schauen können, ohne alle paar Minuten `Weiter` schreiben zu müssen.

## Pflicht vor der Weiterarbeit: Projektaufzeichnungen einlesen

Der Agent darf die Übergabedateien nicht als vollständigen Ersatz für die gewachsene FundBlick-Projektdokumentation behandeln. Vor längerer autonomer Weiterarbeit muss er sich in die vorhandenen Aufzeichnungen einlesen und den aktuellen Stand gegen sie abgleichen.

Mindestens zu berücksichtigen sind, soweit im verfügbaren Projekt-/Dateibestand zugänglich:

- das jeweils **aktuellste Projektpflichtenheft / Büchlein / Leitfaden** als technische und projektbezogene Arbeitsgrundlage;
- das **Änderungs- und Entscheidungsprotokoll**;
- die separate Dokumentation **`FundBlick – Projektaufwand & Kosten`**;
- vorhandene Brainstorm-/Working-Sheet-/Recherche-/Architektur-/SEO-/Affiliate-/UX-Aufzeichnungen;
- `DESKTOP_HANDOFF_2026-09-30.md`;
- diese Datei `AUTONOMOUS_WORK_MODE_JENS.md`;
- den tatsächlichen aktuellen Repository-/CI-Stand, der bei Abweichungen für den Codezustand maßgeblich ist.

Wichtig: Das Pflichtenheft ist ein **lebendes Projektdokument**. Frühere Fassungen bilden die Chronik; die neueste belastbare Fassung ist die aktuelle Arbeitsgrundlage. Aufwand, Zeit, direkte Kosten und monetäre Aufwandsschätzungen werden **separat** in `FundBlick – Projektaufwand & Kosten` geführt und nicht mit dem technischen Pflichtenheft vermischt.

## Dokumentation ist Teil der Entwicklungsarbeit

Dokumentation ist kein optionaler Abschluss nach der Programmierung. Während autonomer Arbeit muss der Agent relevante Aufzeichnungen mitführen und nach größeren Entwicklungsständen konsolidieren.

Dabei:

- wesentliche neue Anforderungen, Architekturentscheidungen, Sicherheitsregeln, Erkenntnisse und Statusänderungen ins Pflichtenheft/Entscheidungsprotokoll übernehmen;
- erledigt / implementiert-aber-noch-nicht-validiert / offen sauber unterscheiden;
- Aufwand/Kosten separat fortschreiben und keine minutengenaue Historie erfinden, wenn sie nicht belastbar rekonstruierbar ist;
- Brainstorming und noch ungeprüfte Ideen als solche kennzeichnen und nicht als beschlossene Architektur dokumentieren;
- veraltete Aussagen nicht blind fortschreiben, sondern gegen Repository, CI und aktuelle Recherche abgleichen;
- frühere Versionen nicht gedankenlos überschreiben oder löschen: Projektchronik erhalten;
- nach längeren Arbeitsserien prüfen, ob Handoff, Checklisten und Aufzeichnungen noch den tatsächlichen Stand widerspiegeln.

## Verbindliche Denk- und Recherchemethodik

FundBlick wird nicht nach dem Muster `erste plausible Idee -> sofort implementieren` entwickelt. Vor wesentlichen Architektur-, UX-, Such-, Ranking-, SEO-, Affiliate-, Datenschutz-, Performance- oder Skalierungsentscheidungen gilt:

1. **Problem präzisieren.** Was ist tatsächlich nachgewiesen und was nur Vermutung?
2. **Bestehenden FundBlick-Stand prüfen.** Nicht doppelt bauen und keine vorhandene Logik übersehen.
3. **Eigene Annahmen hinterfragen.** Aktiv nach Gegenbeispielen, Edge Cases, Fehlklassifikationen und unerwünschten Nebenwirkungen suchen.
4. **Extern recherchieren, wenn es die Entscheidung verbessert.** Etablierte Standards, Primärquellen, belastbare technische Dokumentation, reale Erfahrungen und bewährte Lösungsansätze prüfen, statt nur aus dem Bauch heraus zu entwerfen.
5. **Alternativen vergleichen.** Kosten, Traffic, Wartbarkeit, Skalierung, Datenschutz, Robustheit, Vendor-Lock-in und Wiederverwendbarkeit berücksichtigen.
6. **Einfachste robuste Lösung bevorzugen.** Keine unnötige Komplexität und keine laufenden Kosten erzeugen, wenn eine kostenlose bzw. bestehende Infrastruktur die Anforderungen zuverlässig erfüllt.
7. **Implementieren und absichern.** Tests/Gates für den gefundenen Fehler oder die neue Regel ergänzen.
8. **Gegenprobe durchführen.** Nicht nur den Happy Path testen; bewusst Fälle suchen, bei denen die eigene Lösung falsch liegen könnte.
9. **Ergebnis erneut hinterfragen.** Nach Implementierung prüfen: Ist das Nutzerergebnis tatsächlich besser oder nur der Test grün?
10. **Dokumentieren.** Entscheidung, Begründung, offene Risiken und tatsächlichen Validierungsstand festhalten.

Bei UX-Entscheidungen haben belastbare Forschung, etablierte Standards und reale Nutzungsdaten Vorrang vor einer einzelnen persönlichen Meinung. Vorgehensweise: **Forschung/Standards -> Soll-Struktur -> begründete FundBlick-Abweichung -> später anhand echter Nutzungsdaten weiter optimieren.**

## Selbstoptimierungs-Schleife

Der Agent soll nicht nur Aufgaben abarbeiten, sondern auch seine eigene Lösungsmethodik fortlaufend prüfen:

- Gibt es einen besseren, einfacheren oder generischeren Ansatz?
- Haben wir gerade Sondercode gebaut, obwohl eine wiederverwendbare Regel möglich wäre?
- Skaliert die Lösung von 10 auf 100/1000 Händler bzw. von 20 auf Hunderte Produktklassen?
- Erzeugen wir unnötigen Traffic oder externe Kosten?
- Ist eine Heuristik zu aggressiv und produziert False Positives/False Negatives?
- Kann ein Regressionstest den gefundenen Fehler dauerhaft absichern?
- Gibt es relevante Erkenntnisse aus externer Recherche, die unseren bisherigen Ansatz widerlegen oder verbessern?
- Ist der dokumentierte Stand noch wahr?

Wenn eine bessere Lösung gefunden wird, nicht aus Stolz am bisherigen Ansatz festhalten. Innerhalb `development` darf eine reversible technische Entscheidung verbessert werden, sofern Tests und Dokumentation entsprechend nachgezogen werden.

## Arbeitszyklus

Solange keine echte Blockade oder Freigabegrenze erreicht ist, wiederholt der Agent selbstständig:

1. aktuellen HEAD/Arbeitsstand und relevante Aufzeichnungen feststellen;
2. nächsten offenen Punkt aus Handoff/Pflichtenheft/Checkliste wählen;
3. relevante Dateien und bestehenden Code prüfen;
4. bei wesentlichen oder unsicheren Punkten recherchieren und Lösungsansatz gegen Alternativen prüfen;
5. Änderung ausschließlich auf `development` implementieren;
6. passende Regressionstests ergänzen oder bestehende Tests ausführen;
7. Gegenproben/Edge Cases durchführen und reale Nutzerwirkung prüfen;
8. Fehler ursächlich beheben, nicht Gates abschwächen;
9. nachvollziehbar committen;
10. CI/GitHub Actions kontrollieren;
11. bei rotem Gate Logs untersuchen, Fehler korrigieren und erneut prüfen;
12. relevante Projektaufzeichnungen/Checklisten auf den tatsächlichen Stand bringen;
13. Lösung und Methodik kurz selbstkritisch prüfen;
14. wenn der Block sauber ist, **ohne neue Benutzernachricht automatisch den nächsten offenen sinnvollen Punkt beginnen**.

Danach wieder bei Schritt 1 bzw. 2 fortfahren.

## Wann NICHT auf Jens warten

Nicht anhalten nur weil:

- ein Commit fertig ist;
- ein Test grün ist;
- ein Teilblock abgeschlossen ist;
- ein Zwischenbericht möglich wäre;
- der nächste Punkt bereits aus der Checkliste hervorgeht;
- eine technische Detailentscheidung reversibel und innerhalb des vereinbarten Development-Ziels ist;
- mehrere weitere sichere Development-Aufgaben vorhanden sind;
- Dokumentation aktualisiert werden muss;
- weitere Recherche oder Gegenproben sinnvoll sind.

Zwischenstände dürfen im Chat sichtbar sein, sollen aber **kein künstlicher Stopppunkt** sein, sofern die Umgebung weiteres Arbeiten erlaubt.

## Wann anhalten / Freigabe verlangen

Nur bei einer echten Grenze, insbesondere:

- Änderung an `main`, Backup oder Live/Produktion wäre erforderlich;
- Merge/Deployment/Live-Schaltung steht an;
- kostenpflichtiger externer Dienst oder neue laufende Kosten wären nötig;
- Zugangsdaten, Secrets oder eine Nutzeraktion außerhalb der verfügbaren Werkzeuge sind zwingend erforderlich;
- mehrere fachlich grundverschiedene Produktentscheidungen sind möglich und Jens' Präferenz ist nicht aus Projektziel, Aufzeichnungen oder Handoff ableitbar;
- Änderung wäre schwer reversibel oder hätte erhebliches Risiko;
- es gibt objektiv keinen weiteren sicheren Development-Arbeitspunkt.

In diesen Fällen klar erklären, was blockiert und welche Entscheidung/Aktion benötigt wird.

## Wenn die eigentliche Aufgabenliste abgearbeitet ist

Nicht sofort stoppen. Innerhalb des vereinbarten FundBlick-Development-Rahmens selbstständig nach weiteren sinnvollen Qualitätsarbeiten suchen, z. B.:

- Golden Queries erweitern;
- reale Trefferqualität prüfen;
- Edge Cases und Regressionen suchen;
- Mehrsprachigkeit testen;
- Facettennormalisierung härten;
- Ranking-/Deduper-/Conflict-Filter-Grenzfälle prüfen;
- Performance und Request-Anzahl analysieren;
- Timeout-/Fehler-/Fallback-Verhalten prüfen;
- Mobile-/Accessibility-Probleme untersuchen;
- externe Best Practices/Primärdokumentation gegen die aktuelle Lösung prüfen;
- Architektur auf unnötige Sonderfälle und bessere Wiederverwendbarkeit untersuchen;
- Dokumentation/Checkliste/Pflichtenheft auf tatsächlichen Stand bringen.

Dabei keine Scope-Ausweitung in fremde Projekte und keine Live-Änderung.

## Kosten- und Infrastrukturprinzip

- External Search und die laufende FundBlick-Grundarchitektur sollen keine vermeidbaren laufenden Kosten erzeugen.
- Kostenlose Quellen und vorhandene Infrastruktur priorisieren, solange sie Anforderungen zuverlässig erfüllen.
- Kein neuer Server/Backend nur aus technischer Eleganz. Backend erst dann erwägen, wenn ein echter Bedarf wie serverseitige Geheimnisse, Datenbank, Echtzeitlogik oder Anforderungen besteht, die mit der bestehenden Architektur nicht zuverlässig lösbar sind.
- Providerneutrale Adapter und wiederverwendbare Normalisierung bevorzugen, damit FundBlick nicht unnötig an einen einzelnen Anbieter gebunden wird.

## Berichterstattung

Die ausführliche, verständliche Berichtsweise aus `DESKTOP_HANDOFF_2026-09-30.md` bleibt gültig. Sie bedeutet aber **nicht**, dass nach jedem Bericht auf Jens gewartet werden soll.

Berichte sollen nach größeren sinnvollen Etappen bzw. bei wichtigen Funden erfolgen und enthalten möglichst:

`geprüft -> recherchiert/gegengeprüft -> gefunden -> geändert -> getestet/Gegenprobe -> CI-Status -> Dokumentation -> Commit(s) -> nächster Schritt`

Danach, sofern keine Freigabegrenze erreicht ist, selbstständig mit dem angekündigten nächsten Schritt fortfahren.

## Sicherheitsgrenze

- Arbeitsbranch: `development`.
- `main`, Backup und Live/Produktion nicht verändern.
- Keine Gates löschen/abschwächen, um grün zu werden.
- Keine Live-Schaltung ohne ausdrückliche Freigabe von Jens.
- Kleine nachvollziehbare Commits bevorzugen.
- Bestehende FundBlick-Funktionalität schützen.
- Unsicherheit offen kennzeichnen; Vermutungen nicht als nachgewiesene Tatsachen dokumentieren.

## Kurzfassung für den Agenten

**Lies vor längerer Arbeit die vorhandenen FundBlick-Aufzeichnungen ein. Arbeite danach möglichst lange autonom in `development`. Hinterfrage Annahmen, recherchiere vor wesentlichen Entscheidungen, vergleiche Alternativen, implementiere die robusteste kostenarme Lösung, teste Happy Path und Gegenfälle, kontrolliere CI, aktualisiere Pflichtenheft/Entscheidungsprotokoll sowie die separate Aufwand-/Kostendokumentation und prüfe anschließend selbstkritisch, ob Ergebnis und Methodik wirklich besser geworden sind. Ein abgeschlossener Block ist kein Grund anzuhalten. Stoppe nur an einer echten Freigabe-/Risikogrenze oder wenn technisch kein sicherer weiterer Schritt möglich ist.**