# Research Summary: TTS-JS

**Domain:** Browser-based Text-to-Speech WordPress Plugin
**Researched:** 2026-03-27
**Overall confidence:** HIGH

## Executive Summary

Building a browser-based TTS WordPress plugin is well-supported by the current ecosystem. The Web Speech API's `speechSynthesis` interface has broad browser support (~75/100 compatibility score) and requires zero server infrastructure. WordPress's block development tooling (@wordpress/create-block, @wordpress/scripts) provides a zero-config build pipeline that handles the entire development workflow.

The recommended architecture is a dynamic WordPress block using `render.php` for server-side HTML generation and vanilla JavaScript (`viewScript`) for the frontend player logic. The WordPress Interactivity API was explicitly evaluated and rejected -- speechSynthesis is fundamentally imperative (speak/pause/resume/cancel), not reactive, and the player UI is too simple to warrant Preact/signals overhead.

The single most critical technical challenge is Chrome's ~15-second speech cutoff bug on long utterances. This is a long-standing Chromium issue that silently cancels speech without firing an error event. Text chunking at sentence boundaries is the proven workaround and must be implemented from day one -- without it, the plugin is broken for any real article. Secondary challenges include async voice loading (Safari/Firefox), iOS Safari's silent switch behavior, and variable Dutch voice quality across browser/OS combinations.

The project's competitive advantage is clear: zero configuration, zero cost, zero external dependencies. Existing solutions (Trinity Audio, BeyondWords, AtlasVoice) are paid SaaS products. Browser extensions (Read Aloud) struggle with content extraction. This plugin leverages WordPress's Gutenberg block context for clean article text extraction -- a structural advantage.

## Key Findings

**Stack:** WordPress Block API v3 + @wordpress/scripts + vanilla JS frontend + Web Speech API. No frameworks on frontend.
**Architecture:** Dynamic block (render.php + viewScript), PHP text extraction, JS utterance queue with chunking.
**Critical pitfall:** Chrome silently kills speech after ~15s. Must chunk text from the start.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Foundation -- Block scaffold + basic TTS** - Get the WordPress block structure right first. Scaffold with create-block, implement dynamic block with render.php, get basic speechSynthesis.speak() working.
   - Addresses: Block registration, text extraction, basic playback
   - Avoids: Static block save() trap (Pitfall #4)

2. **Reliability -- Chunking + voice selection** - Make it work on real articles across browsers. This is where the hard problems live.
   - Addresses: Chrome 15s bug, async voice loading, Dutch voice selection, pause/resume
   - Avoids: Single-utterance approach (Pitfall #1), sync getVoices() (Pitfall #2)

3. **Polish -- UI, speed, progress, mobile** - Make it look and feel like the Google Blog player inspiration.
   - Addresses: Speed control, estimated duration, progress indication, responsive design
   - Avoids: Over-engineering UI before core TTS works

4. **Hardening -- Cross-browser, edge cases** - Handle the long tail of browser quirks and edge cases.
   - Addresses: iOS Safari issues, Firefox quirks, multiple players on page, error states
   - Avoids: iOS silent mode surprise (Pitfall #3)

**Phase ordering rationale:**
- Phase 1 before 2: need working block structure before adding speech complexity
- Phase 2 before 3: chunking is required for Chrome; UI polish on broken speech is wasted effort
- Phase 3 before 4: polish core experience before handling edge cases
- Phase 2 is the riskiest phase (cross-browser speech APIs are notoriously inconsistent)

**Research flags for phases:**
- Phase 2: Likely needs deeper research -- Chrome chunking behavior, pause/resume quirks per browser, Dutch voice ranking
- Phase 4: Likely needs deeper research -- iOS Safari testing on physical devices, Firefox TTS engine variations
- Phase 1, 3: Standard patterns, unlikely to need additional research

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | @wordpress/create-block and wp-scripts are the uncontested standard; Web Speech API is well-documented |
| Features | HIGH | Table stakes are clear from competitor analysis; differentiators well-understood |
| Architecture | HIGH | Dynamic block + viewScript is standard WordPress pattern; text chunking is proven approach |
| Pitfalls | HIGH | Chrome 15s bug is extensively documented; iOS issues confirmed in Apple forums; voice loading quirks are well-known |

## Gaps to Address

- **Dutch voice quality ranking:** Need to test actual voice names and quality across Chrome/Safari/Firefox/Edge on macOS, Windows, iOS, and Android. Training data suggests some voice names but real-world testing is needed.
- **iOS Safari silent switch detection:** No reliable way to detect if the silent switch is on. May need to use a heuristic (timeout after speak() with no boundary events).
- **Very long articles (10K+ words):** Data attribute approach for text may hit limits. May need `<script type="application/json">` fallback. Needs testing.
- **WordPress theme compatibility:** Player styling may conflict with aggressive theme CSS. Need to test with popular Dutch WordPress themes.
