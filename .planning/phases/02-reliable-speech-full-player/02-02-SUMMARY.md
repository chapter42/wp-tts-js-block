---
phase: 02-reliable-speech-full-player
plan: 02
subsystem: speech-engine
tags: [web-speech-api, chunking, voice-selection, speechSynthesis, vanilla-js]

# Dependency graph
requires:
  - phase: 01-block-core-speech
    provides: "Phase 1 TTSPlayer class, DOM structure, CSS state machine"
provides:
  - "Chunked speech engine defeating Chrome 15s cutoff"
  - "Three-strategy voice resolver with quality heuristic scoring"
  - "8-step speed cycling (0.8x-1.5x)"
  - "Chunk-based progress bar tracking"
  - "Remaining time display during playback"
  - "Android-safe pause via chunk-boundary hold"
affects: [03-cross-browser-error-handling]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Sentence chunking with uppercase-after-period guard for Dutch abbreviations"
    - "Voice quality heuristic: exact lang +10, quality keywords +5/-5, non-default +2"
    - "Three-strategy async voice loading (sync, onvoiceschanged, polling)"
    - "Android-safe pause via isPausePending flag at chunk boundaries"

key-files:
  created: []
  modified:
    - "tts-js/src/tts-js/view.js"

key-decisions:
  - "Chunk-boundary pause everywhere instead of speechSynthesis.pause() -- consistent Android-safe behavior"
  - "Voice cached after first resolution (D-14) -- no re-evaluation on subsequent plays"
  - "Regex sentence splitter with uppercase guard over Intl.Segmenter -- simpler, proven for Dutch"

patterns-established:
  - "splitIntoChunks: sentence regex + clause sub-splitting for >300 char sentences"
  - "pickBestVoice: scoring heuristic for voice quality ranking"
  - "resolveVoice: Promise-based three-strategy loader with cleanup"
  - "playNextChunk: onend chain with isPausePending guard"

requirements-completed: [SPCH-02, SPCH-03, SPCH-04, SPCH-05, SPCH-06, SPCH-07, PLAY-04, PLAY-05, PLAY-06, PLAY-07]

# Metrics
duration: 4min
completed: 2026-03-27
---

# Phase 02 Plan 02: Speech Engine Summary

**Chunked speech engine with sentence splitting, three-strategy Dutch voice resolver, 8-step speed cycling, chunk-based progress tracking, and Android-safe pause**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-27T16:11:38Z
- **Completed:** 2026-03-27T16:15:38Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Complete rewrite of view.js from 153 lines (single utterance) to 626 lines (production chunked engine)
- Sentence chunking at boundaries with Dutch abbreviation safety via uppercase-after-period regex guard
- Three-strategy voice resolver (sync getVoices, onvoiceschanged, polling) with 3s timeout and quality heuristic scoring
- 8-step speed cycling (0.8x-1.5x) applying to next chunk, with aria-label accessibility updates
- Chunk-based progress bar tracking with aria-valuenow updates
- Remaining time display switching to "resterend" during playback
- Android-safe pause via chunk-boundary hold (never calls speechSynthesis.pause)
- Error state with "Geen geschikte stem gevonden" when no Dutch voice available

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement sentence chunker and voice resolver helper functions** - `b74db27` (feat)

## Files Created/Modified
- `tts-js/src/tts-js/view.js` - Complete chunked speech engine with all 7 sections: constants, splitIntoChunks, pickBestVoice, resolveVoice, duration helpers, TTSPlayer class, initialization

## Decisions Made
- Chunk-boundary pause everywhere instead of speechSynthesis.pause() -- avoids Android bug where pause() acts as cancel()
- Voice cached after first resolution -- subsequent plays skip voice loading entirely
- Regex sentence splitter with uppercase guard chosen over Intl.Segmenter -- simpler and proven for Dutch text
- Error state shows Dutch message ("Geen geschikte stem gevonden") rather than falling back to other languages

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Speech engine complete with all chunking, voice, speed, and progress features
- Ready for Plan 03 (cross-browser error handling) to add resilience on top of this engine
- Build output (5.61 KiB minified) verified via `npm run build`

---
*Phase: 02-reliable-speech-full-player*
*Completed: 2026-03-27*
