# Research: Fix Quran Offline, Azan Sound & Salawat Settings

**Date**: 2026-04-24
**Feature**: 002-fix-quran-azan-settings

## Bug 1: Quran Mushaf Blank Page When Offline

### Root Cause Analysis

**Location**: `src/components/quran/MushafView.tsx`, lines 569-601

The React Query `useQuery` hook fetches Quran page data. When the fetch fails
(offline + cache miss), the render logic is:

```tsx
{isLoading ? (
  <MushafPageSkeleton />
) : data ? (
  <MushafPage data={data} ... />
) : null}   // ← BUG: renders nothing on error
```

**Contributing factors**:
1. No `isError` state is checked in the render
2. `retry: 1` means React Query retries once, then gives up silently
3. Service worker (`sw.ts`) does NOT cache `/api/quran` responses —
   only `/api/prayer` is cached (lines 417-446)
4. Zustand cache (`quran-cache-store.ts`) stores max 50 pages with
   numeric-order eviction (not LRU by timestamp)
5. Prefetch of adjacent pages silently ignores errors (lines 209-227)

### Decision

Add `isError` / error state handling to MushafView.tsx render logic. Display
a styled offline fallback card with:
- Arabic + English "not available offline" message
- Button to go back to last cached page
- Auto-retry when connectivity restored (via `navigator.onLine` + `online` event)

**Rationale**: Minimal change to existing code — only the render branch needs
updating. No architectural changes required.

**Alternatives considered**:
- Service Worker caching for all Quran pages: Would fix root cause but
  adds complexity and storage concerns (604 pages × ~5KB = ~3MB). Consider
  as a follow-up enhancement, not part of this bug fix.
- IndexedDB migration: Overkill for this fix. localStorage with 50-page
  limit is sufficient for now.

---

## Bug 2: Azan Sound Not Playing at Prayer Time

### Root Cause Analysis

**Location**: `src/hooks/useAdhanPlayer.ts`, lines 216-272

The azan trigger checks every 15 seconds whether current time is within
±30 seconds of any prayer time. When a match is found:

1. Sends browser notification
2. Calls `playAdhan()` to play the sound file
3. Dispatches `'adhan-playing'` event

**Identified issues**:

1. **Audio element creation timing**: `playAdhan()` creates a NEW `Audio`
   element each time (line 69). On mobile browsers, `new Audio()` +
   `audio.play()` without prior user interaction is blocked by autoplay
   policy. The first interaction (settings selection) does not "unlock"
   audio for future automated plays.

2. **No persistent audio element**: Unlike `useSalawatTimer.ts` which
   creates a single persistent `Audio` on mount, `useAdhanPlayer.ts`
   creates a new one per play attempt. Mobile Safari and Chrome require
   the SAME audio element that was user-activated to be reused.

3. **`canplaythrough` race condition**: The code waits for `canplaythrough`
   event (line 84) but has a 5-second timeout. On slow networks near
   prayer time, the file may not load in 5 seconds, triggering the
   fallback. But the fallback Web Audio API also requires user gesture
   on mobile.

4. **No `playAdhanTest()` exposed to UI**: The function exists (line 126)
   but is never wired to the settings UI. No way to test/preview.

### Decision

1. Create a persistent `Audio` element on hook mount (same pattern as
   `useSalawatTimer.ts`). Reuse it for all playback.
2. "Unlock" the audio element on first user interaction in settings
   (selecting a sound plays a preview, which constitutes user gesture).
3. Wire `playAdhanTest()` to settings UI with play/pause controls.
4. Add auto-preview when user selects a different azan sound.

**Rationale**: Follows the proven pattern from `useSalawatTimer.ts`.
Persistent audio element solves mobile autoplay restrictions.

**Alternatives considered**:
- Howler.js (already in dependencies): Would add abstraction layer but
  the core issue is autoplay policy, not audio API. Native Audio is fine.
- Web Audio API only: Loses the real azan sound files. Keep as fallback.

---

## Bug 3: Salawat Timer Interval Not Working Reliably

### Root Cause Analysis

**Location**: `src/hooks/useSalawatTimer.ts`

The timer uses `setInterval()` with `salawatInterval * 60 * 1000`.
When the interval changes in settings, the hook should:
1. Clear the old interval
2. Set a new interval with the updated duration

**Identified issues**:

1. **Stale closure**: The `useEffect` that sets up `setInterval` may
   capture a stale `salawatInterval` value if the dependency array
   does not include `salawatInterval`. Need to verify the effect
   re-runs when interval changes.

2. **No immediate reset**: When the user changes the interval from
   30min to 5min, the old 30-min timer continues until it fires,
   THEN the new interval takes effect. Users expect immediate reset.

### Decision

Ensure the `useEffect` dependency array includes `salawatInterval`.
When interval changes, the effect cleanup clears the old timer and
sets up a new one immediately.

**Rationale**: Standard React effect pattern. Minimal code change.

**Alternatives considered**:
- `setTimeout` chain instead of `setInterval`: More complex, no benefit
  for this use case.

---

## Technical Decisions Summary

| Decision | Chosen | Rationale |
|----------|--------|-----------|
| Offline UI approach | Error state in existing render | Minimal change, follows existing patterns |
| Audio element strategy | Persistent + reuse | Solves mobile autoplay, matches salawat pattern |
| Azan preview | Auto-play on select + play/pause | User gesture unlocks audio for future automated plays |
| Salawat timer | Fix useEffect deps + immediate reset | Standard React pattern |
| Service Worker Quran caching | Deferred to follow-up | Adds complexity beyond bug fix scope |
