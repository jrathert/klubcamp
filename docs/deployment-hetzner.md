# Hetzner deployment and operation

**Status:** [Change 002](../specs/changes/002-production-setup/validation.md) is complete as bootstrap deployment verified (7 November 2026): HTTPS frontend/assets/API, private configuration loading, database connectivity, email delivery, and manual restart. The owner explicitly deferred further operational validation to [pre-release readiness](../specs/release-readiness.md); deferred checks are not passed. Remote changes still require operational approval; this is not a product release or permission to use real personal data.

This guide covers the provider-specific upload paths, konsoleH settings, HTTPS, diagnostics, and the current deployment's external Azure mail service. Start with [the provider-neutral packaging and runtime contract](deployment.md). The same package is used here without a Hetzner-specific build or runtime adapter.

## Hosting model

The bootstrap runs at `https://camps.schwarzweisskoeln.de` on Hetzner Webhosting L using konsoleH-managed Node.js **24.22.2**, verified over SSH and matching the local pin. The actual database is MariaDB **11.8.6**; the initial 10.11.19 report referred to an old server.

One Express process serves the JSON API and the built React frontend. Vite builds static files locally; neither Vite nor a separate frontend server runs in production. No containers, custom proxy, or additional process manager are planned.

## Server directory structure

Keep everything together in the **SSH account's actual home directory**, not Apache's document root. `~` means the directory returned by `printf '%s\n' "$HOME"` over SSH. Placing the upload under the website's document root caused the panel to report the script missing. Use this private layout instead:

```text
~/klubcamp/
├── app/                     # Replaceable application deployment
│   ├── app.js               # Production-only launcher
│   ├── runtime.js           # Shared private configuration loader
│   ├── check-db.js          # Explicit compiled database check launcher
│   ├── check-smtp.js        # Explicit compiled SMTP check launcher
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

Create and edit `~/klubcamp/production.env` manually over SSH, using [the placeholder-only reference](../deployment/production.env.example). Keep it outside Git and the generated deployment artifact. Restrict the parent directory to the account owner (`chmod 700 ~/klubcamp`) and the file to owner read/write access (`chmod 600 ~/klubcamp/production.env`). The loader rejects a missing/non-file configuration or any group/other permission bits. Never copy the local development `.env` to production. Quote values containing `#` or whitespace using Node's environment-file syntax.

The file contains `NODE_ENV=production`, verified listener settings, DB connection settings, and authenticated production SMTP settings (`SMTP_MODE=smtp`). Do not use local Compose or Mailpit settings.

