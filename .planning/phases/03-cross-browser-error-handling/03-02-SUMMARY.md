---
phase: 03-cross-browser-error-handling
plan: 02
subsystem: ui
tags: [web-speech-api, cross-browser, error-handling, voice-loading, capability-detection]

# Dependency graph
requires:
  - phase: 03-01
    provides: "Error markup in render.php (data-tts-errors, .tts-error CSS, error icon SVG)"
  - phase: 02-02
    provides: "Chunked speech engine with resolveVoice(), pickBestVoice(), state machine"
provides:
  - "checkCapabilities() method for feature detection on first play click"
  - "loadVoices() cross-browser voice loading (Chrome async, Safari polling, Firefox sync)"
  - "showError() / hideError() inline error display methods"
  - "ERROR state fully wired in togglePlay() and onerror handler"
  - "Enhanced onerror with all SpeechSynthesisErrorEvent codes mapped to localized messages"
affects: [03-03, error-handling, cross-browser]

# Tech tracking
tech-stack:
  added: []
  patterns: [capability-detection-on-first-click, cross-browser-voice-polling, inline-error-state-machine]

key-files:
  created: []
  modified:
    - tts-js/src/tts-js/view.js

key-decisions:
  - "Kept existing resolveVoice() standalone function alongside new loadVoices() class method for backward compatibility"
  - "selectedVoice from checkCapabilities() takes priority over resolvedVoice from startPlayback()"
  - "loadVoices() uses 250ms polling with 2s max (simpler than resolveVoice's 100ms/3s) per plan spec"

patterns-established:
  - "Capability gate pattern: capabilitiesChecked flag + async checkCapabilities() on first togglePlay()"
  - "Error display pattern: showError() creates .tts-error div with role=status inside .tts-info"
  - "onerror mapping pattern: canceled/interrupted ignored, language/voice errors to no-voice, synthesis/not-allowed to no-support"

requirements-completed: [ERR-01, ERR-02, ERR-03, XBRW-01, XBRW-02, XBRW-03, XBRW-04]

# Metrics
duration: 2min
completed: 2026-03-27
---

# Phase 3 Plan 2: Capability Detection and Error Handling Summary

**Capability detection on first play click with cross-browser voice loading and localized inline error messages**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-27T16:43:52Z
- **Completed:** 2026-03-27T16:46:47Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Added checkCapabilities() that runs on first play click (D-12) with feature detection (D-10, no UA sniffing)
- Added loadVoices() with cross-browser support: Chrome async onvoiceschanged, Safari polling fallback, Firefox sync
- Added showError()/hideError() for inline localized error display replacing controls (D-05)
- Enhanced onerror handler mapping all SpeechSynthesisErrorEvent codes to appropriate user-facing messages
- Player hides completely when speechSynthesis API missing (D-01), shows inline error when no voice (D-02)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add ERROR state and error message infrastructure to TTSPlayer** - `ad3accf` (feat)

## Files Created/Modified
- `tts-js/src/tts-js/view.js` - Added showError(), hideError(), loadVoices(), checkCapabilities() methods; async togglePlay() with capability gate; enhanced onerror handler; errorMessages/selectedVoice/capabilitiesChecked constructor properties

## Decisions Made
- Kept existing resolveVoice() standalone function alongside new loadVoices() class method -- resolveVoice() is more robust (with pickBestVoice scoring) and used as fallback in startPlayback()
- selectedVoice from checkCapabilities() takes priority in playNextChunk() voice assignment
- loadVoices() uses simpler 250ms/2s polling per plan spec, while resolveVoice() keeps its 100ms/3s pattern

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Adapted startPlayback() error handling to use showError() with localized messages**
- **Found during:** Task 1
- **Issue:** Plan specified replacing inline error handling in startPlayback() with showError(), but existing code had hardcoded Dutch strings ('Geen geschikte stem gevonden') instead of using data-tts-errors messages
- **Fix:** Replaced hardcoded strings with this.errorMessages['no-voice'] lookup via showError()
- **Files modified:** tts-js/src/tts-js/view.js
- **Verification:** grep confirms showError() calls use errorMessages lookup
- **Committed in:** ad3accf

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Essential for localized error messages (D-04). No scope creep.

## Known Stubs

None -- all methods are fully wired with real data from render.php data attributes.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ERROR state, capability detection, and cross-browser voice loading are fully operational
- Ready for Plan 03: auto-retry on failure and iOS visibility change handling
- All error messages flow through render.php data-tts-errors attribute (localized per block language)

---
*Phase: 03-cross-browser-error-handling*
*Completed: 2026-03-27*
