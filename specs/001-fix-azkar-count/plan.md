# Implementation Plan: Fix Azkar Count Bug

**Branch**: `001-fix-azkar-count` | **Date**: 2025-01-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-fix-azkar-count/spec.md`

## Summary

Fix the bug in the Azkar page where clicking on a zikr does not decrement the count by one on each click. The fix involves correcting the click handler to properly decrement the counter and ensuring the count persists to local storage.

## Technical Context

**Language/Version**: TypeScript / Next.js 16 + React 19  
**Primary Dependencies**: Next.js, React, Zustand (state management), Tailwind CSS 4, shadcn/ui  
**Storage**: Client-side LocalStorage (per project architecture)  
**Testing**: Manual browser testing in Chrome/Firefox (per constitution: "UI changes require manual testing in browser before completion")  
**Target Platform**: Web (PWA - installable, works offline)  
**Project Type**: Web application (Next.js 16 App Router)  
**Performance Goals**: < 100ms UI interactions  
**Constraints**: Offline-capable PWA, client-side only storage  
**Scale/Scope**: Single user, local storage per browser

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Bug fix is simple - no premature abstractions needed |
| II. Clarity Over Cleverness | ✅ PASS | Clear, straightforward fix to counter logic |
| III. Security by Default | ✅ PASS | No security concerns - local counter only |
| IV. Test What Matters | ✅ PASS | Manual browser testing will verify the fix |
| V. User Experience Consistency | ✅ PASS | Fixes broken UX - counter not working |

**Gate Result**: ✅ PASS - No violations. Proceed to research.

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-azkar-count/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (not needed - no unknowns)
├── data-model.md        # Phase 1 output (not needed - simple bug fix)
├── quickstart.md        # Phase 1 output (not needed)
├── contracts/           # Phase 1 output (not needed - no external interfaces)
├── checklists/          # Validation checklists
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                  # Next.js App Router pages
│   └── [locale]/        # i18n routing
│       └── azkar/       # Azkar page and components
├── components/          # React components
│   └── ui/             # shadcn/ui components
├── store/               # Zustand state stores
│   └── azkar-store.ts  # Azkar state management (likely location of bug)
├── data/                # Static data
│   └── azkar/          # Azkar content data
├── hooks/               # Custom React hooks
├── lib/                 # Utilities
└── types/               # TypeScript types
```

**Structure Decision**: The bug is likely in the Azkar store (`src/store/azkar-store.ts`) or the Azkar component that handles clicks. The fix will involve:
1. Finding the click handler for zikr items
2. Ensuring it decrements the count by 1
3. Ensuring the count is saved to local storage

## Phase 0: Research

**Status**: Not needed for this simple bug fix.

**Reason**: No [NEEDS CLARIFICATION] markers in the spec. The requirements are clear:
- Decrement count by 1 on click
- Prevent negative counts
- Persist to local storage

The technical approach is straightforward - find the buggy code and fix it.

## Phase 1: Design

**Status**: Not needed for this simple bug fix.

**Reason**: This is a bug fix, not a new feature. The data model already exists (zikr items with counts). No new contracts or interfaces needed.

## Implementation Notes

### Likely Bug Location
Based on typical patterns in Next.js/Zustand apps, the bug is likely in:
1. `src/store/azkar-store.ts` - The Zustand store managing zikr counts
2. `src/app/[locale]/azkar/page.tsx` - The Azkar page component
3. `src/components/azkar/` - Azkar-specific components

### Fix Approach
1. Find the click handler for zikr items
2. Verify the decrement logic: `count = count - 1` or `count -= 1`
3. Verify local storage persistence is called after decrement
4. Add debounce if needed for rapid clicks (FR-005)

### Testing Steps
1. Open Azkar page in browser
2. Click on any zikr item
3. Verify count decreases by 1
4. Refresh page and verify count persists
5. Click rapidly to verify no double-decrement
6. Click when count is 0 to verify it stays at 0

## Next Steps

Run `/speckit-tasks` to generate the implementation task list.