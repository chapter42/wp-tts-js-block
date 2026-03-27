---
phase: 03-cross-browser-error-handling
plan: 01
subsystem: ui
tags: [php, scss, error-handling, i18n, web-speech-api]

# Dependency graph
requires:
  - phase: 02-reliable-speech-full-player
    provides: Player HTML structure with data attributes and CSS state machine
provides:
  - data-tts-errors JSON attribute with localized error messages (nl-NL, en-US)
  - CSS rules for error state (.tts-error element visibility)
  - CSS rules for mute hint (.tts-mute-hint styling)
affects: [03-02, 03-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [server-side localized error strings via data attribute, CSS error state visibility toggle]

key-files:
  created: []
  modified:
    - tts-js/src/tts-js/render.php
    - tts-js/src/tts-js/style.scss

key-decisions:
  - "Used wp_json_encode() for safe JSON output in HTML attribute"
  - "Error play button fully hidden (display:none) instead of disabled+dimmed for cleaner error UX"

patterns-established:
  - "Localized strings via data attribute: server-side PHP array keyed by lang, output as JSON data attribute for JS consumption"

requirements-completed: [ERR-01, ERR-02, ERR-03, XBRW-01, XBRW-02, XBRW-03, XBRW-04]

# Metrics
duration: 2min
completed: 2026-03-27
---

# Phase 3 Plan 1: Error Messages & CSS Summary

**Localized error message data attribute (nl-NL/en-US) in render.php and error/mute-hint CSS states in style.scss**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-27T16:20:02Z
- **Completed:** 2026-03-27T16:21:45Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added `data-tts-errors` JSON attribute to render.php with 4 error message keys per language (no-support, no-voice, failed, mute-hint)
- Two language sets: nl-NL (Dutch) and en-US (English) with automatic fallback to English
- Added `.tts-error` CSS class (hidden by default, shown when player is in error state)
- Added `.tts-mute-hint` CSS class for iOS silent switch hint
- Updated error state to fully hide play button (display:none) for cleaner error presentation

## Task Commits

Each task was committed atomically:

1. **Task 1: Add localized error messages data attribute to render.php** - `d1f027a` (feat)
2. **Task 2: Add error state and mute hint CSS rules to style.scss** - `a3cbffe` (feat)

## Files Created/Modified
- `tts-js/src/tts-js/render.php` - Added $error_messages array and data-tts-errors attribute
- `tts-js/src/tts-js/style.scss` - Added .tts-error and .tts-mute-hint CSS rules, updated error state play button

## Decisions Made
- Used `wp_json_encode()` (WordPress function) instead of `json_encode()` for proper escaping in HTML attributes
- Changed error state play button from `pointer-events:none; opacity:0.5` to `display:none` per plan requirement for hiding controls entirely in error state

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated existing error state play button CSS**
- **Found during:** Task 2 (error state CSS)
- **Issue:** Existing CSS had `pointer-events: none; opacity: 0.5` on `.tts-play-btn` in error state, but plan specifies `display: none`
- **Fix:** Changed to `display: none` to fully hide the button per D-05 spec
- **Files modified:** tts-js/src/tts-js/style.scss
- **Verification:** grep confirms rule present
- **Committed in:** a3cbffe (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Minor CSS rule update to match plan spec. No scope creep.

## Issues Encountered
- node_modules not present in worktree; ran npm install for build verification (expected for worktree setup)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- data-tts-errors attribute ready for Plan 02 (view.js) to read and display error messages
- .tts-error and .tts-mute-hint CSS classes ready for JS to inject content into
- Build compiles successfully with all changes

---
*Phase: 03-cross-browser-error-handling*
*Completed: 2026-03-27*
