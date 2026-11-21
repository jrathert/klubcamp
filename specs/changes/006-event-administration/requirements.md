# 006 — Event Administration: Requirements

**Status:** Documented for future implementation — not implemented. Business scope confirmed by the owner; recording this specification does not authorize implementation.

## Objective

**Shared UI requirement:** Follow [UI1–UI8](../../ui-conventions.md) where applicable. The Email/Export list remains distinct from the staff edit/delete/cancel list while sharing consistent presentation and staff navigation.

Provide a simple staff management backend with an event overview, email to registered children via their guardian addresses, and a full Excel export of event registrations.

Depends on [004 — Child Registration](../004-child-registration/requirements.md). Coordinate the staff navigation/table with [005 — Event Management Improvements](../005-event-management-improvements/requirements.md) without expanding either change's action scope. See [plan](plan.md), [validation](validation.md), and [roadmap](../../roadmap.md).

## Confirmed workflow

1. Authorized staff see a table with event **name**, **age groups**, **start/end dates**, and **number of registered participants**.
2. Cancelled events are clearly marked **Abgesagt**, with color as an additional cue rather than the only distinction.
3. Each event row offers **Email** and **Export**, including cancelled events.
4. **Email** opens a subject and plain-text message composer for that event. Staff review the selected event, content, and message count before explicitly confirming sending.
5. Send one separate message per registered child to that registration's guardian address. One guardian can therefore receive several messages. Never deduplicate by guardian address or reveal other guardians' addresses.
6. Record per-message send outcomes and show a batch summary.
7. **Export** downloads an `.xlsx` workbook containing all registration data for the selected event, including sensitive guardian/banking and authorization data.

## Requirements

| ID | Requirement |
| --- | --- |
| R1 | Protect the overview, counts, composer, send results, and downloads using existing backend staff session/allowlist authorization. No new role hierarchy is introduced. Keep state-changing requests protected by the existing origin/CSRF rules. |
| R2 | Show the agreed event columns and registration count, including cancelled events. Count authoritative saved registrations, including confirmation-email failures/unknown outcomes, consistently with 004. Use German text/dates and a readable desktop/mobile layout. |
| R3 | Provide subject and plain-text body inputs with understandable German validation. Require both. Show the selected event, full content, and number of per-child messages before explicit confirmation; dismissing confirmation sends nothing. Resolve recipients from persisted registrations on the backend, not client-supplied arbitrary addresses. |
| R4 | Send one private message per registration/child to its guardian address, including multiple messages to a shared address. Never use visible multi-guardian To/Cc headers. Allow sending for cancelled events; cancellation does not remove their registrations from the recipient set. |
| R5 | Persist an identifiable send batch with event, subject/body, recipient registration snapshot, and individual logical message identifiers/outcomes. Use the shared pending/relay-accepted/failed/unknown semantics from 004. Record sanitized failure categories per message and show per-message results plus batch counts; one failure does not erase successful results or make the entire batch appear unsent. |
| R6 | Prevent double-clicks/retries of the same confirmed send from creating another batch or sending duplicate logical messages. Keep ambiguous outcomes unknown and do not automatically resend them. A deliberately composed and confirmed new batch is a separate communication, not an accidental duplicate. |
| R7 | Download a genuine `.xlsx` file for the selected event with one participant row per saved registration and clear German column headings. Include all registration data described below, including bank/guardian/authorization information. Export remains available for cancelled events. Preserve identifiers, membership numbers, IBAN/BIC, Unicode, and dates without numeric/scientific-notation corruption. Treat user-controlled cells as data, never formulas. |
| R8 | Keep exports, email bodies/recipient snapshots, and results private. Do not expose them in public routes, frontend build artifacts, routine logs, public/static files, or shared caches. Deliver downloads only through authorized requests. Do not include banking/authorization data in participant email merely because it is included in exports. |
| R9 | Reuse 004's SMTP result tracking and manual bounce-monitoring approach. Label relay acceptance accurately; do not claim destination delivery or reading. Do not automatically update application results from manually observed bounces or add provider webhooks/bounce parsing in this scope. |

## Excel contents

“All registration data” includes:

- Event identity/name and relevant event dates so the export is unambiguous.
- Registration identifier and registration timestamp.
- Child first name, last name, birthday, and optional membership number.
- Guardian first name, last name, and email address.
- IBAN, conditional BIC, and account holder.
- Bank-authorization acceptance, acceptance timestamp, accepted wording snapshot, and version/hash as recorded by 004.
- Registration confirmation-email outcome recorded by 004.

The export is not a raw database dump: exclude credentials, session/CSRF tokens, submission retry secrets, and internal diagnostics. This scope does not require exporting 006's separate communication-batch history.

## Email consistency and outcomes

- Reuse [004's email outcome definitions](../004-child-registration/requirements.md#email-outcomes-and-bounce-monitoring): pending, accepted by relay, failed during sending, outcome unknown. Relay acceptance is not delivery; a later bounce or spam classification may occur.
- Bind the confirmation to a specific event/content/recipient snapshot. If registrations change before submission is committed, do not silently send to an expanded audience the operator did not confirm; require refreshed confirmation or use the explicitly confirmed snapshot. Define the chosen contract before implementation.
- Persist per-child correlation even when recipient addresses are identical. Preserve available SMTP/provider message identifiers for controlled operational use; do not publish raw provider errors.
- Pending/unknown outcomes after interruption must remain visible, not be counted as known failures or automatically retried. Avoid promising exactly-once delivery across SMTP/network/crash boundaries.
- Use a designated manually monitored return/bounce mailbox supported by the configured provider, documented with 004. Manual monitoring is outside application automation and does not guarantee that every late failure can be correlated.
- A zero-registration event shows a count of zero. No send can be confirmed without recipients; export must still be a valid workbook with headings/event context and no participant rows.

## Dependencies, privacy, and boundaries

- Reuse the existing staff allowlist. All currently authorized staff may use these actions; this explicitly grants access to full sensitive exports, unlike 004's minimal participant-list response.
- Retain 004's minimal participant-list projection. A new protected export boundary does not justify adding bank/guardian data to ordinary event or participant-list APIs.
- Before real-data use, address export access/download handling, email batch/snapshot retention, and local copies of sensitive workbooks in the applicable privacy/operating procedures. Earlier generic operational acceptance is not approval of these new feature-specific data flows.
- Coordinate event deletion with 005's confirmed policy: permanently remove all application-held event registrations and associated communication batches, content, recipient snapshots, history/tracking, and any retained event export artifacts. Leave no orphaned data or late write that recreates it. Cancellation retains all records and Email/Export access. Deletion cannot recall already-sent emails, downloaded Excel files, or external mailbox/provider copies.
- 005's cancellation/deletion dialogs remind staff in German to inform registrants. Staff may use this change's Email action manually before deletion; neither action automatically sends a message or requires proof of prior communication.
- Mailpit validates capture and immediate send behavior only, not external delivery/bounce routing. Production SMTP or hosted changes require separate approval.

## Out of scope

- New staff roles, parent accounts, bank/guardian edit screens, payment collection, or participant withdrawal.
- Rich HTML email, attachments, recipient filtering/selection, arbitrary recipient entry, guardian-address deduplication, or personalized template variables.
- Automatic cancellation announcements, automated resend/retry UI, automated bounce/webhook ingestion, and delivery/read receipts.
- Advanced event filtering/sorting, new runtime queue services, scheduled campaigns, or Excel import.
- Runtime, database, hosted, or email-sending changes during this documentation step.
