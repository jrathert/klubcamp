# 001 — Application Bootstrap: Implementation Plan

**Status:** Approved baseline; implementation not started.

Implement only the scope in [requirements.md](requirements.md). Record evidence against [validation.md](validation.md).

## 1. Resolve the hosting approach first

- Establish supported runtime versions, routing, and process supervision for manually managed Node.js.
- Confirm the approach preserves WordPress.
- If unsupported, present alternatives for approval before introducing new infrastructure or changing domain configuration.

Reference: [Hetzner Node.js configuration](https://docs.hetzner.com/managed/administration-on-konsoleh/nodejs/). The manual runtime section does not by itself establish public routing or process supervision.

## 2. Create the minimal application structure

- Set up npm scripts, TypeScript, React/Vite, and Express.
- Select a supported Node.js LTS version compatible with hosting and record it.
- Implement the health endpoint and frontend connectivity page.
- Configure the development API proxy and production serving of the built frontend.
- Document the health response and unknown API route behavior.

## 3. Establish local configuration and database

- Add Docker Compose for MariaDB with a pinned supported version, preferably matching production's major version.
- Bind the database port to localhost and persist data in a volume.
- Document start, stop, and explicitly destructive reset procedures.
- Add configuration examples and secret-file exclusions.
- Add the database verification command using a MariaDB-compatible driver.

## 4. Add email verification

- Use a small SMTP library to send an explicitly requested test message.
- Document required SMTP settings and safe credential handling.
- Give database and SMTP checks bounded timeouts, clear exit codes, and sanitized diagnostics.

## 5. Add automated checks

- Configure Vitest and minimal test helpers.
- Test API behavior and frontend loading, success, and failure states.
- Keep normal tests independent of live database, SMTP, and hosting services.
- Verify type checking and production builds.

## 6. Deploy and record evidence

- Document installation, development, build, start, deployment, and safe deployment-removal procedures.
- Deploy the bootstrap using the verified hosting approach.
- Run database and email checks in the hosting environment.
- Verify HTTPS, logs, restart behavior, and continued WordPress operation.
- Record results and remaining blockers in the validation document. External checks not performed remain pending.

## Deferred choices

Select the exact MariaDB driver, SMTP library, and minimal test helpers during implementation within the approved scope. Do not introduce an ORM, migration tooling, or additional infrastructure in this change.
