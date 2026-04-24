# Quickstart: Fix Quran Offline, Azan Sound & Salawat Settings

**Date**: 2026-04-24
**Feature**: 002-fix-quran-azan-settings

## Prerequisites

- Node.js 18+ installed
- Project dependencies installed (`npm install`)
- Dev server running (`npm run dev`)

## Testing the Fixes

### 1. Quran Offline Fallback

1. Open `http://localhost:3000` in Chrome
2. Navigate to Quran → Mushaf view
3. Browse a few pages (1-5) to cache them
4. Open DevTools → Network tab → check "Offline"
5. Navigate to a page you haven't visited (e.g., page 50)
6. **Expected**: Styled fallback card appears with:
   - "هذه الصفحة غير متوفرة بدون إنترنت" message
   - "العودة" (Go back) button
7. Uncheck "Offline" in DevTools
8. **Expected**: Page auto-loads within a few seconds
9. Click "Go back" button while offline
10. **Expected**: Returns to last cached page

### 2. Azan Sound Playback & Preview

1. Open Settings → Notifications section
2. Enable "Adhan Sound" toggle
3. Tap "Muezzin" selector
4. Select any of the 3 options (Rashed, Makka, Algeria)
5. **Expected**: Sound auto-plays a preview immediately
6. **Expected**: Play/Pause buttons appear
7. Tap Pause → sound stops
8. Tap Play → sound resumes
9. Select a different sound → previous stops, new one plays
10. To test actual prayer-time trigger:
    - Note the next prayer time from the home page
    - Wait until that time (or adjust system clock)
    - **Expected**: Azan plays automatically + notification appears

### 3. Salawat Timer Interval

1. Open Settings → Salawat section
2. Enable "Salawat Reminder"
3. Tap interval selector
4. **Expected**: Options shown: 1 min, 5 min, 10 min, 15 min, 30 min, 1 hour
5. Select "1 min" for quick testing
6. Wait ~60 seconds
7. **Expected**: Salawat sound plays + counter increments
8. Change interval to "5 min" while timer is active
9. **Expected**: Timer resets immediately to 5-minute countdown

## Common Issues

- **Sound doesn't play**: Check browser autoplay policy — interact with the
  page first (tap/click anywhere), then try again
- **Notifications blocked**: Check browser notification permissions for localhost
- **Cache not working**: Check localStorage in DevTools → Application tab
