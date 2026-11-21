# Shared UI Conventions

**Status:** Owner-requested requirements for 004–006 and all upcoming UI changes. Documented only; not a claim that the current UI already conforms.

## Purpose and scope

Public and staff event lists must have a consistent look and feel while retaining their distinct purposes, columns, permissions, and actions.

| Audience | Event list | Specified columns | Actions |
| --- | --- | --- | --- |
| Public | Registration ([004](changes/004-child-registration/requirements.md)) | Linked name, start/end dates, age groups as text, registration deadline | View details, **Anmelden** when eligible |
| Staff | Event management ([005](changes/005-event-management-improvements/requirements.md)) | Name, shortened description, start/end dates, minimum/maximum participants, registration deadline | **Bearbeiten**, **Löschen**, **Absagen**, subject to event/registration rules |
| Staff | Event administration ([006](changes/006-event-administration/requirements.md)) | Name, age groups, start/end dates, registered participant count | **Email**, **Export**, including cancelled events |

The participant list beneath an event's data is a detail-page section, not a fourth event overview.

## Requirements

| ID | Convention |
| --- | --- |
| UI1 | Use consistent page headings, typography, spacing, table headers/rows, borders, colors, links, and action-button styling across event lists. Shared data columns use consistent labels and presentation even where the lists have different columns. |
| UI2 | Use German interface text and consistent date/range formatting, age-group labels/separators, optional-limit wording, and participant-count presentation wherever the same information appears. Interpret civil dates using the feature's existing `Europe/Berlin` rules; display formatting must not change business semantics. |
| UI3 | Place row actions consistently in a dedicated action area, with consistent order within each list and clear text labels. Distinguish destructive actions consistently. Preserve feature-specific confirmation and eligibility rules; consistent styling must not make a forbidden action appear available. |
| UI4 | Mark cancelled events with the text **Abgesagt** and consistent styling; color alone is insufficient. Public cancelled events have no registration action, while staff administration retains Email/Export as specified. |
| UI5 | Use consistent wording and visual treatment for loading, empty-list, unavailable-action, and failure states. Explain the relevant context where lists differ; consistency does not require misleading identical messages or exposing internal errors. |
| UI6 | Use the same responsive strategy for comparable event lists. At narrow widths, keep labels, data associations, and actions readable and operable; do not let one list become unusable while equivalent lists work. Preserve semantic table/row relationships or an equivalently accessible mobile representation. |
| UI7 | Provide consistent keyboard navigation, visible focus, accessible control names, and readable contrast. Do not rely on color or hover alone for status/actions. |
| UI8 | Provide clear, consistent navigation between the two staff lists, with distinct headings/current-view indication so staff understand whether they are managing events or communicating/exporting registrations. Do not expose staff-only navigation/data to anonymous users. |

## Applying these conventions

- New or changed UI specifications must reference this document and include applicable consistency checks in their validation criteria.
- Feature requirements control columns, permissions, data exposure, and business behavior; these conventions control shared presentation and interaction. Resolve conflicts explicitly before implementation rather than silently changing either scope.
- Reusable components/styles are an implementation option, not a mandate for a new UI framework or a broad refactor.
- Keep accepted 003 evidence intact. Apply these conventions as upcoming changes introduce/modify the relevant views; this document alone does not authorize a retrospective redesign.
- Update this shared document when an approved design decision changes a convention instead of maintaining conflicting copies in individual specifications.

## Validation checklist

For each affected UI change:

1. Check applicable UI1–UI8 on representative desktop and mobile widths, including keyboard use.
2. Compare headings, shared columns, dates/age groups, row/action styling, cancellation markers, and empty/error states against the other implemented event lists.
3. Verify that visual consistency has not changed each list's columns, authorization, confirmations, or eligibility rules.
4. Record which views/devices were checked and any conventions not yet testable because a related list is unimplemented. Repeat the cross-view comparison when that list becomes available; do not claim unimplemented views were validated.
