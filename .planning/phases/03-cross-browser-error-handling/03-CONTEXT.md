# Phase 3: Cross-Browser + Error Handling - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the TTS player work reliably across Chrome (desktop + Android), Safari (desktop + iOS), Firefox, and Edge with graceful error handling when the Web Speech API or a matching voice is unavailable. This phase does NOT add new player features — it hardens what Phase 1 and 2 built.

</domain>

<decisions>
## Implementation Decisions

### Degradation Strategy
- **D-01:** When the browser has NO Web Speech API at all, hide the player completely — visitor never sees it.
- **D-02:** When the API exists but no voice is available for the configured language, show an inline message in the player area (e.g. "Geen stem beschikbaar voor Nederlands").
- **D-03:** If speech fails mid-playback (engine error, iOS tab background), auto-retry once from where it stopped. If retry also fails, show a brief error message and reset to idle.

### Error Messages & UX
- **D-04:** Error message language matches the block's language setting (nl-NL → Dutch errors, en-US → English errors). Not hardcoded Dutch.
- **D-05:** Error messages appear inline within the player area, replacing the controls. No popups, toasts, or external elements.
- **D-06:** Error tone is friendly and brief — no technical jargon. Example: "Voorlezen is niet beschikbaar in deze browser."

### iOS Safari Edge Cases
- **D-07:** On iOS background tab (visibilitychange event): auto-retry from where speech stopped when tab returns to foreground. Ties into D-03 auto-retry behavior.
- **D-08:** Silent/mute switch: show a one-time hint on first play — "Geen geluid? Controleer of je telefoon niet op stil staat." Do not try to detect the switch programmatically.
- **D-09:** iOS voice availability: use best available voice. If no Dutch voice exists at all, trigger the "no voice" message (D-02). No extended wait/timeout for iOS specifically.

### Detection Approach
- **D-10:** Use feature detection only — check `'speechSynthesis' in window` and `getVoices()` results. No user-agent sniffing.
- **D-11:** API check only — no silent test utterance. Check API presence and voice list, don't try to speak at volume 0.
- **D-12:** Capability check runs on first play click, not on page load. Player always renders initially; if no support, show inline error on first interaction.

### Claude's Discretion
- Specific error message copy per language (exact wording for each error state)
- How to detect "first play ever" for the iOS silent switch hint (localStorage flag vs. session flag)
- Exact visibilitychange handling implementation details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/PROJECT.md` — Project vision, constraints, tech stack decisions
- `.planning/REQUIREMENTS.md` — Full v1 requirements; Phase 3 covers XBRW-01..05 and ERR-01..03
- `.planning/ROADMAP.md` — Phase 3 success criteria and dependency on Phase 2

### Prior Phase Context
- `.planning/phases/01-block-core-speech/CONTEXT.md` — Player styling (Chapter42 brand), state machine (idle→loading→playing→paused→stopped/finished), DOM walker scope, Dutch labels, editor preview decisions

### External References
- [SpeechSynthesis on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) — API reference
- [Chrome speechSynthesis 15s timeout bug](https://issues.chromium.org/issues/41294170) — Chunking workaround context (Phase 2)
- [Safari speech synthesis issues](https://weboutloud.io/bulletin/speech_synthesis_in_safari/) — Safari-specific quirks
- [iOS Safari TTS issues](https://developer.apple.com/forums/thread/49875) — iOS edge cases
- [Cross-browser speech synthesis guide](https://dev.to/jankapunkt/cross-browser-speech-synthesis-the-hard-way-and-the-easy-way-353) — Multi-browser patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No source code exists yet — Phase 1 and 2 will create the player, speech engine, and block infrastructure that Phase 3 hardens.

### Established Patterns
- Phase 1 defines the player state machine (idle → loading → playing → paused → stopped/finished) — Phase 3 adds error states to this machine.
- Phase 2 builds chunked speech with onend chaining — Phase 3's auto-retry hooks into the chunk chain.

### Integration Points
- Player viewScript (vanilla JS) — all cross-browser detection and error handling lives here
- render.php — may need data attributes for error message strings per language
- Block attributes — language setting drives error message language (D-04)

</code_context>

<specifics>
## Specific Ideas

- iOS silent switch hint is a one-time display — should not keep appearing on every visit
- Auto-retry on mid-playback failure should be invisible to the user (no flash/reset visible) if the retry succeeds
- "Hide completely" for no API means the player container should not output any DOM — not just `display: none`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-cross-browser-error-handling*
*Context gathered: 2026-03-27*
