# 001 — Application Bootstrap: Validation

**Status:** Complete — local acceptance criteria passed. Production verification is tracked in [002 — Production Setup](../002-production-setup/validation.md).

Validate against [requirements.md](requirements.md). Do not record credentials or other secrets. Retained validation IDs remain stable; V6/V8 and hosted portions of V9 moved to change 002.

| ID | Requirements | Acceptance evidence | Result |
| --- | --- | --- | --- |
| V1 | R1, R7 | Clean dependency installation, type checking, tests, and build succeed. | Passed |
| V2 | R2, R3, R7 | Development frontend reaches health API through Vite; loading/success/failure behavior is covered. | Passed |
| V3 | R1, R3 | Built Express application serves frontend/assets and health API; unknown API paths return JSON 404. Local stop/restart works. | Passed |
| V4 | R4, R6 | Local MariaDB check succeeds and data survives container recreation; port binds only to localhost. | Passed |
| V5 | R6 | Checks fail with nonzero results, sanitized diagnostics, and bounded timeouts; checks are opt-in only. | Passed |
| V7 | R2, R5 | Secret files are ignored; frontend artifacts and captured diagnostics do not expose synthetic backend secrets. | Passed |
| V9 | R6 | Local database connectivity passes. Hosted connectivity is owned by change 002. | Passed locally |
| V10 | R9 | Mailpit captures test messages and persists them across recreation; loopback-only ports and development SMTP guards are verified. | Passed |

## Current evidence

- **Runtime and regression:** Node.js 24.22.2/npm 11.19.1. Type checking, 30 tests across three files, and production build passed. Clean-source installation/build validation and local built-server/API smoke checks also passed.
- **Frontend/API:** Automated tests cover health/API boundaries and frontend loading, success, and failure. Browser checks confirmed success and failure through Vite. The owner independently confirmed the frontend success page and `/api/health` on frontend/backend, with backend port 3000 working.
- **Database:** MariaDB 10.11.19 in an isolated local Compose project passed `check:db`. A disposable row survived container recreation; test data and isolated resources were removed. Existing volumes were not modified.
- **Check safety:** Missing/refused configurations failed promptly. Stalled database/SMTP connections terminated within the documented bounds, including the SMTP script's 10-second total deadline. Synthetic secrets were absent from diagnostics. No check runs through HTTP, ordinary startup, tests, or builds.
- **Secrets:** Ignore rules exclude private environment files and logs. Synthetic database/SMTP secret canaries were absent from frontend output and captured logs.
- **Mailpit:** Pinned `axllent/mailpit:v1.33.0`; Compose validation passed using `.env.example`. The opt-in SMTP check succeeded under Node 24; Mailpit's API confirmed the expected subject/recipient. Captured mail survived container recreation. Published SMTP/UI ports were localhost-only. Ordinary SMTP mode refused plaintext Mailpit instead of downgrading TLS. The owner independently confirmed a message arrived in the browser inbox.
- **Documentation:** The [README](../../../README.md) describes local setup, configuration, checks, port changes, persistence, and destructive cleanup. Production settings and unresolved hosting decisions are documented separately.

## Completion boundary

The owner accepted completion of the local bootstrap. This establishes neither production readiness nor hosted database/SMTP delivery. Those checks remain pending in change 002; no production deployment or domain change was performed.
