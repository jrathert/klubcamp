# Production Environment

This document describes the current production baseline, not the sequence of local setup experiments. Version availability is reported by the project owner; a deployed Klubcamp application has not yet been verified on the provider.

## Environment baseline

| Component | Production | Local alignment |
| --- | --- | --- |
| Hosting | Existing Hetzner Webhosting L package | Local development only; no production containers |
| Backend runtime | Node.js **24** available; exact provider patch version not recorded | Node.js **24.22.2**, selected via `.nvmrc` / `.node-version` |
| Database | Provider-managed MariaDB **10.11.19** | Docker Compose image `mariadb:10.11.19` |
| Email | Existing mail service; hosted settings and delivery unverified | Mailpit captures development mail; local delivery verified |
| Existing website | Club WordPress website must remain operational | No domain or hosting configuration changes authorized |

The application uses React/Vite and Express with a JSON API. The preferred deployment is one Node.js application serving both the API and built frontend from one origin, subject to hosting verification. Local database containers do not define production infrastructure.

## Configuration boundary

- Keep credentials outside source control and frontend bundles. `.env.example` documents the application's settings without real credentials.
- The backend listener uses `HOST` and `PORT`; the provider's required listener/routing configuration remains to be established.
- Database connectivity uses `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`. The hosted endpoint, access rules, TLS requirements, credentials, character set, collation, SQL mode, and time zone have not been verified. Local version parity alone does not establish configuration parity.
- Production SMTP uses `SMTP_MODE=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`, with authentication and TLS required. Never use local Mailpit mode in production. Verify the existing service's settings and an authorized test recipient before sending a message.
- `DB_ROOT_PASSWORD` is for local Compose initialization only; do not request or use a production root account.

## Deployment verification still required

Requirements, execution planning, and acceptance checks are tracked in [002 — Production Setup](changes/002-production-setup/requirements.md). The completed local bootstrap does not establish production readiness. Specification approval does not authorize remote operations.

No remote bootstrap deployment has been made or validated. Before deployment, establish and approve:

1. A routing/domain arrangement that preserves WordPress, including HTTPS for the page and API.
2. Persistent Node.js operation, the exact runtime patch version, listener configuration, and process supervision.
3. Secure runtime configuration, log access, restart procedures, and safe stop/removal procedures.
4. Hosted database connectivity using `npm run check:db` (non-mutating `SELECT 1`).
5. Explicit SMTP acceptance and inbox delivery using `npm run check:smtp -- <authorized-recipient>`.
6. Continued WordPress operation after deployment and restart.

**Do not activate Node.js on the WordPress domain.** [Hetzner's Node.js documentation](https://docs.hetzner.com/managed/administration-on-konsoleh/nodejs/) warns that activation disables PHP/HTML applications on the selected domain. Availability of a manually selected runtime does not prove public routing or supervision. A separate subdomain or other hosting arrangement requires approval rather than assumption.

Backup/restore and production data-handling procedures must also be established before production use; they are not implemented by the bootstrap.

## Local database safety

Compose uses the version-specific named volume `mariadb-10-11-data` so MariaDB 10.11 cannot accidentally open the previous 11.8 volume. Any previous `mariadb-data` volume is left untouched. Never point MariaDB 10.11 at a data directory initialized by MariaDB 11.8. Valuable data requires a separately planned logical export/import with compatibility checks, not an in-place downgrade.

See [local setup instructions](../README.md), [completed local bootstrap validation](changes/001-application-bootstrap/validation.md), and [pending production validation](changes/002-production-setup/validation.md).
