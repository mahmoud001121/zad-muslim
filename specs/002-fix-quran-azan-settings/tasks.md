# Tasks: Fix Quran Offline, Azan Sound & Salawat Settings

**Input**: Design documents from `/specs/002-fix-quran-azan-settings/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Tests**: No automated test framework configured. All verification is manual browser testing per quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `public/` at repository root
- Next.js App Router in `src/app/`

---

## Phase 1: Setup

**Purpose**: Verify existing infrastructure and audio assets before making changes

- [X] T001 [P] Verify audio files exist and are playable in `public/audio/adhan-rashed.mp3`, `public/audio/adhan-makka.mp3`, `public/audio/adhan-algeria.mp3`, `public/audio/salawat.mp3`
- [X] T002 [P] Verify salawat interval options in `src/lib/constants.ts` include all 6 values: 1, 5, 10, 15, 30, 60 minutes with correct Arabic/English labels
- [X] T003 [P] Verify settings store defaults in `src/store/settings-store.ts` match expected: `adhanEnabled: true`, `adhanSound: "rashed"`, `salawatEnabled: true`, `salawatInterval: 15`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Read and understand the exact current code before modifying — no code changes in this phase

**CRITICAL**: All three user stories modify different files and can proceed in parallel after this phase

- [X] T004 Read current render logic in `src/components/quran/MushafView.tsx` lines 140-200 (React Query setup) and lines 560-610 (render branch) to confirm the `null` fallback bug location
- [X] T005 [P] Read current `src/hooks/useAdhanPlayer.ts` to confirm Audio element creation pattern (new per play vs persistent) and locate `playAdhanTest()` function
- [X] T006 [P] Read current `src/hooks/useSalawatTimer.ts` to confirm `useEffect` dependency array and `setInterval` setup pattern

**Checkpoint**: All bug locations confirmed — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Offline Quran Page Fallback (Priority: P1)

**Goal**: Replace blank screen with styled offline fallback card when Mushaf page fails to load offline

**Independent Test**: Open app → Quran → Mushaf view → browse pages 1-5 → go offline in DevTools → navigate to page 50 → fallback card appears → go online → page auto-loads

### Implementation for User Story 1

- [X] T007 [US1] Add `isError` and `error` destructuring from `useQuery` hook and add `refetch` function reference in `src/components/quran/MushafView.tsx` (around line 143 where useQuery is called)
- [X] T008 [US1] Add `online` event listener with `useEffect` to auto-retry (`refetch()`) when connectivity restores in `src/components/quran/MushafView.tsx`
- [X] T009 [US1] Compute `lastCachedPage` from quran-cache-store — find the nearest cached page number to `currentPage` using the store's `getPage`/`hasPage` methods in `src/components/quran/MushafView.tsx`
- [X] T010 [US1] Replace the `null` render branch (around line 601) with an offline fallback card: styled div with Arabic message "هذه الصفحة غير متوفرة بدون إنترنت", English subtitle "This page is not available offline", a "Retry" button calling `refetch()`, and a "Go back" button calling `setPage(lastCachedPage)` — all in `src/components/quran/MushafView.tsx`
- [X] T011 [US1] Style the offline fallback card to match existing app design patterns (Tailwind classes consistent with other cards in the app, centered in the Mushaf container, Arabic text direction RTL) in `src/components/quran/MushafView.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional — offline Quran pages show fallback instead of blank

---

## Phase 4: User Story 2 - Azan Sound Playback Fix & Preview (Priority: P1)

**Goal**: Fix azan sound to play at prayer time and add preview with play/pause controls in settings

**Independent Test**: Open Settings → Notifications → enable Adhan → select a sound → preview auto-plays with play/pause → wait for prayer time → azan plays automatically

### Implementation for User Story 2

- [X] T012 [US2] Refactor `src/hooks/useAdhanPlayer.ts` to create a single persistent `Audio` element on hook mount via `useRef` (same pattern as `useSalawatTimer.ts`) instead of creating a new Audio per play attempt
- [X] T013 [US2] Update the `playAdhan()` function in `src/hooks/useAdhanPlayer.ts` to reuse the persistent Audio ref: set `src` to the selected sound file path, reset `currentTime = 0`, and call `play()` on the existing element
- [X] T014 [US2] Update `playAdhanTest()` in `src/hooks/useAdhanPlayer.ts` to also use the persistent Audio ref and expose `pauseAdhan()` and `isPlaying` state via the hook return value
- [ ] T015 [US2] Add azan preview auto-play in `src/components/settings/SettingsPage.tsx`: when user selects a different azan sound in the SelectionDrawer, call `playAdhanTest()` with the new sound key and stop any previous preview
- [ ] T016 [US2] Add play/pause toggle buttons in `src/components/settings/SettingsPage.tsx` azan section (around lines 741-759): show a Play icon button and Pause icon button (from lucide-react) that call `playAdhanTest()` / `pauseAdhan()`, conditionally rendered based on `isPlaying` state from the hook
- [X] T017 [US2] Handle autoplay restriction gracefully: if `audio.play()` returns a rejected promise in `src/hooks/useAdhanPlayer.ts`, dispatch a toast event or log a user-friendly message instead of silently failing

