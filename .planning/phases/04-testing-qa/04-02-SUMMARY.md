---
phase: 04-testing-qa
plan: 02
subsystem: testing
tags: [eslint, stylelint, husky, lint-staged, debug-logging, wordpress-scripts]

requires:
  - phase: 04-01
    provides: Extracted utils.js with pure functions for testability

provides:
  - Zero lint violations across all JS and SCSS source files
  - Debug logging mode activated by ?tts-debug=1 URL parameter
  - Pre-commit hook enforcing lint on staged files via husky + lint-staged

affects: [04-03, all-future-development]

tech-stack:
  added: [husky@9.1.7, lint-staged@16.4.0]
  patterns: [debug-logging-via-url-param, pre-commit-lint-enforcement, wp-scripts-lint]

key-files:
  created:
    - .husky/pre-commit
  modified:
    - tts-js/src/tts-js/view.js
    - tts-js/src/tts-js/utils.js
    - tts-js/src/tts-js/edit.js
    - tts-js/src/tts-js/style.scss
    - tts-js/package.json

key-decisions:
  - "Used /* global */ directive for browser APIs (speechSynthesis, localStorage) instead of env config"
  - "Added @wordpress/components to dependencies to fix import/no-extraneous-dependencies lint error"
  - "SpeechSynthesisVoice JSDoc typedef added to utils.js for cross-file type documentation"
  - "Husky installed at git root with prepare script: cd .. && husky"

patterns-established:
  - "Debug logging: TTS_DEBUG flag from URL params, debugLog/debugWarn functions with [TTS-JS] prefix"
  - "Lint enforcement: lint-staged runs wp-scripts lint-js --fix and lint-style --fix on staged files"

requirements-completed: []

duration: 6min
completed: 2026-03-28
---

# Phase 04 Plan 02: Linting + Debug Logging Summary

**WordPress-standard linting with zero violations, URL-activated debug logging with 7 call sites, and husky pre-commit hook enforcing lint-staged on all commits.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-28T10:34:51Z
- **Completed:** 2026-03-28T10:40:28Z
- **Tasks:** 1
- **Files modified:** 7

## Accomplishments

### Lint Compliance
- Fixed all JS lint violations across view.js, utils.js, and edit.js (prettier formatting, JSDoc alignment, curly braces, unused imports)
- Fixed all SCSS lint violations in style.scss (color hex case, string quotes, line length, empty lines)
- Added `/* global */` directive for browser APIs (speechSynthesis, SpeechSynthesisUtterance, localStorage)
- Added SpeechSynthesisVoice typedef to utils.js for JSDoc type resolution
- Added @wordpress/components to package.json dependencies

### Debug Logging
- Added `TTS_DEBUG` flag based on `?tts-debug=1` URL parameter
- Added `debugLog()` and `debugWarn()` functions with `[TTS-JS]` prefix and `eslint-disable-next-line no-console`
- 7 debug call sites covering: state transitions, voice count, selected voice, chunk statistics, chunk playback progress, speech errors, speed changes
- Zero console output when debug mode is not active

### Pre-commit Hook
- Installed husky v9.1.7 and lint-staged v16.4.0 as devDependencies
- Configured lint-staged in package.json: `*.{js,jsx}` runs `wp-scripts lint-js --fix`, `*.scss` runs `wp-scripts lint-style --fix`
- Created `.husky/pre-commit` hook that cds into tts-js/ and runs `npx lint-staged`
- Verified hook executes successfully during commit (lint-staged ran on all staged files)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing] Added @wordpress/components to dependencies**
- **Found during:** Task 1 lint step
- **Issue:** edit.js imports from @wordpress/components which was not listed in package.json dependencies, triggering import/no-extraneous-dependencies
- **Fix:** Added `"@wordpress/components": "latest"` to dependencies
- **Files modified:** tts-js/package.json
- **Commit:** d25f764

**2. [Rule 1 - Bug] Adjusted prepare script for correct husky placement**
- **Found during:** Task 1 husky setup
- **Issue:** Plan specified `"prepare": "cd .. && husky tts-js/.husky"` which would place .husky inside tts-js/ instead of at git root
- **Fix:** Used `"prepare": "cd .. && husky"` to correctly install hooks at git root
- **Files modified:** tts-js/package.json
- **Commit:** d25f764

## Commits

| Hash | Message |
|------|---------|
| d25f764 | feat(04-02): add WordPress linting, debug logging, and pre-commit hook |

## Known Stubs

None -- all functionality is fully wired and operational.

## Self-Check: PASSED
