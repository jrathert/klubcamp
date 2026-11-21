# 005 — Event Management Improvements: Requirements

**Status:** Documented for future implementation — not implemented. Renumbered from 004 to 005 at the owner's request so [004 — Child Registration](../004-child-registration/requirements.md) can establish the registration dependency first.

## Objective

**Shared UI requirement:** Follow [UI1–UI8](../../ui-conventions.md) where applicable. The event-management list remains distinct from the staff Email/Export list while sharing consistent presentation and staff navigation.

Improve staff event management with specific validation feedback, a compact event overview, and controlled editing and deletion.

This is a follow-up to the accepted [003 — Event Publishing](../003-event-publishing/requirements.md), not a reopening of its completed scope. Once implemented, this change supersedes 003's prohibition on editing/deleting published events and its unconditional preservation of cancelled events.

See [implementation plan](plan.md), [validation criteria](validation.md), and [roadmap](../../roadmap.md).

## Confirmed decisions

- Existing staff authorization remains unchanged: all authorized staff have equal access to event management.
- “Active” means published and not cancelled; it does not introduce a new stored status.
- “Registration date” / “last date” in the discussion means the **registration deadline**, not the date on which a family registered.
- Editing sends no notifications.
- Cancellation and deletion send no automatic notifications and add no communication workflow. Their confirmation dialogs remind staff in German to inform registrants; staff may use 006's existing Email capability before deletion.
- Cancelled events are immutable, but may be deleted after their end date regardless of registrations.
- Cancellation retains all associated data. Permanent event deletion removes all associated registrations, child/guardian/bank details, authorization records, and email history/tracking.
- The staff overview is a simple table; public browsing remains unchanged except that saved edits become visible and deleted events disappear.

## Editing and deletion rules

| Event state | Editing | Deletion |
| --- | --- | --- |
| Active, no registrations | All event fields | Allowed |
| Active, with registrations | Name, description, registration deadline, minimum/maximum participants, and adding age groups | Not allowed; cancellation instead |
| Cancelled, on or before its end date | Not allowed | Not allowed, even without registrations |
| Cancelled, after its end date | Not allowed | Allowed, regardless of registrations |

For active events with registrations, start/end dates cannot change and existing age groups cannot be removed. Existing groups may be retained and new groups added. Optional participant limits can be changed or cleared, subject to the existing positive-integer and minimum ≤ maximum rules. A finite maximum must also be greater than or equal to the authoritative current registration count; equality is allowed. Clearing the maximum still means unlimited. Count every saved registration regardless of confirmation-email state.

“After its end date” means the current calendar date in `Europe/Berlin` is strictly later than the stored inclusive end date, not simply that the event has started or that the server's UTC date changed.

## Requirements

| ID | Requirement |
| --- | --- |
| R1 | Show specific German validation messages identifying invalid fields and the applicable rules, on both initial creation and editing. Report multiple detected errors together, associate messages with their fields, and preserve entered values. Unexpected system failures remain generic and must not expose internal details. |
| R2 | Provide an authenticated staff event table with name, shortened description, start/end dates, minimum/maximum participants, registration deadline, and actions labelled **Bearbeiten**, **Löschen**, and **Absagen**. Represent unavailable actions clearly according to event state, without suggesting that a forbidden action is available. Keep full descriptions accessible in the existing detail/edit views. |
| R3 | Allow editing according to the state/registration rules above. Prefill the existing event, permit review and correction before explicitly saving, and update the same event rather than publishing a duplicate. Keep 003's existing field validation, date representation, and optional-limit semantics. |
| R4 | Allow permanent deletion only according to the rules above. Require explicit confirmation naming the event; cancelling the confirmation must not delete anything. A successful deletion removes the event from staff/public lists and makes its detail unavailable. |
| R5 | Preserve cancellation with explicit confirmation for active events. Cancelled events remain publicly marked **Abgesagt** until eligible deletion. Do not allow editing or reactivating a cancelled event. |
| R6 | Enforce all authorization, field restrictions, registration dependencies, and date-based deletion rules on the backend, including direct API requests. Preserve session, origin/CSRF, and request protections. Recheck eligibility when a mutation is saved; an outdated screen must not bypass changed event/registration state. |
| R7 | Keep the staff overview and forms usable on desktop and mobile. Use German labels and dates consistently, and make validation feedback accessible to the relevant form controls. |
| R8 | Permanently delete all application-held event-associated data when an eligible event is deleted: registrations, child/guardian/bank details, authorization snapshots/version/time, confirmation messages and their tracking, and 006's communication batches, content, recipient snapshots, and per-message history/tracking. Leave no orphaned records or application-held export artifacts. Preserve other events' data. Cancellation retains these records. |
| R9 | Cancellation/deletion confirmations must name the event and remind staff in German to inform the registered participants or their guardians. Deletion must additionally explain that the event and all associated registration/email data are permanently removed. Dismissing either dialog changes nothing. Do not send automatic notifications or require evidence that staff already informed recipients. |