The [shared runtime contract](deployment.md#configuration-and-startup-contract) defines explicit file loading, production guards, and sanitized failures. On this host, it resolves to `~/klubcamp/production.env`. Do not rely on konsoleH's script-argument field accepting Node runtime flags. The managed process must run with access to the private directory/file.

Existing process environment variables take precedence over file values. Avoid duplicating settings in konsoleH: normally no environment entries should be needed, with at most one or two justified bootstrap/provider settings if required. Restart the application after editing the file; running processes do not automatically reload it.

Manual database and SMTP checks load the same file. See [shared check commands and safety rules](deployment.md#manual-connectivity-checks). Existing development commands remain unchanged. The owner separately approved correcting local Compose to MariaDB 11.8.6 on a fresh volume; see [local database safety](../specs/production-environment.md#local-database-safety).

## First deployment — working manual workflow

For an approved deployment, use the following procedure demonstrated by the initial deployment:

1. Run [the local validation and packaging commands](deployment.md#build-and-package-locally).
2. Upload the generated `release/klubcamp/` directory into the hosting account's home directory using SSH/SCP, producing `~/klubcamp/app/`.
3. Manually provision a dedicated MariaDB database and non-root application account. No application tables or migrations are required for change 002.
4. Create the private configuration file with the verified database and SMTP settings and restrict its permissions.
5. Select Node.js 24.22.2 in the SSH session, verify `node --version`, and install dependencies on the server:

   ```sh
   cd ~/klubcamp/app
   npm ci --omit=dev
   ```

6. Configure the application hostname in konsoleH:

   | Field | Working configuration |
   | --- | --- |
   | Skript-Pfad | `app.js` |
   | Arbeitsverzeichnis | `klubcamp/app` (relative to home) |
   | Name der Log-Datei | `klubcamp/application.log` (relative to home) |
   | Version | `24` |
   | Skript Parameter | None needed by the launcher |
   | Umgebungsvariablen | Normally none; configuration comes from the private file |
   | Memory limit | Confirm provider-supported/default value before selecting |

7. Activate the application and verify HTTPS page/assets/API behavior, including `/api/health` and JSON 404 responses for unknown API routes.
8. In `~/klubcamp/app`, run `npm run check:db`. It executes only `SELECT 1`; record additional database version/server-settings evidence separately using approved read-only inspection. To send one explicitly authorized SMTP message, run `npm run check:smtp -- recipient@example.org` (replace the address), then separately confirm inbox arrival. Missing settings or an absent/invalid recipient fail without sending.
9. Verify baseline managed availability, logs, and manual restart against [002 validation](../specs/changes/002-production-setup/validation.md). Further recovery, hosted failure, and safe update/removal tests are tracked in [pre-release readiness PR1/PR2/PR6](../specs/release-readiness.md); they were not run for bootstrap closure. Record evidence accurately and obtain operational approval before disruptive tests.

## Later updates — procedure to verify

Build a fresh artifact locally, stop the application through the verified provider procedure, replace only `~/klubcamp/app/`, install runtime dependencies, and restart. Preserve `~/klubcamp/production.env` and `~/klubcamp/application.log`. Recheck the page, assets, and API after restart.

Do not upload over a running installation or delete the whole `~/klubcamp/` directory. Establish the exact provider stop/restart and recovery procedure before executing an update.

## Controlled first-start diagnostics

Once upload/configuration and a first-start test are authorized, run `npm start` in `~/klubcamp/app` over SSH before panel activation. The server and checks use the private file automatically. A successful SSH start verifies the executable and listener locally, not public routing or persistence. Stop it with Ctrl+C before activating through konsoleH to avoid two processes competing for a port. Do not use an SSH foreground process as production supervision.

The current deployment works with `HOST=127.0.0.1` and `PORT=3000`. `npm start` starts only the internal Express listener; it does not activate public routing. A request to `http://127.0.0.1:3000/api/health` must be made **on Hetzner over SSH**. A public request to `http://camps.schwarzweisskoeln.de:3000` is not a supported test and may time out. Do not change the app to port 80/443 or expose port 3000.

Activate Node.js in the selected hostname's konsoleH panel, then request `https://camps.schwarzweisskoeln.de/api/health` without `:3000`. The app still listens internally on 3000; Hetzner handles public HTTP(S). If the public response is an Apache HTML 403/404 rather than our JSON, check the selected hostname, active state, home-relative paths, and log before changing application code. The first activation attempt did not yield routing; retrying activation succeeded. The internal forwarding mechanism was not inspected and is not assumed.

HTTPS was enabled separately using the hosting controls. Public HTTP redirects to HTTPS; both IPv4 and IPv6 HTTPS checks passed. Keep TLS certificate renewal under the hosting provider's management.

If startup fails, share only sanitized startup messages, HTTP status, and panel behavior; do not paste the private file or unreviewed provider logs. npm verbosity does not reveal SMTP driver errors; the CLI deliberately sanitizes failures. The health endpoint only tests application responsiveness, not DB/SMTP.

## Azure SMTP: why `SMTP_SECURE=false` is correct

The verified production service is Azure Communication Services, not an SMTP server supplied by Hetzner:

```dotenv
SMTP_MODE=smtp
SMTP_HOST=smtp.azurecomm.net
SMTP_PORT=587
SMTP_SECURE=false
```

`SMTP_SECURE` follows Nodemailer's meaning, not a generic "encrypt mail" checkbox:

| Value | Connection behavior | Typical port |
| --- | --- | --- |
| `true` | Start TLS immediately on connection (implicit TLS) | 465 |
| `false` | Connect using SMTP, then upgrade using STARTTLS | 587 |

In this application's production SMTP mode, `false` sets **`requireTLS=true`**, so STARTTLS must succeed; plaintext fallback is not allowed and certificate verification is not disabled. Azure's port 587 expects STARTTLS. Using `true` on that port failed; changing it to `false` succeeded and the recipient confirmed delivery. A mail plugin's setting labelled "TLS" often means STARTTLS and is not equivalent to this boolean.

Put `SMTP_USER`, quoted `SMTP_PASSWORD`, and an authorized `SMTP_FROM` sender address in `production.env`, not the panel. `SMTP_USER` is the login identity; `SMTP_FROM` is the sender, which must be allowed by the service. Supply the receiver separately:

```sh
cd ~/klubcamp/app
npm run check:smtp -- authorized-recipient@example.org
```

This sends one real message and reloads the private file for every invocation, so no application restart is needed to retest an edited SMTP setting. Server acceptance is not delivery proof: inspect the recipient's inbox/spam folder. The initial test reached Thunderbird but was classified as spam. Review sender authentication and deliverability before real registration confirmations; do not disable TLS as a workaround.

## Deferred pre-release provider verification

The app, home-directory paths, internal listener, public HTTPS routing, private-file permissions, log access, and manual restart are demonstrated and accepted for completed 002. Before real product use, complete [the pre-release checklist](../specs/release-readiness.md), including:

- Exact panel stop/start/restart steps, automatic recovery, and startup-failure detection. Manual restart is owner-verified; automatic recovery is not.
- Safe stop/removal and update behavior preserving private configuration, logs, and database data.
- The selected memory limit and any relevant resource constraints.
- Application database TLS requirements and actual driver-connection evidence. TLS shown by the DB administration tool applies only to that tool's session.

References: [Hetzner Node.js documentation](https://docs.hetzner.com/de/managed/administration-on-konsoleh/nodejs/), [Hetzner-hosted deployment tutorial](https://community.hetzner.com/tutorials/deploy-nextjs-on-a-managed-server/), and [002 implementation plan](../specs/changes/002-production-setup/plan.md).
