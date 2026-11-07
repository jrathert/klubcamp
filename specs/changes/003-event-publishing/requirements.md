# 003 — Event Publishing: Requirements

**Status:** Approved baseline; implementation not started.

## Objective

Deliver the first product vertical slice: authorized staff create, review, and publish an event, parents view it, and staff may subsequently cancel it. Published events cannot be edited or deleted.

See [mission](../../mission.md), [technology stack](../../tech-stack.md), and [roadmap](../../roadmap.md). Implementation depends on the completed [application bootstrap](../001-application-bootstrap/requirements.md) and verified [production setup](../002-production-setup/requirements.md).

## Confirmed decisions

- German-only interface; no i18n framework.
- Microsoft Entra single-tenant OIDC sign-in for staff, with an application-side allowlist using stable tenant/user identifiers.
- All authorized staff have equal access to all events.
- Create, review, publish, and cancel; no saved drafts, editing, or deletion.
- Cancelled events remain public and are marked **“Abgesagt”**.
- Cancellation notifications are deferred until registration is implemented.

## Requirements

| ID | Requirement |
| --- | --- |
| R1 | Staff sign in through the club's Microsoft Entra tenant using OIDC. An application-side allowlist identifies authorized staff using stable tenant/user identifiers, not email addresses. All allowed staff have equal permissions. No account-management UI is included. |
| R2 | Protect staff operations on the backend. Use secure, HTTP-only session cookies and appropriate CSRF protection. Provide sign-out. Do not expose Microsoft credentials or tokens to frontend code. |
| R3 | An event has a required name, optional plain-text description, start date, end date, one or more targeted age groups, optional maximum participant count, and registration deadline. |
| R4 | Dates are inclusive calendar dates interpreted in `Europe/Berlin`. End date must be on or after start date. Age groups are the combinations `{m,w}U{6,8,10,12,14,16,18}`. Capacity, if supplied, is a positive integer; otherwise it is unlimited. |
| R5 | Default the registration deadline to 14 calendar days before the start date. It must be strictly before the start date. Registration closes after that deadline; actual enforcement belongs to the registration change. |
| R6 | Staff enter event information, review it, and explicitly publish it. They may return from review to correct information before publication. No persistent drafts are required. Prevent accidental duplicate publication from repeated submission. |
| R7 | Published events cannot be edited or deleted. Any authorized staff member may cancel one after confirmation. Cancelled events remain publicly visible and clearly marked “Abgesagt”. |
| R8 | Public users can browse published events and view their details without signing in. All interface text, validation messages, and date presentation are German. |
| R9 | Persist events in MariaDB. Introduce only the database migration and access tooling needed for this workflow. |

Unpublished form content must not be publicly accessible.

## Boundaries and dependencies

- Implementation depends on the completed application bootstrap and verified production setup.
- Changes 001/002 now satisfy those development prerequisites. Use synthetic data during development; [pre-release readiness](../../release-readiness.md) and applicable feature/security criteria must pass before real product use. No event implementation is authorized merely by closing 002; this change's approved scope still governs the work.
- Entra configuration and an allowlist must be available before staff-access validation can pass.
- No registrations, cancellation emails, payments, deadline changes, granular permissions, or i18n framework.
- Capacity is recorded and displayed here; seat allocation follows with registration.
- No off-site events; the approved mission's club-premises scope remains unchanged.

## Deferred technical decisions

- Select minimal OIDC, session, MariaDB access, and migration tooling compatible with the verified hosting environment.
- Define the allowlist configuration and session mechanism without adding an account-management UI or Redis by default.

Substantive scope changes require review before implementation. See the [implementation plan](plan.md) and [validation criteria](validation.md).
