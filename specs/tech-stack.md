# Technology Stack

## Confirmed direction

- **Language:** TypeScript for frontend and backend.
- **Frontend:** React SPA built with Vite. Server-side rendering, SEO, and rich event-sharing previews are not first-release requirements.
- **Backend:** Node.js with Express, exposing a JSON HTTP API.
- **Database:** MariaDB.
- **Email:** Existing mail service; SMTP configuration remains to be verified.
- **Hosting:** Existing Hetzner Webhosting L package. Preserve the club's WordPress website.

## Approved architecture

- Keep frontend and backend code separate in one repository.
- Prefer one deployment, with Node.js serving the API and built frontend, subject to hosting verification.
- Keep business logic separate from HTTP handlers and database access.
- Document the API boundary so the frontend is not coupled to backend implementation details.

The priority is understandable code and lightweight infrastructure. No additional runtime services, such as Redis, are currently justified.

## Deferred decisions and validation

- Verify persistent Node.js operation, routing, and process management alongside WordPress; determine whether a dedicated subdomain is needed.
- Select database access and migration tooling.
- Define authentication, authorization, input validation, and personal-data safeguards in the relevant specifications.
- Select testing tools and establish backup, restore, and deployment procedures before production use.

## Reconsideration

TypeScript/Node.js is an intentional learning choice. A later move to PHP/Symfony is acceptable if necessary, but would require backend reimplementation. Preserving the API contract may allow reuse of the React frontend.
