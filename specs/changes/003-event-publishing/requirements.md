# 003 — Event Publishing: Requirements

**Status:** Complete — owner accepted all validation criteria on 21 November 2026; see [validation](validation.md) for evidence sources and acceptance boundaries.

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
| R3 | An event has a required name, optional plain-text description, start date, end date, one or more targeted age groups, optional minimum and maximum participant counts, and registration deadline. Display both counts in the creation form, review, and public event views, with minimum before maximum. |
| R4 | Dates are inclusive calendar dates interpreted in `Europe/Berlin`. End date must be on or after start date. Age groups are the combinations `{m,w}U{6,8,10,12,14,16,18}`. Minimum and maximum participant counts, if supplied, are positive integers. A blank minimum means no minimum; a blank maximum means unlimited. When both are supplied, minimum must not exceed maximum. |
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
- Minimum and maximum participant counts are recorded and displayed here; no automatic cancellation or minimum-participant enforcement is introduced. Seat allocation follows with registration.
- No off-site events; the approved mission's club-premises scope remains unchanged.

## Deferred technical decisions

The owner approved the following implementation choices during change 003:

- `openid-client` for single-tenant Entra OIDC; `express-session` with a MariaDB-backed server-side store.
- Private `STAFF_ALLOWLIST` configuration containing comma-separated `tenant-id:user-object-id` pairs; no account-management UI or Redis.
- Drizzle ORM with `mysql2` and Drizzle Kit-generated, reviewed SQL migrations, applied explicitly rather than at startup. The owner selected Drizzle instead of the initially proposed direct SQL approach for its learning value and typed schema.
- HTTP-only SameSite=Lax cookies, Secure over HTTPS, with a local-loopback HTTP development exception; exact-origin and server-session CSRF-token checks on mutations.

See [Entra setup](../../../docs/entra-setup.md) and [event publishing operations/API](../../../docs/event-publishing.md). The owner confirmed local staff access, trainer usability, and hosted feature/security acceptance. Operational checks are owner-accepted in [pre-release readiness](../../release-readiness.md); local tests alone do not establish hosted results.

**Approved scope extension:** The owner approved optional minimum participants, positive-integer and minimum/maximum consistency validation, and creation/review/public display. Blank means no minimum, and the field is informational only. There are no existing events requiring data migration; published events remain uneditable. Implementation uses an additive nullable-column migration without resetting development data.

**Approved development-setup clarification (21 November 2026):** The owner approved simplifying database guidance around one MariaDB 11.8.6 baseline and disposable development data, including the hosted bootstrap. No production-data upgrade path is required. Retain current schema semantics and migrations, centralize technical database details, and document a local database-only reset preserving Mailpit. Preserve historical validation evidence and real-use release gates. This clarification does not authorize resetting existing local/hosted databases.

Substantive scope changes require review before implementation. See the [implementation plan](plan.md) and [validation criteria](validation.md).

**Approved login troubleshooting follow-up (21 November 2026):** Investigate the owner's repeatable local `AUTH_LOGIN_MISSING` after Entra/MFA. Add fixed, secret-free login-cookie/session diagnostics only; do not change authorization, cookie protections, Entra configuration, or stored application data. Never log callback URLs, cookie/session values, claims, tokens, or raw errors.

**Approved local URL correction (21 November 2026):** The owner confirmed sign-in works at `http://localhost:5173` but fails through Vite's printed IP-address URL. Bind Vite to `localhost`, explicitly use port 5173 with strict port selection, and align development documentation. Preserve the backend proxy, authentication protections, and Entra configuration.
