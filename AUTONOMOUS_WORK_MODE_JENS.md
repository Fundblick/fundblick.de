# FundBlick – Autonomer Arbeitsmodus für Jens

Diese Datei ergänzt `DESKTOP_HANDOFF_2026-09-30.md` und hat für die Arbeitsdauer Vorrang, falls dort eine Formulierung so verstanden werden könnte, dass nach jedem Arbeitsblock auf eine neue Nachricht von Jens gewartet werden soll.

## Kernauftrag

**Nicht nach einem sinnvollen Arbeitsblock anhalten und auf `Weiter` warten.**

Wenn Jens `Los`, `Weiter`, `Attacke`, `arbeite weiter`, `mach weiter` oder sinngemäß die autonome Fortsetzung freigibt, soll der Desktop-Agent **so lange wie in der laufenden Sitzung technisch sinnvoll möglich selbstständig weiterarbeiten**.

Ziel: Jens soll den Rechner laufen lassen und z. B. einen Film schauen können, ohne alle paar Minuten `Weiter` schreiben zu müssen.

## Arbeitszyklus

Solange keine echte Blockade oder Freigabegrenze erreicht ist, wiederholt der Agent selbstständig:

1. aktuellen HEAD/Arbeitsstand feststellen;
2. nächsten offenen Punkt aus Handoff/Checkliste wählen;
3. relevante Dateien und bestehenden Code prüfen;
4. Änderung ausschließlich auf `development` implementieren;
5. passende Regressionstests ergänzen oder bestehende Tests ausführen;
6. Fehler ursächlich beheben, nicht Gates abschwächen;
7. nachvollziehbar committen;
8. CI/GitHub Actions kontrollieren;
9. bei rotem Gate Logs untersuchen, Fehler korrigieren und erneut prüfen;
10. wenn der Block sauber ist, **ohne neue Benutzernachricht automatisch den nächsten offenen sinnvollen Punkt beginnen**.

Danach wieder bei Schritt 1 bzw. 2 fortfahren.

## Wann NICHT auf Jens warten

Nicht anhalten nur weil:

- ein Commit fertig ist;
- ein Test grün ist;
- ein Teilblock abgeschlossen ist;
- ein Zwischenbericht möglich wäre;
- der nächste Punkt bereits aus der Checkliste hervorgeht;
- eine technische Detailentscheidung reversibel und innerhalb des vereinbarten Development-Ziels ist;
- mehrere weitere sichere Development-Aufgaben vorhanden sind.

Zwischenstände dürfen im Chat sichtbar sein, sollen aber **kein künstlicher Stopppunkt** sein, sofern die Umgebung weiteres Arbeiten erlaubt.

## Wann anhalten / Freigabe verlangen

Nur bei einer echten Grenze, insbesondere:

- Änderung an `main`, Backup oder Live/Produktion wäre erforderlich;
- Merge/Deployment/Live-Schaltung steht an;
- kostenpflichtiger externer Dienst oder neue laufende Kosten wären nötig;
- Zugangsdaten, Secrets oder eine Nutzeraktion außerhalb der verfügbaren Werkzeuge sind zwingend erforderlich;
- mehrere fachlich grundverschiedene Produktentscheidungen sind möglich und Jens' Präferenz ist nicht aus Projektziel/Handoff ableitbar;
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
- Dokumentation/Checkliste auf tatsächlichen Stand bringen.

Dabei keine Scope-Ausweitung in fremde Projekte und keine Live-Änderung.

## Berichterstattung

Die ausführliche, verständliche Berichtsweise aus `DESKTOP_HANDOFF_2026-09-30.md` bleibt gültig. Sie bedeutet aber **nicht**, dass nach jedem Bericht auf Jens gewartet werden soll.

Berichte sollen nach größeren sinnvollen Etappen bzw. bei wichtigen Funden erfolgen und enthalten möglichst:

`geprüft -> gefunden -> geändert -> getestet -> CI-Status -> Commit(s) -> nächster Schritt`

Danach, sofern keine Freigabegrenze erreicht ist, selbstständig mit dem angekündigten nächsten Schritt fortfahren.

## Sicherheitsgrenze

- Arbeitsbranch: `development`.
- `main`, Backup und Live/Produktion nicht verändern.
- Keine Gates löschen/abschwächen, um grün zu werden.
- Keine Live-Schaltung ohne ausdrückliche Freigabe von Jens.
- Kleine nachvollziehbare Commits bevorzugen.
- Bestehende FundBlick-Funktionalität schützen.

## Kurzfassung für den Agenten

**Arbeite nach Freigabe durch Jens möglichst lange autonom in `development`. Ein abgeschlossener Block ist kein Grund anzuhalten. Prüfe, implementiere, teste, committe, kontrolliere CI, behebe Fehler und gehe selbstständig zum nächsten offenen Punkt über. Stoppe nur an einer echten Freigabe-/Risikogrenze oder wenn technisch kein sicherer weiterer Schritt möglich ist.**
