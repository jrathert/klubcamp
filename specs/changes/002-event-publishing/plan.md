# 002 — Event Publishing: Implementation Plan

**Status:** Approved baseline; implementation not started.

Implement only the scope in [requirements.md](requirements.md). Record evidence against [validation.md](validation.md). Verify the application-bootstrap dependency before implementation.

## 1. Configure staff access

- Register the single-tenant Entra application for the club's existing Microsoft 365 tenant.
- Document local and hosted callback URLs and credential configuration without recording secrets.
- Implement OIDC sign-in, server-side sessions, allowlist checks, sign-out, and request protection.
- Identify allowed staff through stable tenant/user identifiers, not email addresses.
- Select a minimal session mechanism compatible with Hetzner; do not introduce Redis by default.

## 2. Establish event persistence

- Select minimal MariaDB access and migration tooling.
- Create the event schema, including publication/cancellation state.
- Implement backend validation and protected publish/cancel operations.
- Prevent duplicate publication from repeated submission.
- Do not expose edit or delete operations.

## 3. Build the staff workflow

- Provide a German event form with the agreed fields and deadline default.
- Provide a review screen with a return-to-form correction step before explicit publication.
- Provide cancellation confirmation and a clear cancelled state.
- Do not introduce saved-draft infrastructure or editing after publication.

## 4. Build public views

- Provide responsive event list and detail pages without requiring sign-in.
- Display capacity information and mark cancelled events “Abgesagt”.
- Keep unpublished form content private and document the API boundary.

## 5. Validate and synchronize specifications

- Run automated tests and manual usability/security checks.
- Update the roadmap from “create, edit, publish” to “create, publish, cancel”.
- Record selected access, session, and migration tooling in the relevant specifications.
- Record validation results and any blockers; unperformed external checks remain pending.

## Deferred functionality

Implement registration-deadline enforcement, seat allocation, and cancellation notifications with registration, not in this change. Do not introduce infrastructure beyond what this workflow needs.
