# 005 — Event Management Improvements: Implementation Plan

**Status:** Proposed sequence only — no implementation authorized by recording this specification. Renumbered from 004 to 005; child registration is now specified in [004](../004-child-registration/requirements.md).

Review [requirements](requirements.md) and [validation](validation.md) before implementation. Keep the accepted 003 scope as historical evidence.

## 1. Confirm implementation boundaries and dependencies

- Review [shared UI conventions](../../ui-conventions.md), including common event-list styling and navigation between the two distinct staff lists.

- Plan registration-dependent work against 004's persisted registrations. Independent improvements may be implemented separately only within an explicitly approved scope.
- Use 004's authoritative count of every saved registration. Apply the confirmed maximum ≥ count rule and full event-associated deletion policy; do not treat these decisions as unresolved.
- Define authoritative repository queries and API error contracts for field errors and rejected state transitions. Do not add a registration schema solely to make this change appear testable.

## 2. Improve validation feedback

- Return structured field/rule errors from backend input validation and present specific German feedback in creation and editing.
- Detect/report multiple invalid fields, preserve form values, and associate accessible errors with controls.
- Keep unexpected errors sanitized and preserve existing publication/retry protections.

## 3. Implement event-management policy and persistence

- Apply the editing/deletion matrix in backend policy with controlled test fixtures for no/existing registrations and calendar boundaries.
- Add update/delete persistence for the same event identity, preserving cancellation state and enforcing restrictions on the saved values.
- Ensure registration checks and mutations cannot race with new registrations, cancellation, or another state change. Select appropriate transaction/locking or conditional-write behavior after reviewing the actual repositories.
- Enforce a finite maximum ≥ current registration count and minimum ≤ maximum in the same consistency boundary as saving the event. Equality and clearing to unlimited are allowed.
- Review 003's canonical publication payload/retry behavior: an edit or deletion must not make an old publication retry overwrite an edited event, recreate a deleted event, or silently lose the original duplicate-submission guarantees. Specify the chosen behavior before implementation.
- Delete the eligible event and all associated registration/personal/bank/authorization and confirmation/communication history in an atomic, consistent operation. Cover 006's batches, message content, recipient snapshots, and tracking when present; preserve other events and avoid orphaned data.
- Coordinate deletion with pending/in-flight sends and export generation so deleted data cannot be recreated by late writes or used to start new sends after deletion. Already submitted emails and downloaded workbooks cannot be recalled. Document any temporary export cleanup and backup/restore boundaries without promising external erasure.

## 4. Build the staff workflow

- Add the authenticated table and eligibility-aware **Bearbeiten**, **Löschen**, and **Absagen** actions.
- Reuse existing event inputs and review behavior for editing; save changes explicitly without sending notifications.
- Use the German cancellation/deletion reminders and destructive-data warning from requirements. Preserve all data if dismissed, send no automatic notifications, and do not introduce a requirement to prove prior manual communication.
- Refresh staff/public data after successful mutations and retain mobile usability.

## 5. Validate and document

- Run field/policy/component/API tests, MariaDB integration tests, and relevant bootstrap/production-packaging regressions.
- Include capacity edit/registration races, complete event-data deletion with another event preserved, cancellation retaining records, confirmation reminders, and deletion versus pending sends/exports.
- Use synthetic records for all local and hosted checks; remote operations require separate approval.
- Record registration-dependent fixtures separately from tests using actual registrations. Leave dependent acceptance criteria pending until real integration is exercised.
- Record trainer desktop/mobile acceptance and public-view regression results.
- Synchronize API documentation, roadmap, requirements, and validation results only for implemented/accepted scope.
