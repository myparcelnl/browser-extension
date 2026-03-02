# US-000001 - See active tab URL and matching presets when opening the popup

## Metadata

| Field            | Value                                                              |
| ---------------- | ------------------------------------------------------------------ |
| **ID**           | US-000001                                                             |
| **Title**        | See active tab URL and matching presets when opening the popup      |
| **Status**       | Draft                                                              |
| **Priority**     | High                                                               |
| **Story Points** | 5                                                                  |
| **Date Created** | 2026-03-02                                                         |
| **Last Updated** | 2026-03-02                                                         |

## User Story

**As a** browser extension user,
**I want** the popup to automatically show my current tab's URL and any matching presets,
**So that** I can quickly apply settings without manual input.

## Parent Requirement

- [BR-000001 - Extension popup displays contextual tab data on open](../business-requirements/BR-000001-popup-contextual-tab-data.md)

## Acceptance Criteria

### Scenario 1: Active tab URL is displayed on popup open

- **Given** the user has a browser tab open with any URL
- **When** the user opens the extension popup
- **Then** the "Current Url" text input displays the URL of the currently active tab

### Scenario 2: Matching presets are populated when saved settings exist

- **Given** the user has previously saved settings/presets for the active tab's URL
- **When** the user opens the extension popup
- **Then** the "Preset" select is populated with the saved presets matching that URL

### Scenario 3: No presets available for the active tab URL

- **Given** no saved settings/presets exist for the active tab's URL
- **When** the user opens the extension popup
- **Then** the "Preset" select is empty or shows a default placeholder

### Scenario 4: Consistent behavior after idle period

- **Given** the extension has been idle for an extended period
- **When** the user opens the extension popup
- **Then** the active tab's URL and any matching presets are displayed correctly, with no stale or missing data

### Scenario 5: Tab switch while popup is open

- **Given** the extension popup is already open
- **When** the user switches to a different browser tab
- **Then** the displayed URL updates to reflect the newly active tab, and the "Preset" select updates to show presets matching the new URL

## Child Functional Requirements

- [FR-000001 - Populate popup with active tab URL and preset on open](../functional-requirements/FR-000001-populate-popup-active-tab-data.md)

## INVEST Assessment

| Criterion     | Assessment |
| ------------- | ---------- |
| Independent   | Yes -- self-contained around the popup opening experience with no tight coupling to other stories |
| Negotiable    | Yes -- describes the user goal without prescribing implementation details |
| Valuable      | Yes -- enables users to see contextually relevant information immediately without manual steps |
| Estimable     | Yes -- well-defined scope covering popup open, URL display, and preset population |
| Small         | Yes -- single user role, single workflow, completable within one sprint |
| Testable      | Yes -- all acceptance criteria use Given/When/Then format and are objectively verifiable |

## Notes

- This is the first User Story document in the project. The requirements framework is being bootstrapped.
- FR-000001 was created prior to this US and has been linked as a child functional requirement.
- Parent traceability established via BR-000001.
