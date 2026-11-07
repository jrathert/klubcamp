# Technology Stack

## Confirmed direction

- **Language:** TypeScript for frontend and backend.
- **Frontend:** React SPA built with Vite. Server-side rendering, SEO, and rich event-sharing previews are not first-release requirements.
- **Backend:** Node.js 24 with Express, exposing a JSON HTTP API.
- **Database:** MariaDB 11.8.6, confirmed on the production server; local Docker Compose pins `mariadb:11.8.6` with a fresh version-specific volume. The earlier 10.11.19 report referred to an old server.
- **Email:** Mailpit (Docker) captures local development email without TLS/authentication or external delivery. Production uses Azure Communication Services SMTP with authenticated STARTTLS on port 587 (`SMTP_SECURE=false`); acceptance and recipient delivery are verified. Spam classification remains a release concern.
- **Hosting:** Existing Hetzner Webhosting L package, using konsoleH-managed Node.js for `camps.schwarzweisskoeln.de`.

See [Production Environment](production-environment.md) for the current provider baseline and verification boundaries. Node.js 24.22.2 is verified locally and over SSH on the host. Change 002 is complete for the deployed HTTPS bootstrap; further operational checks are explicitly deferred to [pre-release readiness](release-readiness.md), not claimed passed.

## Approved architecture

- Keep frontend and backend code separate in one repository.
- Use one deployment, with Node.js serving the API and built frontend; this topology is verified on Hetzner.
- Keep business logic separate from HTTP handlers and database access.
- Document the API boundary so the frontend is not coupled to backend implementation details.

The priority is understandable code and lightweight infrastructure. No additional runtime services, such as Redis, are currently justified.

## Deferred decisions and validation

- Complete process recovery and other deferred operating checks before real product use under the pre-release checklist. See [provider-neutral packaging/startup](../docs/deployment.md) and [Hetzner-specific operation](../docs/deployment-hetzner.md); the build artifact and launchers do not invoke provider APIs.
- Select database access and migration tooling.
- Define authentication, authorization, input validation, and personal-data safeguards in the relevant specifications.
- Select testing tools and establish backup, restore, and deployment procedures before production use.

## Reconsideration

TypeScript/Node.js is an intentional learning choice. A later move to PHP/Symfony is acceptable if necessary, but would require backend reimplementation. Preserving the API contract may allow reuse of the React frontend.
