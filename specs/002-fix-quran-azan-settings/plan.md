# Implementation Plan: Fix Quran Offline, Azan Sound & Salawat Settings

**Branch**: `002-fix-quran-azan-settings` | **Date**: 2026-04-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-fix-quran-azan-settings/spec.md`

## Summary

Fix three interrelated bugs in the Zad Muslim PWA: (1) Quran Mushaf view renders blank
when offline and page is not cached — add proper error state and fallback UI; (2) Azan
sound does not play at prayer time and has no preview in settings — diagnose playback
trigger, add auto-preview with play/pause; (3) Salawat-on-Naby timer interval settings
are unreliable — ensure all 6 interval options work and timer resets on change.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 16
**Primary Dependencies**: Zustand 5 (state), React Query / TanStack Query 5 (data fetching),
Serwist 9 (service worker / PWA), Framer Motion 12 (animations), Radix UI (components),
Tailwind CSS 4
**Storage**: Prisma + PostgreSQL (server), Zustand persist + localStorage (client),
React Query in-memory cache (client)
**Testing**: Manual browser testing (no automated test framework configured)
**Target Platform**: Mobile-first PWA (Chrome, Safari, Firefox — iOS + Android)
**Project Type**: Web application (Next.js PWA)
**Performance Goals**: Page load < 2s on 3G, UI interactions < 100ms
**Constraints**: Offline-capable, mobile-first, audio autoplay restrictions,
localStorage ~5MB limit
**Scale/Scope**: Single-page app with ~15 views, 604 Mushaf pages, 114 surahs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | PASS | Fixes target existing code with minimal new abstractions |
| II. Clarity Over Cleverness | PASS | Explicit error states replace silent `null` renders |
| III. Security by Default | PASS | No new external input surfaces |
| IV. Rigorous Testing | PASS | Manual browser testing required; bug fixes need verification |
| V. User Experience Consistency | PASS | Fallback UI follows existing design patterns |
| VI. Zero-Bug Tolerance | PASS | Root-cause analysis for all 3 bugs, not surface patches |
| VII. Defensive Error Handling | PASS | Adding explicit error handling where it was missing |
| VIII. Code Quality Gates | PASS | All changes must pass lint + typecheck |

## Project Structure

### Documentation (this feature)

```text
specs/002-fix-quran-azan-settings/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 root-cause analysis
├── data-model.md        # Phase 1 entity definitions
├── quickstart.md        # Phase 1 testing guide
└── tasks.md             # Phase 2 task breakdown
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── quran/
│   │   └── MushafView.tsx         # FIX: add error state + offline fallback UI
│   ├── settings/
│   │   └── SettingsPage.tsx        # FIX: azan preview + salawat interval
│   └── salawat/
│       └── SalawatBanner.tsx       # VERIFY: timer behavior
├── hooks/
│   ├── useAdhanPlayer.ts           # FIX: playback trigger + expose test fn
│   ├── useSalawatTimer.ts          # FIX: timer reset on interval change
│   └── usePrayerTimes.ts           # VERIFY: time matching logic
├── store/
│   ├── quran-cache-store.ts        # VERIFY: cache behavior
│   └── settings-store.ts           # VERIFY: interval options
├── lib/
│   └── constants.ts                # VERIFY: interval + sound options
└── app/
    └── sw.ts                       # OPTIONAL: add Quran API caching rule

public/
└── audio/
    ├── adhan-algeria.mp3
    ├── adhan-rashed.mp3
    ├── adhan-makka.mp3
    └── salawat.mp3
```

**Structure Decision**: Single Next.js project with `src/` directory. All changes
are in existing files — no new files needed except potentially a small
`OfflineFallback` inline component within MushafView.tsx.

## Complexity Tracking

> No constitution violations — all changes are minimal, targeted bug fixes.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none)    | —          | —                                    |
