---
phase: 07-enhanced-player
plan: 03
subsystem: ui
tags: [highlighting, auto-scroll, speechSynthesis, DOM-manipulation, css-custom-properties]

# Dependency graph
requires:
  - phase: 07-01
    provides: Skip forward/back methods and chunk-based playback
  - phase: 07-02
    provides: Position memory and resumeFromSavedPosition
provides:
  - Sentence-level text highlighting during TTS playback
  - Auto-scroll to keep highlighted sentence in viewport
  - enableHighlighting block attribute with editor toggle
  - Highlight cleanup on stop/finish
affects: [08-auto-insert]

# Tech tracking
tech-stack:
  added: []
  patterns: [TreeWalker text-node walking for DOM injection, color-mix highlight with theme inheritance]

key-files:
  created: []
  modified:
    - tts-js/src/tts-js/view.js
    - tts-js/src/tts-js/style.scss
    - tts-js/src/tts-js/block.json
    - tts-js/src/tts-js/edit.js
    - tts-js/src/tts-js/render.php

key-decisions:
  - "TreeWalker text-node walking for precise chunk-to-DOM mapping instead of innerHTML replacement"
  - "Title chunk offset detection using common WordPress title selectors (entry-title, post-title, wp-block-post-title)"
  - "Multi-node chunk spans silently skipped for robustness rather than attempting complex cross-node wrapping"

patterns-established:
  - "Highlight injection: JS runtime span wrapping via TreeWalker, cleanup via replaceChild + normalize()"
  - "Auto-scroll gating: getBoundingClientRect viewport check before scrollIntoView"

requirements-completed: [ADV-01]

# Metrics
duration: 5min
completed: 2026-03-29
---

# Phase 07 Plan 03: Sentence Highlighting Summary

**Sentence-level text highlighting with TreeWalker DOM injection, theme-aware CSS color-mix, and viewport-gated auto-scroll**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-29T18:57:37Z
- **Completed:** 2026-03-29T19:02:09Z
- **Tasks:** 2/2
- **Files modified:** 5

## Accomplishments

### Task 1: enableHighlighting attribute and highlight CSS
- Added `enableHighlighting` boolean attribute (default `true`) to `block.json`
- Added `data-tts-highlight` data attribute in `render.php` via `get_block_wrapper_attributes()`
- Added `ToggleControl` in editor sidebar ("Tekst markeren tijdens afspelen")
- Added `--tts-highlight` CSS custom property using `color-mix(in srgb, var(--tts-primary) 15%, transparent)`
- Added `.tts-hl` base styles with 0.2s background-color transition
- Added `.tts-hl--active` with theme-aware highlight background
- Added `prefers-reduced-motion` override disabling highlight transition
- **Commit:** 1cc56d8

### Task 2: Highlight span injection, tracking, cleanup, auto-scroll
- Added `scrollIntoViewIfNeeded()` standalone function with `getBoundingClientRect` viewport check and `prefers-reduced-motion` respect
- Added `injectHighlightSpans()` method using `document.createTreeWalker` to walk text nodes and wrap chunk matches in `<span class="tts-hl" data-chunk="N">`
- Title chunk offset detection using selectors: `h1.entry-title`, `h1.post-title`, `article h1`, `.wp-block-post-title`
- Added `updateHighlight()` method toggling `.tts-hl--active` class on current chunk span
- Added `removeHighlightSpans()` method restoring original text via `replaceChild` + `parent.normalize()`
- Wired `injectHighlightSpans()` into `startPlayback()` and `resumeFromSavedPosition()`
- Wired `updateHighlight()` into `playNextChunk()` onstart, `skipForward()`, `skipBack()`
- Wired `removeHighlightSpans()` into `handleFinished()` and `stop()`
- Build succeeds, all 19 tests pass
- **Commit:** dbfc341

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

None -- all highlighting functionality is fully wired and functional.

## Decisions Made

1. **TreeWalker text-node walking**: Used `document.createTreeWalker(el, NodeFilter.SHOW_TEXT)` for precise chunk-to-DOM text node mapping, handling inline elements (bold, italic, links) gracefully.
2. **Title chunk offset**: Detects title text via common WordPress selectors and skips matching leading chunks to avoid highlighting the page title.
3. **Multi-node chunk skip**: When a chunk spans multiple text nodes (e.g., "bold **word** rest"), the wrapping is silently skipped rather than attempting complex multi-node DOM surgery that could corrupt the document.
