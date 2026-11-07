# 002 — Production Setup: Validation

**Status:** Complete — bootstrap deployment verified and accepted by the owner. Broader operational checks are explicitly deferred to pre-release readiness, not recorded as passed.

Validated against the owner-revised [requirements.md](requirements.md) using [plan.md](plan.md). The completion decision accepts the deployed bootstrap and transfers unfinished operational work to [pre-release readiness](../../release-readiness.md). Existing local/hosted evidence is preserved below, with sources distinguished; local results do not substitute for hosted checks unless explicitly accepted in the revised criterion.

| ID | Requirements | Passing evidence | Result |
| --- | --- | --- | --- |
| V1 | R1, R2 | Effective Node.js version, konsoleH target, managed activation, HTTPS routing, and listener configuration are established. Detailed supervision/recovery/resource verification transfers to PR1. | Passed for bootstrap — runtime/target/routing verified; PR1 deferred |
| V2 | R1, R3 | Documented build, artifact transfer, dependency installation, and startup steps reproduce one Express deployment serving `backend/dist/` and `frontend/dist/`, without a Vite server. Public HTTPS page, assets, and health API work at `camps.schwarzweisskoeln.de`. Unknown API routes return JSON 404. Hosted DB/SMTP check tooling is available through the documented deployment procedure. | Passed — owner deployment and agent public probes |
| V3 | R4 | Hosted private paths, owner-only permissions, explicit file loading for server/checks, restart-after-edit, and public file boundaries work. Local launcher tests are accepted for precedence and sanitized failure cases. Additional host-specific verification transfers to PR6. | Passed for bootstrap — hosted paths/loading/boundaries and local negative tests; PR6 deferred |
| V4 | R5 | Hosted read-only `check:db` succeeds with a non-root account; actual version and supplied administration-session settings are recorded with evidence limits. App TLS/access/session verification transfers to PR3. | Passed for bootstrap — connectivity/version/non-root/metadata verified; PR3 deferred |
| V5 | R6 | An explicitly authorized message is accepted through authenticated production SMTP over TLS and confirmed in the intended recipient inbox. | Passed — owner confirmed acceptance and receipt (spam classification noted) |
| V6 | R7 | Managed availability, accessible sanitized startup logs, and manual restart after edits are demonstrated. Detailed operating/recovery/failure-detection checks transfer to PR1/PR6. | Passed for bootstrap — owner-tested manual restart and logs; PR1/PR6 deferred |
| V7 | R2, R8 | Hosted safe update/removal rehearsal preserving configuration, logs, DB data, and shared services. Preservation boundaries are documented, but the rehearsal was not performed. | Deferred to PR2 — not run, not passed |
| V8 | R1, R8 | README, shared/host guides, and production baseline describe verified deployment settings and evidence; remaining work has explicit pre-release ownership and acceptance criteria. | Passed — documentation synchronized; follow-up is tracked separately |

## Known facts and deferred release work

- Hosted Node.js **v24.22.2** is verified by owner SSH output. Actual database **11.8.6-MariaDB-0+deb13u1** is owner-confirmed on the application server; the previous 10.11.19 report referred to an old server. Compose is corrected to `mariadb:11.8.6` on a fresh version-specific volume with explicit owner approval.
- The owner has created `camps.schwarzweisskoeln.de` for the application. Other domains and their applications are outside scope; they are not deployment prerequisites or acceptance checks.
- The supplied konsoleH screenshot shows script path, working directory, log path, memory limit, version, script arguments, environment entries, and activation controls. It does not establish listener routing, restart controls, or automatic recovery behavior.
- The selected direction is one konsoleH-managed Express application serving the built React frontend and API over one HTTPS origin. The bootstrap already supports this layout locally; no separate production frontend server is required.
- Actual managed activation confirms public routing works with `HOST=127.0.0.1`, `PORT=3000`. The provider's internal forwarding mechanism is not assumed. Restart/recovery details and resource limits still require inspection/documentation.
- Local packaging and compiled checks were used for the owner-run deployment. Memory limit, automatic recovery, startup-failure detection, and safe removal remain open; do not mark them passed based on successful activation alone.
- Private-file loading works on the host for startup and checks. Owner verified `~/klubcamp` mode 700 and `production.env` mode 600. Missing/unreadable-file and environment-precedence behavior is covered locally; no deliberate hosted configuration failure was performed.
- The owner authorized implementing the agreed deployment tooling. Existing development commands, `.env` loading, dependency declarations/lockfile, runtime pin, Docker Compose, and Mailpit were left unchanged. Only additive production commands/ignore rules and production-specific files/documentation were introduced.
- SMTP delivery and database connectivity were verified by owner-run commands without placing credentials in this record. Application DB TLS/access details remain open. Spam classification is a later release concern, not a failed SMTP-delivery test.
- Local bootstrap history remains in 001. The owner has now supplied hosted runtime/database/email/restart evidence, and the agent performed public read-only HTTPS/routing/file-boundary probes.

