---
phase: 01-block-core-speech
plan: 01
subsystem: ui
tags: [wordpress, gutenberg, block-api, php, parse-blocks, dynamic-block]

# Dependency graph
requires: []
provides:
  - WordPress plugin skeleton with block.json, tts-js.php bootstrap
  - Dynamic block registration (tts-js/player) with save() returning null
  - Server-side text extraction via parse_blocks() in render.php
  - Player HTML shell with SVG icons and data attributes
affects: [01-02, 01-03, 02-01]

# Tech tracking
tech-stack:
  added: ["@wordpress/create-block", "@wordpress/scripts ^31.x"]
  patterns: ["Dynamic block with render.php", "parse_blocks() text extraction", "function_exists guard for render.php functions"]

key-files:
  created:
    - tts-js/src/tts-js/block.json
    - tts-js/src/tts-js/index.js
    - tts-js/src/tts-js/edit.js
    - tts-js/src/tts-js/view.js
    - tts-js/src/tts-js/render.php
    - tts-js/tts-js.php
  modified: []

key-decisions:
  - "Used register_block_type() instead of wp_register_block_types_from_metadata_collection() for WP 6.5+ compat"
  - "Nested source structure src/tts-js/ follows create-block v4.85 convention"
  - "Text extraction uses parse_blocks() + recursive innerBlocks walking, not DOM traversal"

patterns-established:
  - "Dynamic block: save() returns null, render.php generates HTML"
  - "Text extraction: allowed-list of block types, recursive innerBlocks"
  - "Player HTML: data-tts-text/lang/speed attributes pass config to frontend JS"

requirements-completed: [WP-01, WP-02, WP-04, CONT-01, CONT-02, CONT-03]

# Metrics
duration: 8min
completed: 2026-03-27
---

# Phase 01 Plan 01: Plugin Scaffold & Text Extraction Summary

**WordPress block plugin scaffolded with dynamic rendering and parse_blocks() text extraction engine for headings, paragraphs, lists, and blockquotes**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-27T15:12:27Z
- **Completed:** 2026-03-27T15:20:18Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Scaffolded tts-js WordPress plugin via @wordpress/create-block with correct block.json metadata
- Configured dynamic block (tts-js/player) with 3 attributes: lang (nl-NL), speed (1), label (Luister naar artikel)
- Implemented render.php with parse_blocks() text extraction from heading/paragraph/list/quote blocks
- Player HTML with 5 SVG icons (play, pause, check, spinner, stop) and data attributes for frontend JS

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold WordPress block plugin and configure block.json** - `534cabd` (feat)
2. **Task 2: Implement render.php with parse_blocks() text extraction and player HTML** - `4a34ba0` (feat)

## Files Created/Modified
- `tts-js/src/tts-js/block.json` - Block metadata with attributes, viewScript, render path
- `tts-js/src/tts-js/index.js` - Block registration with save() returning null
- `tts-js/src/tts-js/edit.js` - Placeholder editor preview (implemented in Plan 02)
- `tts-js/src/tts-js/view.js` - Placeholder frontend script (implemented in Plan 03)
- `tts-js/src/tts-js/render.php` - Server-side text extraction and player HTML with SVG icons
- `tts-js/src/tts-js/style.scss` - Placeholder styles (implemented in Plan 02)
- `tts-js/src/tts-js/editor.scss` - Placeholder editor styles (implemented in Plan 02)
- `tts-js/tts-js.php` - Plugin bootstrap with register_block_type()
- `tts-js/package.json` - npm package config with wp-scripts
- `tts-js/.gitignore` - Git ignore with build/ excluded

## Decisions Made
- Used `register_block_type()` instead of the newer `wp_register_block_types_from_metadata_collection()` for WP 6.5+ compatibility (scaffolder generated WP 6.8 pattern)
- Kept `src/tts-js/` nested directory structure from create-block v4.85 (supports multi-block plugins)
- Added `build/` to .gitignore since it is regenerated via `npm run build`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Adapted to create-block v4.85 nested directory structure**
- **Found during:** Task 1 (Scaffolding)
- **Issue:** Plan assumed files at `src/block.json`, `src/index.js`, etc. but create-block v4.85 generates `src/tts-js/` subdirectory
- **Fix:** Placed all source files in `src/tts-js/` and updated `register_block_type()` path to `__DIR__ . '/build/tts-js'`
- **Files modified:** tts-js/tts-js.php
- **Verification:** `npm run build` succeeds, build output at `build/tts-js/`
- **Committed in:** 534cabd (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary adaptation to current create-block version. No scope creep.

## Known Stubs
- `tts-js/src/tts-js/edit.js` - Placeholder editor preview, will be implemented in Plan 02
- `tts-js/src/tts-js/view.js` - Placeholder frontend script, will be implemented in Plan 03
- `tts-js/src/tts-js/style.scss` - Empty styles, will be implemented in Plan 02

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plugin skeleton complete and builds without errors
- render.php ready for frontend JS to consume via data-tts-text attribute
- edit.js placeholder ready for Plan 02 editor preview implementation
- view.js placeholder ready for Plan 03 speech synthesis implementation

## Self-Check: PASSED

All 7 created files verified on disk. Both task commits (534cabd, 4a34ba0) verified in git log.

---
*Phase: 01-block-core-speech*
*Completed: 2026-03-27*
