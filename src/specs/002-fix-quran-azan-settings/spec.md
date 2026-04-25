# Feature Specification: Fix Quran Offline, Azan Sound & Salawat Settings

**Feature Branch**: `002-fix-quran-azan-settings`
**Created**: 2026-04-24
**Status**: Draft
**Input**: User description: fix offline Quran blank pages, add salawat-on-naby interval settings, fix azan sound playback and add preview

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Offline Quran Page Fallback (Priority: P1)

When a user is offline and navigates to a Quran page (Mushaf view) that has not been
downloaded/cached, the page currently renders blank with no feedback. The user MUST see
a clear offline fallback message instead of a blank screen, with guidance on how to
access cached content.

**Why this priority**: Core reading experience is broken offline — users cannot
distinguish between a loading page and a failed page, causing confusion and app abandonment.

**Independent Test**: Go offline in browser DevTools, navigate to an uncached Mushaf page,
verify fallback UI appears with actionable message.

**Acceptance Scenarios**:

1. **Given** the user is offline and on a cached Mushaf page, **When** they swipe to an
   uncached page, **Then** a styled fallback card appears showing "This page is not
   available offline" with a button to return to the last cached page.
2. **Given** the user is offline and selects a surah from the index, **When** the target
   page is not cached, **Then** the fallback card appears instead of a blank screen.
3. **Given** the user was offline and connectivity returns, **When** they are on the
   fallback page, **Then** the page auto-retries and loads the content.

---

### User Story 2 - Azan Sound Playback Fix & Preview (Priority: P1)

The azan sound is configured in settings but does not play at prayer time. Additionally,
when the user selects one of the 3 azan sounds in settings, there is no way to preview
it. The user MUST hear the selected azan at prayer time, and MUST be able to test/preview
each sound in settings with play/pause controls.

**Why this priority**: Prayer time notification is a core Islamic app feature — broken
azan undermines the app's primary purpose.

**Independent Test**: Select an azan sound in settings, verify it auto-plays a preview.
Set a prayer time to 1 minute from now, verify the azan plays at that time.

**Acceptance Scenarios**:

1. **Given** the user has azan enabled and a sound selected, **When** a prayer time
   arrives (within ±30 seconds), **Then** the selected azan sound file plays audibly.
2. **Given** the user opens azan settings and selects any of the 3 sounds, **When** the
   selection changes, **Then** the sound auto-plays a short preview and play/pause
   buttons appear.
3. **Given** the user is previewing an azan sound, **When** they tap pause, **Then**
   playback stops; when they tap play, **Then** playback resumes.
4. **Given** the azan sound file fails to load, **When** prayer time arrives, **Then**
   the Web Audio API fallback plays the synthesized call.

---

### User Story 3 - Salawat-on-Naby Interval Settings (Priority: P2)

The salawat reminder interval options are incomplete. The user MUST be able to choose
from a clear set of intervals: 1 min, 5 min, 10 min, 15 min, 30 min, 1 hour.

**Why this priority**: Feature already partially exists but the timing does not work
reliably — improving the settings UI gives users control.

**Independent Test**: Open settings, change salawat interval to each option, verify the
reminder fires at the selected interval.

**Acceptance Scenarios**:

1. **Given** the user opens salawat settings, **When** they tap the interval selector,
   **Then** all 6 options appear: 1 min, 5 min, 10 min, 15 min, 30 min, 1 hour.
2. **Given** the user selects "5 min" interval, **When** 5 minutes elapse, **Then** the
   salawat sound plays and the counter increments.
3. **Given** the user changes the interval while a timer is active, **When** the new
   interval is saved, **Then** the timer resets to the new interval immediately.

---

### Edge Cases

- What happens when the browser blocks autoplay? Show a toast prompting user interaction.
- What happens when localStorage is full and Quran pages cannot be cached? Show warning.
- What happens when all 3 azan sound files are missing/corrupted? Fall back to Web Audio.
- What happens when the user rapidly switches between azan sounds in preview? Stop previous before starting next.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a styled offline fallback card when a Mushaf page
  cannot be loaded (network error + cache miss).
- **FR-002**: System MUST auto-retry loading the page when connectivity is restored.
- **FR-003**: Offline fallback MUST include a "Go back" button to return to last cached page.
- **FR-004**: System MUST play the selected azan sound file at each prayer time.
- **FR-005**: Azan settings MUST auto-play a preview when the user selects a sound.
- **FR-006**: Azan preview MUST show play/pause toggle buttons.
- **FR-007**: Salawat interval selector MUST offer: 1, 5, 10, 15, 30, 60 minute options.
- **FR-008**: Changing the salawat interval MUST immediately reset and restart the timer.
- **FR-009**: System MUST handle audio autoplay restrictions gracefully with user feedback.

### Key Entities

- **CachedPage**: Quran page data stored in Zustand/localStorage (number, ayahs, surahStarts, timestamp)
- **AdhanSound**: One of 3 sound variants (rashed, makka, algeria) with file path and display name
- **SalawatInterval**: Timer interval in minutes with display label

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero blank screens when navigating Quran pages offline — fallback UI appears within 2 seconds
- **SC-002**: Azan sound plays successfully at prayer time in 95%+ of attempts
- **SC-003**: Users can preview all 3 azan sounds from settings without leaving the page
- **SC-004**: Salawat reminder fires within ±5 seconds of the configured interval
- **SC-005**: All offline fallback, azan preview, and salawat settings work on mobile browsers (Chrome, Safari)

## Assumptions

- Users have granted notification and audio permissions for the PWA
- The 3 azan MP3 files in `/public/audio/` are valid and playable
- The existing Zustand + localStorage caching mechanism is adequate (no IndexedDB migration needed)
- Service worker is registered and active for offline detection
- The existing ±30 second prayer time detection window is acceptable