## Local deployment-tooling evidence

- **Runtime/regression:** Node.js 24.22.2/npm 11.19.1. `npm run typecheck`, all 30 existing Vitest tests, six production-tooling tests (`npm run test:production`), and repeated `npm run build:production` passed.
- **Bootstrap:** Tests cover loading relative to the launcher rather than the working directory, existing-environment precedence, restart loading edited values, missing/non-private configuration failures, production-mode and explicit-listener guards, sanitized import failures, and opt-in check dispatch preserving SMTP recipient arguments.
- **Packaging:** Tests verify the runtime allowlist, exclusion of stale compiled tests/private local configuration, repeatable regeneration, preservation of sibling configuration, refusal to replace unmarked output, and refusal to follow a linked output directory. The artifact includes no source checks or `tsx` requirement.
- **Runtime-only artifact:** A copy of the generated artifact was installed in an isolated `/tmp/opencode/` directory using `npm ci --omit=dev` (75 packages, zero audit findings). `tsx` was absent. With disposable private configuration and a loopback-only listener, the real launcher served HTML/assets, health JSON, and JSON API 404s. Private configuration/package/backend paths did not expose their file contents. A synthetic backend-secret canary was absent from frontend output and captured logs. SIGTERM stop and a second startup passed.
- **Compiled-check negative paths:** During local tooling validation both generated npm commands failed safely under intentionally incomplete configuration; no email or database mutation was performed by those local tests. Positive hosted results are recorded below.
- **Initial tooling scope:** No hosted mutation or development-environment change occurred during initial tooling implementation. The later owner-run deployment and explicitly approved MariaDB correction are separate evidence below. No commits were made.

## Hosted evidence — 7 November 2026

- **Paths/runtime:** Owner corrected the upload location to the SSH account home (not Apache document root), then activated konsoleH. `node --version` returned v24.22.2. Panel paths are `klubcamp/app`, `app.js`, and `klubcamp/application.log`; the internal listener remains `127.0.0.1:3000`.
- **Public probes (agent):** HTTPS homepage and both referenced JS/CSS assets returned 200 with a trusted certificate. Health returned `{"status":"ok"}`. Unknown API paths, `/api`, and POST to health returned JSON 404. IPv4 and IPv6 HTTPS health succeeded; HTTP redirected permanently to HTTPS. Owner also confirmed HTTPS browser operation.
- **Private boundaries:** Probes of configuration, launcher/runtime, package/lockfile, compiled backend, and log URLs returned identical SPA HTML rather than file contents. This is expected SPA fallback, not exposure of private files. Owner verified directory/file modes 700/600 and supplied a log excerpt containing only repeated sanitized startup messages.
- **Database (owner):** `npm run check:db` succeeded. The owner confirmed the actual DB server/version and a non-root account. Administration-session metadata: `utf8mb4`, `utf8mb4_unicode_ci`, SQL mode `STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION`, time zone `SYSTEM`, cipher `TLS_AES_256_GCM_SHA384`. Cipher/session settings apply to that administration connection, not necessarily the app driver; application DB TLS remains unverified.
- **SMTP (owner):** Azure `smtp.azurecomm.net:587` failed with `SMTP_SECURE=true`; changing to `false` enabled required STARTTLS and the check succeeded. Owner confirmed recipient delivery in Thunderbird, marked as spam. No passwords, login identity, sender, or recipient are recorded here.
- **Restart (owner):** Manual restart worked while editing SMTP configuration. Automatic recovery, exact control sequence, and safe removal have not been verified.

