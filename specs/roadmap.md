# Roadmap

## Goal

Deliver a complete, usable v1.0 without a fixed deadline. Internal v0.x versions may be incomplete; the first public release must cover the full basic event-registration workflow.

Each milestone requires an approved specification and validation criteria before implementation.

## Current changes

1. [001 — Application Bootstrap](changes/001-application-bootstrap/requirements.md): complete local development foundation.
2. [002 — Production Setup](changes/002-production-setup/requirements.md): production feasibility, deployment, and external-service verification pending; remote operations require separate approval.
3. [003 — Event Publishing](changes/003-event-publishing/requirements.md): approved product scope; implementation not started, dependent on the bootstrap and verified production setup.

Change numbers identify specifications; the broader milestones below span multiple changes. Completing the local bootstrap does not complete deployment feasibility or staff access protection.

## 1. Verify deployment feasibility

- Confirm how a persistent Node.js application can run alongside the existing WordPress website on Hetzner.
- Verify routing, HTTPS, environment configuration, logs, and process restart behavior.
- Verify MariaDB and outbound email connectivity.

**Complete when:** a minimal deployed application demonstrates the required connections without disrupting WordPress.

## 2. Specify the first-release workflows

- Define event information, publishing rules, registration data, and participant overview.
- Decide whether capacity limits belong in v1.0.
- Define staff access protection and permissions.
- Establish privacy, data-access, and retention requirements.
- Define email confirmation behavior and Excel export content.
- Make the mission's usability targets testable.

**Complete when:** the specifications and acceptance criteria are approved, with no unresolved decisions blocking implementation.

## 3. Establish the application foundation

- Set up the TypeScript frontend and backend, MariaDB access, and database migrations.
- Establish local development, automated tests, and a repeatable deployment process.
- Implement the agreed staff access protection.

**Complete when:** the application can be developed, tested, and deployed reliably, and restricted functions reject unauthorized access.

## 4. Build the event workflow

- Allow authorized staff to create, review, publish, and cancel events; published events cannot be edited or deleted.
- Allow parents to browse published events and view their details.
- Provide responsive layouts and basic validation.

**Complete when:** a trainer can set up and publish an event in under 10 minutes.

## 5. Build registration end to end

- Let parents register a child for a published event.
- Store registrations and send confirmation emails.
- Apply the agreed registration rules and handle submission or email failures.

**Complete when:** a parent can register a child for a selected event in under 3 minutes, and registration and confirmation behavior pass the approved tests.

## 6. Complete office administration

- Provide per-event participant overviews.
- Export registrations to Excel.
- Implement any additional basic administration explicitly approved in the specifications.

**Complete when:** office staff can access participant information within the agreed usability target and obtain a correct export.

## 7. Validate and release v1.0

- Validate the complete workflow on mobile and desktop.
- Test authorization, validation, failure handling, and personal-data safeguards.
- Verify backup and restore procedures and production configuration.
- Document essential operation and maintenance tasks.

**Complete when:** all first-release acceptance criteria pass. No separate pilot phase is required.

## Beyond v1.0

Payments and user self-registration/account management are excluded from v1.0. Consider them later through separate specifications, alongside usability improvements informed by actual use.
