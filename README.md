# Klubcamp

Klubcamp is a responsive web application for organizing events at our field hockey club, primarily week-long training camps for young players.

It replaces fragmented announcements and paper/PDF or Google Forms registrations followed by manual Excel entry with a shared event and registration process.

At the same time, it is a project showing spec-driven development. See the `specs` directory for details.

## Current status

Event publishing is complete and owner-accepted: staff create, review, publish, and cancel events; public users browse lists and details. Staff access uses Entra OIDC and a private allowlist. The owner confirmed local staff access, trainer usability, and hosted feature/security checks on 21 November 2026. This is not a v1.0 product release.

The [local application bootstrap (001)](specs/changes/001-application-bootstrap/validation.md), [bootstrap deployment (002)](specs/changes/002-production-setup/validation.md), and [event publishing (003)](specs/changes/003-event-publishing/validation.md) are complete. All current [pre-release checklist](specs/release-readiness.md) items are passed for now by owner acceptance. Registration, confirmation emails, participant administration, and Excel export remain unimplemented and require their own specifications and validation.

Start with [event publishing setup and migrations](docs/event-publishing.md) and the [step-by-step Entra registration guide](docs/entra-setup.md). For the reason behind the two development servers, see [development setup](docs/development-setup.md).

Also see the [system architecture diagram](specs/diagrams/architecture.drawio.svg) for details.



## Local prerequisites

- Node.js **24.22.2** (see `.nvmrc` and `.node-version`) and npm. Node 24 matches the hosted runtime.
- Docker Engine and Docker Compose for local MariaDB and Mailpit (email capture). Event/session requests require a migrated database; ordinary tests and health checks do not. Startup opens no DB connection and sends no mail.

## Install and develop

```sh
nvm use
npm ci
cp .env.example .env
```

`nvm use` selects the installed project version in the current shell; run it in each development terminal. If you do not use nvm, select the version recorded in `.node-version` with your runtime manager instead.

Replace the disposable database password placeholders in `.env`. Use synthetic data and development-only credentials. Start MariaDB and apply the schema before using events:

```sh
docker compose up -d db
npm run db:migrate
```

`db:migrate` changes the database selected in `.env`; confirm it points to your development database. Configure staff access using [the Entra guide](docs/entra-setup.md). Run these in separate terminals from the repository root:

```sh
npm run dev:backend
```

```sh
npm run dev:frontend
```

Open Vite's printed `http://localhost:5173` link, matching `APP_ORIGIN` and the registered Entra callback. Vite fails if port 5173 is occupied instead of silently choosing another port. Do not substitute `127.0.0.1` in the browser: its cookies are separate from localhost's, breaking staff sign-in. Vite proxies `/api` to the backend on loopback using `PORT` from the environment or root `.env` (default 3000). If ports change, update the configuration and Entra callback as documented and restart both servers. Both development servers bind to loopback by default. The retained bootstrap connectivity page is at `/connectivity`; it still demonstrates loading, availability, failure, and a five-second timeout.

## Automated validation and local production-mode preview

```sh
npm run typecheck
npm test
npm run build
npm start
```

Open `http://127.0.0.1:3000`. Express serves `frontend/dist` and the API without Vite. Backend output is in `backend/dist`. `HOST` and `PORT` configure the listener; defaults are `127.0.0.1:3000`. Use Ctrl+C to stop, and `npm start` to restart. Logs go to stdout/stderr without credentials; startup failures exit nonzero. This is a local preview, **not** a verified production deployment procedure.

For staff sign-in in this preview, temporarily set `APP_ORIGIN=http://localhost:3000`, use the corresponding registered Web callback, restart, and open **http://localhost:3000**. Restore `APP_ORIGIN=http://localhost:5173` when returning to Vite; see [Entra setup](docs/entra-setup.md).

### API boundary

