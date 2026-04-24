# Implementation Tasks: Fix Azkar Count Bug

**Feature**: Fix Azkar Count Bug | **Branch**: `001-fix-azkar-count` | **Date**: 2025-01-20
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Overview

| Metric | Value |
|--------|-------|
| Total Tasks | 6 |
| User Story 1 Tasks | 3 |
| User Story 2 Tasks | 2 |
| Parallelizable Tasks | 2 |

## Phase 1: Investigation (Setup)

- [ ] T001 [P] Investigate Azkar store and components to locate the bug in src/store/salawat-store.ts or src/components/azkar/

**Investigation Steps**:
1. Review `src/store/salawat-store.ts` - Salawat (prayers) store since azkar counts may be managed there
2. Review `src/components/azkar/TasbeehCounter.tsx` - The counter component
3. Review `src/components/azkar/AzkarList.tsx` - The list component
4. Identify where the click handler decrements the count
5. Identify where local storage persistence happens

**Files to Review**:
- `src/store/salawat-store.ts`
- `src/store/index.ts` (check exports)
- `src/components/azkar/TasbeehCounter.tsx`
- `src/components/azkar/AzkarList.tsx`

## Phase 2: User Story 1 - Clicking Zikr Decrements Counter (P1)

**Goal**: Users can decrement a zikr count by clicking, with each click reducing count by exactly 1

**Independent Test**: Click on any zikr item and verify the count decreases by 1. Repeat 10 times and verify count decreases from 10 to 0.

### Tasks

- [ ] T002 [US1] Fix the decrement logic in the click handler
  - File: `src/store/salawat-store.ts` (or identified store file)
  - Change: Ensure count decrements by 1 on each click: `count = count - 1` or `count -= 1`
  - Verify the click handler calls the decrement function

- [ ] T003 [US1] Add protection against negative counts
  - File: Same store file as T002
  - Change: Add check `if (count > 0) { count -= 1 }` or `count = Math.max(0, count - 1)`
  - Ensures FR-002: System MUST NOT allow the count to go below 0

- [ ] T004 [US1] Verify fix with manual browser testing
  - Open Azkar page in browser
  - Click on any zikr item
  - Verify count decreases by 1
  - Click until count reaches 0, verify it stays at 0

## Phase 3: User Story 2 - Counter Persists Across Sessions (P2)

**Goal**: Users' progress on zikr counts is saved and restored on page reload

**Independent Test**: Set a zikr count to 5, refresh the page, verify count is still 5.

### Tasks

- [ ] T005 [US2] Ensure local storage persistence is called after decrement
  - File: Same store file as T002
  - Change: After decrementing, save to local storage
  - Verify the save function is called in the decrement action

- [ ] T006 [US2] Verify persistence with manual browser testing
  - Set a zikr count to a specific value (e.g., 5)
  - Refresh the page
  - Verify count is still the same value
  - Test with count at 0 as well

## Dependencies

```
T001 (Investigation)
    │
    ▼
T002 (Fix decrement) ──► T003 (Negative count protection)
    │                           │
    ▼                           ▼
T004 (Test US1)          T005 (Persistence)
                                │
                                ▼
                           T006 (Test US2)
```

## Parallel Execution

The following tasks can be executed in parallel (different files, no dependencies):

- T001 can run independently
- T002 and T003 are sequential (same file)
- T005 can run in parallel with T002/T003 once the store file is identified

## Implementation Strategy

**MVP Scope**: User Story 1 (T002, T003, T004) - Core functionality: clicking decrements the counter

**Incremental Delivery**:
1. First, complete T001-T004 to fix the core decrement bug
2. Then, complete T005-T006 to ensure persistence works

**Note**: Manual browser testing is required per constitution: "UI changes require manual testing in browser before completion"