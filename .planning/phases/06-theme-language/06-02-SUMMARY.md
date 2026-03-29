---
phase: 06-theme-language
plan: 02
subsystem: editor
tags: [language-dropdown, speechSynthesis, getVoices, block-editor]
dependency_graph:
  requires: []
  provides: [dynamic-language-selection, className-passthrough]
  affects: [tts-js/src/tts-js/edit.js]
tech_stack:
  added: [Intl.DisplayNames]
  patterns: [useAvailableLanguages-hook, optgroup-grouping, fallback-timeout]
key_files:
  created: []
  modified: [tts-js/src/tts-js/edit.js]
decisions:
  - "D-05: Dynamic language list from speechSynthesis.getVoices() replaces hardcoded 5-option list"
  - "D-08: 10-language curated fallback list after 3s timeout (nl, en, de, fr, es, it, pt, ja, zh, ko)"
  - "D-09: className passthrough already works via get_block_wrapper_attributes() -- no changes needed"
metrics:
  duration: 1min
  completed: 2026-03-29T14:36:28Z
  tasks_completed: 2
  tasks_total: 2
  files_modified: 1
---

# Phase 06 Plan 02: Dynamic Language Dropdown Summary

Dynamic language dropdown built from speechSynthesis.getVoices() with Intl.DisplayNames for language labels, grouped by language name with optgroup, falling back to 10-language curated list after 3s timeout.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add useAvailableLanguages hook and dynamic grouped language dropdown | 4c494bd | tts-js/src/tts-js/edit.js |
| 2 | Verify className passthrough and build | (verification only) | render.php, block.json verified |

## Changes Made

### Task 1: Dynamic Language Dropdown

Added to `edit.js`:
- `FALLBACK_LANGUAGES` constant with 10 curated languages (nl, en, de, fr, es, it, pt, ja, zh, ko)
- `getLanguageName()` helper using `Intl.DisplayNames` for proper English language names
- `useAvailableLanguages()` custom hook that:
  - Tries `window.speechSynthesis` then `window.parent.speechSynthesis` (editor iframe support)
  - Processes voices into deduplicated language groups by base language code
  - Falls back to `FALLBACK_LANGUAGES` after 3s timeout
  - Cleans up event listeners and timeout on unmount
- Replaced hardcoded 5-language `SelectControl` with dynamic grouped dropdown using `<optgroup>` children
- Loading state shows disabled dropdown with "Talen laden..." help text

### Task 2: className Passthrough Verification

- Confirmed `render.php` uses `get_block_wrapper_attributes()` on line 89 (automatically includes className)
- Confirmed `block.json` does NOT contain `"customClassName": false` (enabled by default)
- Full build (`npx wp-scripts build`) completes successfully
- Compiled `style-index.css` contains `--wp--preset--color--` references from Plan 01

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

1. **D-05 implemented**: Dynamic language list from `speechSynthesis.getVoices()` replaces hardcoded 5-option SelectControl
2. **D-08 implemented**: 10-language curated fallback list (nl, en, de, fr, es, it, pt, ja, zh, ko) activates after 3s timeout or when speechSynthesis is unavailable
3. **D-09 verified**: Custom CSS class passthrough already works via `get_block_wrapper_attributes()` -- no code changes needed

## Known Stubs

None -- all functionality is fully wired.

## Verification Results

- `useAvailableLanguages` found 2 times in edit.js
- `FALLBACK_LANGUAGES` found 3 times in edit.js
- `optgroup` found 2 times in edit.js
- `getVoices` found 2 times in edit.js
- `Intl.DisplayNames` found 1 time in edit.js
- `wp-scripts build` exits with code 0
- `style-index.css` contains `--wp--preset--color--` references
- `customClassName: false` NOT found in block.json (correctly absent)

## Self-Check: PASSED

- edit.js: FOUND
- Commit 4c494bd: FOUND
- SUMMARY.md: FOUND
