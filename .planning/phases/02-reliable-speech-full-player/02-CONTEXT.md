# Phase 2: Reliable Speech + Full Player - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Make speech playback reliable on real articles (sentence chunking to avoid Chrome's 15s cutoff, smart Dutch voice selection, speed control mid-playback) and deliver a polished responsive player UI (progress bar, estimated/remaining duration, visual play state, speed cycling button, mobile responsive layout).

</domain>

<decisions>
## Implementation Decisions

### Chunking Strategy
- **D-01:** Split text at sentence boundaries (`.` `!` `?` followed by space/newline) — natural pauses, easy progress tracking
- **D-02:** Sub-split long sentences (>300 chars) at clause boundaries (commas, semicolons, dashes) to prevent Chrome timeout on run-on sentences
- **D-03:** Chain chunks seamlessly via `onend` callback — no artificial pauses between sentences

### Progress Bar & Duration
- **D-04:** Estimated duration calculated from word count / speaking rate (~150 wpm, adjusted for current speed setting)
- **D-05:** Progress bar tracks chunk-based position (completed chunks / total chunks) — jumps slightly per sentence
- **D-06:** Duration display switches to remaining time once playback starts (e.g. "~3 min" becomes "~2 min remaining")

### Speed Control UX
- **D-07:** Custom 8-step speed cycle: 0.8x → 0.9x → 1x → 1.1x → 1.2x → 1.3x → 1.4x → 1.5x (wraps back to 0.8x after 1.5x)
- **D-08:** Default speed is 1x
- **D-09:** Speed button shows multiplier text only (e.g. "1x", "1.2x", "0.8x") — compact, updates on each tap
- **D-10:** Speed changes apply to the next chunk (per SPCH-07 requirement)

### Voice Selection Logic
- **D-11:** Quality heuristic ranking: score voices by (1) exact lang match (nl-NL > nl), (2) name keywords ('enhanced', 'premium', 'neural' score higher), (3) prefer non-default voices. Pick highest score.
- **D-12:** If no Dutch voice found: disable player and show message "Geen geschikte stem gevonden" — don't fall back to other languages
- **D-13:** Async voice loading: listen for `onvoiceschanged`, poll every 100ms, give up after 3 seconds
- **D-14:** Cache selected voice after first resolution — subsequent plays reuse it instantly without re-evaluation

### Claude's Discretion
- Progress bar visual style (thin bar, color, animation) — should match Chapter42 brand from Phase 1
- Mobile responsive breakpoints and layout adjustments
- Exact voice quality keywords to score (research best known voice name patterns per browser)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/PROJECT.md` — Core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — Phase 2 requirements: SPCH-02 through SPCH-07, PLAY-04 through PLAY-08
- `.planning/ROADMAP.md` — Phase 2 success criteria and dependencies

### Phase 1 Foundation
- `.planning/phases/01-block-core-speech/CONTEXT.md` — Phase 1 decisions (brand styling, DOM walker scope, player state machine, block settings)

### Technical References
- `CLAUDE.md` §Technology Stack — Web Speech API browser compat matrix, Chrome 15s bug, Safari voice issues
- [Chrome speechSynthesis 15s timeout bug](https://issues.chromium.org/issues/41294170) — Primary motivation for chunking
- [Chrome chunking workaround gist](https://gist.github.com/woollsta/2d146f13878a301b36d7) — Reference implementation for chunk chaining
- [Cross-browser speech synthesis guide](https://dev.to/jankapunkt/cross-browser-speech-synthesis-the-hard-way-and-the-easy-way-353) — Voice loading patterns per browser

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No source code exists yet — Phase 1 has not been built

### Established Patterns
- Phase 1 CONTEXT.md establishes: dynamic block (render.php), viewScript (vanilla JS), edit.js (React/JSX), Chapter42 brand styling
- Player state machine defined in Phase 1: idle → loading → playing → paused → finished (with checkmark then reset)

### Integration Points
- Phase 2 chunking engine integrates with Phase 1's DOM walker output (extracted text array)
- Phase 2 voice selection runs at page load, feeds into Phase 1's speech synthesis calls
- Progress bar and speed button add to Phase 1's player UI (full-width, brand-styled container)
- Speed setting from block sidebar (Phase 1 D7) provides the default speed value

</code_context>

<specifics>
## Specific Ideas

- Speed range intentionally includes sub-1x speeds (0.8x, 0.9x) for accessibility / slower listening preference
- Fine-grained 0.1x increments preferred over coarse jumps — user wants precise control
- No fallback to English or other languages — if Dutch isn't available, don't play at all (clean failure)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-reliable-speech-full-player*
*Context gathered: 2026-03-27*
