# 001 — Application Bootstrap: Validation

**Status:** Approved criteria; all checks not run.

Validate against [requirements.md](requirements.md) using the sequence in [plan.md](plan.md). Record commands or manual procedures, outcomes, and sanitized evidence as implementation proceeds. Do not record credentials or other secrets.

| ID | Requirements | Passing evidence | Result |
| --- | --- | --- | --- |
| V1 | R1, R7 | From a fresh checkout, documented installation, type-check, test, and build commands succeed. | Not run |
| V2 | R2, R3, R7 | In local development, the React page obtains the health response through the Vite proxy; an unavailable backend produces a visible failure state. Automated tests cover loading, success, and failure behavior and the health API contract. | Not run |
| V3 | R1, R3 | Production start serves the built frontend and API without the Vite development server. Unknown API paths return an appropriate error status and JSON response. | Not run |
| V4 | R4, R6 | Local MariaDB starts through Compose, passes the database check, and retains test data across container recreation without volume deletion. The database port is bound only to localhost; start, stop, and destructive reset procedures are documented. | Not run |
| V5 | R6 | Database and SMTP checks report failures with nonzero exit codes and finish within documented timeouts. They do not reveal credentials. Neither check is exposed through HTTP or runs during normal startup or tests. | Not run |
| V6 | R6 | An explicitly requested test email reaches the designated inbox through the existing mail service. | Not run |
| V7 | R2, R5 | Secret files are excluded from version control; frontend build output and diagnostic logs contain no configured backend secrets. Public health responses contain no secrets or infrastructure details. | Not run |
| V8 | R8 | The deployed page and API work over HTTPS. Documented restart procedures restore service, logs are accessible, and WordPress remains operational. Runtime configuration and safe stop/removal procedures are documented. | Not run |
| V9 | R6, R8 | Local and hosted database checks pass. Hosted SMTP delivery is confirmed. Any unperformed external checks remain explicitly marked pending—not passed. | Not run |

## Validation record

No validation has been performed. Implementation has not started.

For each executed check, record the environment, procedure or command, outcome, and relevant evidence. Use only disposable local test data for persistence checks; the database connectivity command itself must remain non-mutating.

## Completion rule

The change is complete only when all criteria pass and evidence is recorded. Blocked hosting or external-service checks must be reported as blockers rather than silently waived.
