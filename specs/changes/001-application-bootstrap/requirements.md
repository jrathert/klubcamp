# 001 — Application Bootstrap: Requirements

**Status:** Complete — local development foundation implemented and validated.

## Objective

Provide the smallest runnable and testable local application foundation, with no product features. Production deployment and external-service verification belong to [002 — Production Setup](../002-production-setup/requirements.md).

See [mission](../../mission.md), [technology stack](../../tech-stack.md), and [roadmap](../../roadmap.md). This change does not complete the roadmap's broader application-foundation milestone, which also requires staff access protection and deployment.

## Confirmed decisions

- TypeScript, React/Vite, Express, and npm; separate frontend/backend directories.
- Node.js 24, locally pinned to 24.22.2.
- Local Docker MariaDB 10.11.19, aligned with the provider's reported version.
- Local Docker Mailpit captures development email without external delivery.
- Vitest; normal tests and startup do not depend on live infrastructure.

## Requirements

| ID | Requirement |
| --- | --- |
| R1 | Provide separate frontend and backend source directories with documented npm commands for installation, development, type checking, tests, build, and local production-mode preview. Include the dependency lockfile. |
| R2 | Provide a minimal React page that calls `GET /api/health` and displays loading, success, or failure. The endpoint returns a small documented JSON response without infrastructure details or secrets. |
| R3 | Proxy API requests through Vite during development. The built application serves frontend and API from Express on one origin. Unknown API paths return an appropriate JSON error, not frontend HTML. |
| R4 | Provide pinned local MariaDB in Docker Compose, with persistent storage and a localhost-only port. Document start, stop, and explicitly destructive reset procedures. Preserve incompatible older database volumes. |
| R5 | Configure runtime settings and credentials outside source code. Provide configuration examples; keep backend secrets out of frontend bundles and logs. |
| R6 | Provide manually invoked database and SMTP checks. The database check uses a non-mutating query; the SMTP check sends one test message to a supplied recipient. Both have clear exit results, bounded timeouts, and sanitized diagnostics. Neither is exposed through HTTP or runs during normal startup or tests. |
| R7 | Provide automated tests for the health API and frontend loading/success/failure behavior, plus TypeScript checking. Normal tests must not require hosted services, MariaDB, or SMTP. |
| R9 | Provide pinned local Mailpit with localhost-only SMTP/browser ports and persistent captured messages. Explicit Mailpit mode allows unauthenticated plaintext SMTP only to loopback outside production. Default SMTP behavior requires authenticated TLS. Document setup, inbox inspection, retention, and cleanup. Local capture does not establish production delivery. |

R8 (hosted deployment) and the hosted portions of R6 are owned by change 002. Retained requirement IDs remain stable.

The health endpoint checks application responsiveness only—not database or email availability.

## Out of scope

Production deployment and external-service verification; event schemas and CRUD; registration; authentication; payments; migrations and ORM tooling; additional UI/routing/state libraries; queues; Redis; production Docker; CI pipelines.

Staff access protection must be specified and implemented before restricted product operations. See the [implementation plan](plan.md) and [validation results](validation.md).
