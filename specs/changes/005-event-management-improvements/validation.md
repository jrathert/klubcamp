# 005 — Event Management Improvements: Validation

**Status:** Not started — specification only. Renumbered from 004 to 005; no implementation or acceptance checks have been performed for this change.

Validate against [requirements](requirements.md) using [plan](plan.md). Record environment, procedure, result, and evidence source. Synthetic fixtures do not replace end-to-end checks with actual persisted registrations.

| ID | Requirements | Acceptance criteria | Status |
| --- | --- | --- | --- |
| V1 | R1, R3 | Creation and editing identify specific invalid fields in German, report multiple detected errors, preserve entered values through correction/review, and do not expose internal errors. Check frontend and direct backend requests, including invalid dates, deadlines, age groups, participant limits, and minimum greater than maximum. | Pending |
| V2 | R2, R7 | Authorized staff see the agreed table columns, shortened descriptions, German dates, limit semantics, and the three labelled actions with eligibility represented correctly. Check desktop/mobile readability and access to full descriptions. Public browsing does not acquire staff controls. | Pending |
| V3 | R3, R6 | An active event without registrations permits changing every event field. Review/correction preserves changes; explicit save updates the same event and public views, survives restart, and sends no notifications. | Pending |
| V4 | R3, R6 | With actual registrations, permitted fields/groups can change, but removing existing groups or changing event dates is rejected without partial changes. Finite maximum below saved registration count is rejected; equality, increases, and clearing to unlimited succeed. Minimum > maximum is rejected. Count registrations with pending/failed/unknown email, and test concurrent registration during a capacity edit. No notifications are sent. | Pending — actual registration integration required |
| V5 | R4, R6 | Active event without registrations: dismissing deletion confirmation preserves it; confirming deletes the named event persistently, removes it from public/staff lists, and makes detail unavailable. | Pending |
| V6 | R4, R5, R6 | Active event with actual registrations: deletion is rejected by UI/API and leaves event/registrations unchanged; cancellation remains available with confirmation and public **Abgesagt** display. | Pending — actual registration integration required |
| V7 | R3, R5, R6 | Cancelled events cannot be edited or reactivated through UI/direct requests, regardless of registrations or whether the end date has passed. Failed mutations preserve all data. Existing cancellation-retry behavior remains covered by regression tests. | Pending |
| V8 | R4, R6, R8 | Cancelled events cannot be deleted before or on the end date, even with zero registrations. They may be deleted the following Berlin calendar day, with or without registrations. Test midnight/time-zone boundaries; eligible deletion permanently removes the event and all associated data under R8. | Pending — registered-event variant requires registration integration |
| V9 | R6 | Anonymous/disallowed users cannot access staff data or mutations. Mutations require the existing session/origin/CSRF protections; invalid input and rejected state changes never leak secrets or bypass authorization. | Pending |
| V10 | R3, R4, R6 | Stale screens/direct requests cannot bypass eligibility after a new registration or cancellation. Integration tests verify concurrent checks/mutations and the chosen handling of publication retries after editing/deletion; no overwrite, unintended recreation, duplicate event, or registration-data corruption occurs. | Pending — registration races require actual registration integration |
| V11 | R1–R9 | Type checking, application tests, production-tooling tests/build, MariaDB persistence checks, and relevant public/create/review/publish/cancel regressions pass. Hosted staff/public smoke and trainer desktop/mobile checks pass for the implemented scope. | Pending |
| V12 | R4, R5, R9 | Both confirmation dialogs name the event and show the German reminder to inform registrants/guardians. Deletion additionally warns of permanent associated-data removal. Dismissal changes nothing; confirmation sends no automatic notification and does not require communication evidence. Cancellation retains registrations, authorizations, and email data; 006 Email/Export remain available. | Pending |
| V13 | R6, R8 | With synthetic registrations and 004 message history, deletion removes all associated child/guardian/bank/authorization and confirmation/tracking records. When 006 exists, repeat with batches, content, recipient snapshots, tracking, and any application-held export artifacts. Verify no orphans or late recreation after restart/concurrent send/export work; other events remain intact. Already-sent messages, external mailbox/provider copies, downloaded workbooks, and backup copies are not falsely claimed erased. | Pending — 004 integration required; repeat 006-specific cases when implemented |

## Shared UI acceptance — pending

Validate applicable [UI1–UI8](../../ui-conventions.md) and the shared desktop/mobile/keyboard checklist. Compare event-management styling, common data formatting, actions, cancellation markers, and empty/error states with other implemented lists. Verify clear navigation/current-view indication between the two staff lists without exposing staff navigation to anonymous users. Preserve edit/delete/cancel rules and this list's agreed columns. Record unavailable views and repeat cross-view checks when implemented; no UI consistency validation has yet been performed.

## Evidence and completion

- Business rules documented from the owner's decisions; this is not implementation validation.
- Record independent and registration-dependent checks separately if implementation is split. Controlled registration-presence fixtures may validate policy early but must be labelled as such.
- Exact UI truncation/layout and API contracts will be reviewed during implementation; no implementation artifacts are prescribed by this document.
- Do not close all of 005 until the approved scope is implemented and its criteria pass, including the registration-dependent cases using [004's registrations](../004-child-registration/requirements.md), or the owner explicitly approves a documented split/change of scope.
