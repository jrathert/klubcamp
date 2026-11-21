# Event publishing: development and operation

## Tooling and boundaries

- Drizzle ORM's MySQL dialect with `mysql2` accesses MariaDB. The original `mariadb` driver remains for the unchanged, read-only `check:db` command.
- Drizzle Kit generates SQL migrations offline. The runtime migration command uses Drizzle ORM; production does not need Drizzle Kit or TypeScript tooling.
- Events store civil dates as SQL `DATE` and API `YYYY-MM-DD` strings. Display uses `de-DE` / `Europe/Berlin`; no server-local timezone conversion is applied.
- Staff identity uses `openid-client`, Entra single-tenant OIDC, and a private stable-ID allowlist. `express-session` stores server sessions in MariaDB; no Redis or in-memory production session store is used. See [explicit Entra setup](entra-setup.md).
- Form/review state exists only in React memory. There is no draft endpoint, persistent draft, edit, delete, registration, or notification workflow.

## Local setup

Use the project Node version and existing local DB settings:

```sh
nvm use
npm ci
docker compose up -d db
npm run db:migrate
```

**`db:migrate` changes the selected database schema.** Confirm `.env` targets your development database. It creates event/session tables and Drizzle's migration journal; it does not seed events. It is never run by ordinary startup, builds, health checks, or tests.

All current application data is disposable development data. For a fresh start, use the [database-only reset](../README.md#reset-the-development-database); no upgrade or backfill procedure is needed. Otherwise, running `npm run db:migrate` applies outstanding migrations without a reset. Restart the backend and reload the browser after schema changes.

Configure Entra following [the setup guide](entra-setup.md), then start `npm run dev:backend` and `npm run dev:frontend`. Open the exact `APP_ORIGIN` URL. Public list/detail views do not require sign-in. The retained bootstrap connectivity page is at `/connectivity`.

## Migration workflow

1. Change `backend/src/schema.ts` only within an approved feature scope.
2. Run `npm run db:generate`.
3. Review and retain the generated SQL and metadata under `backend/migrations/` in source control. Check MariaDB compatibility, charset/collation, locks, and data-preservation consequences.
4. Apply with `npm run db:migrate` against an empty isolated MariaDB 11.8.6 database first. Verify a second run is a no-op and existing records survive.
5. For a separately approved hosted development update, upload a fresh artifact, install runtime dependencies, stop the application, run `npm run db:migrate` in `~/klubcamp/app`, then restart and smoke-test. Any hosted reset requires explicit approval and must target only this application's development database.

The command loads the same private production file as startup when executed from the generated artifact. A database advisory lock serializes migration invocations. MariaDB DDL is not generally transactionally reversible: a partial failure requires inspection and an explicit recovery plan, not blind retries or automatic rollback. Do not use `drizzle-kit push` on production. No destructive rollback command is provided.

**Database baseline:** MariaDB 11.8.6, InnoDB tables, and UTF-8 (`utf8mb4`) with table collation `utf8mb4_unicode_ci`. No manual collation setup is needed: the reviewed SQL migrations specify the table options. Drizzle Kit's snapshots do not represent these options, so preserve them when reviewing SQL for new tables. Keep the existing migration chain; starting from scratch means applying it to an empty database, not rewriting it.

`DB_SSL=false` is suitable for the local loopback container. `DB_SSL=true` enables certificate-verified TLS for application and migration connections. Verify hosted application transport/access before real use under [pre-release PR3](../specs/release-readiness.md); a successful standalone `check:db` does not establish application connection security.

## HTTP boundary

| Method and route | Access / behavior |
| --- | --- |
| `GET /api/health` | Public responsiveness only; unchanged JSON contract |
| `GET /api/events` | Public published events, including cancelled ones; start-date order |
| `GET /api/events/:id` | Public event details, or JSON 404 |
| `GET /api/auth/session` | Authentication availability/state; CSRF token only for an authorized session |
| `GET /api/auth/login` | Starts server-side OIDC, redirects to Microsoft |
| `GET /api/auth/callback` | Validates one-time login attempt, PKCE, state, nonce, issuer/audience/signature, tenant and allowlist |
| `POST /api/auth/logout` | Authorized session + origin/CSRF checks; destroys application session |
| `POST /api/staff/events` | Authorized session + origin/CSRF; body `{ submissionId, event }` |
| `POST /api/staff/events/:id/cancel` | Authorized session + origin/CSRF; body `{ confirmed: true }` |

Mutation requests use `Content-Type: application/json`, the exact configured `Origin`, and `X-CSRF-Token` from `/api/auth/session`. Unmatched API routes/methods return JSON 404, never SPA HTML.

An event has `name` (1–200 characters after trimming), `description` (optional plain text, up to 10,000 characters), `startDate`, `endDate`, nonempty unique `ageGroups`, `capacity` (null/unlimited or integer 1–2,147,483,647), `minimumParticipants` (null/no minimum or integer 1–2,147,483,647), and `registrationDeadline`. An omitted minimum is normalized to null. If both participant counts are set, minimum must not exceed maximum. Creation, review, and public list/detail views display the minimum as “Mindestteilnehmerzahl”; an unset minimum is shown as “Keine Mindestteilnehmerzahl”. The minimum is informational only: no automatic cancellation or enforcement is introduced. End must not precede start; deadline must precede start. Supported dates are valid calendar dates in MariaDB's 1000–9999 year range. Public output adds `id` and `cancelled`; internal publication keys and staff identity are not exposed.

The review screen creates no database record. Publication uses a stable UUID submission key and a database unique constraint, so concurrent or retried identical requests from the same staff identity return the same event. Reuse with changed data or another identity returns 409 and never overwrites the original. After an uncertain response, retry the same submission or check the public list before starting another one. There are no edit/delete routes. Cancellation changes only the cancellation flag and preserves public details.

Sessions have an eight-hour absolute authorization limit. Login attempts last ten minutes. Expired session rows are cleaned lazily during session writes. Database failures return sanitized German errors, not driver diagnostics, tokens, or credentials. Browser responses are not cached; React renders descriptions as text, not HTML.

## Validation

```sh
npm run typecheck
npm test
npm run test:production
npm run build:production
```

These commands do not require live Entra, MariaDB, or SMTP. Isolated live MariaDB and browser checks are recorded separately in [003 validation](../specs/changes/003-event-publishing/validation.md); passing unit tests does not establish hosted or Entra acceptance.

For an explicit database integration check, build first and provide the connection variables to a **fresh, empty, disposable loopback database whose name ends in `_test`**, then run:

```sh
DB_TEST_CONFIRM=isolated-disposable node scripts/test-event-database.mjs
```

This script uses the supplied process environment (it does not load `.env`), checks the database is empty, applies migrations twice, and writes synthetic events and sessions. It tests concurrent publication deduplication, conflict preservation, service recreation/persistence, session restoration/destruction, and cancellation. It never resets or drops data; dispose only of the isolated fixture you created after testing. Do not point it at your ordinary development or hosted database.

Dependency audit: the selected Drizzle Kit release currently pulls a development-only `@esbuild-kit`/old-esbuild chain with four moderate audit findings (GHSA-67mh-4wv8-2f99). The production-only install excludes that chain and has no reported vulnerabilities at validation time. Do not expose tooling development servers or treat this as a clean full audit; review upstream updates before release. No forced downgrade or dependency override was applied.
