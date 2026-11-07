# 002 — Production Setup: Validation

**Status:** All production checks pending. No verified Klubcamp deployment exists on Hetzner.

Validate against [requirements.md](requirements.md) using [plan.md](plan.md). Record concise results and sanitized evidence, never credentials. Local evidence is in [001](../001-application-bootstrap/validation.md) and does not satisfy these criteria.

| ID | Requirements | Passing evidence | Result |
| --- | --- | --- | --- |
| V1 | R1, R2 | The effective Node.js version is recorded against the owner-reported v24.22.2 baseline. The konsoleH target `camps.schwarzweisskoeln.de`, HTTPS routing, listener contract, and supervision procedure are established and approved. | Pending |
| V2 | R1, R3 | Documented build, artifact transfer, dependency installation, and startup steps reproduce one Express deployment serving `backend/dist/` and `frontend/dist/`, without a Vite server. Public HTTPS page, assets, and health API work at `camps.schwarzweisskoeln.de`. Unknown API routes return JSON 404. Hosted DB/SMTP check tooling is available through the documented deployment procedure. | Pending |
| V3 | R4 | The application directory is outside publicly served directories. A manually editable, owner-only private environment file outside the deployment artifact supplies the main configuration, including `NODE_ENV=production` and DB/SMTP settings. Explicit loading works before backend startup under konsoleH and for manual checks. File-path resolution, environment precedence, sanitized missing/unreadable-file failures, and restart-after-edit behavior are verified. No panel environment entries are required except at most one or two documented bootstrap/provider settings. Frontend output, public files, and logs contain no backend secrets. Listener behavior matches verified provider requirements. | Pending |
| V4 | R5 | Hosted `check:db` exits successfully using a non-root account; actual database version and relevant connection/server settings are recorded. The check does not mutate data. | Pending |
| V5 | R6 | An explicitly authorized message is accepted through authenticated production SMTP over TLS and confirmed in the intended recipient inbox. | Pending |
| V6 | R7 | The process remains available under the agreed supervision mechanism. Documented stop/start/restart and recovery work; logs are accessible and sanitized; failures are detectable. | Pending |
| V7 | R2, R8 | Safe stop/removal affects only the Klubcamp deployment. Shared resources, database data, and the private configuration file are preserved. No validation of other domains or their applications is required. | Pending |
| V8 | R1, R8 | README and production-environment reference describe the verified procedure and current results; no unperformed external check is marked passed. | Pending |

## Known facts and blockers

- The owner reports Hetzner Webhosting L with Node.js **v24.22.2** and MariaDB **10.11.19**. Node.js matches the local pin; the effective deployed runtime has not been independently verified.
- The owner has created `camps.schwarzweisskoeln.de` for the application. Other domains and their applications are outside scope; they are not deployment prerequisites or acceptance checks.
- The supplied konsoleH screenshot shows script path, working directory, log path, memory limit, version, script arguments, environment entries, and activation controls. It does not establish listener routing, restart controls, or automatic recovery behavior.
- The selected direction is one konsoleH-managed Express application serving the built React frontend and API over one HTTPS origin. The bootstrap already supports this layout locally; no separate production frontend server is required.
- Provider documentation and the Hetzner-hosted tutorial support the general managed build/start workflow, but do not establish this application's listener contract, restart/recovery behavior, or resource limits. These require read-only provider inspection and possibly support clarification before finalizing the execution procedure.
- The initial proposal is a local build plus uploaded compiled output and provider-installed runtime dependencies. The owner can upload via SSH/SCP and manually provision the hosted MariaDB database/account. Artifact contents, hosted check tooling, memory limit, HTTPS routing, logs, and safe removal still require a concrete approved procedure. Runtime-only dependencies do not provide `tsx` for the existing check commands.
- Main production settings will live in a manually maintained private environment file, not in the konsoleH environment table. Explicit file loading is required for startup and checks; a production-only launcher using Node 24's built-in support is proposed but not implemented or validated.
- Code implementation is paused pending owner clarification. Local development settings must remain unchanged unless a necessary change is explained and explicitly approved first. No code or development-environment changes have been made for this revision.
- Hosted database credentials/configuration, production SMTP settings, and a designated authorized test recipient have not been supplied for validation.
- The local API, MariaDB, and Mailpit checks passed in change 001. No hosted connectivity, external inbox delivery, HTTPS deployment, or remote operational checks have been performed.

## Completion rule

Complete only when all criteria pass and evidence is recorded. Report missing access, unsupported capabilities, and unperformed external checks as blockers, not waived requirements. Planning approval alone does not authorize remote changes.
