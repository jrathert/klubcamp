# Klubcamp bootstrap

Minimal connectivity page and JSON API only; no product features or staff access protection.

The [local application bootstrap (001)](specs/changes/001-application-bootstrap/validation.md) is complete. Hosted deployment and external-service verification are tracked separately in [002 — Production Setup](specs/changes/002-production-setup/requirements.md); [003 — Event Publishing](specs/changes/003-event-publishing/requirements.md) has not started. Local completion does not establish production readiness.

## Local prerequisites

- Node.js **24.22.2** (see `.nvmrc` and `.node-version`) and npm. Node 24 matches the provider's available major version; production operations still require verification.
- Docker Engine and Docker Compose for local MariaDB and Mailpit (email capture). Ordinary development, tests, and startup do not connect to a database or mail server.

## Install and develop

```sh
nvm use
npm ci
cp .env.example .env
```

`nvm use` selects the installed project version in the current shell; run it in each development terminal. If you do not use nvm, select the version recorded in `.node-version` with your runtime manager instead.

Replace the disposable database password placeholders in `.env`. Never use production credentials locally. Run these in separate terminals from the repository root:

```sh
npm run dev:backend
```

```sh
npm run dev:frontend
```

Open the Vite URL (normally `http://127.0.0.1:5173`). Vite proxies `/api` to the backend on localhost using `PORT` from the environment or root `.env` (default 3000). If port 3000 is occupied, change `PORT` in `.env` and restart both servers. The page shows loading, availability, or failure (including a five-second request timeout). Stop the backend to exercise failure, then reload the page. Both development servers bind to localhost by default.

## Automated validation and local production-mode preview

```sh
npm run typecheck
npm test
npm run build
npm start
```

Open `http://127.0.0.1:3000`. Express serves `frontend/dist` and the API without Vite. Backend output is in `backend/dist`. `HOST` and `PORT` configure the listener; defaults are `127.0.0.1:3000`. Use Ctrl+C to stop, and `npm start` to restart. Logs go to stdout/stderr without credentials; startup failures exit nonzero. This is a local preview, **not** a verified production deployment procedure.

### API boundary

- `GET /api/health`: HTTP 200, `Content-Type: application/json`, body `{"status":"ok"}`. Checks application responsiveness only, not DB/SMTP.
- Unknown `/api` routes or unsupported methods: HTTP 404 JSON `{"error":"Not found"}`, never SPA HTML.
- Frontend assets and non-API GET routes are served by Express in the built application.

## Local MariaDB

Compose pins MariaDB **10.11.19**, matching the provider's reported production version. No ORM, migrations, or application schema are introduced. Settings come from `.env`; `DB_HOST` should remain `127.0.0.1` locally. The container's port is bound **only to 127.0.0.1**, and data persists in the named volume `mariadb-10-11-data`. If 3306 is occupied, change `DB_PORT` in `.env`.

**Existing 11.8 data:** the version-specific volume deliberately leaves any previous `mariadb-data` volume untouched. Do not reuse an 11.8 data directory with MariaDB 10.11. If you have valuable old data, preserve it and plan a compatible logical export/import separately; this setup performs no automatic migration or deletion. `docker compose down --volumes` now removes only volumes declared by the current Compose configuration, not the old 11.8 volume.

Start, then explicitly verify once initialization finishes:

```sh
docker compose up -d db
npm run check:db
```

The command runs only `SELECT 1 AS result`; it makes no changes. To stop/remove containers while retaining data:

```sh
docker compose down
```

**Destructive reset — permanently deletes all local database data AND captured email in this Compose project's volumes:**

```sh
docker compose down --volumes
docker compose up -d db
```

Changing initial DB credentials does not update an already initialized volume. Do not reset valuable data to change credentials.

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

## Production environment

The provider offers **Node.js 24** and **MariaDB 10.11.19** on the existing Hetzner Webhosting L package. The current baseline, configuration boundaries, and WordPress safeguards are documented in [Production Environment](specs/production-environment.md). [002 — Production Setup](specs/changes/002-production-setup/requirements.md) owns the outstanding deployment and hosted database/SMTP checks; remote operations require explicit approval.

Production deployment is not yet verified. Do **not** activate Node.js on the WordPress domain or treat local Compose/preview instructions as a production deployment procedure. There is no remote bootstrap deployment to remove. Locally, stop the servers with Ctrl+C; `docker compose down` preserves database data.
