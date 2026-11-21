# Technology Stack

## Confirmed direction

- **Language:** TypeScript for frontend and backend.
- **Frontend:** React SPA built with Vite. Server-side rendering, SEO, and rich event-sharing previews are not first-release requirements.
- **Backend:** Node.js 26 with Express, exposing a JSON HTTP API; pinned toolchain Node.js 26.13.1 / npm 11.20.0.
- **Database:** MariaDB 11.8.6 in local Docker Compose and the hosted development deployment. Current application data is disposable; no production-data upgrade path is required. See [database baseline and migrations](../docs/event-publishing.md#migration-workflow).
- **Database tooling (003):** Owner-selected Drizzle ORM with `mysql2`; Drizzle Kit generates reviewed, versioned SQL migrations applied explicitly. The existing `mariadb` driver remains for bootstrap connectivity checks. Local MariaDB compatibility is verified; hosted checks are owner-accepted.
- **Staff access (003):** `openid-client` for single-tenant Entra OIDC; `express-session` with MariaDB-backed server sessions and a private stable tenant/user-ID allowlist. See [Entra setup](../docs/entra-setup.md); local and hosted staff-access acceptance is owner-confirmed.
- **Email:** Mailpit (Docker) captures local development email without TLS/authentication or external delivery. Hosted deployment uses Azure Communication Services SMTP with authenticated STARTTLS on port 587 (`SMTP_SECURE=false`); acceptance and recipient delivery are verified. Deliverability is owner-accepted under PR5; the initial spam result remains historical evidence.
- **Hosting:** Existing Hetzner Webhosting L package, using konsoleH-managed Node.js for `camps.schwarzweisskoeln.de`.

See [Hosted Development Environment](production-environment.md) for the current provider baseline and verification boundaries. The owner reports Node.js 26.13.1 / npm 11.20.0 on the host; local pins now match. Historical checks used Node.js 24.22.2 and are not evidence of a new hosted Node 26 test. Changes 002/003 are complete; all [operational checklist](release-readiness.md) items are passed for now by owner acceptance on 21 November 2026, not a new agent-run hosted test.

## Approved architecture

- Keep frontend and backend code separate in one repository.
- Use one deployment, with Node.js serving the API and built frontend; this topology is verified on Hetzner.
- Keep business logic separate from HTTP handlers and database access.
- Document the API boundary so the frontend is not coupled to backend implementation details.

The priority is understandable code and lightweight infrastructure. No additional runtime services, such as Redis, are currently justified.

## Deferred decisions and validation

- Process recovery and operating checks are owner-accepted under the pre-release checklist. See [provider-neutral packaging/startup](../docs/deployment.md) and [Hetzner-specific operation](../docs/deployment-hetzner.md); the build artifact and launchers do not invoke provider APIs.
- Hosted database/access/session tooling and Entra sign-in acceptance are owner-confirmed under change 003.
- Define further personal-data safeguards in the registration specification; event input validation and staff access are implemented under 003.
- Vitest covers ordinary automated tests without live services. Backup/restore and current operating checks are owner-accepted; future feature acceptance and the full v1.0 release remain separate.

## Reconsideration

TypeScript/Node.js is an intentional learning choice. A later move to PHP/Symfony is acceptable if necessary, but would require backend reimplementation. Preserving the API contract may allow reuse of the React frontend.
