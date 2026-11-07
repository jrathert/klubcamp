# Pre-release readiness checklist

**Status:** Open — required before enabling real registrations, storing real personal data, or sending real registration confirmations. Product development with synthetic data may proceed.

## Purpose and release gate

[002 — Production Setup](changes/002-production-setup/validation.md) is complete as **bootstrap deployment verified**, following the owner's explicit decision to defer operational hardening. The public bootstrap is already reachable; "before going live" here means before real product use, not before first exposing the connectivity page.

This checklist carries forward unfinished verification rather than declaring it passed. It also tracks existing broader release obligations from the [roadmap](roadmap.md). Completion of 002 does not waive these obligations or authorize remote changes, production personal-data use, or new implementation outside approved feature specifications.

## Checklist

| ID | Item | Evidence needed before real product use | Status |
| --- | --- | --- | --- |
| PR1 | Process supervision and operating procedure (from 002 R1/R7, V1/V6/V8) | Document exact panel stop/start/restart controls, selected memory limit/relevant resource constraints, startup-failure detection, and recovery after an unexpected process exit. Verify recovery through provider evidence and/or an approved controlled test. Manual restart is already owner-verified; automatic recovery is not. | Open |
| PR2 | Safe update/removal rehearsal (from 002 R8, V7/V8) | Verify an approved stop/update/restart and removal procedure affecting only replaceable `app/` files, preserving private configuration, logs, database data, and shared services. Prefer a disposable deployment; do not delete the working bootstrap merely to satisfy a test. Record restoration/recovery steps and update the host guide. | Open |
| PR3 | Application database transport, access, and configuration (from 002 R5, V4) | Establish provider TLS/access requirements and verify the actual Node.js driver's connection, account scope, and relevant session/schema settings. The administration tool's TLS cipher does not prove app TLS. Resolve intended charset/collation settings as part of schema/migration work; local and hosted administration-session collations currently differ. No silent TLS bypass or configuration-parity assumption. | Open |
| PR4 | Backup/restore and personal-data operation (existing roadmap release obligation) | Document and validate backup/restore, including an actual restore test and protected handling of credentials/data; establish the approved privacy, access, retention, and operational data-handling procedures through the relevant specifications. Do not use real personal data until these safeguards and the applicable feature acceptance tests pass. | Open |
| PR5 | Sender authentication and deliverability (follow-up to 002 R6/V5) | Review the authorized sender/domain setup and relevant SPF/DKIM/DMARC configuration with the mail service, then verify representative confirmation delivery with authorized recipients. Address the initial test's spam classification. SMTP acceptance and actual delivery already passed; inbox placement for real confirmations is not established. | Open |
| PR6 | Hosted configuration/failure verification (remaining hosted portion of 002 R4/V3) | Verify any host-specific configuration precedence and sanitized startup-failure behavior not established by local launcher tests. Use approved controlled or disposable tests; never expose credentials or deliberately break the working deployment without approval. | Open |

## Ownership and completion

- The project owner approves remote tests, supplies private provider settings, and accepts the evidence. The implementing agent records sanitized outcomes and updates deployment documentation under the relevant approved scope.
- Record the date, environment, procedure, outcome, and evidence for each item. Local results, owner-reported hosted results, and agent-observed hosted results must remain distinguishable.
- Keep an item open until evidence is accepted. Unsupported capabilities require an explicit alternative/decision; do not silently convert an unperformed test into a pass.
- Before real product use, review every item alongside the relevant feature/security acceptance criteria and the roadmap's release milestone. This checklist is not a substitute for those criteria.
- Follow-up implementation that is non-trivial needs its own approved specification or an explicit amendment to the relevant feature specification. The checklist itself does not authorize new architecture or production operations.
