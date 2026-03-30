---
phase: 09-sticky-bottom-player
plan: 02
subsystem: ui
tags: [sticky-player, speech-synthesis, time-estimation, bar-controls, vanilla-js]

# Dependency graph
requires:
  - phase: 09-sticky-bottom-player
    provides: Bar HTML with all controls, CSS states, settings toggle (09-01)
provides:
  - formatTimestamp() and buildChunkTimes() utility functions for time display
  - TTSPlayer sticky mode with bar activation, dismiss, and control sync
  - Inline block collapse to "Wordt voorgelezen..." indicator when bar active
  - Bar state sync (playing/paused/loading/finished/error via data-tts-bar-state)
  - Bar speed cycling, timestamp display, voice name display
affects: [09-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [lazy bar DOM query on first play, stickyMode flag for dual-state management, chunk time estimation from word count]

key-files:
  created: []
  modified:
    - tts-js/src/tts-js/utils.js
    - tts-js/src/tts-js/view.js

key-decisions:
  - "Lazy bar initialization: initStickyBar() only runs on first play click when sticky enabled"
  - "Inline block stays in sticky-active state while bar is active; setState() overrides container state"
  - "cycleBarSpeed() syncs both bar and inline speed controls for consistency"
  - "D-04: handleFinished() skips 3-second auto-reset when in sticky mode -- bar stays visible"
  - "Added this.label DOM ref (missing from prior phases) to support inline label text changes"

patterns-established:
  - "this.stickyMode boolean gates all bar-related updates in existing methods"
  - "updateBarState/updateBarTimestamps/updateBarSpeed pattern for bar info sync"
  - "formatTimestamp(seconds) returns m:ss format for elapsed/total display"

requirements-completed: [STICKY-05, STICKY-06, STICKY-04, STICKY-09]

# Metrics
duration: 4min
completed: 2026-03-30
---

# Phase 9 Plan 2: Sticky Bottom Player - JS Behavior Wiring Summary

**TTSPlayer extended with sticky mode: bar activates on play with slide-up animation, shows title/timestamps/voice/speed, inline block collapses to indicator, close button dismisses bar and restores idle state**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-30T20:34:34Z
- **Completed:** 2026-03-30T20:38:21Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added formatTimestamp(seconds) utility returning m:ss format (e.g., 62 -> "1:02")
- Added buildChunkTimes(chunks) utility computing cumulative start-time offsets using WORDS_PER_MINUTE
- Extended TTSPlayer constructor with stickyEnabled flag, stickyMode state, 12 bar DOM refs, label ref, and _originalLabel
- initStickyBar() lazily queries .tts-bar element and caches all control references
- activateStickyBar() shows bar with CSS transition animation, collapses inline block, sets up bar info
- dismissStickyBar() stops speech, animates bar out, restores inline block label and idle state
- setState() now keeps inline block in sticky-active state when bar is active
- updateBarTimestamps() called on each chunk transition for elapsed/total time display
- cycleBarSpeed() cycles through SPEED_STEPS and syncs both bar and inline controls
- handleFinished() respects D-04: no auto-close in sticky mode
- Screen reader announcements on bar open ("Audio speler geopend") and close ("Audio speler gesloten")

## Task Commits

Each task was committed atomically:

1. **Task 1: Add formatTimestamp and buildChunkTimes utilities** - `e5694c1` (feat)
2. **Task 2: TTSPlayer sticky mode -- bar wiring, trigger/dismiss, control sync** - `5fa7a69` (feat)

## Files Created/Modified
- `tts-js/src/tts-js/utils.js` - Added formatTimestamp() and buildChunkTimes() exported functions
- `tts-js/src/tts-js/view.js` - Extended TTSPlayer with sticky mode: 7 new methods, import updates, constructor extensions, setState/handleFinished/startPlayback/playNextChunk/setSpeed modifications

## Decisions Made
- Lazy bar initialization: initStickyBar() deferred to first play click to avoid querying DOM on page load for non-sticky users
- Added this.label DOM ref that was missing from prior phases (Rule 3: blocking issue -- plan references label changes but no ref existed)
- cycleBarSpeed() maintains sync with inline speed menu state (aria-selected, active class) for consistency
- handleFinished() conditionally skips the 3-second auto-reset to idle when stickyMode is true per D-04

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added missing this.label DOM reference**
- **Found during:** Task 2
- **Issue:** Plan references `this.label` for text changes but no such property existed in the constructor
- **Fix:** Added `this.label = container.querySelector( '.tts-label' )` in constructor
- **Files modified:** tts-js/src/tts-js/view.js
- **Commit:** 5fa7a69

**2. [Rule 2 - Critical] Added chunk time building in resumeFromSavedPosition**
- **Found during:** Task 2
- **Issue:** resumeFromSavedPosition() creates chunks but didn't build chunk times, so bar timestamps would be wrong when resuming
- **Fix:** Added buildChunkTimes() call and sticky bar activation in resumeFromSavedPosition()
- **Files modified:** tts-js/src/tts-js/view.js
- **Commit:** 5fa7a69

## Issues Encountered
None

## Known Stubs
None -- all bar wiring is fully functional. Skip buttons in bar are declared but event wiring deferred to Plan 09-03 (time-based seeking).

## Next Phase Readiness
- Bar activates on play, shows all info, dismisses on close
- Plan 09-03 can now add: time-based seeking via timeline click/drag, 15-second skip buttons, interpolated elapsed time display

---
*Phase: 09-sticky-bottom-player*
*Completed: 2026-03-30*
