---
phase: 03-cross-browser-error-handling
plan: 03
subsystem: speech-engine
tags: [web-speech-api, error-handling, ios-safari, auto-retry, visibility-api]

# Dependency graph
requires:
  - phase: 03-cross-browser-error-handling/plan-02
    provides: "Capability detection, onerror handler, ERROR state, voice loading"
provides:
  - "Auto-retry on speech failure with single retry limit (D-03)"
  - "iOS tab background recovery via visibilitychange (D-07)"
  - "One-time mute hint for touch devices (D-08)"
  - "XBRW-05 user gesture context compliance"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single-retry pattern: hasRetried flag gates one invisible retry before showing error"
    - "Visibility change recovery: store chunk position on hidden, retry on visible if speech stopped"
    - "localStorage-guarded one-time hints for mobile UX"

key-files:
  created: []
  modified:
    - tts-js/src/tts-js/view.js

key-decisions:
  - "retryPlayback() resumes from lastChunkIndex using existing chunked playback -- no need to restart from beginning"
  - "hasRetried resets on successful onstart so each new speech segment gets its own retry budget"
  - "Mute hint uses localStorage (not sessionStorage) for true one-time-ever display"

patterns-established:
  - "Resilience pattern: invisible retry -> visible error -> auto-reset to idle after 5s"
  - "Tab recovery pattern: visibilitychange listener stores state on hidden, retries on visible"

requirements-completed: [XBRW-02, XBRW-05, ERR-03]

# Metrics
duration: 2min
completed: 2026-03-27
---

# Phase 3 Plan 3: Resilience Summary

**Auto-retry on speech failure, iOS tab background recovery, and one-time mute hint for touch devices**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-27T16:48:59Z
- **Completed:** 2026-03-27T16:50:36Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Added retryPlayback() method that resumes from last chunk position with single-retry limit
- Added handleVisibilityChange() for iOS Safari tab background recovery using visibilitychange API
- Added showMuteHintIfNeeded() with localStorage guard for one-time mute hint on touch devices
- Updated onerror handler with auto-retry logic before showing friendly error + 5s auto-reset
- Verified XBRW-05 user gesture context compliance (speak() in click handler path)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add auto-retry, visibility change handler, and mute hint** - `074a999` (feat)

## Files Created/Modified
- `tts-js/src/tts-js/view.js` - Added retryPlayback(), handleVisibilityChange(), showMuteHintIfNeeded() methods; updated onerror handler with retry logic; added constructor properties and visibilitychange listener

## Decisions Made
- retryPlayback() leverages existing chunked playback to resume from lastChunkIndex rather than restarting
- hasRetried flag resets on successful utterance.onstart so each speech segment gets its own retry attempt
- Mute hint uses localStorage (persistent across sessions) rather than sessionStorage for true one-time display
- retryPlayback sets LOADING state before playNextChunk() so the UI shows appropriate feedback during retry

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added LOADING state transition in retryPlayback()**
- **Found during:** Task 1
- **Issue:** Plan's retryPlayback() called startPlayback() which would re-split chunks and re-resolve voice unnecessarily. Direct call to playNextChunk() is more efficient but needs explicit state transition.
- **Fix:** retryPlayback() sets LOADING state and calls playNextChunk() directly, skipping redundant chunk splitting and voice resolution
- **Files modified:** tts-js/src/tts-js/view.js
- **Verification:** Build succeeds, method correctly resumes from chunk index
- **Committed in:** 074a999

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Improved efficiency of retry path. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 3 cross-browser error handling is complete
- All resilience features (capability detection, error states, auto-retry, iOS recovery, mute hint) are in place
- Player is hardened for Chrome, Safari, Firefox, Edge on desktop and mobile

---
*Phase: 03-cross-browser-error-handling*
*Completed: 2026-03-27*
