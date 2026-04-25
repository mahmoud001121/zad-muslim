# Feature Specification: Fix Azkar Count Bug

**Feature Branch**: `001-fix-azkar-count`  
**Created**: 2025-01-20  
**Status**: Draft  
**Input**: User description: "Fix bug in Azkar page where clicking on a zikr doesn't decrease the count by one on each click"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clicking Zikr Decrements Counter (Priority: P1)

As a user, when I click on a zikr (remembrance) item in the Azkar list, I expect the counter to decrease by exactly one with each click, so I can track my progress through the prescribed number of repetitions.

**Why this priority**: This is the core functionality of the Azkar feature - users rely on the counter to complete their daily remembrance. If the counter doesn't work, the entire feature is broken.

**Independent Test**: Click on any zikr item and verify the count decreases by 1. Repeat 10 times and verify count decreases to 0 from 10.

**Acceptance Scenarios**:

1. **Given** a zikr with count 10, **When** user clicks the zikr, **Then** count should become 9
2. **Given** a zikr with count 1, **When** user clicks the zikr, **Then** count should become 0
3. **Given** a zikr with count 0, **When** user clicks the zikr, **Then** count should stay at 0 (no negative counts)

---

### User Story 2 - Counter Persists Across Sessions (Priority: P2)

As a user, I expect my progress on zikr counts to be saved so that when I return to the app later, I can continue from where I left off.

**Why this priority**: Users often complete their azkar over multiple sessions throughout the day. Losing progress would be frustrating.

**Independent Test**: Set a zikr count to 5, close the browser, reopen the browser, verify count is still 5.

**Acceptance Scenarios**:

1. **Given** a zikr with count 5, **When** user refreshes the page, **Then** count should still be 5
2. **Given** a zikr with count 0, **When** user refreshes the page, **Then** count should still be 0

---

### Edge Cases

- What happens when user clicks rapidly (multiple clicks in quick succession)?
- What happens when count is already at 0?
- What happens on page load if stored count exceeds the original count?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST decrement the zikr count by exactly 1 when a user clicks on a zikr
- **FR-002**: System MUST NOT allow the count to go below 0
- **FR-003**: System MUST persist the zikr count to local storage so it survives page refreshes
- **FR-004**: System MUST load the saved count from local storage when the page loads
- **FR-005**: System MUST handle rapid consecutive clicks correctly (no double-decrementing)

### Key Entities

- **Zikr**: A remembrance item with Arabic text, translation, and a target count
- **ZikrCount**: The current remaining count for a specific zikr, stored locally

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can decrement a zikr count by clicking, with each click reducing count by exactly 1
- **SC-002**: No user can get a negative count (count stays at 0 when already at 0)
- **SC-003**: Count persists across browser refreshes
- **SC-004**: Rapid clicks do not cause double-decrementing

## Assumptions

- The Azkar page already exists and displays zikr items correctly
- Each zikr has an initial count (e.g., 33, 100, etc.) set in the data
- The app uses local storage or IndexedDB for persistence (standard for this project)
- The bug is in the click handler or state management, not in the data model