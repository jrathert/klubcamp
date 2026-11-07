# 002 — Production Setup: Implementation Plan

**Status:** Hosting direction established; implementation paused pending owner clarification. Provider-specific details, access, and operational approval remain pending.

Implement only [requirements.md](requirements.md). Record evidence against [validation.md](validation.md), without credentials or unnecessary execution history.

The agreed directory layout, proposed `npm run build:production` packaging command, and manual deployment workflow are documented in [the deployment proposal](../../../docs/deployment.md). These are not yet implemented or verified; code changes remain paused pending explicit continuation.

## 1. Confirm provider integration and approve the deployment procedure

- Use konsoleH-managed Node.js on the existing Webhosting L package for `camps.schwarzweisskoeln.de`. The owner reports v24.22.2, matching local development; confirm the effective version selected for deployment.
- Confirm the selected konsoleH target is `camps.schwarzweisskoeln.de` and establish HTTPS routing. Do not inspect, configure, or validate applications on other domains as part of this change.
- Consult the [provider documentation](https://docs.hetzner.com/de/managed/administration-on-konsoleh/nodejs/) and [Hetzner-hosted deployment tutorial](https://community.hetzner.com/tutorials/deploy-nextjs-on-a-managed-server/). The tutorial demonstrates a build-and-start workflow for Webhosting L/XL, but uses Next.js, not this application's Express/Vite stack; neither source is proof of a verified Klubcamp deployment.
- Resolve remaining details through read-only konsoleH inspection and, if needed, Hetzner support: the listener/routing contract, restart controls, automatic recovery, log access, and installation/build resource limits. The provider's example calls `server.listen()` without arguments, whereas the bootstrap explicitly uses `HOST`/`PORT`; do not assume a port or supervision implementation.
- Present unsupported capabilities and alternatives for approval before introducing infrastructure or making domain changes.
- Obtain explicit approval for the concrete deployment and validation steps before remote operations.

## 2. Prepare deployment and configuration

- Document reproducible install/build/start steps for one Express process serving both the API and built React files. `npm run build` produces `backend/dist/` and `frontend/dist/`; Vite is a build tool, not a production server.
- Prefer a local build on Node.js 24.22.2 and upload the compiled output into a dedicated private application directory. Install runtime dependencies on Hetzner rather than copying local `node_modules`. Document the required package/lock files and relative directory layout. If hosted builds are preferable, first establish resource feasibility and approve the revised procedure.
- Define how to run the hosted DB/SMTP checks: the existing npm commands require backend TypeScript sources and `tsx`, so a runtime-only artifact/install is insufficient. Approve either privately staged check sources and tooling or a separately specified compiled-check approach before deployment.
- Prepare a production-only entry point that explicitly loads the private environment file before importing the compiled backend. A launcher such as `app.js` using Node 24's built-in environment-file support is the proposed approach; finalize the entry point and loading mechanism after the owner's clarification. Do not rely on the panel's script-argument field accepting Node runtime flags.
- Proposed konsoleH settings are the dedicated application working directory, the production entry point, version `24`, and a private application-specific log path. Confirm memory limit and listener settings from provider evidence; these settings are not yet validated.
- Keep the application, configuration, and logs together under `~/klubcamp/`: replaceable files in `app/`, private configuration in `production.env`, and the provider log in `application.log`. The private file stays outside the upload/deployment artifact, with owner-only file permissions (`chmod 600`) and restricted directory access. Include `NODE_ENV=production` and the database/SMTP settings there. Deployment updates and removal must preserve this file. Avoid konsoleH environment entries; use at most one or two only if needed for documented bootstrap/provider settings.
- Explicitly load the same private configuration for separately invoked DB/SMTP checks. Document the resolved file path, existing-environment precedence, sanitized behavior when the file cannot be loaded, and the restart procedure needed after edits. Do not assume Node automatically reads `.env` or that direct startup uses `npm start`'s loading option. Keep local Compose settings and Mailpit out of production.
- Leave local development configuration and commands unchanged. Explain and obtain explicit owner approval before any necessary development-environment change. Do not start code changes until the owner has provided the pending clarification and authorized continuation.
- Obtain verified hosted database and authenticated SMTP settings without adding secrets to specifications.
- Define supervision, log access, restart/recovery, and safe stop/removal procedures before deploying.

## 3. Deploy the approved bootstrap

- Deploy the existing frontend/API as one konsoleH-managed application at `https://camps.schwarzweisskoeln.de` using the approved procedure; do not add PM2, a custom proxy, containers, or separate frontend/backend servers by assumption.
- Confirm HTTPS page/assets/API behavior and unknown API route boundaries.

## 4. Verify external services and operation

- Run the hosted database check using only its non-mutating query. Record database configuration parity and any differences from local development.
- Run one explicitly approved production SMTP test; distinguish server acceptance from confirmed inbox delivery.
- Verify logs, process persistence, stop/start/restart, and recovery under the provider's supervision mechanism.
- Verify safe deployment removal using the agreed non-destructive procedure, preserving shared resources, database data, and the private configuration file. Restore the deployment only if approved.

## 5. Record the verified operating procedure

- Update the README and production-environment reference with the confirmed procedure and acceptance results.
- Leave unperformed checks pending and describe blockers; do not substitute local results for hosted evidence.
- Keep product features, schema changes, and broader release operations outside this change.