## Confirmation wording and deletion boundary

Use the following German wording, or equivalent wording preserving both meaning and explicit confirmation:

- **Absagen:** `Veranstaltung „{Name}“ wirklich absagen? Bitte stellen Sie sicher, dass Sie die angemeldeten Teilnehmenden bzw. deren Erziehungsberechtigte informieren.`
- **Löschen:** `Veranstaltung „{Name}“ wirklich löschen? Die Veranstaltung und alle zugehörigen Anmelde- und E-Mail-Daten werden dauerhaft gelöscht. Bitte informieren Sie die angemeldeten Teilnehmenden bzw. deren Erziehungsberechtigte vor dem Löschen.`

Staff may use [006's Email action](../006-event-administration/requirements.md) manually; it remains available for cancelled events until deletion. Neither sending nor recording a communication is a prerequisite for cancellation/deletion.

Deletion applies to data held by the application, including retained event-specific email records and any application-held export artifacts. Previously downloaded Excel files, emails already sent/accepted by the relay, provider-held records, and manually monitored bounce-mailbox copies cannot be recalled or erased by deleting the event. Do not promise otherwise. Backup-copy expiry/restore handling remains part of the real-data operating policy, not an assertion that deleting a live event rewrites every backup.

## Dependencies and sequencing

- Change numbers identify specifications, not a mandatory implementation sequence. The owner may reorder or renumber this change before implementation.
- [004 — Child Registration](../004-child-registration/requirements.md) is specified but not implemented yet. Use its authoritative persisted registration data to determine registration existence, not a permanently hardcoded zero or a UI-only assumption. A saved registration counts even if its confirmation email failed.
- Specific errors, the table, and no-registration workflows can be implemented/tested independently if that scope is explicitly approved. Registration-dependent cases can be tested with controlled fixtures at the policy boundary, but those tests do not establish end-to-end behavior with real registration persistence.
- Full acceptance of the registration-dependent rules requires the actual registration model and integration tests. If implementation is split, record completed and blocked criteria separately rather than declaring the entire change complete.

## Registration integration

- Capacity and event-associated deletion decisions are confirmed above; they are no longer open questions.
- Under 004, further registrations are blocked whenever the count is at or above the current finite maximum. Capacity edits must enforce maximum ≥ count when saved, including concurrent new registrations.
- 004 has no withdrawal/cancelled-registration lifecycle: every persisted registration counts, including pending/failed/unknown confirmation email. If a later specification adds registration statuses, it must explicitly define their effect on counts and these restrictions.

## Out of scope

- Implementing child registration, participant administration, confirmation/cancellation emails, or Excel export.
- New roles, account management, saved drafts, reactivation, bulk actions, advanced filtering/sorting, or a new public event layout.
- Automatic cancellation, minimum-participant enforcement, or additional registration-capacity rules.
- Runtime, schema, deployment, or data changes during this documentation step.
