# 004 — Child Registration: Implementation Plan

**Status:** Proposed plan — specification only; no implementation performed or authorized by this documentation step.

Review [requirements](requirements.md) and [validation](validation.md) before implementation. Event Management Improvements is now [005](../005-event-management-improvements/requirements.md).

## 1. Review contracts and safeguards

- Review [shared UI conventions](../../ui-conventions.md) before designing the public list; compare against other implemented event lists without changing this list's agreed columns/actions.

- Review existing public event routes, staff event view, validation, Drizzle schema/migrations, SMTP guards, and runtime packaging.
- Define public registration and restricted participant-list contracts. Do not expose registration lookup by email, bank data, or unrestricted lists.
- Specify field limits, format validation/normalization (including IBAN/BIC), accessible German errors, and the policy for invalid birth dates without introducing age-group eligibility.
- Document development-only dummy wording and feature-specific privacy/retention/storage decisions required before real use.

## 2. Add durable registration and confirmation state

- Add reviewed MariaDB migrations for child/guardian/bank data, event relation, authorization snapshot/version/time, submission retry identity, and confirmation state.
- Keep registration success distinct from pending/relay-accepted/failed/unknown confirmation states. Count every saved registration regardless of email state; associate each logical message with a registration and unique tracking identifier.
- Apply event eligibility, Berlin deadline, capacity, and insertion with concurrency-safe database behavior. Coordinate with cancellation, not just competing registrations.
- Define retry behavior so the same submission cannot create another reservation or trigger another send. Deliberate new submissions remain accepted without identity-based deduplication.
- Apply/reapply migrations in an isolated database and preserve existing event/session data.
- Design event relations and confirmation tracking for 005's confirmed full associated-data deletion policy. Do not add deletion actions in 004; cancellation retains registrations and email state.

## 3. Load editable authorization wording

- Select/document the configurable UTF-8 file path and include a clearly marked development dummy example without treating it as approved legal text.
- Read current wording at runtime; handle missing, empty, or unreadable files safely.
- Associate rendered wording with a content version/hash. On submit, ensure explicit acceptance corresponds to the current displayed version; request renewed confirmation if changed.
- Store immutable accepted wording and timestamp. Confirm plain-text rendering and runtime-only packaging support; preserve sibling deployment configuration/text files.

## 4. Build public registration workflow

- Adapt anonymous event list to the agreed columns and linked name.
- Add event-specific **Anmelden** navigation from list and detail, with unavailable/cancelled states.
- Add the registration form, conditional BIC, unchecked authorization, field feedback, preserved values on errors, and a clear submission/result state.
- Recheck availability server-side even when a form was opened earlier. Keep draft bank data out of URLs and persistent browser storage.

## 5. Send confirmation and show trainer participants

- Reuse SMTP/Mailpit tooling to send a short German child/event confirmation after durable registration.
- Record pending/relay-accepted/failed/unknown states and sanitized failure categories without losing the registration or logging sensitive payloads. Preserve SMTP/provider message identifiers when available.
- Define crash/timeout behavior between save, send, and state update before implementation. Do not claim exactly-once inbox delivery or add a new queue service; make any uncertain delivery outcome explicit rather than silently resend.
- Verify/document a provider-supported return/bounce address and manual mailbox-monitoring procedure. Distinguish delayed bounce reports from immediate send failures; no automated bounce processing or state reconciliation is included.
- Verify one private message per registration, including siblings sharing an address. Never put multiple guardians in visible recipient headers.
- Extend the authenticated trainer event view with participant first/last names and age at event start. Project only the allowed fields at the backend boundary.

## 6. Validate and synchronize

- Run unit/component/API tests for navigation, fields, conditional BIC, capacity, Berlin/DST boundaries, retry handling, authorization-file changes, email states, participant projection, and staff protection.
- Run isolated MariaDB concurrency/persistence checks and Mailpit capture/failure checks using synthetic records.
- Run existing type checking, application tests, production-tooling tests/build, and event-publishing/authentication regressions.
- Perform desktop/mobile parent/trainer acceptance and separately approved hosted smoke/security checks. Test runtime wording updates without restart.
- Record evidence in validation and update roadmap/status only for completed scope. Do not mark feature-specific real-data/legal safeguards complete merely because the development workflow works.
