# 003 — Event Publishing: Implementation Plan

**Status:** Complete — local implementation/validation and owner-confirmed live Entra, hosted, and trainer acceptance recorded in [validation](validation.md) on 21 November 2026. Earlier plan-step notes describe implementation history.

Implement only the scope in [requirements.md](requirements.md). Record evidence against [validation.md](validation.md). Verify the application-bootstrap and production-setup dependencies before implementation.

## 1. Configure staff access

- Register the single-tenant Entra application for the club's existing Microsoft 365 tenant.
- Document local and hosted callback URLs and credential configuration without recording secrets.
- Implement OIDC sign-in, server-side sessions, allowlist checks, sign-out, and request protection.
- Identify allowed staff through stable tenant/user identifiers, not email addresses.
- Select a minimal session mechanism compatible with Hetzner; do not introduce Redis by default.

**Selected with owner approval:** `openid-client`, `express-session`, MariaDB session storage, and private tenant/user object-ID allowlist. The [repeatable Entra setup guide](../../../docs/entra-setup.md) gives exact Web callback URLs, secret handling, user-ID lookup, and local/production validation. No Entra or hosted changes have been performed by the agent.

## 2. Establish event persistence

- Select minimal MariaDB access and migration tooling.
- Create the event schema, including publication/cancellation state.
- Add the owner-approved optional `minimumParticipants` field with a nullable integer column, positive-integer and minimum ≤ maximum validation, and an additive migration. Do not reset development data or introduce enforcement/automatic cancellation.
- Implement backend validation and protected publish/cancel operations.
- Prevent duplicate publication from repeated submission.
- Do not expose edit or delete operations.

**Selected with owner approval:** Drizzle ORM's MySQL dialect and `mysql2`; Drizzle Kit generates versioned SQL under `backend/migrations/`. `db:migrate` is explicit and available in the runtime-only artifact. Publication uses a unique submission UUID with canonical payload/owner comparison, preserving identical retries without overwriting published data.

## 3. Build the staff workflow

- Provide a German event form with the agreed fields and deadline default.
- Include “Mindestteilnehmerzahl” in creation/review and public list/detail views; blank means no minimum.
- Provide a review screen with a return-to-form correction step before explicit publication.
- Provide cancellation confirmation and a clear cancelled state.
- Do not introduce saved-draft infrastructure or editing after publication.

## 4. Build public views

- Provide responsive event list and detail pages without requiring sign-in.
- Display capacity information and mark cancelled events “Abgesagt”.
- Keep unpublished form content private and document the API boundary.

## 5. Validate and synchronize specifications

- Run automated tests and manual usability/security checks.
- Keep the roadmap aligned with the approved create/review/publish/cancel workflow; published events cannot be edited or deleted.
- Record selected access, session, and migration tooling in the relevant specifications.
- Record validation results and any blockers; unperformed external checks remain pending.

## Deferred functionality

Implement registration-deadline enforcement, seat allocation, and cancellation notifications with registration, not in this change. Do not introduce infrastructure beyond what this workflow needs.

## Approved local session troubleshooting

- Probe local login initiation without completing a real identity exchange; report only cookie/storage presence and expiry booleans.
- Log fixed login-start cookie-emission status and classify missing-attempt callbacks as absent, duplicate, invalid-signature cookie, unrestored session, or restored session without an attempt. Classification is diagnostic only, never an authentication bypass.
- Test each classification, cookie transport behavior, and exclusion of synthetic cookie/session/secret/callback canaries. Run type checking, regression, and packaging checks. Ask the owner for the resulting fixed diagnostic lines on one fresh sign-in; live browser/Entra resolution remains pending until confirmed.

## Approved local URL correction

- Set Vite's host to `localhost`, port to 5173, and `strictPort` to true; leave the backend proxy unchanged.
- Replace documentation workarounds for the printed IP address with the canonical localhost link and explain separate browser cookies.
- Validate resolved configuration, the advertised localhost URL, occupied-port failure, type checking, and application tests. Real Entra sign-in through the updated printed link remains an owner browser check.
