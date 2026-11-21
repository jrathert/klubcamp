# 004 — Child Registration: Requirements

**Status:** Documented for future implementation — not implemented. Business scope confirmed by the owner; recording this specification does not authorize implementation.

## Objective

**Shared UI requirement:** Follow [UI1–UI8](../../ui-conventions.md) where applicable. The public registration list is one of the three coordinated event lists; it retains its own columns/actions and anonymous access.

Let parents register a child for a published event without signing in, receive a short German confirmation email, and let authorized trainers view the event's participant names and ages.

This follows accepted [003 — Event Publishing](../003-event-publishing/requirements.md). Event Management Improvements has moved from 004 to [005](../005-event-management-improvements/requirements.md). See [implementation plan](plan.md), [validation criteria](validation.md), and [roadmap](../../roadmap.md).

## Public workflow

1. Anonymous visitors see a simple event list/table. Each entry shows the event name, start/end dates, age groups as text, registration deadline, and an **Anmelden** button when registration is available.
2. The event name links to its full detail page, including the description. That page also offers **Anmelden** when registration is available.
3. Either button opens a registration page clearly identifying the selected event.
4. The parent completes the form, explicitly authorizes bank collection, and submits. Valid submissions are saved before confirmation email is attempted.
5. Show a clear registration result. If email fails or its send outcome is unknown, keep the registration and explain the confirmation's status without claiming delivery; do not tell the parent to register again.

Cancelled events remain visible as **Abgesagt**, but have no registration button. Full events and events past the deadline must communicate that registration is unavailable, rather than offer a usable submission action. A direct URL or stale page must never bypass backend restrictions.

## Registration form

All listed fields are required except the child's membership number and the conditional BIC.

| Section | Field | Rule |
| --- | --- | --- |
| Kind | Vorname | Required |
| Kind | Nachname | Required |
| Kind | Geburtstag | Required valid calendar date; no age-group eligibility check |
| Kind | Mitgliedsnummer | Optional; absence must not prevent registration |
| Erziehungsberechtigte Person | Vorname | Required |
| Erziehungsberechtigte Person | Nachname | Required |
| Erziehungsberechtigte Person | E-Mail-Adresse | Required valid email address; confirmation recipient |
| Bankeinzug | IBAN | Required valid IBAN |
| Bankeinzug | BIC | Required when the normalized IBAN country prefix is not `DE`; optional for German IBANs |
| Bankeinzug | Kontoinhaber | Required; may differ from the guardian |
| Bankeinzug | Bestätigung des Bankeinzugs | Required, initially unchecked checkbox beside the applicable authorization text |

## Confirmed rules

- Trust families to select appropriate age groups. Do not calculate eligibility from birthday or require a selected age group as an additional registration field.
- No duplicate-child/person detection. A separate intentional submission may register the same child again. This is distinct from protecting against accidental HTTP retries/double-clicks.
- Enforce maximum capacity now; a blank maximum remains unlimited. Minimum participants remain informational, with no automatic cancellation.
- Accept registration throughout the deadline date in `Europe/Berlin`. Close at the start of the following Berlin calendar day; do not use UTC midnight or a fixed 24-hour duration across DST.
- A saved registration reserves one place regardless of whether its confirmation email succeeded.
- Trainer participant age is calculated as completed years on the event's start date, not the current date.
- No payment execution is introduced. Collecting bank details and authorization does not debit an account.

## Requirements

| ID | Requirement |
| --- | --- |
| R1 | Provide the anonymous list/detail/registration navigation described above, with German labels, civil dates, and responsive desktop/mobile layouts. No parent account or sign-in is required. |
| R2 | Validate and persist the selected event, child, guardian, bank fields, and explicit authorization. Preserve entered values and show understandable German field errors on invalid submissions. Do not expose raw errors or personal/bank data in diagnostics. |
| R3 | Enforce event existence, not-cancelled status, inclusive Berlin deadline, and capacity on the backend at submission time. Use authoritative persisted counts. Concurrent requests must not overbook; cancellation and other state changes must not race past eligibility checks. |
| R4 | Save registration durably before attempting email. Prevent accidental retries/double-clicks of the same submission from creating multiple registrations, consuming multiple places, or sending multiple confirmations. Do not introduce child-identity deduplication. A failed email must not roll back a saved registration or release its place. |
| R5 | Send a short German confirmation per registered child to the supplied guardian address identifying the child and event with event dates. Different children sharing an address receive separate messages; do not expose other guardians' addresses. Exclude IBAN, BIC, and authorization text from email. Persist confirmation state separately from registration success, distinguishing pending, accepted by relay, failed during sending, and outcome unknown as defined below. Keep failure details sanitized. |
| R6 | Load authorization wording from a dedicated configurable UTF-8 text file at runtime. Changing it must require no rebuild/restart. Display plain text, not executable HTML; record the exact accepted wording (or immutable equivalent), its version/hash, and acceptance timestamp with each registration. Do not accept submission if the file is missing/empty/unreadable or the displayed text changed before acceptance; show the current text and request renewed confirmation rather than record unseen wording. |
| R7 | Initially use clearly labelled dummy authorization wording for synthetic development only. Make replacing the file straightforward for the owner. Dummy text is not sufficient for real bank authorization or real-data use; final wording and feature-specific privacy/data-handling decisions must be approved before such use. |
| R8 | In the authenticated trainer event view, show event data followed by participants' **Vorname**, **Nachname**, and **Alter** at event start. Include saved registrations even if confirmation email failed. Do not return guardian contact details, bank details, full birth dates, or authorization records through this participant-list boundary. |
| R9 | Protect participant access on the backend using existing staff session/allowlist rules. Public event responses and anonymous routes must not disclose registrations or bank/guardian data. Keep secrets and personal/bank data out of URLs, frontend build artifacts, routine logs, and error responses. |

