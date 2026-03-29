---
phase: 05-a11y-keyboard
plan: 01
subsystem: a11y
tags: [aria, focus-visible, reduced-motion, screen-reader, wcag]

# Dependency graph
requires:
  - phase: 01-block-core-speech
    provides: "Player markup (render.php) and CSS state machine (style.scss)"
provides:
  - "ARIA-enhanced player markup with SR announcement region, type=button, roving tabindex"
  - "Focus indicators using :focus-visible with outline (high-contrast-safe)"
  - "Reduced motion media query disabling animations"
  - "Visually-hidden SR-only class for live announcements"
affects: [05-02-keyboard-js]

# Tech tracking
tech-stack:
  added: []
  patterns: [":focus-visible for keyboard-only focus indicators", "clip-path SR-only pattern", "prefers-reduced-motion media query"]

key-files:
  modified:
    - "tts-js/src/tts-js/render.php"
    - "tts-js/src/tts-js/style.scss"

key-decisions:
  - "Used outline instead of box-shadow for focus indicators (Windows High Contrast Mode safe)"
  - "Added stylelint-disable for no-descending-specificity on focus-visible rules (legitimate specificity pattern)"

patterns-established:
  - "Focus-visible pattern: outline with var(--tts-dark) for 7.5:1 contrast ratio"
  - "SR announcement: server-rendered aria-live=polite span (not JS-created) for AT registration"
  - "Roving tabindex: tabindex=-1 on options, JS sets tabindex=0 on focused item"

requirements-completed: [UX-01]

# Metrics
duration: 2min
completed: 2026-03-29
---

# Phase 05 Plan 01: A11y Markup & CSS Summary

**ARIA markup (type=button, roving tabindex, SR live region) and CSS focus indicators with reduced motion support**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-29T12:33:35Z
- **Completed:** 2026-03-29T12:35:23Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added type="button" to play and speed buttons preventing accidental form submission
- Added tabindex="-1" to all 8 speed menu options enabling roving tabindex keyboard pattern
- Added server-rendered SR announcement span with aria-live="polite" for assistive technology
- Added :focus-visible focus indicators (3px play, 2px speed/options) using outline for WHCM safety
- Added prefers-reduced-motion query disabling spinner animation, progress transition, and button scale
- Added visually-hidden class for SR announcement using clip-path pattern

## Task Commits

Each task was committed atomically:

1. **Task 1: Add accessibility markup to render.php** - `ae0558e` (feat)
2. **Task 2: Add focus indicators, SR-only class, and reduced motion to style.scss** - `743cc62` (feat)

## Files Created/Modified
- `tts-js/src/tts-js/render.php` - Added type="button", tabindex="-1", and SR announcement span
- `tts-js/src/tts-js/style.scss` - Added focus-visible rules, visually-hidden class, reduced motion query

## Decisions Made
- Used outline instead of box-shadow for focus indicators -- box-shadow is stripped in Windows High Contrast Mode
- Added stylelint-disable for no-descending-specificity on focus-visible selectors -- legitimate pattern where pseudo-class creates different specificity ordering than state-driven attribute selectors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added stylelint-disable for no-descending-specificity**
- **Found during:** Task 2 (CSS focus indicators)
- **Issue:** wp-scripts lint-style flagged focus-visible selectors as descending specificity errors vs state-driven selectors above
- **Fix:** Added stylelint-disable/enable comments around the focus-visible rules
- **Files modified:** tts-js/src/tts-js/style.scss
- **Verification:** wp-scripts lint-style passes clean
- **Committed in:** 743cc62 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary for lint compliance. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- HTML/CSS foundation complete for Plan 02 (keyboard JS behavior)
- SR announcement span is in DOM, ready for JS to populate with status text
- Roving tabindex skeleton ready -- JS needs to manage tabindex="0" on active option
- Focus indicators active -- keyboard users will see outlines on Tab navigation

---
*Phase: 05-a11y-keyboard*
*Completed: 2026-03-29*
