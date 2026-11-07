# 001 — Application Bootstrap: Implementation Plan

**Status:** Complete — local scope implemented and validated.

Scope: [requirements.md](requirements.md). Results: [validation.md](validation.md). Production work is specified in [002 — Production Setup](../002-production-setup/plan.md).

## 1. Minimal application

- Use Node.js 24.22.2, TypeScript, React/Vite, and Express.
- Provide a health endpoint and frontend connectivity page with loading, success, and failure states.
- Proxy API requests in development; serve the built frontend and API from Express for local preview.
- Document API boundaries and npm commands.

## 2. Local infrastructure and configuration

- Original implementation pinned MariaDB 10.11.19 with localhost binding and a version-specific persistent volume. Change 002 subsequently corrects the current pin to 11.8.6 using a new volume; older volumes remain untouched.
- Pin Mailpit with localhost-only SMTP/browser ports and dedicated persistent storage.
- Provide example settings, secret-file exclusions, and safe start/stop/reset instructions in the [README](../../../README.md).

## 3. Explicit connectivity checks

- Use the MariaDB driver for a non-mutating database check and Nodemailer for one explicitly requested SMTP test message.
- Bound connection and total execution time; sanitize failures and return meaningful exit codes.
- Permit plaintext unauthenticated SMTP only in explicitly selected local Mailpit mode; preserve authenticated TLS defaults.
- Keep checks separate from HTTP, startup, builds, and ordinary tests.

## 4. Validation

- Test API behavior, frontend states, and SMTP configuration guards without live services.
- Verify type checking, tests, build, local development, and built application serving.
- Verify local database connectivity/persistence and Mailpit capture/persistence.
- Retain concise evidence and links to operational instructions; production checks belong to change 002.
