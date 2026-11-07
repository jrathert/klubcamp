# 002 — Production Setup: Requirements

**Status:** Approved scope; production implementation and validation not started.

## Objective

Deploy and verify the existing bootstrap at `https://camps.schwarzweisskoeln.de` using Hetzner's built-in Node.js configuration, without disrupting the club's WordPress website at `schwarzweisskoeln.de`. This change owns the production requirements and unperformed external checks separated from [001 — Application Bootstrap](../001-application-bootstrap/requirements.md).

See the [production baseline](../../production-environment.md), [technology stack](../../tech-stack.md), and [roadmap](../../roadmap.md). Local bootstrap validation is complete; it is not evidence of production readiness.

## Requirements

| ID | Requirement |
| --- | --- |
| R1 | Establish a supported deployment procedure on the existing Hetzner Webhosting L package using konsoleH-managed Node.js 24. The owner reports v24.22.2, matching the local pin; verify the effective deployment runtime. Document installation/build/start commands, deployment contents, listener configuration, routing, and process supervision. Run one Express application serving the built React frontend and JSON API; do not run Vite or separate frontend/backend development servers in production. |
| R2 | Use the owner-created application hostname `camps.schwarzweisskoeln.de`, separately configured from WordPress at `schwarzweisskoeln.de`. Confirm konsoleH's activation scope and obtain approval for the concrete routing and deployment procedure before remote changes. Preserve WordPress throughout deployment, restart, and removal. Do not activate Node.js on the WordPress domain. If the existing package cannot support the application safely, present alternatives for approval rather than introducing infrastructure unilaterally. |
| R3 | Serve the bootstrap page, assets, and API over HTTPS from one origin. `/api/health` returns the documented response; unknown API paths remain JSON 404 responses. |
| R4 | Keep runtime configuration and credentials outside source control, public files, frontend bundles, and diagnostic logs. Use a dedicated application directory outside WordPress and publicly served directories, with only built frontend files exposed by Express. Document secure configuration placement and loading without recording secrets, including `NODE_ENV=production`. Establish the provider's listener contract and compatible `HOST`/`PORT` settings or any required listener adaptation; do not assume the local defaults work. |
| R5 | Verify hosted MariaDB connectivity using the non-mutating `npm run check:db` command and a non-root application account. Record the actual version and relevant endpoint/access, TLS, character set, collation, SQL mode, and time-zone configuration without exposing credentials. |
| R6 | Verify the existing production SMTP service with authenticated TLS using `SMTP_MODE=smtp`. Send one explicitly authorized test message to a supplied recipient and separately confirm inbox arrival. Local Mailpit capture or SMTP acceptance alone does not prove production delivery. |
| R7 | Verify persistent operation, accessible sanitized logs, and documented process stop/start/restart and recovery behavior. Startup failures must be detectable; no credentials may appear in operational output. |
| R8 | Document and verify safe stop/removal of only the Klubcamp deployment, without deleting shared services, database data, or WordPress resources. Record production validation evidence and unresolved blockers accurately. |

## Boundaries and dependencies

- Depends on the completed local bootstrap. Deploy that foundation only; no event features or staff authentication are introduced here.
- The owner reports Hetzner Node.js v24.22.2 and MariaDB 10.11.19. Runtime-version parity is established by owner report, not by deployment validation; effective runtime settings and hosted connectivity remain unverified.
- The owner reports WordPress at `schwarzweisskoeln.de` is currently working. It is a separate hosting target from the new application hostname; retain before/after availability checks rather than treating coexistence as an unresolved architecture decision.
- The initial deployment proposal is to build locally, upload compiled frontend/backend output, and install runtime dependencies on Hetzner. Finalize the artifact contents and hosted DB/SMTP check tooling before execution; the existing check commands require TypeScript source and the development dependency `tsx`.
- Access, verified database/SMTP settings, an approved recipient, and an approved routing/supervision procedure are prerequisites for external checks.
- This specification authorizes planning the production setup, **not remote deployment or configuration changes**. Obtain explicit operational approval before executing those steps.
- No production Docker, new hosting infrastructure, DNS/domain changes, schema migrations, or data migration is authorized by default.
- Backup/restore and production personal-data handling must be established before product use; local bootstrap deployment does not satisfy that broader release requirement.

See the [implementation plan](plan.md) and [validation criteria](validation.md).
