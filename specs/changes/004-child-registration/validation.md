# 004 — Child Registration: Validation

**Status:** Not started — specification only. No implementation or acceptance checks performed for this change.

Validate against [requirements](requirements.md) using [plan](plan.md). Record environment, steps, results, and evidence source without personal/bank data, credentials, or raw email payloads.

| ID | Requirements | Acceptance criteria | Status |
| --- | --- | --- | --- |
| V1 | R1 | Anonymous list shows linked event name, start/end dates, textual age groups, deadline, and available **Anmelden** action. Both list/detail actions open the form for the correct event. Full detail includes the description. Desktop/mobile layouts and German labels work without sign-in. | Pending |
| V2 | R2 | All agreed form fields persist correctly; membership number is optional. German IBAN permits blank BIC; non-German IBAN requires valid BIC. Required/invalid fields produce specific German feedback without losing inputs. No age-group eligibility or duplicate-child check is introduced. | Pending |
| V3 | R3 | Deadline day remains open through its last instant in `Europe/Berlin`; the next Berlin day is closed. Test month/year/DST and UTC-offset boundaries. Direct/stale submissions cannot bypass closure, missing-event, or cancellation checks. Cancelled list/detail pages have no registration button. | Pending |
| V4 | R3, R4 | Unlimited capacity works; the last place can be booked once; further requests are rejected. Concurrent submissions and cancellation races do not overbook or accept after cancellation. A saved registration with pending/failed email still consumes capacity. Minimum participants have no enforcement effect. | Pending |
| V5 | R4 | Double-click/retry of one submission creates one persisted registration and one confirmation attempt, including after an uncertain response/restart. A separately initiated submission for the same child is not rejected as a duplicate. Invalid submissions consume no place. | Pending |
| V6 | R4, R5 | Mailpit captures the short German confirmation addressed to the guardian with child/event/dates and no bank/authorization data or other guardians' addresses. Two children sharing an address produce separate tracked messages. Definitive SMTP failure leaves a durable registration and failed state; ambiguous timeout/interruption records outcome unknown, not an assumed rejection. Pending/relay-accepted/failed/unknown states survive restart, consume no extra places, and do not trigger silent resend or claim inbox delivery. | Pending |
| V7 | R6, R7 | Authorization checkbox starts unchecked and is mandatory. Runtime text-file edits appear without rebuild/restart. Missing/empty/unreadable text blocks acceptance; changed text requires renewed confirmation. Stored snapshot/version/timestamp matches exactly the text accepted. HTML-like text is rendered literally. The dummy is clearly development-only. | Pending |
| V8 | R8 | Trainer event view shows event data then persisted child first/last names and age in completed years at event start, including email-failed registrations. Test birthdays before/on/after start, year boundaries, and leap-day birthdays. The participant response contains no full birthday, guardian contact, banking, or authorization fields. | Pending |
| V9 | R2, R9 | Anonymous/disallowed users cannot read participant data, including direct API requests. Public event responses, URLs, built assets, routine logs, and sanitized errors contain no synthetic personal/bank/secret canaries. Existing staff access/session protections pass. | Pending |
| V10 | R2–R9 | Empty-database and repeat migrations, application restart, event/session preservation, registration persistence, and authorization/email state pass isolated MariaDB checks. Runtime-only packaging supports current text-file loading without bundling private data or overwriting the sibling file. | Pending |
| V11 | R1–R9 | Type checking, application tests, production-tooling tests/build, and existing public event/create/review/publish/cancel/login regressions pass. Parent flow meets the mission's under-three-minute target; trainer can inspect participants. Record device, timing, and owner-observed hosted smoke/security outcomes. | Pending |
| V12 | R7, R9 | Before real-data use: approve actual bank authorization/privacy wording and feature-specific access/storage/retention/operational handling. Dummy consent and development tests do not pass this gate. | Pending — real-use gate |
| V13 | R5 | Document and verify provider-supported routing to the designated monitored bounce mailbox, ownership of manual checks, and available message-ID correlation. Use an authorized controlled check/provider evidence, not an unsolicited message. Explain that delayed bounces do not automatically update application status and that Mailpit capture alone does not prove external bounce routing. | Pending |

## Shared UI acceptance — pending

Validate applicable [UI1–UI8](../../ui-conventions.md) and the shared desktop/mobile/keyboard checklist for the public list and related navigation. Compare shared labels, dates/age groups, list/action styling, cancellation markers, and empty/error states with other implemented event lists. Preserve anonymous access, agreed columns, and registration eligibility. Record views not yet available and repeat cross-view checks when they are implemented; no UI consistency validation has yet been performed.

## Completion and dependencies

- The owner confirmed scope, not implementation results. All criteria remain pending.
- Development may use synthetic records and dummy wording; explicitly distinguish development workflow acceptance from V12's real-data gate.
- 005 may use the resulting persisted registrations for its edit/delete policy checks, but neither this specification nor successful registration testing implements 005.
- Cancellation notifications, 006's Excel export/participant email composer, manual email resend, automated delivery/bounce tracking, and payment execution are not validated as implemented by this change.
