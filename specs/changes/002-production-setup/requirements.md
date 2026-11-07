# 002 — Production Setup: Requirements

**Status:** Complete — bootstrap deployment verified. Owner-approved pre-release deferrals are tracked separately; this is not approval for real product use.

## Objective

Deploy and verify the existing bootstrap at `https://camps.schwarzweisskoeln.de` using Hetzner's built-in Node.js configuration. This change demonstrates deployment feasibility and hosted connectivity, separated from [001 — Application Bootstrap](../001-application-bootstrap/requirements.md), not full operational or product-release readiness.

See the [production baseline](../../production-environment.md), [technology stack](../../tech-stack.md), and [roadmap](../../roadmap.md). Local bootstrap validation is complete; it is not evidence of production readiness.

## Requirements

| ID | Requirement |
| --- | --- |
| R1 | Establish the bootstrap deployment procedure on Hetzner Webhosting L using konsoleH-managed Node.js 24. Verify the effective runtime (v24.22.2), document installation/build/start commands, deployment contents, listener configuration, routing, and managed activation. Run one Express application serving the built frontend and JSON API; do not run development servers in production. Detailed supervision/recovery and resource documentation follow under PR1. |
| R2 | Use the owner-created application hostname `camps.schwarzweisskoeln.de`. Confirm the selected konsoleH target and obtain approval for the concrete routing and deployment procedure before remote changes. Other domains and their applications are outside this change's scope and validation. If the existing package cannot support the application safely, present alternatives for approval rather than introducing infrastructure unilaterally. |
| R3 | Serve the bootstrap page, assets, and API over HTTPS from one origin. `/api/health` returns the documented response; unknown API paths remain JSON 404 responses. |
| R4 | Keep runtime configuration and credentials outside source control, public files, frontend bundles, and diagnostic logs. Use a dedicated private application directory exposing only built frontend files. Load the main production settings explicitly from a manually editable private file before startup and manual checks. Avoid panel environment entries except at most one or two justified bootstrap/provider settings. Verify hosted paths, permissions, loading, public-file boundaries, and restart-after-edit behavior; accept local launcher tests for precedence and sanitized failure cases. Document the working `HOST`/`PORT` settings and loading contract. Additional host-specific failure/precedence verification follows under PR6. |
| R5 | Verify hosted MariaDB connectivity using non-mutating `npm run check:db` and a non-root application account. Record the actual version and supplied server/administration-session metadata without secrets, explicitly distinguishing those results from application-session TLS/access/configuration evidence. The latter follow under PR3. |
| R6 | Verify the existing production SMTP service with authenticated TLS using `SMTP_MODE=smtp`. Send one explicitly authorized test message to a supplied recipient and separately confirm inbox arrival. Local Mailpit capture or SMTP acceptance alone does not prove production delivery. |
| R7 | Demonstrate managed application availability, accessible sanitized startup logs, and owner-tested manual restart after configuration edits. Preserve local startup-failure tests and do not expose credentials in output. Full stop/start/restart instructions, unexpected-exit recovery, and hosted failure detection follow under PR1/PR6. |
| R8 | Document replacement/removal boundaries preserving shared services, database data, logs, and private configuration. Record deployment evidence and owner-approved deferrals accurately. The actual safe hosted update/removal rehearsal is deferred to PR2, not claimed as passed. |

## Boundaries and dependencies

- Depends on the completed local bootstrap. Deploy that foundation only; no event features or staff authentication are introduced here.
- Hosted Node.js v24.22.2 and actual application database MariaDB 11.8.6 are owner-verified. The original 10.11.19 report referred to an old server. The owner approved updating local Compose to 11.8.6 on a fresh version-specific volume without reusing or deleting earlier volumes. This is the only approved development-environment adjustment in this closeout update.
- Preserve the existing local development setup, including local `.env` loading, npm development commands, runtime pin, Docker Compose, and Mailpit. If a development-environment change becomes necessary, explain the need and obtain explicit approval before making it.
- The owner authorized proceeding with the agreed packaging/private-file approach. Existing development commands remain unchanged; production tooling is additive.
- Build locally with `npm run build:production`, upload `release/klubcamp/app/`, and install runtime dependencies on Hetzner. The artifact provides compiled DB/SMTP checks under the same npm command names as development, without requiring TypeScript source or `tsx`. Keep packaging and production launch/check tooling provider-neutral, including the shared environment reference. Document the fixed private-file convention as an application contract, not a provider requirement. Separate [shared packaging/startup instructions](../../../docs/deployment.md) from [Hetzner operation and current external Azure SMTP settings](../../../docs/deployment-hetzner.md); do not introduce provider adapters or change runtime behavior solely for this separation.
- Access, verified database/SMTP settings, an approved recipient, and an approved routing/supervision procedure are prerequisites for external checks.
- This specification authorizes planning the production setup, **not remote deployment or configuration changes**. Obtain explicit operational approval before executing those steps.
- No production Docker, new hosting infrastructure, DNS/domain changes, schema migrations, or data migration is authorized by default.
- Backup/restore and production personal-data handling must be established before product use; local bootstrap deployment does not satisfy that broader release requirement.

## Owner-approved completion boundary

The owner approved closing 002 once bootstrap deployment, HTTPS frontend/API, private configuration, hosted DB connectivity, SMTP acceptance/receipt, and manual restart were demonstrated. Previously broader operational criteria are explicitly transferred to [pre-release readiness PR1–PR6](../../release-readiness.md), not silently waived or marked passed. Local tests are accepted for launcher failure/precedence behavior; their hosted follow-up remains tracked separately. This scope revision unblocks product development, not real registrations or personal-data use.

See the [implementation plan](plan.md) and [validation criteria](validation.md).
