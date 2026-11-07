# Production packaging and runtime contract

This guide describes the **provider-neutral** build artifact and production startup conventions. It does not upload files, configure DNS/HTTPS, provision services, or activate a hosting process. For the current production environment, use [the Hetzner deployment and operation guide](deployment-hetzner.md). Its Azure SMTP section describes a separate external mail service, not a requirement of the package.

Packaging and launchers are implemented and locally tested under completed [change 002](../specs/changes/002-production-setup/requirements.md). [002 validation](../specs/changes/002-production-setup/validation.md) records the accepted bootstrap deployment and owner-approved scope revision. Unperformed operational checks remain open in [pre-release readiness](../specs/release-readiness.md); closure does not authorize real personal-data use or real registration confirmations.

## Separation of responsibilities

| Location | Responsibility |
| --- | --- |
| `scripts/package-production.mjs` | Assemble an upload-ready artifact from the existing build; no provider API calls or remote actions |
| `deployment/` | Production-only startup/check entry points, shared private-file loader, and a placeholder environment reference |
| `docs/deployment.md` | Package contents, dependency installation, startup/configuration contract, and manual check commands |
| `docs/deployment-hetzner.md` | Current host paths, panel settings, routing/HTTPS, operating procedures, troubleshooting, and external Azure SMTP configuration |

One Express process serves the JSON API and built React frontend. Vite builds static files; it is not a production server. The package does not include or start a database or SMTP server, and it does not install a process manager or configure public routing.

## Build and package locally

Use the pinned Node.js version (currently 24.22.2). From the repository root, after the usual dependency installation:

```sh
npm run typecheck
npm test
npm run test:production
npm run build:production
```

`build:production` runs the existing build and then packages its output:

```text
release/klubcamp/
└── app/
    ├── .klubcamp-artifact    # Identifies generated output
    ├── app.js               # Server entry point
    ├── runtime.js           # Private configuration loader
    ├── check-db.js          # Explicit database-check entry point
    ├── check-smtp.js        # Explicit SMTP-check entry point
    ├── package.json
    ├── package-lock.json
    ├── backend/dist/        # Allowlisted compiled runtime modules
    └── frontend/dist/       # Built public HTML, JS, and CSS
```

The artifact contains no private configuration, logs, local `node_modules`, tests, or development source. The example environment file is reference material only and is not packaged. Rebuilding replaces only the marked generated `release/klubcamp/app/` subtree and refuses unrecognized output or linked output parents. Never put manually maintained files inside generated `app/`.

Dependency declarations and the original lockfile are retained; generated npm scripts are replaced with production start/check commands. On the target machine, install runtime dependencies in `app/`:

```sh
npm ci --omit=dev
```

Do not upload local `node_modules`: install for the target platform. TypeScript, Vite, and `tsx` are not needed to run the generated artifact. Existing repository build/development/check commands, environment loading, and runtime pin are unchanged by packaging.

## Configuration and startup contract

The current startup convention is an **application choice**, not a Node.js or provider requirement:

```text
<private-install-directory>/
├── app/                    # Replaceable artifact and installed dependencies
│   ├── app.js
│   ├── runtime.js
│   └── ...
└── production.env          # Persistent, private, manually maintained configuration
```

The parent directory can be chosen for the host, but the sibling relationship is fixed by the current launcher: `runtime.js` resolves `../production.env` relative to its own location, not the shell's working directory. A different configuration mechanism would require an explicit runtime change; the package is not claimed to support every hosting platform unchanged.

Create the private file using [the generic reference](../deployment/production.env.example). Keep it outside source control, generated output, and public directories. Restrict directory access to the runtime account and set the file to mode 600 (or stricter, while remaining readable by that account). Quote values containing `#` or whitespace. Never copy development credentials or use production credentials locally.

`npm start` **inside the artifact** runs `app.js`, which:

1. Checks that the private configuration exists, is a regular file, and has no group/other permission bits.
2. Explicitly loads it through Node 24's built-in `loadEnvFile` before backend import.
3. Requires `NODE_ENV=production` and explicit `HOST`/`PORT` for server startup.
4. Starts the compiled Express backend, serving both frontend and API.

Existing process environment variables take precedence over file values. The file is read on each new invocation, not watched for changes; restart the managed application after editing it. Configuration/import failures exit nonzero with sanitized diagnostics. Normal startup does not connect to the database or send mail.

`HOST`/`PORT` configure the application's listener only. The provider's public routing, HTTPS termination, supervision, logs, memory limits, and restart controls must be documented separately. Do not assume a particular listener or environment-injection mechanism on a new host. An SSH foreground `npm start` process is a diagnostic tool, not process supervision.

## Manual connectivity checks

From the installed artifact's `app/` directory:

```sh
npm run check:db
```

This explicitly loads the same private file and executes only `SELECT 1` with the configured database account. Use a non-root application account. Record database version, access rules, TLS requirements, and relevant server/session settings separately; a successful connectivity check alone does not establish those properties.

To send **one real test email**, only with an authorized recipient:

```sh
npm run check:smtp -- authorized-recipient@example.org
```

`SMTP_FROM` in the private file selects the authorized sender; `SMTP_USER`/`SMTP_PASSWORD` authenticate to the service; the command-line argument selects the recipient. Server acceptance is not proof of delivery: separately confirm receipt, including the spam folder. Each check reloads the file, so no server restart is needed before retesting edited settings.

Production SMTP requires authentication and TLS. `SMTP_SECURE=true` selects immediate/implicit TLS (typically port 465); `false` selects **required STARTTLS** (typically port 587), not plaintext. The application requires the upgrade and does not disable certificate verification. Select the actual combination documented by the mail service; see [the verified Azure example](deployment-hetzner.md#azure-smtp-why-smtp_securefalse-is-correct) for the current deployment. Mailpit is for local development only.

The compiled checks need no `tsx` or source files, never run automatically during startup/build/packaging, and retain bounded execution and sanitized diagnostics. npm verbose logging does not reveal sanitized driver errors. Do not publish private files or enable raw protocol logging that could expose credentials.

## Replacement and removal boundaries

Treat `app/` as replaceable and its sibling configuration as persistent. Use the host's documented stop/update/restart procedure, reinstall runtime dependencies, and recheck the application afterward. Preserve private configuration, logs, database data, and shared services; never delete an entire installation parent just to replace the artifact.

Only `frontend/dist/` is exposed as static files by Express. Keep the installation and private configuration outside public document roots. The health endpoint reports application responsiveness, not database or email availability. Backups, personal-data handling, and product readiness require their own validated procedures.
