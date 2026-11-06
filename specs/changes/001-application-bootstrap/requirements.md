# 001 — Application Bootstrap: Requirements

**Status:** Approved baseline; implementation not started.

## Objective

Establish the smallest runnable, testable, deployable application foundation for the subsequent event workflow. This change implements no product features.

See [mission](../../mission.md), [technology stack](../../tech-stack.md), and [roadmap](../../roadmap.md). This change covers deployment feasibility and technical prerequisites; it does not complete the roadmap's application-foundation milestone, which also requires staff access protection.

## Confirmed decisions

- TypeScript, React/Vite, Express, MariaDB, and npm.
- Separate frontend/backend code, preferably deployed as one application.
- Local MariaDB in Docker; existing MariaDB in production.
- Hosting, database, and SMTP verification are required.
- Existing WordPress operation must be preserved.
- Vitest for automated tests.

## Requirements

| ID | Requirement |
| --- | --- |
| R1 | Provide separate frontend and backend source directories with documented npm commands for installation, development, type checking, tests, build, and production start. Commit the dependency lockfile. |
| R2 | Provide a minimal React page that calls `GET /api/health` and displays loading, success, or failure. The endpoint returns a small documented JSON response without infrastructure details or secrets. |
| R3 | Proxy API requests through Vite during development. In production, Express serves the built frontend and API from one origin. Unknown API routes return an API error, not frontend HTML. |
| R4 | Provide a Docker Compose configuration for local MariaDB, with persistent storage and a database port bound only to localhost. Document start, stop, and explicitly destructive reset procedures. No production containers are required. |
| R5 | Configure runtime settings and credentials outside source code. Provide placeholder configuration examples; keep backend secrets out of frontend bundles and logs. |
| R6 | Provide a manually invoked database check using a non-mutating query and an explicitly invoked SMTP check sending one test email to a supplied recipient. Both must terminate with clear success/failure results and bounded timeouts. Neither is exposed through HTTP or runs during ordinary tests or startup. |
| R7 | Provide automated smoke tests for the health API and frontend loading/success/failure behavior, plus TypeScript checking. Normal tests must not depend on Hetzner, MariaDB, or an SMTP server. |
| R8 | Document and verify deployment, HTTPS routing, runtime configuration, logs, and process restart behavior on Hetzner without disrupting WordPress. Document how to stop or remove the bootstrap deployment safely. |

The health endpoint checks application responsiveness only—not database or email availability.

## Out of scope

Event schemas and CRUD, registration, authentication, payments, migrations, ORM selection, UI libraries, frontend routing libraries, global state management, queues, Redis, production Docker, and CI pipelines.

Staff access protection must be specified and implemented before adding restricted product operations.

## Open questions and verification

- Confirm Hetzner's manual deployment, routing, and process supervision mechanism. Runtime availability alone does not establish these capabilities.
- Confirm production MariaDB version and SMTP connection settings; credentials are not part of the specification.

Substantive scope changes require review before implementation. See the [implementation plan](plan.md) and [validation criteria](validation.md).
