# Production deployment proposal

**Status:** Agreed deployment direction for [change 002](../specs/changes/002-production-setup/requirements.md), not an implemented or verified deployment procedure. The packaging command and production launcher described below do not exist yet. This document does not authorize remote changes.

## Hosting model

Deploy to `https://camps.schwarzweisskoeln.de` on Hetzner Webhosting L using konsoleH-managed Node.js. The owner reports Node.js **24.22.2**, matching the local runtime pin.

One Express process serves the JSON API and the built React frontend. Vite builds static files locally; neither Vite nor a separate frontend server runs in production. No containers, custom proxy, or additional process manager are planned.

## Server directory structure

Keep everything together in a private directory outside publicly served directories:

```text
~/klubcamp/
├── app/                     # Replaceable application deployment
│   ├── app.js               # Production-only launcher
│   ├── package.json
│   ├── package-lock.json
│   ├── backend/dist/        # Compiled backend and connectivity checks
│   ├── frontend/dist/       # Built frontend: the only public files
│   └── node_modules/        # Installed on Hetzner, not uploaded
├── production.env           # Private configuration, maintained on the server
└── application.log          # Written by Hetzner
```

The `app/` boundary allows deployment updates without overwriting configuration or logs. Replacing or removing the application must not delete `production.env`, logs, or database data.

## Private configuration

Create and edit `~/klubcamp/production.env` manually over SSH. Keep it outside Git and the generated deployment artifact. Restrict the parent directory to the account owner and the file to owner read/write access (`chmod 600`). Never copy the local development `.env` to production.

The file contains `NODE_ENV=production`, verified listener settings, DB connection settings, and authenticated production SMTP settings (`SMTP_MODE=smtp`). Do not use local Compose or Mailpit settings.

The proposed production launcher explicitly loads `../production.env`, resolved relative to the launcher's own location, using Node 24's built-in environment-file support **before importing the backend**. Do not depend on Node automatically discovering `.env` or on konsoleH's script arguments being Node runtime flags. Missing or unreadable configuration must fail with sanitized diagnostics.

Existing process environment variables take precedence over file values. Avoid duplicating settings in konsoleH: normally no environment entries should be needed, with at most one or two justified bootstrap/provider settings if required. Restart the application after editing the file; running processes do not automatically reload it.

Manual database and SMTP checks must explicitly load the same file. The existing development check commands depend on TypeScript sources and `tsx`; the production package needs documented compiled-check entry points that work with runtime dependencies only. Their exact invocation remains to be implemented and validated; they must never run automatically during startup or packaging.

## Local packaging

The proposed additional command is:

```sh
npm run build:production
```

It will build and package an upload-ready tree:

```text
release/klubcamp/
└── app/
    ├── app.js
    ├── package.json
    ├── package-lock.json
    ├── backend/dist/
    └── frontend/dist/
```

The artifact must contain no private environment files, logs, local `node_modules`, or development-only files. Its package metadata and lockfile must support installing runtime dependencies on Hetzner and invoking the compiled connectivity checks.

Existing `npm run build`, local environment loading, development commands, runtime pin, Docker Compose, and Mailpit remain unchanged. Any necessary development-environment change requires prior explanation and explicit owner approval.

## First deployment — proposed manual workflow

After the remaining provider questions are resolved and the concrete procedure is approved:

1. Run local type checking, tests, and `npm run build:production` once implemented.
2. Upload the generated `release/klubcamp/` directory into the hosting account's home directory using SSH/SCP, producing `~/klubcamp/app/`.
3. Manually provision a dedicated MariaDB database and non-root application account. No application tables or migrations are required for change 002.
4. Create the private configuration file with the verified database and SMTP settings and restrict its permissions.
5. Select Node.js 24.22.2 in the SSH session, verify `node --version`, and install dependencies on the server:

   ```sh
   cd ~/klubcamp/app
   npm ci --omit=dev
   ```

6. Configure the application hostname in konsoleH:

   | Field | Proposed value |
   | --- | --- |
   | Skript-Pfad | `app.js` |
   | Arbeitsverzeichnis | `klubcamp/app` (relative to home) |
   | Name der Log-Datei | `klubcamp/application.log` (relative to home) |
   | Version | `24` |
   | Skript Parameter | None initially |
   | Umgebungsvariablen | Normally none; configuration comes from the private file |
   | Memory limit | Confirm provider-supported/default value before selecting |

7. Activate the application and verify HTTPS page/assets/API behavior, including `/api/health` and JSON 404 responses for unknown API routes.
8. Run the explicit non-mutating database check. Send one SMTP test only to an explicitly authorized recipient and separately confirm inbox arrival.
9. Verify logs, persistence, stop/start/restart, recovery, and safe application removal against [002 validation](../specs/changes/002-production-setup/validation.md). Record hosted evidence rather than substituting local test results.

## Later updates — proposed manual workflow

Build a fresh artifact locally, stop the application through the verified provider procedure, replace only `~/klubcamp/app/`, install runtime dependencies, and restart. Preserve `~/klubcamp/production.env` and `~/klubcamp/application.log`. Recheck the page, assets, and API after restart.

Do not upload over a running installation or delete the whole `~/klubcamp/` directory. Establish the exact provider stop/restart and recovery procedure before executing an update.

## Remaining provider verification

The configuration screenshot establishes the available fields, not the full runtime contract. Before deployment, resolve:

- Listener/routing behavior: the required `HOST`/`PORT` settings or listener adaptation. Do not assume the local `127.0.0.1:3000` default works.
- HTTPS configuration for the application hostname.
- Stop/start/restart controls, automatic recovery, failure detection, and log access.
- Supported memory limits and dependency-installation resource constraints.

References: [Hetzner Node.js documentation](https://docs.hetzner.com/de/managed/administration-on-konsoleh/nodejs/), [Hetzner-hosted deployment tutorial](https://community.hetzner.com/tutorials/deploy-nextjs-on-a-managed-server/), and [002 implementation plan](../specs/changes/002-production-setup/plan.md).
