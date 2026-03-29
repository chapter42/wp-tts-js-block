---
phase: 05-a11y-keyboard
plan: 02
subsystem: a11y
tags: [keyboard, aria-label, screen-reader, roving-tabindex, focus-trap, wai-aria]

# Dependency graph
requires:
  - phase: 05-a11y-keyboard
    plan: 01
    provides: "ARIA markup (type=button, roving tabindex skeleton, SR announcement span)"
provides:
  - "Keyboard navigation for speed menu (Arrow/Enter/Escape/Home/End/Tab)"
  - "Dynamic aria-label updates on play button per state"
  - "Screen reader announcements for state changes, speed changes, and errors"
  - "A11Y_MESSAGES constant with nl-NL and en-US translations"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: ["WAI-ARIA APG listbox keyboard pattern", "clear-then-rAF announcement pattern for aria-live", "roving tabindex focus management"]

key-files:
  modified:
    - "tts-js/src/tts-js/view.js"

key-decisions:
  - "Used ownerDocument.activeElement instead of document.activeElement per WordPress lint rule"
  - "Added requestAnimationFrame to global declaration for SR announcement clear-then-set pattern"
  - "Speed announcement placed before speed value update to ensure correct timing"

patterns-established:
  - "announce() method: clear textContent, set via rAF for re-announcement of same text"
  - "A11Y_MESSAGES keyed by language code with en-US fallback"
  - "handleSpeedMenuKeydown() follows WAI-ARIA APG listbox keyboard pattern"

requirements-completed: [UX-01]

# Metrics
duration: 2min
completed: 2026-03-29
---

# Phase 05 Plan 02: Keyboard JS & Screen Reader Announcements Summary

**WAI-ARIA keyboard navigation for speed menu with roving tabindex, dynamic aria-labels, and bilingual screen reader announcements**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-29T12:37:38Z
- **Completed:** 2026-03-29T12:40:08Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Added A11Y_MESSAGES constant with nl-NL and en-US accessibility text for play/pause/replay labels and state announcements
- Added announce() method using clear-then-rAF pattern for reliable screen reader re-announcements
- Enhanced setState() to update play button aria-label dynamically and announce state changes (playing/paused/finished)
- Enhanced setSpeed() to announce speed changes and showError() to announce errors via SR region
- Added full keyboard navigation for speed menu: ArrowUp/Down navigate with wrapping, Enter selects, Escape closes, Home/End jump, Tab is trapped
- Added openSpeedMenu() with focus on currently-selected option using roving tabindex
- Added focusout handler to close speed menu when focus leaves the speed wrap

## Task Commits

Each task was committed atomically:

1. **Task 1: Add A11Y_MESSAGES constant and announce() method** - `70cb371` (feat)
2. **Task 2: Add keyboard navigation for speed menu and focus management** - `dc52be2` (feat)

## Files Created/Modified
- `tts-js/src/tts-js/view.js` - Added A11Y_MESSAGES, announce(), keyboard handlers, aria-label updates, SR announcements

## Decisions Made
- Used `ownerDocument.activeElement` instead of `document.activeElement` per `@wordpress/no-global-active-element` lint rule
- Added `requestAnimationFrame` to the `/* global */` declaration since wp-scripts lint flags it as undefined
- Placed speed announcement before the speed value update in setSpeed() to ensure the announce() call has access to the a11yText

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed wp-scripts lint errors for WordPress conventions**
- **Found during:** Task 2 (keyboard navigation)
- **Issue:** `document.activeElement` flagged by `@wordpress/no-global-active-element`; `requestAnimationFrame` flagged as undefined; prettier formatting differences
- **Fix:** Used `this.container.ownerDocument.activeElement`, added `requestAnimationFrame` to global declaration, ran `--fix` for prettier
- **Files modified:** tts-js/src/tts-js/view.js
- **Verification:** wp-scripts lint-js passes clean
- **Committed in:** dc52be2 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary for lint compliance. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 05 (a11y-keyboard) is fully complete
- Player is now fully keyboard-accessible and screen reader friendly
- All WAI-ARIA patterns implemented: roving tabindex, focus trapping, aria-live announcements
- Ready for Phase 06 (theme integration & language selection)

---
*Phase: 05-a11y-keyboard*
*Completed: 2026-03-29*
