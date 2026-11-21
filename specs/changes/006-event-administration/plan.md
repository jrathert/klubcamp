# 006 — Event Administration: Implementation Plan

**Status:** Proposed plan — specification only. No implementation or acceptance checks performed.

Review [requirements](requirements.md) and [validation](validation.md) before implementation.

## 1. Review dependencies and contracts

- Review [shared UI conventions](../../ui-conventions.md), including common event-list styling and navigation between the two distinct staff lists.

- Review 004's registration/confirmation persistence, shared SMTP outcome contract, and manual bounce-monitoring procedure.
- Coordinate administration navigation with 005 without conflating event edit/delete actions with Email/Export.
- Define backend-authorized list/count, composer confirmation, batch status, and export contracts. Define field limits and safe German errors.
- Decide recipient snapshot/confirmation freshness and interrupted-send handling before implementation. Do not introduce automatic resend or a new queue service.
- Agree export schema and sensitive-data retention/access/download procedures for real use.

## 2. Add durable batch/message tracking

- Add reviewed migrations as needed for batch content, recipient registration snapshot, logical message identifiers, per-message state, sanitized failure categories, and available provider identifiers.
- Keep confirmation messages from 004 and staff-composed messages distinct by purpose while sharing outcome semantics.
- Make double-clicks/request retries idempotent and partial results durable. Separate explicit new sends from retries of an existing batch.
- Preserve pending/unknown state under crashes/timeouts; never infer delivery or resend solely from lack of a recorded acceptance.
- Integrate 005's confirmed permanent deletion of event-associated batches, content, recipient snapshots, and message tracking. Prevent in-flight/late processing from recreating deleted records or starting new sends from deleted event data; already submitted messages cannot be recalled.

## 3. Build overview and Email workflow

- Show event name, age groups, dates, registration count, cancellation marker, and Email/Export actions.
- Add subject/plain-text body inputs, review of the event/content/message count, and explicit confirmation.
- Resolve one recipient per child from authoritative saved registrations. Shared addresses must receive separate private messages.
- Use existing SMTP/Mailpit integration and persist individual outcomes. Expose authorized per-message results and accurate batch counts, including partial failures and unknowns.
- Keep both actions available for cancelled events; handle zero registrations clearly.

## 4. Build Excel export

- Select a maintained `.xlsx` writer compatible with the runtime-only package; review dependencies and output limits before implementation.
- Define German columns covering the agreed full registration data, authorization record, confirmation status, and event context.
- Generate a consistent event-specific download. Keep identifiers/banking fields as text, dates explicit, and malicious spreadsheet formulas inert.
- Send an authorized download with appropriate filename/content type and no shared caching/public artifacts. Avoid persistent temporary files containing personal data; define protected cleanup if temporary storage is necessary.
- Handle empty events and generation failures without leaking details or returning a corrupt workbook as success.

## 5. Validate and document

- Test staff/anonymous boundaries, counts, cancellation highlighting, composer confirmation, recipient privacy, double submission, message tracking, and batch summaries.
- Test synthetic Mailpit capture plus definitive SMTP failure and ambiguous interruption, including siblings sharing an address.
- Read exported workbooks back in automated tests to verify complete values/types, empty cases, and formula-injection resistance; manually inspect in an Excel-compatible application.
- Test database persistence/restart and existing 004/005 regressions, runtime packaging, desktop/mobile usability, and separately authorized hosted smoke checks.
- Test that cancellation retains Email/Export and histories, while eventual 005 deletion removes all application-held event-associated communication/export data without affecting other events or falsely promising erasure of external copies.
- Record evidence in validation; document manual bounce monitoring and limitations without claiming inbox delivery.
