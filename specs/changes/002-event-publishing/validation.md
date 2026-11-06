# 002 — Event Publishing: Validation

**Status:** Approved criteria; all checks not run.

Validate against [requirements.md](requirements.md) using the sequence in [plan.md](plan.md). Record commands or manual procedures, outcomes, and sanitized evidence as implementation proceeds. Do not record credentials, tokens, session secrets, or other sensitive information.

| ID | Requirements | Passing evidence | Result |
| --- | --- | --- | --- |
| V1 | R1, R2 | Allowed staff can sign in; users outside the configured tenant or allowlist cannot access staff functions. Direct API requests cannot bypass protection. | Not run |
| V2 | R2 | Session cookies and state-changing requests have the agreed security protections. Sign-out invalidates the application session. No credentials or tokens appear in frontend output or logs. | Not run |
| V3 | R3, R4, R5 | Backend and frontend reject invalid dates, age groups, capacities, missing required information, and deadlines on or after the start date. | Not run |
| V4 | R5, R6 | The default deadline is exactly 14 calendar days before the start date, including across month/year boundaries. A valid manually chosen deadline survives review unchanged. | Not run |
| V5 | R6, R8 | Review permits correction before publication. Publication stores one event despite repeated submission. Public users cannot retrieve unpublished form content. | Not run |
| V6 | R7, R9 | Published events survive application restart. Editing and deletion are unavailable through both UI and API. Cancellation preserves the event and displays “Abgesagt” publicly. | Not run |
| V7 | R3, R4, R8 | Public list/detail pages work without sign-in on mobile and desktop, with German text and date formatting. | Not run |
| V8 | R1, R3, R6 | An authorized trainer can create, review, and publish a representative event in under 10 minutes. Record whether initial sign-in is included in the measurement. | Not run |
| V9 | R1, R2, R8, R9 | Migrations work on an empty development database and the deployed application passes staff-access and public-view smoke checks. Existing bootstrap checks still pass. | Not run |

## Validation record

No validation has been performed. Implementation has not started.

For each executed check, record the environment, procedure or command, outcome, and relevant evidence. External Entra and deployment checks that have not been performed remain pending, not passed.

## Completion rule

The change is complete only when all criteria pass and evidence is recorded. Report unresolved dependencies or external-service checks as blockers rather than silently waiving them.