**Checkpoint**: At this point, User Story 2 should be fully functional — azan previews in settings and plays at prayer time

---

## Phase 5: User Story 3 - Salawat Timer Interval Settings (Priority: P2)

**Goal**: Ensure all 6 salawat interval options work and timer resets immediately on change

**Independent Test**: Open Settings → Salawat → enable → set interval to 1 min → wait 60s → sound plays → change to 5 min → timer resets immediately

### Implementation for User Story 3

- [X] T018 [US3] Fix `useEffect` dependency array in `src/hooks/useSalawatTimer.ts` to include `salawatInterval` so the effect re-runs (clears old interval, creates new one) when the interval setting changes
- [X] T019 [US3] Verify the effect cleanup function in `src/hooks/useSalawatTimer.ts` properly calls `clearInterval()` on the stored interval ID so the old timer is stopped before the new one starts
- [X] T020 [US3] Verify the salawat interval selector in `src/components/settings/SettingsPage.tsx` (around lines 762-799) renders all 6 options (1, 5, 10, 15, 30, 60 minutes) from constants and that selecting an option immediately updates the Zustand settings store

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification and quality checks across all fixes

- [ ] T021 [P] Run TypeScript type-check (`npx tsc --noEmit`) and fix any type errors introduced by changes
- [ ] T022 [P] Run ESLint (`npm run lint`) and fix any linting issues in modified files
- [ ] T023 Manual browser test: follow `specs/002-fix-quran-azan-settings/quickstart.md` end-to-end covering all 3 user stories on Chrome mobile emulation
- [ ] T024 Verify no regressions: Quran reader (non-Mushaf) view still works, prayer times display still works, existing settings still persist after changes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — confirms bug locations before editing
- **User Stories (Phase 3, 4, 5)**: All depend on Phase 2 completion
  - US1 (Phase 3) and US2 (Phase 4) can proceed **in parallel** (different files)
  - US3 (Phase 5) can proceed **in parallel** with US1 and US2 (different files)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Modifies `MushafView.tsx` only — no dependencies on other stories
- **User Story 2 (P1)**: Modifies `useAdhanPlayer.ts` + `SettingsPage.tsx` (azan section) — no dependencies on other stories
- **User Story 3 (P2)**: Modifies `useSalawatTimer.ts` + `SettingsPage.tsx` (salawat section) — no dependencies on other stories

### Within Each User Story

- Read/understand code before modifying (Phase 2 handles this)
- Implementation tasks are sequential within each story (each builds on previous)
- Story complete before moving to polish

### Parallel Opportunities

- T001, T002, T003 can all run in parallel (verification tasks)
- T004, T005, T006 can run in parallel (read-only tasks)
- All three user stories (Phase 3, 4, 5) can run in parallel (different files)
- T021, T022 can run in parallel (lint + typecheck)

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Complete Phase 1: Setup verification
2. Complete Phase 2: Read and confirm bug locations
3. Complete Phase 3: Offline Quran fallback (US1) — highest user-impact fix
4. Complete Phase 4: Azan sound fix + preview (US2) — core feature fix
5. **STOP and VALIDATE**: Test US1 and US2 independently
6. Complete Phase 5: Salawat timer fix (US3) — enhancement
7. Complete Phase 6: Polish and regression check

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Add US1 → Test offline fallback → Partial fix deployed
3. Add US2 → Test azan playback → Core audio fixed
4. Add US3 → Test salawat timer → All bugs resolved
5. Phase 6 → Quality verified → Ready for PR

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All changes are in existing files — no new files created
- No database/API changes required — all fixes are client-side
- SettingsPage.tsx is touched by US2 and US3 but in different sections (azan vs salawat) — parallel work is safe if care is taken
- Audio autoplay is the root cause of the azan bug — persistent Audio element pattern is the proven fix