## Email outcomes and bounce monitoring

These semantics also apply to [006 — Event Administration](../006-event-administration/requirements.md).

| State | Meaning |
| --- | --- |
| Pending | Message is recorded but has no definitive send result yet. |
| Accepted by relay | SMTP relay explicitly accepted the message. This is not proof of destination delivery, inbox placement, or reading. |
| Failed during sending | A definitive failure is known, such as authentication failure, explicit SMTP rejection, or a connection failure known to occur before acceptance is possible. |
| Outcome unknown | A timeout, interruption, or crash leaves acceptance uncertain. Do not mislabel it as failure/success or silently resend it. |

- Associate each logical message with its registration/child, purpose, and unique tracking identifier. Preserve provider/SMTP message identifiers when available without exposing them in public responses or routine logs.
- A repeated request for the same logical submission must not create another message. Separate registrations for siblings are not duplicates even if the recipient address is identical.
- Persist known state and sanitized failure categories so an operator can distinguish failed, pending, and uncertain messages. Do not retain raw SMTP errors containing recipient addresses, credentials, or message bodies as diagnostics.
- Later destination rejections may arrive as bounce emails after relay acceptance. For this version, use a designated, manually monitored bounce/return mailbox supported by the configured mail service. Verify/document how the provider routes these reports and how available message identifiers can aid correlation; do not assume all providers expose identical bounce information.
- Manual mailbox monitoring does not automatically reconcile application state. A message recorded as relay-accepted may later bounce; absence of a bounce does not prove delivery. Spam placement and reading remain unknown.
- Automated bounce parsing, provider event/webhook ingestion, delivery/read tracking, and automatic resend are outside this change. A monitored mailbox and SMTP result tracking do not require a new queue service.
- Every saved registration retains its place for all email outcomes.

## Authorization text and data safeguards

- The text file location is configurable and documented during implementation. Store deployment-specific wording outside replaceable build output so updates do not silently overwrite it.
- Reading at runtime must work in the packaged deployment as well as local development. Do not introduce an upload/editor interface or a new runtime service.
- Treat child, guardian, and especially banking/authorization data as sensitive. Use synthetic values during development; do not put real records or consent text containing personal data in fixtures, logs, or validation evidence.
- Existing operational checklist acceptance does not approve this new feature's dummy consent or unspecified personal-data practices. Before real use, agree the actual authorization/privacy text, bank-data access/storage protections, retention/deletion, and operational handling.

## Dependencies and boundaries

- Reuse the current MariaDB/Drizzle stack and SMTP/Mailpit integration; review migrations and packaging changes explicitly. Do not reset databases as part of implementation.
- Until 005 is implemented, 003's prohibition on editing/deleting published events remains in force. This change does not add those actions.
- Persisted registrations and their counts provide the dependency for 005's edit/delete restrictions. There is no withdrawal/waitlist/status lifecycle in this scope: every saved registration counts, including email failures.
- 005 disallows setting a finite maximum below the current saved registration count; equality and unlimited capacity remain allowed. Further registration is blocked whenever the count is at or above its current finite maximum.
- Deleting cancelled events with registrations belongs to 005 and permanently removes all associated application-held registration/personal/bank/authorization and email data. Cancellation retains these records. Design 004 persistence/tracking to support this policy without orphaned data; cancellation/deletion send no automatic messages.

## Out of scope

- Age-group eligibility enforcement, child-identity duplicate checks, waiting lists, withdrawals, parent accounts, payment execution, or membership lookup.
- Event editing/deletion and the staff management table specified in 005.
- Excel export and participant email composition are specified separately in [006](../006-event-administration/requirements.md). Guardian/bank administration views, automatic cancellation notifications, and a manual email-resend UI are not part of 004. Recording email outcomes and documenting manual bounce monitoring are required; resending is a separate scope decision.
- Runtime, database, or hosted changes during this documentation step.
