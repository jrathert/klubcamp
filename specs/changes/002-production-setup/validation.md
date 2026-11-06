# 002 — Production Setup: Validation

**Status:** All production checks pending. No verified Klubcamp deployment exists on Hetzner.

Validate against [requirements.md](requirements.md) using [plan.md](plan.md). Record concise results and sanitized evidence, never credentials. Local evidence is in [001](../001-application-bootstrap/validation.md) and does not satisfy these criteria.

| ID | Requirements | Passing evidence | Result |
| --- | --- | --- | --- |
| V1 | R1, R2 | Supported runtime, exact patch version, target routing, HTTPS, and supervision procedure are established and approved; WordPress activation hazard is addressed. | Pending |
| V2 | R1, R3 | The bootstrap is installed and started using documented commands; public HTTPS page, assets, and health API work. Unknown API routes return JSON 404. | Pending |
| V3 | R4 | Runtime settings use an approved private location; frontend output, public files, and operational logs contain no backend secrets. Listener settings match provider requirements. | Pending |
| V4 | R5 | Hosted `check:db` exits successfully using a non-root account; actual database version and relevant connection/server settings are recorded. The check does not mutate data. | Pending |
| V5 | R6 | An explicitly authorized message is accepted through authenticated production SMTP over TLS and confirmed in the intended recipient inbox. | Pending |
| V6 | R7 | The process remains available under the agreed supervision mechanism. Documented stop/start/restart and recovery work; logs are accessible and sanitized; failures are detectable. | Pending |
| V7 | R2, R8 | WordPress works before/after deployment and restart. Safe stop/removal is verified without modifying shared resources or deleting data. | Pending |
| V8 | R1, R8 | README and production-environment reference describe the verified procedure and current results; no unperformed external check is marked passed. | Pending |

## Known facts and blockers

- The owner reports Hetzner Webhosting L with Node.js 24 and MariaDB 10.11.19. The provider's exact Node patch version is not recorded.
- WordPress must remain operational. Provider documentation warns that activating Node.js disables PHP/HTML applications on the selected domain.
- Routing/domain, persistent operation, supervision, configuration placement, and safe removal are not yet established or approved.
- Hosted database credentials/configuration, production SMTP settings, and a designated authorized test recipient have not been supplied for validation.
- The local API, MariaDB, and Mailpit checks passed in change 001. No hosted connectivity, external inbox delivery, HTTPS deployment, or remote operational checks have been performed.

## Completion rule

Complete only when all criteria pass and evidence is recorded. Report missing access, unsupported capabilities, and unperformed external checks as blockers, not waived requirements. Planning approval alone does not authorize remote changes.