- `GET /api/health`: HTTP 200, `Content-Type: application/json`, body `{"status":"ok"}`. Checks application responsiveness only, not DB/SMTP.
- Unknown `/api` routes or unsupported methods: HTTP 404 JSON `{"error":"Not found"}`, never SPA HTML.
- Frontend assets and non-API GET routes are served by Express in the built application.
- Event, sign-in, publication, and cancellation routes are documented in [the event API boundary](docs/event-publishing.md#http-boundary).

## Local MariaDB

Local development uses MariaDB **11.8.6** in Docker. Start the database and run migrations before using event features (see [setup above](#install-and-develop)). Data persists until explicitly reset.

Settings come from `.env`; keep `DB_HOST=127.0.0.1`. The database port is localhost-only. If 3306 is occupied, change `DB_PORT`. See [database and migration details](docs/event-publishing.md#migration-workflow) when changing the schema.

Start, then explicitly verify once initialization finishes:

```sh
docker compose up -d db
npm run check:db
```

The command runs only `SELECT 1 AS result`; it makes no changes. To stop/remove containers while retaining data:

```sh
docker compose down
```

### Reset the development database

All current application databases contain disposable development data; no data upgrade is required. To start locally from scratch, stop the backend, then identify the database volume:

```sh
docker compose stop db
docker inspect "$(docker compose ps -a -q db)" --format '{{range .Mounts}}{{if eq .Destination "/var/lib/mysql"}}{{.Name}}{{end}}{{end}}'
```

**The next steps permanently delete all events and sessions in that database.** Replace `DATABASE_VOLUME_NAME` with the exact name printed above (not a Mailpit or unrelated volume):

```sh
docker compose rm -f db
docker volume rm DATABASE_VOLUME_NAME
docker compose up -d db
npm run db:migrate
```

Wait for MariaDB initialization before running migrations, then restart the backend. This leaves Mailpit and its captured messages untouched. If you have never created the database container, just follow the normal setup instead.

Changing `.env` initialization credentials takes effect on a fresh database, not an existing volume. No reset is performed automatically.

## Local email with Mailpit

Mailpit catches development email instead of delivering it to external recipients. Compose pins `axllent/mailpit:v1.33.0`. SMTP and the browser inbox bind only to `127.0.0.1`; neither requires authentication. Do not expose these ports publicly or configure SMTP forwarding/relay.

New copies of `.env.example` already select Mailpit. If you have an existing `.env`, update only its SMTP settings (keep your database settings):

```dotenv
SMTP_MODE=mailpit
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=klubcamp@example.test
MAILPIT_UI_PORT=8025
```

Start Mailpit and send one explicitly requested test message:

```sh
docker compose up -d mailpit
npm run check:smtp -- recipient@example.test
```

Open **http://127.0.0.1:8025** and inspect the captured message. The address is a test address, not a real inbox. Mailpit also displays attachments when a sender supplies them; the bootstrap check sends plain text only. To start both local services, use `docker compose up -d db mailpit`.

The backend runs on your host, so use `127.0.0.1`, not the Docker service name `mailpit`. If ports are occupied, change `SMTP_PORT` or `MAILPIT_UI_PORT` in `.env` and rerun `docker compose up -d mailpit`; adjust the browser URL accordingly. Existing shell environment variables override `.env`, so remove any old SMTP overrides first.

Mailpit mode explicitly disables TLS and omits authentication. It rejects non-loopback SMTP hosts, nonempty credentials, `SMTP_SECURE=true`, and `NODE_ENV=production`. Use only disposable development messages, not real personal data or secrets.

Captured messages persist in the `mailpit-data` volume across container restarts and `docker compose down`. Mailpit retains up to its default 500 messages, removing older ones. Delete messages in the browser inbox to clear mail without touching the database. `docker compose stop mailpit` stops only Mailpit; `docker compose down` removes both services' containers but retains both volumes. **`docker compose down --volumes` permanently deletes both database data and captured mail.**

Local capture verifies the local SMTP path, **not delivery through the production mail service**.

## Explicit production SMTP verification

Never copy the local Mailpit configuration to production. Set `SMTP_MODE=smtp` (also the default if unset), and configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` using the existing mail service's verified settings. `SMTP_SECURE=true` selects implicit TLS (usually 465); `false` requires STARTTLS (usually 587). Authentication remains mandatory; TLS certificate verification is not disabled. Mailpit is development-only, not a production SMTP server.

**This command sends one real email to the supplied plain address. Run only with the recipient's permission:**

```sh
npm run check:smtp -- recipient@example.org
```

Server acceptance is reported as success; separately confirm arrival in the intended inbox. Delivery is not proven merely by server acceptance. Without one valid recipient or complete configuration it fails without sending.

Both verification commands exit 0 on success, nonzero on failure, use five-second connection/socket timeouts, and enforce a **10-second total deadline** after starting the script (npm/Node startup time is additional). Diagnostics are deliberately generic and never include raw driver errors, addresses, or credentials. Neither runs through HTTP, tests, builds, or ordinary startup.

## Configuration and secrets

Node loads the optional root `.env`; existing environment variables take precedence. `.env` files and logs are git-ignored, with `.env.example` as the placeholder-only exception. Restrict permissions of populated files (for example, `chmod 600 .env`). Never add secrets to `VITE_*` variables: Vite treats these as public. The frontend uses only a relative API URL and no backend configuration. Do not copy `.env` into frontend source or static output. Compose configuration rendering can reveal credentials: do not publish its output.

## Hosted development deployment

The hosted development bootstrap uses **Node.js 24.22.2** and **MariaDB 11.8.6** on Hetzner Webhosting L at `https://camps.schwarzweisskoeln.de`. There is no production product or production data to migrate. HTTPS, frontend/assets/API, hosted database connectivity, SMTP delivery, and manual restart have been verified. See [hosted environment](specs/production-environment.md) for evidence boundaries, [provider-neutral packaging and startup](docs/deployment.md) for the artifact/runtime contract, and [Hetzner deployment and operation](docs/deployment-hetzner.md) for actual home-directory paths, panel settings, HTTPS, and the current Azure SMTP STARTTLS setup. Existing `production` command/file names refer to the deployment build mode, not approval for real product use.

Build an upload-ready package with `npm run build:production`; validate its production-only bootstrap with `npm run test:production`. Output is `release/klubcamp/app/`, without secrets or dependencies. On the server, install dependencies with `npm ci --omit=dev`; generated npm start/check commands explicitly load the sibling `production.env`. Existing development commands and configuration are unchanged.

The owner accepted [002 — Production Setup](specs/changes/002-production-setup/validation.md) as complete for bootstrap deployment, then accepted all [operational readiness checks](specs/release-readiness.md) as passed for now on 21 November 2026. These are owner-confirmed results, not a new agent-run hosted verification. Future registration and personal-data features still require their own approved scope and acceptance. Remote changes require approval. Local Compose/preview instructions are not a hosted procedure. Locally, stop the servers with Ctrl+C; `docker compose down` preserves database data.
