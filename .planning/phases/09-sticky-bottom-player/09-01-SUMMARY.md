---
phase: 09-sticky-bottom-player
plan: 01
subsystem: ui
tags: [sticky-player, css-animations, wordpress-settings, svg-icons, responsive, safe-area]

# Dependency graph
requires:
  - phase: 08-auto-insert-wporg
    provides: Settings page structure (tts_js_register_settings, tts_js_render_settings_page)
provides:
  - Sticky player settings toggle (tts_js_sticky_player option)
  - Bar HTML with all controls rendered conditionally from render.php
  - 3 new SVG icons (skip-back-15, skip-forward-15, close-x)
  - Complete bar CSS with positioning, animations, responsive breakpoints
  - Inline block collapsed state CSS (data-tts-state=sticky-active)
  - viewport-fit=cover meta tag injection for iOS safe-area
affects: [09-02, 09-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [data-tts-bar attribute for bar visibility states, data-tts-bar-state for icon state machine, static PHP flag for single-render guard, viewport-fit JS injection]

key-files:
  created: []
  modified:
    - tts-js/tts-js.php
    - tts-js/src/tts-js/render.php
    - tts-js/src/tts-js/style.scss

key-decisions:
  - "Bar HTML rendered outside block wrapper as standalone fixed element"
  - "Static $bar_rendered flag prevents duplicate bar on pages with multiple blocks"
  - "viewport-fit=cover injected via JS in wp_head rather than PHP meta manipulation"
  - "Separate data-tts-bar-state attribute for bar icon machine (not reusing inline data-tts-state)"

patterns-established:
  - "data-tts-bar: hidden/visible/animating-in/animating-out for bar lifecycle"
  - "data-tts-bar-state: idle/playing/paused/loading/finished/error for bar icon visibility"
  - "body.tts-bar-active class for content occlusion prevention"
  - "data-tts-state=sticky-active for inline block collapsed state"

requirements-completed: [STICKY-01, STICKY-02, STICKY-03, STICKY-04]

# Metrics
duration: 3min
completed: 2026-03-30
---

# Phase 9 Plan 1: Sticky Bottom Player - Settings, HTML & CSS Summary

**Sticky player settings toggle, bar HTML with all controls and 3 new SVG icons, complete bar CSS with fixed positioning, slide animations, responsive breakpoints, and inline collapsed state**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-30T20:27:52Z
- **Completed:** 2026-03-30T20:30:38Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Settings page extended with sticky player toggle checkbox (off by default)
- Bar HTML rendered conditionally in render.php with all controls: title, skip-15 back/forward, play/pause, timeline with timestamps, speed, voice name, close
- 3 new SVG icons defined and wp_kses-escaped: skip-back-15, skip-forward-15, close-x
- Complete bar CSS with fixed positioning, slide-in/out transitions, icon state machine, responsive breakpoints, iOS safe-area support, reduced motion, and content occlusion prevention
- Inline block collapsed state CSS for sticky-active mode

## Task Commits

Each task was committed atomically:

1. **Task 1: Settings toggle + viewport-fit meta + bar HTML rendering** - `39ec4f4` (feat)
2. **Task 2: Bar CSS -- positioning, animations, responsive, inline collapsed state** - `76f6968` (feat)

## Files Created/Modified
- `tts-js/tts-js.php` - Added tts_js_sticky_player setting registration, settings page checkbox, viewport-fit meta injection
- `tts-js/src/tts-js/render.php` - Added data-tts-title/data-tts-sticky attributes, 3 new SVG icons, text in allowed_svg, conditional bar HTML with static render guard
- `tts-js/src/tts-js/style.scss` - Added complete bar CSS: container, visibility states, icon state machine, all controls, collapsed inline state, responsive breakpoints, reduced motion, hover expand

## Decisions Made
- Bar HTML rendered outside the `.wp-block-tts-js-player` wrapper as a standalone fixed element -- required for proper fixed positioning
- Used `static $bar_rendered = false` PHP flag to ensure bar renders only once per page even with multiple TTS blocks
- viewport-fit=cover injected via inline JS in wp_head at priority 1 (non-destructive append to existing viewport meta) -- preferred over PHP manipulation since theme meta tag cannot be reliably intercepted
- Separate `data-tts-bar-state` attribute for bar icon visibility instead of reusing inline `data-tts-state` -- bar and inline block need independent state tracking

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## Known Stubs
None -- all HTML, CSS, and settings are fully implemented. JS wiring is planned for 09-02.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Bar HTML exists in DOM (hidden) when setting is enabled
- All CSS states ready for JS to toggle data-tts-bar and data-tts-bar-state attributes
- Plan 09-02 can now wire view.js to activate sticky mode, handle bar controls, and implement time-based seeking
- Plan 09-03 can add speed popup and keyboard controls for the bar

---
*Phase: 09-sticky-bottom-player*
*Completed: 2026-03-30*
