# Data Model: Fix Quran Offline, Azan Sound & Salawat Settings

**Date**: 2026-04-24
**Feature**: 002-fix-quran-azan-settings

## Existing Entities (no schema changes needed)

### CachedPage (Zustand — quran-cache-store.ts)

```typescript
interface CachedPage {
  number: number;            // Mushaf page number (1-604)
  ayahs: CachedPageAyah[];   // Ayahs on this page
  surahStarts: CachedSurah[]; // Surahs that start on this page
  timestamp: number;          // Cache time (epoch ms)
}
```

- **Storage**: localStorage key `"zad-muslim-quran-cache"`
- **Limit**: MAX_PAGES = 50
- **Eviction**: Numeric page order (not LRU — known limitation, not fixing now)

### Settings (Zustand — settings-store.ts)

```typescript
// Relevant fields only
interface SettingsState {
  adhanEnabled: boolean;        // Default: true
  adhanSound: string;           // Default: "rashed" — one of "rashed"|"makka"|"algeria"
  salawatEnabled: boolean;      // Default: true
  salawatInterval: number;      // Default: 15 — minutes (1|5|10|15|30|60)
}
```

- **Storage**: localStorage key `"zad-muslim-settings"`

### AdhanSound Options (constants.ts)

```typescript
// Existing mapping
const ADHAN_SOUNDS = {
  rashed: "/audio/adhan-rashed.mp3",
  makka: "/audio/adhan-makka.mp3",
  algeria: "/audio/adhan-algeria.mp3",
};
```

## New UI State (component-local, no persistence)

### Azan Preview State

```typescript
// Local state in SettingsPage.tsx azan section
interface AdhanPreviewState {
  isPlaying: boolean;   // Whether preview is currently playing
  currentSound: string; // Which sound is being previewed
}
```

- **Not persisted** — resets when settings page unmounts
- Managed via `useState` in SettingsPage component

### Offline Fallback State

```typescript
// Derived from React Query in MushafView.tsx
interface OfflineFallbackProps {
  pageNumber: number;          // The page that failed to load
  lastCachedPage: number;      // Nearest cached page to navigate back to
  onRetry: () => void;         // Retry loading the page
  onGoBack: () => void;        // Navigate to last cached page
}
```

- **Not persisted** — derived from React Query `isError` state
- `lastCachedPage` computed from quran-cache-store

## Entity Relationships

```
Settings ──controls──► useAdhanPlayer (sound selection + enabled flag)
Settings ──controls──► useSalawatTimer (interval + enabled flag)
QuranCacheStore ──provides──► MushafView (cached page data)
MushafView ──renders──► OfflineFallback (when error + no cache)
```

## No Database Changes

All changes are client-side only. No Prisma schema modifications needed.
No API endpoint changes needed.
