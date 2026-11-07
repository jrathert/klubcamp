# Production Environment

This document describes the deployed bootstrap baseline as verified on **7 November 2026**. Public HTTP(S) checks were performed by the agent; SSH, database, email delivery, and restart evidence was supplied by the owner. Change 002 is complete for bootstrap deployment; deferred operational/release checks are tracked separately below.

## Environment baseline

| Component | Production | Local alignment |
| --- | --- | --- |
| Hosting | Existing Hetzner Webhosting L package | Local development only; no production containers |
| Backend runtime | Node.js **24.22.2**, confirmed by hosted `node --version` | Node.js **24.22.2**, selected via `.nvmrc` / `.node-version` |
| Database | MariaDB **11.8.6-MariaDB-0+deb13u1**, owner-confirmed on the application DB server; non-root account | Docker Compose image `mariadb:11.8.6`, fresh `mariadb-11-8-6-data` volume |
| Email | Azure Communication Services, `smtp.azurecomm.net:587`, authenticated STARTTLS; delivery confirmed, marked as spam | Mailpit captures development mail; local delivery verified |
| Application hostname | `camps.schwarzweisskoeln.de`, created by the owner | Other domains are outside deployment scope |

One konsoleH-managed Express process serves the built React frontend and JSON API over `https://camps.schwarzweisskoeln.de`. HTTPS page/assets/API, IPv4/IPv6 access, HTTP-to-HTTPS redirection, and JSON API 404s are verified. Local database containers do not define production infrastructure. See [Hetzner deployment and operation](../docs/deployment-hetzner.md) for paths, panel settings, troubleshooting, and the current Azure SMTP setup; [the shared packaging/runtime contract](../docs/deployment.md) is provider-neutral.

## Configuration boundary

- Keep credentials outside source control and frontend bundles. Production launchers explicitly load `~/klubcamp/production.env` before backend/check imports; the file must be private (mode 600 or stricter) and contain `NODE_ENV=production`. Existing environment variables take precedence. Main settings live in this file, not the panel. `deployment/production.env.example` is a placeholder-only reference, not part of the artifact.
- Working deployment uses `HOST=127.0.0.1` and `PORT=3000`; konsoleH activation makes the application available through public HTTP(S). The backend does not switch to port 80/443. Do not expose port 3000 or add a proxy/process manager. The exact provider routing implementation is not assumed.
- Database connectivity uses `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`. `check:db` succeeded against the actual server. Owner-supplied administration-session metadata: character set `utf8mb4`, collation `utf8mb4_unicode_ci`, SQL mode `STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION`, session time zone `SYSTEM`. Administration TLS cipher: `TLS_AES_256_GCM_SHA384`. These session values do not prove application-session parity or application DB TLS. Application TLS requirements/access rules remain to be established; credentials/endpoints stay in the private file.
- An isolated local 11.8.6 image test returned `11.8.6-MariaDB-ubu2404`, non-root connectivity, `utf8mb4`, matching SQL mode and `SYSTEM` time zone, but connection collation `utf8mb4_uca1400_ai_ci`. Production's Debian packaging and administration-session collation differ. Version alignment is not full configuration parity; schema/connection collation must be deliberately established before schema work rather than assumed from this check.
- Production SMTP uses `SMTP_MODE=smtp`, `SMTP_HOST=smtp.azurecomm.net`, `SMTP_PORT=587`, and `SMTP_SECURE=false`, plus private `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`. Here `false` selects required STARTTLS, not plaintext: the application sets `requireTLS=true`. `true` selects immediate TLS, usually port 465, and failed against this Azure port-587 endpoint. `SMTP_FROM` is the authorized sender; the recipient is supplied to the explicit test command. Never use Mailpit mode in production. The authorized test was accepted and received, but marked as spam; address deliverability before product use.
- `DB_ROOT_PASSWORD` is for local Compose initialization only; do not request or use a production root account.

## Verified operation and remaining checks

The completed bootstrap deployment and its evidence are recorded in [002 — Production Setup](changes/002-production-setup/validation.md). The owner explicitly accepted that scope while transferring further operational hardening to [pre-release readiness](release-readiness.md). Neither closure nor specification approval authorizes remote operations or real product use.

The owner deployed under the **SSH account home directory**, not Apache's document root: `~/klubcamp/app`, private configuration `~/klubcamp/production.env`, and log `~/klubcamp/application.log`. Directory/file permissions `700`/`600` were verified. Logs show sanitized startup messages; manual restart after configuration edits works. Public probes of private-file URLs returned the SPA fallback, not file contents.

Deferred to pre-release readiness, not blockers to closing 002 and not verified results:

1. PR1: Automatic recovery, exact operating controls, startup-failure detection, selected memory limit, and relevant resource documentation.
2. PR2: Safe hosted update/removal rehearsal preserving configuration, logs, database data, and shared services.
3. PR3: Application DB TLS/access/session evidence. The administration-tool TLS result is not evidence for the Node driver connection.
4. PR6: Additional hosted configuration/failure tests beyond the accepted local launcher tests.

Use the application's selected konsoleH target only; other domains and applications are outside scope. Change 002 is complete as **bootstrap deployment verified**, not full product-release readiness. Development can proceed using synthetic data.

Backup/restore and personal-data procedures (PR4), sender deliverability (PR5), and all other checklist/feature-security gates must be satisfied before real product use; they are not implemented or certified by bootstrap closure.

## Local database safety

The earlier 10.11.19 report referred to an old production server. The owner approved aligning local Compose to **11.8.6**. Compose now uses fresh `mariadb-11-8-6-data`, leaving previous `mariadb-10-11-data` and older `mariadb-data` untouched. The next local DB recreation initializes an empty database; existing data is not migrated. Preserve valuable data and separately plan a logical export/import before switching. Never downgrade an 11.8 data directory to 10.11. This update does not authorize deleting or reusing old volumes.

See [local setup instructions](../README.md), [completed local bootstrap validation](changes/001-application-bootstrap/validation.md), [completed deployment validation and explicit deferrals](changes/002-production-setup/validation.md), and [pre-release readiness](release-readiness.md).