## MariaDB baseline correction validation

- Owner explicitly approved the development DB image correction. Compose configuration validation with placeholder `.env.example` succeeded. Type checking, all 30 Vitest tests, six production-tooling tests, and `npm run build:production` passed after the update; `git diff --check` passed.
- The actual Compose DB service was started in isolated project `klubcamp002-dbverify`, with a fresh project-scoped `mariadb-11-8-6-data` volume and a dynamically allocated **loopback-only** port. No existing development service was restarted and no legacy volume was reused.
- `healthcheck.sh --connect --innodb_initialized` and the unchanged `npm run check:db` passed against MariaDB `11.8.6-MariaDB-ubu2404` with a non-root account. Local administration-session values: `utf8mb4`, `utf8mb4_uca1400_ai_ci`, the same SQL mode as production, and `SYSTEM` time zone. The connection collation differs from production's administration session; this is recorded, not silently changed or claimed as full parity.
- The isolated container, network, and test volume were removed after validation. Existing application data, legacy volumes, `.env`, SMTP/Mailpit configuration, and Node/Vite development behavior were untouched. No remote change or email was performed as part of this documentation/database correction.

## Packaging/provider documentation separation

- The owner approved separating the provider-neutral artifact/runtime contract (`docs/deployment.md`) from current host operations and external Azure SMTP settings (`docs/deployment-hetzner.md`). README and specification links were updated accordingly.
- `deployment/production.env.example` now uses generic host/mail placeholders and explains the TLS boolean without embedding Hetzner or Azure configuration values. Actual production values remain documented in the host guide; no server configuration was edited.
- Type checking, all 30 application tests, six production-tooling tests, and the production build passed. All 48 relative documentation links/anchors checked in README, both deployment guides, the production baseline, tech stack, and change 002 resolved; `git diff --check` passed.
- SHA-256 checksums for every generated artifact file matched the pre-reorganization artifact byte-for-byte. No runtime, packaging logic, development environment, deployed paths, or production behavior changed. No redeployment is required for this reorganization, and no hosted check was rerun or newly marked passed.

## Owner-approved closure and transfer

The owner accepted 002 as **bootstrap deployment verified** and explicitly requested moving the remaining operational work to before real product use. This changes the completion scope; it does not assert that previously pending tests were performed.

| Previously open portion | Follow-up |
| --- | --- |
| V1/V6/V8: exact operating controls, resource/memory details, automatic recovery, startup-failure detection | PR1 |
| V7/V8: hosted safe removal/update and recovery rehearsal | PR2 |
| V4: actual application DB TLS/access and session/schema settings | PR3 |
| Existing broader backup/restore and personal-data obligations | PR4 |
| V5 follow-up: spam classification/sender deliverability, despite successful acceptance and receipt | PR5 |
| V3/V6: additional host-specific configuration precedence and failure tests (only local negative tests performed) | PR6 |

All PR items are in the linked pre-release checklist and remain open. Product development with synthetic data may proceed, including change 003 under its own approved scope; real registrations, personal-data storage, and real confirmation emails remain gated.

**Closure validation:** This is a documentation-only scope/acceptance update. All 93 relative links/anchors across README, docs, and specifications resolve; `git diff --check` passed. No runtime code, development configuration, or hosted resource changed, no application/hosted tests were rerun for closure, and no previously unperformed test gained a passing result. Earlier runtime/test evidence remains historical as recorded above.

## Completion rule

002 is complete when the owner accepts the demonstrated bootstrap deployment, revised in-scope criteria are supported by recorded evidence, and deferred portions are explicitly transferred to the pre-release checklist. These conditions are met. V7 is deferred, not passed; V1/V3/V4/V6 passed only for the revised bootstrap boundary. Closure is not a product-release approval, an authorization for remote changes, or evidence of unperformed tests.
