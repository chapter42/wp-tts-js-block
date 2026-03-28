---
phase: 04-testing-qa
plan: 01
subsystem: testing
tags: [jest, wp-scripts, unit-tests, es-modules, refactoring]

# Dependency graph
requires:
  - phase: 03-cross-browser
    provides: "view.js with 5 pure functions and constants inline"
provides:
  - "utils.js with 5 exported pure functions and 9 exported constants"
  - "19 passing Jest unit tests for all pure functions"
  - "npm test script via wp-scripts test-unit-js"
affects: [04-testing-qa, future plans importing from utils.js]

# Tech tracking
tech-stack:
  added: [jest (via wp-scripts), wp-scripts test-unit-js]
  patterns: [pure function extraction for testability, ES module imports between source files]

key-files:
  created:
    - tts-js/src/tts-js/utils.js
    - tts-js/src/tts-js/__tests__/utils.test.js
  modified:
    - tts-js/src/tts-js/view.js
    - tts-js/package.json

key-decisions:
  - "Extracted 5 pure functions + 9 constants to utils.js for testability without DOM/speechSynthesis mocking"
  - "resolveVoice() stays in view.js -- uses window.speechSynthesis (browser API, not pure)"

patterns-established:
  - "Pure function extraction: testable logic in utils.js, browser-dependent logic in view.js"
  - "Test location: __tests__/utils.test.js adjacent to source in src/tts-js/"

requirements-completed: []

# Metrics
duration: 3min
completed: 2026-03-28
---

# Phase 04 Plan 01: Extract & Test Pure Functions Summary

**5 pure functions extracted to utils.js with 19 passing Jest unit tests covering chunking, voice selection, duration, and speed formatting**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-28T10:30:03Z
- **Completed:** 2026-03-28T10:32:39Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Extracted splitIntoChunks, pickBestVoice, estimateDuration, formatDuration, formatSpeed to utils.js
- Refactored view.js to import all functions and constants from utils.js
- 19 unit tests passing: sentence splitting (5), voice scoring (4), duration formatting (4), speed formatting (2), duration estimation (4)
- Build still succeeds with webpack resolving the new ES module import

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract pure functions to utils.js and add test script** - `6d01ec3` (refactor)
2. **Task 2: Write comprehensive Jest unit tests for all 5 pure functions** - `72d8e67` (test)

## Files Created/Modified
- `tts-js/src/tts-js/utils.js` - 5 exported pure functions + 9 exported constants
- `tts-js/src/tts-js/__tests__/utils.test.js` - 19 Jest unit tests for all pure functions
- `tts-js/src/tts-js/view.js` - Refactored to import from utils.js; resolveVoice + TTSPlayer remain
- `tts-js/package.json` - Added "test": "wp-scripts test-unit-js" script

## Decisions Made
- Extracted 5 pure functions + 9 constants to utils.js for testability without DOM/speechSynthesis mocking
- resolveVoice() stays in view.js because it uses window.speechSynthesis (browser API, not pure)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Testing foundation established: utils.js is fully testable without browser environment
- Ready for integration tests (plan 04-02) and manual cross-browser testing (plan 04-03)
- Future plans can import from utils.js for any pure function needs

## Self-Check: PASSED

---
*Phase: 04-testing-qa*
*Completed: 2026-03-28*
