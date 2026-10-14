# FundBlick website

Before project work, read the private [documentation master](https://github.com/Fundblick/fundblick-core/blob/main/core/internal-docs/DOCUMENTATION-MASTER.md) and follow its reading order. The current private handoff is linked from [docs/HANDOFF_CURRENT.md](docs/HANDOFF_CURRENT.md).

Internal documentation belongs exclusively in Fundblick/fundblick-core. This public repository contains website/build/deployment inputs and these entry-point links. Use branch + PR and preserve the existing safety gates.

## Zero-waste CI and cost rules (mandatory)

Before adding any workflow, scheduled feed job, browser suite or deployment step, read the private [cross-project CI budget policy](https://github.com/Fundblick/fundblick-core/blob/main/core/internal-docs/KOSTEN-KONTINGENTE-CI-REGEL_2026-10-14.md) (requires authorization). Prefer local deterministic tests, bundled commits and one necessary PR/release acceptance rather than push-triggered duplicate full suites. Estimate monthly runner minutes and provider quotas first; do not increase billing limits or disable security gates without explicit authorization. Internal billing analyses and project reports stay ONLY in the private Core repository.
