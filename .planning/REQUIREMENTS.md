# Requirements: TTS-JS

**Defined:** 2026-03-27
**Core Value:** Bezoekers van chapter42.com kunnen artikelen beluisteren via een native browser TTS player, zonder externe services of kosten.

## v1 Requirements

### Player UI

- [x] **PLAY-01**: User can start article playback by pressing a play button
- [x] **PLAY-02**: User can pause and resume playback
- [x] **PLAY-03**: User can stop playback and reset to the beginning
- [x] **PLAY-04**: Player shows estimated reading duration (e.g. "~3 min") based on word count
- [x] **PLAY-05**: Player shows a progress bar indicating position in the article
- [x] **PLAY-06**: User can cycle playback speed (1x, 1.25x, 1.5x, 2x)
- [x] **PLAY-07**: Player displays current play state visually (playing, paused, stopped)
- [x] **PLAY-08**: Player is mobile responsive (works on phone and desktop screens)

### Speech Engine

- [x] **SPCH-01**: Text-to-speech uses the browser's Web Speech API (no external API)
- [x] **SPCH-02**: Article text is chunked at sentence boundaries to prevent Chrome's 15s cutoff
- [x] **SPCH-03**: Chunks are chained via onend callbacks for seamless playback
- [x] **SPCH-04**: Language is auto-detected from the page/block setting (default: nl-NL)
- [x] **SPCH-05**: Best available voice is auto-selected per browser/OS with smart ranking
- [x] **SPCH-06**: Async voice loading is handled (Chrome onvoiceschanged, Safari/Firefox patterns)
- [x] **SPCH-07**: Speed changes apply immediately to subsequent chunks

### Content Extraction

- [x] **CONT-01**: Plugin extracts headings (h1-h6) and body text (paragraphs) from the article
- [x] **CONT-02**: Non-content elements (nav, footer, ads, sidebars) are excluded
- [x] **CONT-03**: Extracted text is passed to the speech engine in reading order

### WordPress Integration

- [x] **WP-01**: Plugin registers as a Gutenberg block that editors can place in posts/pages
- [x] **WP-02**: Block uses dynamic rendering (render.php, not static save())
- [x] **WP-03**: Block sidebar (InspectorControls) allows setting language and default speed
- [x] **WP-04**: Player script loads only on pages where the block is used (no global script loading)

### Error Handling

- [x] **ERR-01**: Player shows friendly message when browser doesn't support Web Speech API
- [x] **ERR-02**: Player shows message when no voice is available for the detected language
- [x] **ERR-03**: Player hides gracefully rather than showing broken UI on unsupported browsers

### Cross-Browser

- [x] **XBRW-01**: Works on Chrome desktop and Android
- [x] **XBRW-02**: Works on Safari desktop and iOS Safari
- [x] **XBRW-03**: Works on Firefox desktop
- [x] **XBRW-04**: Works on Edge desktop
- [x] **XBRW-05**: Respects mobile user gesture requirement (speak() in click handler)

## v2 Requirements

### Enhanced UX

- **UX-01**: Keyboard accessibility (Space/Enter to play/pause when focused)
- **UX-02**: Auto-insert option (automatically add player to all posts without manual block placement)
- **UX-03**: Skip forward/back by chunk (sentence-level navigation)
- **UX-04**: Remember playback position across page reloads (localStorage)

### Advanced Features

- **ADV-01**: Sentence-level text highlighting during playback
- **ADV-02**: Voice quality diagnostics in block settings (show available voices + quality tier)
- **ADV-03**: Custom CSS class support for theme integration

## Out of Scope

| Feature | Reason |
|---------|--------|
| Voice selection dropdown | UI complexity, voices vary per browser — auto-select is better UX |
| Audio export/download to MP3 | Web Speech API is real-time only; different product category |
| Floating/sticky player | CSS complexity, z-index conflicts with themes; player stays in-block |
| Cloud/AI voice fallback | Defeats core value (free, no API keys, privacy-first) |
| Word-level text highlighting | Boundary events unreliable on Android/Safari; too fragile |
| Podcast feed / RSS generation | Massive scope creep; different product |
| Analytics / listener tracking | Unnecessary for personal blog; requires server-side component |
| Volume control | Browser/OS already handles volume |
| Settings page in wp-admin | Block sidebar settings are sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PLAY-01 | Phase 1 | Complete |
| PLAY-02 | Phase 1 | Complete |
| PLAY-03 | Phase 1 | Complete |
| PLAY-04 | Phase 2 | Complete |
| PLAY-05 | Phase 2 | Complete |
| PLAY-06 | Phase 2 | Complete |
| PLAY-07 | Phase 2 | Complete |
| PLAY-08 | Phase 2 | Complete |
| SPCH-01 | Phase 1 | Complete |
| SPCH-02 | Phase 2 | Complete |
| SPCH-03 | Phase 2 | Complete |
| SPCH-04 | Phase 2 | Complete |
| SPCH-05 | Phase 2 | Complete |
| SPCH-06 | Phase 2 | Complete |
| SPCH-07 | Phase 2 | Complete |
| CONT-01 | Phase 1 | Complete |
| CONT-02 | Phase 1 | Complete |
| CONT-03 | Phase 1 | Complete |
| WP-01 | Phase 1 | Complete |
| WP-02 | Phase 1 | Complete |
| WP-03 | Phase 1 | Complete |
| WP-04 | Phase 1 | Complete |
| ERR-01 | Phase 3 | Complete |
| ERR-02 | Phase 3 | Complete |
| ERR-03 | Phase 3 | Complete |
| XBRW-01 | Phase 3 | Complete |
| XBRW-02 | Phase 3 | Complete |
| XBRW-03 | Phase 3 | Complete |
| XBRW-04 | Phase 3 | Complete |
| XBRW-05 | Phase 3 | Complete |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0

---
*Requirements defined: 2026-03-27*
*Last updated: 2026-03-27 after roadmap creation*
