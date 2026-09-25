# ADCELL readiness – FundBlick

Status: prepared, **not active**.

## Purpose

FundBlick is prepared so ADCELL can later be activated without redesigning consent handling. The production configuration deliberately keeps ADCELL disabled until real publisher/program data and the final live disclosure are present.

## Contract-derived requirements currently reflected in the implementation

- The publisher is responsible for correct technical integration of advertising material/tracking.
- FundBlick must inform users about ADCELL-related tracking and provide an accessible way to control/refuse it.
- The ADCELL Joint Controller agreement names IAB Vendor ID 766 and refers users to ADCELL's privacy/opt-out information.
- Publisher data and registration details must be truthful and current.
- Individual partner programs can impose their own participation requirements.
- Self-generated leads/sales or artificial transactions must not be used to generate commission.
- A legally compliant imprint identifying the operator must remain available.

## Implemented now

- `affiliate-config.js` is the single activation switch. ADCELL is currently `enabled:false` and `trackingEnabled:false`.
- `affiliate-consent.js` contains the consent gate. Tracking is considered allowed only when ADCELL is enabled, tracking is enabled, and the user has explicitly granted consent.
- No ADCELL script, pixel, cookie, redirect or external request is loaded by this readiness layer.
- The consent UI supports the 20 FundBlick interface languages.
- `affiliate-consent.css` provides desktop/mobile styling.
- `datenschutz.html` contains a clearly marked inactive ADCELL preparation section and a separate live disclosure block that remains hidden until activation.
- `language-links.js` loads the readiness assets site-wide so the future switch is centralized.
- `verify-affiliate-readiness.js` blocks unsafe activation in CI.

## Activation checklist

Do not activate ADCELL by changing only one flag. Complete all items together:

1. ADCELL account accepted and real publisher identifiers available.
2. Relevant individual partner-program terms reviewed.
3. Real affiliate-link/feed integration implemented from ADCELL's documented format; do not invent URL formats.
4. Change `affiliate-config.js`: `enabled:true` only when the network should be visible; `trackingEnabled:true` only when real tracking is ready.
5. Update `datenschutz.html` to the actual active implementation and set `data-adcell-live-disclosure="true"` plus `liveDisclosure:true` in config.
6. Verify reject/no-consent causes **zero ADCELL tracking requests/cookies**.
7. Verify consent allows only the intended ADCELL tracking path.
8. Verify the user can reopen Tracking Settings and revoke/deny the choice.
9. Check mobile layout and all language variants.
10. Run the full production workflow before deploy.

## Important

Registration at ADCELL can happen while this configuration remains disabled. Registration itself and production tracking are deliberately separate states.
