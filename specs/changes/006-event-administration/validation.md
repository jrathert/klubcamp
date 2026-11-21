# 006 — Event Administration: Validation

**Status:** Not started — specification only. No implementation or acceptance checks performed for 006.

Validate against [requirements](requirements.md) using [plan](plan.md). Use synthetic registrations/addresses/banking data; external sends require recipient permission and separate operational approval.

| ID | Requirements | Acceptance criteria | Status |
| --- | --- | --- | --- |
| V1 | R1, R2 | Authorized staff see the agreed columns and accurate persisted registration counts, including failed/unknown confirmation messages. Cancelled events have a textual **Abgesagt** marker plus any color highlighting. Desktop/mobile navigation and Email/Export actions work, including cancelled events. | Pending |
| V2 | R1, R8 | Anonymous/disallowed requests cannot view administration data, compose/send, inspect batches, or download exports. State-changing requests enforce existing origin/CSRF/session protections. Public event and minimal participant-list APIs retain their restricted projections. | Pending |
| V3 | R3 | Subject/body validation is understandable and preserves input. Review shows event, full content, and correct per-child message count. Dismissing confirmation sends nothing. No-recipient events cannot send. Recipient changes follow the documented snapshot/refreshed-confirmation contract. | Pending |
| V4 | R4 | Two children sharing a guardian address receive two separately tracked messages, while different guardians never appear together in visible headers or message content. Mailpit verifies subject/plain-text body and correct event-specific recipient mapping, including cancelled events. No bank/authorization information is added to messages. | Pending |
| V5 | R5, R9 | Pending/relay-accepted/failed/unknown states persist per child/message and survive restart. Definitive SMTP rejection and ambiguous post-send timeout are classified distinctly. Mixed outcomes produce an accurate batch summary rather than labelling all messages delivered or all failed. Raw sensitive SMTP errors are not exposed. | Pending |
| V6 | R5, R6 | Double-click/retry creates one batch and no additional logical messages. Interrupted/pending/unknown sends are not automatically resent or presented as known non-delivery. A deliberate separately confirmed new batch remains possible. | Pending |
| V7 | R7 | Download is a valid event-specific `.xlsx` with all agreed child, guardian, bank, authorization, registration, and confirmation-state values. Blank optional fields, leading zeros, long identifiers, Unicode, dates, and full accepted wording survive round-trip checks. User input starting with spreadsheet formula characters is inert data. No tokens/secrets/internal diagnostics are exported. | Pending |
| V8 | R7, R8 | Cancelled-event export works; an event with zero registrations yields a valid workbook with headings/context and no participant rows. Downloads have safe filenames/type/cache behavior, create no public/static artifact, and generation errors do not expose data or return corrupt success files. | Pending |
| V9 | R9 | Reuse/verify 004's documented provider-supported monitored bounce mailbox and correlation procedure. Staff-facing labels distinguish relay acceptance from delivery. Delayed bounces are not claimed to reconcile automatically; Mailpit is not treated as proof of external routing/delivery. | Pending |
| V10 | R1–R9 | Type checking, application/API/component tests, MariaDB migrations/restart, production-tooling tests/build, and relevant 004/005 regressions pass. Manual workbook inspection, trainer desktop/mobile use, and separately approved hosted checks pass with evidence sources recorded. | Pending |
| V11 | R8 | Before real-data use: approve full-export handling, authorized access, batch/snapshot retention, download/local-copy protection, and interaction with event/registration deletion. Earlier operational acceptance alone does not satisfy these new feature-specific decisions. | Pending — real-use gate |
| V12 | R5, R8 | Integration with 005: cancellation retains batches/history and Email/Export; eligible deletion permanently removes all associated application-held communication content, recipient snapshots, outcomes/tracking, and any retained export artifacts. In-flight work does not recreate deleted data or start new sends for it. Other events remain intact; downloaded workbooks and already-sent/provider-held emails are not claimed erased. | Pending — 005 integration required |

## Shared UI acceptance — pending

Validate applicable [UI1–UI8](../../ui-conventions.md) and the shared desktop/mobile/keyboard checklist. Compare administration-list styling, shared data formatting, action placement, cancellation markers, and empty/error states with other implemented lists. Verify clear navigation/current-view indication between the staff lists while keeping Email/Export available for cancelled events and all administration data private. Record unavailable views and repeat cross-view checks when implemented; no UI consistency validation has yet been performed.

## Completion

- The owner confirmed business scope and SMTP/bounce limitations, not implementation results. All checks remain pending.
- This change does not implement 004 registration or 005 editing/deletion merely by referencing their data.
- Independent and hosted evidence must be distinguished. SMTP acceptance and manual bounce monitoring do not establish inbox delivery or reading.
- Development acceptance may use synthetic data; explicitly retain V11 as a real-use gate until approved.
