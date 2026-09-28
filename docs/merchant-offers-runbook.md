# FundBlick Händlerangebote / Gutscheine – Runbook

Stand: 28.09.2026

## Ziel
FundBlick behandelt Händlergutscheine als eigenständige, zeitlich begrenzte Angebotsdaten. Gutscheine werden nicht als dauerhafte Produkteigenschaft und nicht pauschal auf einen gesamten Händler angewendet.

## Standard-Datenvertrag
Jedes Angebot benötigt soweit vorhanden:
- stabile interne Offer-ID
- Affiliate-Netzwerk und Händler
- öffentliche Überschrift und Beschreibung
- Gutscheincode
- Rabattart und Rabattwert
- Start- und Endzeit mit Zeitzone
- eindeutige Produkt-/Varianten-Zuordnung
- Bedingungen (z. B. Neukunden, Mindestkauf, Nutzung pro Kunde, Kombinierbarkeit, Online-Shop)
- optional separaten getrackten Angebotslink (`offerUrl`)
- Quelle und Verifikationsdatum
- Aktivstatus

## Sicherheitsregeln
1. Ein Gutschein wird nur angezeigt, wenn Händler UND Produkt-Matcher passen.
2. Abgelaufene Angebote werden automatisch nicht mehr ausgeliefert.
3. Ein Händlerangebot darf niemals ungeprüft auf das komplette Händlersortiment übertragen werden.
4. `offerUrl` ist optional. Der normale Produkt-Deep-Link bleibt davon getrennt.
5. Rabattbedingungen werden nicht verkürzt, wenn dadurch eine wesentliche Einschränkung verschwiegen würde.
6. Preisangaben werden nicht rechnerisch als garantierter Endpreis ausgegeben, sofern der Händler/Awin nur einen Gutscheinsatz und keinen verifizierten rabattierten Produktpreis liefert.
7. Änderungen an echten Angeboten erfolgen zuerst auf `development` und durchlaufen einen Regressionstest.

## Erster Produktionsfall – Ahipos Horses DE / IMMUN10
Quelle: Awin-Angebot, vom Publisher am 28.09.2026 geprüft; Gutschein zusätzlich im Ahipos-Checkout praktisch verifiziert.

- Händler: Ahipos Horses DE
- Aktion: 10 % Rabatt auf AHIPOS SULFO IMMUN – Sulforaphan und Spirulina
- Umfang laut Awin: 3 Varianten
- Code: `Immun10`
- Ende: 23.10.2026, 23:59 Uhr
- Mindestkauf: keiner erforderlich
- Nutzung: einmal pro Kunde
- Kombinierbarkeit: nicht mit anderen Rabatten kombinierbar
- Zielgruppe laut Awin-Detail: Customers who haven't purchased
- Kanal: Onlineshop
- Angebotslink: vorhanden, aber noch nicht als Konfigurationswert gespeichert; erst nach Übernahme der vollständigen URL

Checkout-Verifikation am 28.09.2026:
- Beispielvariante 3 × 30 Stück
- Ausgangspreis: 149,90 EUR
- Gutscheinabzug: 14,99 EUR
- angezeigter Zwischen-/Gesamtpreis vor ggf. adressabhängigem Versand: 134,91 EUR

Diese Checkout-Werte dienen als Verifikationsnachweis und werden nicht als dauerhaft gültiger Produktpreis fest codiert.

## Darstellung
Professionelle Standarddarstellung auf einer passenden Produktkarte:
- Angebots-Badge (`10 % Rabatt`)
- Gutscheincode deutlich und kopierbar
- Ablaufdatum
- kompakte wesentliche Bedingungen
- optional CTA über `offerUrl`, sofern ein verifizierter Angebotslink vorhanden ist

Die Darstellung muss mobil zuerst funktionieren und darf den normalen Produktpreis oder den normalen Händler-CTA nicht ersetzen.

## Pflege / Ablauf
Das System entscheidet anhand `endsAt`, ob ein Angebot aktiv ist. Nach Ablauf verschwindet die Angebotsdarstellung automatisch; der Datensatz kann zur Nachvollziehbarkeit bestehen bleiben. Vor einer Verlängerung oder Wiederverwendung ist eine neue Händler-/Awin-Verifikation erforderlich.
