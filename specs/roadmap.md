# Roadmap

## Goal

Deliver a complete, usable v1.0 without a fixed deadline. Internal v0.x versions may be incomplete; the first public release must cover the full basic event-registration workflow.

Each milestone requires an approved specification and validation criteria before implementation.

All upcoming UI changes follow the [shared UI conventions](ui-conventions.md), including the distinct public registration, staff event-management, and staff event-administration lists.

## Current changes

1. [001 — Application Bootstrap](changes/001-application-bootstrap/requirements.md): complete local development foundation.
2. [002 — Production Setup](changes/002-production-setup/requirements.md): complete — bootstrap deployment verified. Operational follow-ups in [pre-release readiness](release-readiness.md) were subsequently accepted as passed for now by the owner on 21 November 2026.
3. [003 — Event Publishing](changes/003-event-publishing/requirements.md): complete — local automated/database/browser evidence and owner-confirmed staff access, trainer usability, and hosted feature/security acceptance, 21 November 2026.
4. [004 — Child Registration](changes/004-child-registration/requirements.md): documented, not implemented — anonymous event list/detail registration, child/guardian/bank form, runtime-editable authorization wording, capacity/deadline checks, confirmation email with failure tracking, and a trainer participant list.
5. [005 — Event Management Improvements](changes/005-event-management-improvements/requirements.md): documented, not implemented — formerly 004; specific validation feedback, a staff event table, and state/registration-dependent editing and deletion. Uses 004's registrations for dependent policy/integration checks.
6. [006 — Event Administration](changes/006-event-administration/requirements.md): documented, not implemented — staff event/count overview, per-child email to guardian addresses with explicit confirmation and recorded outcomes, and full sensitive registration-data Excel export, including cancelled events.

Change numbers identify specifications, not mandatory implementation order, and may be reorganized before implementation. The broader milestones below span multiple changes. Changes 001/002 complete local bootstrap and deployment feasibility, not staff access protection or approval for real product use.

## 1. Verify deployment feasibility

- Confirm persistent konsoleH-managed Node.js operation for `camps.schwarzweisskoeln.de` on Hetzner.
- Verify routing, HTTPS, environment configuration, logs, and process restart behavior.
- Verify MariaDB and outbound email connectivity.

**Complete:** 002 demonstrates a managed bootstrap over HTTPS, private configuration, DB/SMTP connectivity, logs, and manual restart. The owner subsequently accepted the operational checklist as passed for now; see its evidence boundaries.

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
- Planned follow-up 005 adds controlled editing/deletion and staff-overview/validation improvements, superseding that restriction only when implemented. Its registration-dependent rules use child registration from 004.
- Allow parents to browse published events and view their details.
- Provide responsive layouts and basic validation.

**Complete when:** a trainer can set up and publish an event in under 10 minutes.

**Complete:** change 003 accepted by the owner on 21 November 2026, including the trainer acceptance check. Exact timing and whether sign-in was included were not supplied.

## 5. Build registration end to end

- Let parents register a child for a published event.
- Store registrations and send confirmation emails.
- Track pending, relay-accepted, failed, and unknown email outcomes; later bounces are monitored manually, not automatically interpreted as application delivery status.
- Apply the agreed registration rules and handle submission or email failures.
- Specified in [004 — Child Registration](changes/004-child-registration/requirements.md), including the basic authenticated participant list. Dummy bank authorization wording is development-only; feature-specific real-data safeguards remain a separate acceptance gate.

**Complete when:** a parent can register a child for a selected event in under 3 minutes, and registration and confirmation behavior pass the approved tests.

## 6. Complete office administration

- Provide per-event participant overviews.
- Export registrations to Excel.
- Specified in [006 — Event Administration](changes/006-event-administration/requirements.md), including explicit staff email composition/confirmation, per-message outcomes, and full registration-data export.
- Implement any additional basic administration explicitly approved in the specifications.

**Complete when:** office staff can access participant information within the agreed usability target and obtain a correct export.

## 7. Validate and release v1.0

- Validate the complete workflow on mobile and desktop.
- Test authorization, validation, failure handling, and personal-data safeguards.
- Verify backup and restore procedures and production configuration.
- Document essential operation and maintenance tasks.
- Complete the [pre-release readiness checklist](release-readiness.md), including the explicit deferrals from 002. The public bootstrap is not permission to store real personal data or send real registration confirmations; those uses remain gated by the checklist and applicable feature/security acceptance criteria.

**Complete when:** all first-release acceptance criteria pass. No separate pilot phase is required.

## Beyond v1.0

Payments and user self-registration/account management are excluded from v1.0. Consider them later through separate specifications, alongside usability improvements informed by actual use.
