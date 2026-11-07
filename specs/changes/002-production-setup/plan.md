# 002 — Production Setup: Implementation Plan

**Status:** Complete — bootstrap deployment verified under the owner-approved completion boundary. Further operational/release validation is tracked in the pre-release checklist.

Implement only [requirements.md](requirements.md). Record evidence against [validation.md](validation.md), without credentials or unnecessary execution history.

The implemented `npm run build:production` command and application startup/configuration contract are documented in [the shared packaging guide](../../../docs/deployment.md). Host paths, working panel settings, and the current external Azure SMTP service are documented separately in [Hetzner deployment and operation](../../../docs/deployment-hetzner.md). Hosted HTTPS frontend/API, database connectivity, SMTP delivery, and manual restart are verified; see [validation evidence](validation.md) for remaining boundaries.

The owner approved completing 002 as deployment feasibility, with unfinished operational checks transferred to [pre-release readiness](../../release-readiness.md). The steps below retain the implemented approach; PR references identify follow-up work, not blockers to 002 completion or claims that it was executed.

## 1. Confirm provider integration and approve the deployment procedure

- Use konsoleH-managed Node.js on Webhosting L for `camps.schwarzweisskoeln.de`. Effective Node.js v24.22.2 is owner-verified over SSH; public HTTPS routing works with the existing `127.0.0.1:3000` listener.
- Confirm the selected konsoleH target is `camps.schwarzweisskoeln.de` and establish HTTPS routing. Do not inspect, configure, or validate applications on other domains as part of this change.
- Consult the [provider documentation](https://docs.hetzner.com/de/managed/administration-on-konsoleh/nodejs/) and [Hetzner-hosted deployment tutorial](https://community.hetzner.com/tutorials/deploy-nextjs-on-a-managed-server/). The tutorial demonstrates a build-and-start workflow for Webhosting L/XL, but uses Next.js, not this application's Express/Vite stack; neither source is proof of a verified Klubcamp deployment.
- Initial deployment confirms the current explicit `HOST`/`PORT` listener works without adaptation. Home-relative paths and log access are verified. Exact restart controls, automatic recovery, failure detection, memory limit, and relevant resource documentation transfer to PR1; do not infer supervision internals.
- Present unsupported capabilities and alternatives for approval before introducing infrastructure or making domain changes.
- Obtain explicit approval for the concrete deployment and validation steps before remote operations.

## 2. Prepare deployment and configuration

- Document reproducible install/build/start steps for one Express process serving both the API and built React files. `npm run build` produces `backend/dist/` and `frontend/dist/`; Vite is a build tool, not a production server.
- Keep the build artifact and production launchers provider-neutral. Use a generic placeholder environment reference; put Hetzner panel/routing/operation details and current external Azure mail values in the host guide. Preserve the fixed sibling-file runtime contract and deployed directory layout; no provider adapter, dependency, command, or application-behavior change is needed for this documentation separation.
- Prefer a local build on Node.js 24.22.2 and upload the compiled output into a dedicated private application directory. Install runtime dependencies on Hetzner rather than copying local `node_modules`. Document the required package/lock files and relative directory layout. If hosted builds are preferable, first establish resource feasibility and approve the revised procedure.
- The artifact's `check:db` and `check:smtp` npm commands use compiled checks and production launchers with runtime dependencies only. Development check commands continue using TypeScript/`tsx` unchanged.
- The production-only `app.js` entry point uses shared `runtime.js` to explicitly load the private environment file with Node 24's built-in support before importing the backend. Do not rely on the panel's script-argument field accepting Node runtime flags.
- Working konsoleH settings are home-relative directory `klubcamp/app`, script `app.js`, version `24`, and home-relative log `klubcamp/application.log`. "Home" means the SSH account home, not Apache's document root. The selected memory-limit record is deferred to PR1; do not invent one.
- Keep the application, configuration, and logs together under `~/klubcamp/`: replaceable files in `app/`, private configuration in `production.env`, and the provider log in `application.log`. The private file stays outside the upload/deployment artifact, with owner-only file permissions (`chmod 600`) and restricted directory access. Include `NODE_ENV=production` and the database/SMTP settings there. Deployment updates and removal must preserve this file. Avoid konsoleH environment entries; use at most one or two only if needed for documented bootstrap/provider settings.
- Explicitly load the same private configuration for separately invoked DB/SMTP checks. Document the resolved file path, existing-environment precedence, sanitized behavior when the file cannot be loaded, and the restart procedure needed after edits. Do not assume Node automatically reads `.env` or that direct startup uses `npm start`'s loading option. Keep local Compose settings and Mailpit out of production.
- Leave local development configuration and commands unchanged. Explain and obtain explicit owner approval before any necessary development-environment change. The owner authorized implementing the agreed production tooling; no local development setup change was needed.
- Obtain verified hosted database and authenticated SMTP settings without adding secrets to specifications.
- Correct local MariaDB to the actual hosted version 11.8.6 using fresh `mariadb-11-8-6-data`, as explicitly requested by the owner. Preserve old volumes, do not migrate or delete user data, and validate in an isolated Compose project rather than restarting the user's existing services. Record administration-session settings separately from application DB TLS evidence.
- Record verified managed activation, log access, and manual restart. Detailed operating/recovery instructions and safe removal/update rehearsal follow under PR1/PR2; additional hosted failure/configuration tests follow under PR6.

## 3. Deploy the approved bootstrap

- Deploy the existing frontend/API as one konsoleH-managed application at `https://camps.schwarzweisskoeln.de` using the approved procedure; do not add PM2, a custom proxy, containers, or separate frontend/backend servers by assumption.
- Confirm HTTPS page/assets/API behavior and unknown API route boundaries.

## 4. Verify external services and operation

- Run the hosted database check using only its non-mutating query. Record supplied metadata and configuration differences. Application connection TLS/access evidence and schema/session parity follow under PR3; do not infer them from the administration-tool connection.
- Run one explicitly approved production SMTP test; distinguish server acceptance from confirmed inbox delivery.
- Verify managed availability, sanitized startup logs, and manual restart. Full process/recovery validation is transferred to PR1/PR6.
- Document preservation boundaries for shared resources, database data, logs, and private configuration. Hosted removal/update rehearsal is transferred to PR2 and must not be performed without operational approval.

## 5. Record the verified operating procedure

- Update the README and production-environment reference with the confirmed procedure and acceptance results.
- Leave unperformed checks pending and describe blockers; do not substitute local results for hosted evidence.
- Keep product features, schema changes, and broader release operations outside this change.
- Close 002 with the owner's accepted deployment evidence and explicit PR1–PR6 deferrals. Do not label deferred tests passed or treat the public bootstrap as authorization for real product use.
