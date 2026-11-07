# 002 — Production Setup: Implementation Plan

**Status:** Approved scope and hosting direction; execution pending provider-specific details, access, and operational approval.

Implement only [requirements.md](requirements.md). Record evidence against [validation.md](validation.md), without credentials or unnecessary execution history.

## 1. Confirm provider integration and approve the deployment procedure

- Use konsoleH-managed Node.js on the existing Webhosting L package for `camps.schwarzweisskoeln.de`. The owner reports v24.22.2, matching local development; confirm the effective version selected for deployment.
- Confirm the application hostname is an independently configurable Node.js target and establish HTTPS routing. WordPress at `schwarzweisskoeln.de` is reported working and remains untouched; do not activate Node.js on that target.
- Consult the [provider documentation](https://docs.hetzner.com/de/managed/administration-on-konsoleh/nodejs/) and [Hetzner-hosted deployment tutorial](https://community.hetzner.com/tutorials/deploy-nextjs-on-a-managed-server/). The tutorial demonstrates a build-and-start workflow for Webhosting L/XL, but uses Next.js, not this application's Express/Vite stack; neither source is proof of a verified Klubcamp deployment.
- Resolve remaining details through read-only konsoleH inspection and, if needed, Hetzner support: the listener/routing contract, restart controls, automatic recovery, log access, and installation/build resource limits. The provider's example calls `server.listen()` without arguments, whereas the bootstrap explicitly uses `HOST`/`PORT`; do not assume a port or supervision implementation.
- Present unsupported capabilities and alternatives for approval before introducing infrastructure or making domain changes.
- Obtain explicit approval for the concrete deployment and validation steps before remote operations.

## 2. Prepare deployment and configuration

- Document reproducible install/build/start steps for one Express process serving both the API and built React files. `npm run build` produces `backend/dist/` and `frontend/dist/`; Vite is a build tool, not a production server.
- Prefer a local build on Node.js 24.22.2 and upload the compiled output into a dedicated private application directory. Install runtime dependencies on Hetzner rather than copying local `node_modules`. Document the required package/lock files and relative directory layout. If hosted builds are preferable, first establish resource feasibility and approve the revised procedure.
- Define how to run the hosted DB/SMTP checks: the existing npm commands require backend TypeScript sources and `tsx`, so a runtime-only artifact/install is insufficient. Approve either privately staged check sources and tooling or a separately specified compiled-check approach before deployment.
- Proposed konsoleH settings are the dedicated application working directory, script path `backend/dist/server.js`, version `24`, and a private application-specific log path. Confirm memory limit and listener settings from provider evidence; these settings are not yet validated.
- Establish safe runtime-secret placement and access, with `NODE_ENV=production`. Starting the compiled script directly bypasses `npm start` and its `.env` loading option; use konsoleH environment variables or an explicitly verified private-file loading mechanism. Ensure separately executed checks receive their required configuration securely. Keep local Compose settings and Mailpit out of production.
- Obtain verified hosted database and authenticated SMTP settings without adding secrets to specifications.
- Define supervision, log access, restart/recovery, and safe stop/removal procedures before deploying.

## 3. Deploy the approved bootstrap

- Deploy the existing frontend/API as one konsoleH-managed application at `https://camps.schwarzweisskoeln.de` using the approved procedure; do not add PM2, a custom proxy, containers, or separate frontend/backend servers by assumption.
- Confirm HTTPS page/assets/API behavior and unknown API route boundaries.
- Check WordPress at `schwarzweisskoeln.de` before and after deployment; stop and report any unexpected impact.

## 4. Verify external services and operation

- Run the hosted database check using only its non-mutating query. Record database configuration parity and any differences from local development.
- Run one explicitly approved production SMTP test; distinguish server acceptance from confirmed inbox delivery.
- Verify logs, process persistence, stop/start/restart, and recovery under the provider's supervision mechanism.
- Verify safe deployment removal using the agreed non-destructive procedure, with WordPress/shared resources preserved. Restore the deployment only if approved.

## 5. Record the verified operating procedure

- Update the README and production-environment reference with the confirmed procedure and acceptance results.
- Leave unperformed checks pending and describe blockers; do not substitute local results for hosted evidence.
- Keep product features, schema changes, and broader release operations outside this change.
