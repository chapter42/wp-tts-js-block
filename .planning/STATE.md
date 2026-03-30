---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: — Enhanced UX & Quality
status: executing
stopped_at: Completed 09-01-PLAN.md
last_updated: "2026-03-30T20:32:09.312Z"
last_activity: 2026-03-30
progress:
  total_phases: 9
  completed_phases: 7
  total_plans: 25
  completed_plans: 22
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-27)

**Core value:** Bezoekers van chapter42.com kunnen artikelen beluisteren via een native browser TTS player, zonder externe services of kosten.
**Current focus:** Phase 09 — sticky-bottom-player

## Current Position

Phase: 09 (sticky-bottom-player) — EXECUTING
Plan: 2 of 3
Status: Ready to execute
Last activity: 2026-03-30

Progress: [..........] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 4
- Average duration: 3.5min
- Total execution time: ~14 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 3 | 12min | 4min |
| 02 | 1 | 5min | 5min |

**Recent Trend:**

- Last 5 plans: 8min, 2min, 2min, 5min
- Trend: stable

*Updated after each plan completion*
| Phase 01 P01 | 8min | 2 tasks | 12 files |
| Phase 01 P02 | 2min | 2 tasks | 3 files |
| Phase 01 P03 | 2min | 1 tasks | 1 files |
| Phase 02 P01 | 5min | 3 tasks | 4 files |
| Phase 02 P02 | 4min | 1 tasks | 1 files |
| Phase 03 P02 | 2min | 1 tasks | 1 files |
| Phase 03 P03 | 2min | 1 tasks | 1 files |
| Phase 04 P01 | 3min | 2 tasks | 4 files |
| Phase 04 P02 | 6min | 1 tasks | 7 files |
| Phase 05 P01 | 2min | 2 tasks | 2 files |
| Phase 05 P02 | 2min | 2 tasks | 1 files |
| Phase 06 P01 | 1min | 1 tasks | 1 files |
| Phase 06 P02 | 1min | 2 tasks | 1 files |
| Phase 07 P01 | 3min | 2 tasks | 4 files |
| Phase 07 P02 | 5min | 2 tasks | 3 files |
| Phase 07 P03 | 5min | 2 tasks | 5 files |
| Phase 08 P01 | 1min | 1 tasks | 1 files |
| Phase 08 P02 | 1min | 1 tasks | 1 files |
| Phase 08 P03 | 4min | 4 tasks | 8 files |
| Phase 09 P01 | 3min | 2 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: 3-phase coarse structure chosen -- Foundation, then reliability + polish, then cross-browser hardening
- [Research]: Chrome 15s speech cutoff requires sentence-level chunking from Phase 2 onward
- [Research]: Dynamic block with render.php chosen over static save() -- avoids block validation errors
- [Phase 01]: Used register_block_type() for WP 6.5+ compat instead of wp_register_block_types_from_metadata_collection()
- [Phase 01]: Adapted to create-block v4.85 nested src/tts-js/ directory structure
- [Phase 01]: CSS state machine: data-tts-state attribute on container drives icon/button visibility via CSS selectors
- [Phase 01]: Internal state tracking over speechSynthesis.speaking/paused -- browser implementations unreliable
- [Phase 01]: Single utterance Phase 1 -- no chunking, accepting Chrome 15s cutoff
- [Phase 02]: Chunk-boundary pause everywhere instead of speechSynthesis.pause() -- Android-safe
- [Phase 02]: Voice cached after first resolution (D-14) -- no re-evaluation on subsequent plays
- [Phase 02]: Gap updated 12px->8px, padding 16px 20px->16px 24px per UI-SPEC Phase 2 layout
- [Phase 03]: selectedVoice from checkCapabilities() takes priority over resolvedVoice in playNextChunk()
- [Phase 03]: retryPlayback() resumes from lastChunkIndex using existing chunked playback
- [Phase 04]: Extracted 5 pure functions + 9 constants to utils.js for testability without DOM/speechSynthesis mocking
- [Phase 04]: Used /* global */ directive for browser APIs + SpeechSynthesisVoice JSDoc typedef for lint compliance
- [Phase 05]: Used outline instead of box-shadow for focus indicators (Windows High Contrast Mode safe)
- [Phase 05]: Used ownerDocument.activeElement instead of document.activeElement per WordPress lint rule
- [Phase 06]: Scoped CSS vars to .wp-block-tts-js-player; nested var() fallback chain for theme.json slug compatibility; color-mix() for all derived colors
- [Phase 06]: D-05: Dynamic language list from speechSynthesis.getVoices() replaces hardcoded 5-option list
- [Phase 06]: D-08: 10-language curated fallback after 3s timeout
- [Phase 07]: Skip buttons flank play button with boundary clamping and speechSynthesis.cancel() for clean chunk transitions
- [Phase 07]: Safe localStorage wrappers for Safari private browsing; pathname-scoped position keys with 7-day expiry
- [Phase 07]: TreeWalker text-node walking for highlight injection; title chunk offset via WordPress selectors; multi-node spans silently skipped for robustness
- [Phase 08]: Used array_unshift to merge TTS block with existing post type template (defensive against other plugins)
- [Phase 08]: D-08/D-11: Voice Diagnostics panel in InspectorControls with voice list and Test Voice button; no quality tier indicator
- [Phase 08]: wp_kses with $allowed_svg array for SVG escaping (standard WP PCP pattern)
- [Phase 09]: Bar HTML rendered outside block wrapper as standalone fixed element with static render guard
- [Phase 09]: Separate data-tts-bar-state attribute for bar icon machine independent from inline data-tts-state

### Roadmap Evolution

- Milestone v1.1 created: Enhanced UX & Quality (2026-03-27)
- Phase 4 added: Testing & Quality Assurance (first — testfundament voor nieuwe features)
- Phase 5 added: Accessibility & Keyboard Controls
- Phase 6 added: Theme Integration & Language Selection
- Phase 7 added: Enhanced Player Features
- Phase 8 added: Auto-Insert & WordPress.org Publishing
- Phase 9 added: Sticky Bottom Player (LinkedIn-style persistent audio bar)

### Pending Todos

None yet.

### Blockers/Concerns

- Dutch voice quality varies significantly across browser/OS combinations (research gap)
- iOS Safari silent switch has no reliable detection method

## Session Continuity

Last session: 2026-03-30T20:32:09.308Z
Stopped at: Completed 09-01-PLAN.md
Resume file: None
