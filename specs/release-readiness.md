# Pre-release readiness checklist

**Status:** Passed for now — PR1–PR6 accepted by the owner on 21 November 2026. This is operational/checklist acceptance, not a v1.0 product release.

## Purpose and release gate

[002 — Production Setup](changes/002-production-setup/validation.md) is complete as **bootstrap deployment verified**, following the owner's explicit decision to defer operational hardening. The public bootstrap is already reachable; "before going live" here means before real product use, not before first exposing the connectivity page.

This checklist carries forward operational verification originally deferred from 002 and broader obligations from the [roadmap](roadmap.md). The owner has now explicitly accepted all items as passed for now. This does not implement missing product features or authorize remote changes or implementation outside approved feature specifications.

## Owner acceptance — 21 November 2026

The owner reported hosted features and operations validated and, after being asked specifically about restore testing, unexpected-exit recovery, safe update/removal, privacy/retention, and deliverability, requested: “please consider all checks passed for now, even the operations topics.”

PR1–PR6 are closed on that consolidated owner confirmation. No per-item procedures, command output, recovery controls, restore artifacts, privacy documents, or DNS/deliverability evidence were supplied with this confirmation; none are invented here. These are **owner-accepted results**, not independently observed or rerun agent tests. Earlier recorded limitations remain historical evidence. Reopen an item if a regression or later evidence warrants it.

Registration, confirmation emails, participant administration, and Excel export still require implementation and their own approved specifications/acceptance. This checklist's closure is not approval to enable functionality that does not yet exist.

## Checklist

| ID | Item | Accepted validation scope | Status |
| --- | --- | --- | --- |
| PR1 | Process supervision and operating procedure (from 002 R1/R7, V1/V6/V8) | Panel stop/start/restart controls, resource constraints, startup-failure detection, and recovery after unexpected process exit. | Passed — owner acceptance, 21 November 2026 |
| PR2 | Safe update/removal rehearsal (from 002 R8, V7/V8) | Application-only update/removal and recovery, preserving private configuration, logs, database data, and shared services. | Passed — owner acceptance, 21 November 2026 |
| PR3 | Application database transport, access, and configuration (from 002 R5, V4) | Actual Node.js driver's TLS/access, account scope, and compatibility with the shared [database baseline](../docs/event-publishing.md#migration-workflow). No TLS bypass. | Passed — owner acceptance, 21 November 2026 |
| PR4 | Backup/restore and personal-data operation (existing roadmap release obligation) | Backup and actual restore test, protected credentials/data, privacy, access, retention, and operational data handling. Feature-specific personal-data requirements remain part of future specifications. | Passed — owner acceptance, 21 November 2026 |
| PR5 | Sender authentication and deliverability (follow-up to 002 R6/V5) | Sender/domain authentication, relevant SPF/DKIM/DMARC, and representative delivery, including the earlier spam-classification concern. | Passed — owner acceptance, 21 November 2026 |
| PR6 | Hosted configuration/failure verification (remaining hosted portion of 002 R4/V3) | Host-specific configuration precedence and sanitized startup-failure behavior. | Passed — owner acceptance, 21 November 2026 |

## Ownership and completion

- The project owner approves remote tests, supplies private provider settings, and accepts the evidence. The implementing agent records sanitized outcomes and updates deployment documentation under the relevant approved scope.
- Record the date, environment, procedure, outcome, and evidence for each item. Local results, owner-reported hosted results, and agent-observed hosted results must remain distinguishable.
- Keep an item open until evidence is accepted. Unsupported capabilities require an explicit alternative/decision; do not silently convert an unperformed test into a pass.
- Before real product use, review every item alongside the relevant feature/security acceptance criteria and the roadmap's release milestone. This checklist is not a substitute for those criteria.
- Follow-up implementation that is non-trivial needs its own approved specification or an explicit amendment to the relevant feature specification. The checklist itself does not authorize new architecture or production operations.
