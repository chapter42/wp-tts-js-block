---
phase: 09-sticky-bottom-player
plan: 03
subsystem: ui
tags: [sticky-player, seeking, timeline, skip, progress-interpolation, requestAnimationFrame, pointer-events]

# Dependency graph
requires:
  - phase: 09-sticky-bottom-player
    provides: Bar HTML with timeline element, skip buttons, CSS states (09-01); TTSPlayer sticky mode with bar activation, chunkTimes, totalDurationSecs (09-02)
provides:
  - seekToPercent() method for click-to-seek on timeline
  - skipByTime() method for 15-second forward/back jumps
  - startProgressInterpolation() for smooth rAF-based progress animation
  - updateBarTimelineFill() helper for timeline width + aria
  - Clickable and draggable timeline via pointer events
  - Keyboard arrow key seeking on focused timeline (5% increments)
  - Full interactive sticky bottom bar with podcast-like controls
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [pointer event capture for drag-to-scrub, rAF interpolation between chunk boundaries, time-to-chunk mapping via chunkTimes array]

key-files:
  created: []
  modified:
    - tts-js/src/tts-js/view.js

key-decisions:
  - "seekToPercent maps percentage to 1x-speed chunk time for accurate chunk lookup regardless of speed"
  - "skipByTime converts current time to speed-adjusted, adds delta, converts back for chunk lookup"
  - "Pointer capture (setPointerCapture/releasePointerCapture) ensures drag continues outside timeline bounds"
  - "Progress interpolation cancelled on pause, drag start, seek, and bar dismiss to prevent stale animations"

patterns-established:
  - "Pointer events with capture for mobile-safe drag-to-scrub (pointerdown preventDefault prevents scroll)"
  - "requestAnimationFrame interpolation between discrete chunk boundaries for smooth visual progress"
  - "Preview elapsed time during drag without triggering seek until pointerup"

requirements-completed: [STICKY-07, STICKY-08]

# Metrics
duration: 2min
completed: 2026-03-30
---

# Phase 9 Plan 3: Timeline Seeking, 15-Second Skip, and Progress Interpolation Summary

**Clickable/draggable timeline for seeking, 15-second skip buttons, smooth requestAnimationFrame progress interpolation, and keyboard arrow key navigation on the sticky bottom bar**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-30T20:42:23Z
- **Completed:** 2026-03-30T20:44:27Z
- **Tasks:** 1 (auto) + 1 (checkpoint:human-verify -- noted for manual testing)
- **Files modified:** 1

## Accomplishments
- Added seekToPercent() method mapping timeline percentage to chunk via chunkTimes array
- Added skipByTime() method for 15-second time-based jumps with speed-adjusted calculations
- Added startProgressInterpolation() using requestAnimationFrame for smooth progress bar and elapsed time animation between chunk boundaries
- Added updateBarTimelineFill() helper that sets width style and aria-valuenow on timeline
- Wired pointerdown/pointermove/pointerup on barTimeline with pointer capture for drag-to-scrub
- Wired keyboard ArrowLeft/ArrowRight on timeline for 5% seek increments
- Wired skip buttons to skipByTime(-15) and skipByTime(15)
- Added startProgressInterpolation() call in playNextChunk onstart when stickyMode active
- Added cancelAnimationFrame on pause to stop interpolation
- Added cancelAnimationFrame global declaration

## Task Commits

Each task was committed atomically:

1. **Task 1: Timeline seeking, 15-second skip, and progress interpolation** - `42ce3d4` (feat)
2. **Task 2: Verify sticky bottom player end-to-end** - checkpoint:human-verify (not executed -- noted for manual testing)

## Files Created/Modified
- `tts-js/src/tts-js/view.js` - Added 4 new methods (seekToPercent, skipByTime, startProgressInterpolation, updateBarTimelineFill), pointer event wiring for timeline, skip button wiring, keyboard seek, pause interpolation cancel

## Decisions Made
- seekToPercent maps percentage to 1x-speed chunk time, ensuring accurate chunk targeting regardless of current playback speed
- skipByTime converts elapsed time to speed-adjusted time, adds delta seconds, then converts back for chunk lookup -- enabling speed-aware 15s jumps
- Pointer capture (setPointerCapture) used to ensure drag continues tracking even when cursor leaves timeline bounds
- Progress interpolation uses performance.now() for frame-accurate timing and stops automatically when state changes from PLAYING
- Added cancelAnimationFrame to the global declaration comment for linting compliance

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## Known Stubs
None -- all interactive features are fully implemented. The onerror guard for 'canceled'/'interrupted' was already present from Phase 3, so no changes were needed (verified per task step 9).

## Human Verification Needed

Task 2 is a checkpoint:human-verify. The following verification steps should be performed manually in WordPress:

1. Enable "Gebruik sticky bottom player" in wp-admin > Settings > TTS Player
2. Visit a post with TTS block, click play to activate the sticky bar
3. Verify: click on timeline seeks to that position
4. Verify: drag along timeline shows preview time and seeks on release
5. Verify: 15-second skip buttons jump forward/back
6. Verify: progress bar fills smoothly between chunk boundaries
7. Verify: elapsed time updates smoothly during playback
8. Verify: keyboard Arrow keys on focused timeline seek in 5% increments
9. Verify: speed changes update total duration
10. Verify: all controls work on mobile (touch events via pointer API)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Complete sticky bottom player with all interactive features
- Phase 9 is fully implemented: settings toggle, bar HTML/CSS, JS wiring, seeking, skipping, smooth progress
- Ready for human verification of the end-to-end sticky player flow

---
*Phase: 09-sticky-bottom-player*
*Completed: 2026-03-30*
