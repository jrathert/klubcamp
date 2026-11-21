# Hosted Development Environment

This document describes the hosted development bootstrap baseline as verified on **7 November 2026**. There is no production product or production data requiring staged migration; current application data is disposable. Existing `production` filenames and runtime settings designate the deployment build mode. Public HTTP(S) checks were performed by the agent; SSH, database, email delivery, and restart evidence was supplied by the owner. Change 002 is complete for bootstrap deployment; deferred operational/release checks are tracked separately below.

**Current acceptance — 21 November 2026:** The owner confirmed hosted event-publishing validation and accepted PR1–PR6 as passed for now. The [003 validation record](changes/003-event-publishing/validation.md) and [operational checklist](release-readiness.md) distinguish this consolidated owner confirmation from earlier agent-observed evidence. Earlier pending/deferred statements below describe the original bootstrap boundary, not current blockers; no new per-item operating parameters or test artifacts were supplied.

## Environment baseline

**Runtime update:** The owner subsequently reported hosted **Node.js 26.13.1 / npm 11.20.0** and approved local alignment. This supersedes the original Node 24 baseline only; earlier validation retains its original environment and no hosted test is implied by changing local pins. See [002's approved follow-up](changes/002-production-setup/requirements.md#approved-runtime-baseline-update) and [validation record](changes/002-production-setup/validation.md) for local compatibility results.

| Component | Hosted development | Local development |
| --- | --- | --- |
| Hosting | Existing Hetzner Webhosting L package | Local development only; no production containers |
| Backend runtime | Node.js **26.13.1**, owner-reported | Node.js **26.13.1**, selected via `.nvmrc` / `.node-version` |
| Package manager | npm **11.20.0**, owner-reported | npm **11.20.0**, recorded in package/lockfile engines |
| Database | MariaDB **11.8.6-MariaDB-0+deb13u1**, owner-confirmed on the application DB server; non-root account | Docker Compose image `mariadb:11.8.6`, fresh `mariadb-11-8-6-data` volume |
| Email | Azure Communication Services, `smtp.azurecomm.net:587`, authenticated STARTTLS; delivery confirmed, marked as spam | Mailpit captures development mail; local delivery verified |
| Application hostname | `camps.schwarzweisskoeln.de`, created by the owner | Other domains are outside deployment scope |

One konsoleH-managed Express process serves the built React frontend and JSON API over `https://camps.schwarzweisskoeln.de`. HTTPS page/assets/API, IPv4/IPv6 access, HTTP-to-HTTPS redirection, and JSON API 404s are verified. Local database containers do not define production infrastructure. See [Hetzner deployment and operation](../docs/deployment-hetzner.md) for paths, panel settings, troubleshooting, and the current Azure SMTP setup; [the shared packaging/runtime contract](../docs/deployment.md) is provider-neutral.

## Configuration boundary

- Keep credentials outside source control and frontend bundles. Production launchers explicitly load `~/klubcamp/production.env` before backend/check imports; the file must be private (mode 600 or stricter) and contain `NODE_ENV=production`. Existing environment variables take precedence. Main settings live in this file, not the panel. `deployment/production.env.example` is a placeholder-only reference, not part of the artifact.
- Working deployment uses `HOST=127.0.0.1` and `PORT=3000`; konsoleH activation makes the application available through public HTTP(S). The backend does not switch to port 80/443. Do not expose port 3000 or add a proxy/process manager. The exact provider routing implementation is not assumed.
- Database connectivity uses `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`. Hosted `check:db` succeeded. The shared [database baseline](../docs/event-publishing.md#migration-workflow) is defined by the reviewed migrations. Historical connection metadata remains in [002 validation](changes/002-production-setup/validation.md); application TLS/access checks are now owner-accepted under PR3. Credentials/endpoints stay in the private file.
- Production SMTP uses `SMTP_MODE=smtp`, `SMTP_HOST=smtp.azurecomm.net`, `SMTP_PORT=587`, and `SMTP_SECURE=false`, plus private `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`. Here `false` selects required STARTTLS, not plaintext: the application sets `requireTLS=true`. `true` selects immediate TLS, usually port 465, and failed against this Azure port-587 endpoint. `SMTP_FROM` is the authorized sender; the recipient is supplied to the explicit test command. Never use Mailpit mode in production. The authorized test was accepted and received, but marked as spam; address deliverability before product use.
- `DB_ROOT_PASSWORD` is for local Compose initialization only; do not request or use a production root account.

## Verified operation and remaining checks

The completed bootstrap deployment and its evidence are recorded in [002 — Production Setup](changes/002-production-setup/validation.md). The owner explicitly accepted that scope while transferring further operational hardening to [pre-release readiness](release-readiness.md). Neither closure nor specification approval authorizes remote operations or real product use.

The owner deployed under the **SSH account home directory**, not Apache's document root: `~/klubcamp/app`, private configuration `~/klubcamp/production.env`, and log `~/klubcamp/application.log`. Directory/file permissions `700`/`600` were verified. Logs show sanitized startup messages; manual restart after configuration edits works. Public probes of private-file URLs returned the SPA fallback, not file contents.

Originally deferred at closure of 002; now accepted by the owner under the pre-release checklist:

1. PR1: Automatic recovery, exact operating controls, startup-failure detection, selected memory limit, and relevant resource documentation.
2. PR2: Safe hosted update/removal rehearsal preserving configuration, logs, database data, and shared services.
3. PR3: Application DB TLS/access/session evidence. The administration-tool TLS result is not evidence for the Node driver connection.
4. PR6: Additional hosted configuration/failure tests beyond the accepted local launcher tests.

Use the application's selected konsoleH target only; other domains and applications are outside scope. Change 002 is complete as **bootstrap deployment verified**, not full product-release readiness. Development can proceed using synthetic data.

Backup/restore and personal-data operation (PR4), sender deliverability (PR5), and the other current checklist items are owner-accepted as passed for now. Future features still require their own specifications and security/functional acceptance; neither bootstrap closure nor this checklist implements a complete product.

## Development database setup

Use the [local setup and database-only reset](../README.md#local-mariadb) for disposable development data. No legacy-volume migration is required. Resetting a hosted database or deleting unrelated resources still requires separate approval.

See [local setup instructions](../README.md), [completed local bootstrap validation](changes/001-application-bootstrap/validation.md), [completed deployment validation and explicit deferrals](changes/002-production-setup/validation.md), and [pre-release readiness](release-readiness.md).
