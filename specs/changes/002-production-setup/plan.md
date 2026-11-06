# 002 — Production Setup: Implementation Plan

**Status:** Approved scope; execution pending hosting decisions, access, and operational approval.

Implement only [requirements.md](requirements.md). Record evidence against [validation.md](validation.md), without credentials or unnecessary execution history.

## 1. Resolve and approve the hosting approach

- Confirm supported Node.js 24 runtime selection, public routing, HTTPS, listener configuration, log access, and process supervision on the existing package.
- Establish a target domain/subdomain arrangement that preserves WordPress. Do not activate Node.js on its existing domain.
- Use the [provider documentation](https://docs.hetzner.com/managed/administration-on-konsoleh/nodejs/) as a starting point, not proof that public routing or supervision works.
- Present unsupported capabilities and alternatives for approval before introducing infrastructure or making domain changes.
- Obtain explicit approval for the concrete deployment and validation steps before remote operations.

## 2. Prepare deployment and configuration

- Document reproducible install/build/start steps for the existing bootstrap, with the selected runtime version and provider-required `HOST`/`PORT`.
- Establish safe runtime-secret placement and access. Keep local Compose settings and Mailpit out of production.
- Obtain verified hosted database and authenticated SMTP settings without adding secrets to specifications.
- Define supervision, log access, restart/recovery, and safe stop/removal procedures before deploying.

## 3. Deploy the approved bootstrap

- Deploy the existing frontend/API as one application using the approved procedure.
- Confirm HTTPS page/assets/API behavior and unknown API route boundaries.
- Check WordPress before and after deployment; stop and report any unexpected impact.

## 4. Verify external services and operation

- Run the hosted database check using only its non-mutating query. Record database configuration parity and any differences from local development.
- Run one explicitly approved production SMTP test; distinguish server acceptance from confirmed inbox delivery.
- Verify logs, process persistence, stop/start/restart, and recovery under the provider's supervision mechanism.
- Verify safe deployment removal using the agreed non-destructive procedure, with WordPress/shared resources preserved. Restore the deployment only if approved.

## 5. Record the verified operating procedure

- Update the README and production-environment reference with the confirmed procedure and acceptance results.
- Leave unperformed checks pending and describe blockers; do not substitute local results for hosted evidence.
- Keep product features, schema changes, and broader release operations outside this change.
