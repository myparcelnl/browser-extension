# FR-000001 - Populate popup with active tab URL and preset on open

## Metadata

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **ID**           | FR-000001                                                   |
| **Title**        | Populate popup with active tab URL and preset on open    |
| **Status**       | Draft                                                    |
| **Priority**     | High                                                     |
| **Date Created** | 2026-03-02                                               |
| **Last Updated** | 2026-03-02                                               |

## Parent Requirement

- [US-000001 - See active tab URL and matching presets when opening the popup](../user-stories/US-000001-popup-active-tab-data.md)

## Description

When the user opens the extension popup, the "Current Url" field must display the URL of the currently active browser tab, and the "Preset" select must be populated with any saved settings matching that URL.

This requirement covers the initial data population behavior of the popup interface, ensuring users always see contextually relevant information the moment the popup opens, without requiring any manual action.

## Acceptance Criteria

1. Opening the popup displays the active tab's URL in the "Current Url" text input.
2. If saved settings/presets exist for the active tab's URL, the "Preset" select is populated with them.
3. The behavior is consistent regardless of how long the extension has been idle before opening.
4. Switching tabs while the popup is open updates the displayed URL and presets accordingly.

## Technical Considerations

- Relies on the browser extension `tabs` API to query the active tab's URL.
- Preset lookup requires reading from the extension's storage (e.g., `chrome.storage.local` or `chrome.storage.sync`).
- Tab switch detection while the popup is open may require listening to `tabs.onActivated` or `tabs.onUpdated` events.

> No Technical Requirements (TRs) or Architectural Decision Records (ADRs) exist in this
> project yet. When they are created, relevant ones should be referenced here rather than
> duplicating technical details inline.

## Dependencies

- Access to the browser `tabs` permission to read the active tab URL.
- Access to the extension storage API to retrieve saved presets.

## Notes

- This is the first Functional Requirement document in the project. The requirements framework is being bootstrapped.
- Parent traceability established via US-000001.
