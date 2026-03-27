# Roadmap: TTS-JS

## Overview

This roadmap delivers a browser-based TTS WordPress plugin in three phases: first get the WordPress block and core speech working end-to-end, then make speech reliable and the player feature-complete, then harden for all browsers and error states. Each phase delivers a testable, coherent capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Block + Core Speech** - WordPress Gutenberg block with basic play/pause/stop and text extraction
- [ ] **Phase 2: Reliable Speech + Full Player** - Chunked speech engine, voice selection, speed control, progress, and responsive UI
- [ ] **Phase 3: Cross-Browser + Error Handling** - Works on all target browsers with graceful degradation

## Phase Details

### Phase 1: Block + Core Speech
**Goal**: Editors can place a TTS block in a post and visitors can play/pause/stop article text using browser speech
**Depends on**: Nothing (first phase)
**Requirements**: WP-01, WP-02, WP-03, WP-04, CONT-01, CONT-02, CONT-03, SPCH-01, PLAY-01, PLAY-02, PLAY-03
**Success Criteria** (what must be TRUE):
  1. Editor can add a "Listen to article" Gutenberg block to a post and configure language/speed in the sidebar
  2. Visitor sees a player with play/pause/stop controls on the published post
  3. Pressing play reads the article's headings and body text aloud using the browser's built-in speech
  4. Player script only loads on pages where the block is present (not site-wide)
  5. Non-content elements (nav, footer, sidebars) are not read aloud
**Plans**: TBD
**UI hint**: yes

### Phase 2: Reliable Speech + Full Player
**Goal**: Speech works reliably on real articles with chunking, smart voice selection, speed control, and a polished responsive player
**Depends on**: Phase 1
**Requirements**: SPCH-02, SPCH-03, SPCH-04, SPCH-05, SPCH-06, SPCH-07, PLAY-04, PLAY-05, PLAY-06, PLAY-07, PLAY-08
**Success Criteria** (what must be TRUE):
  1. A 2000-word Dutch article plays from start to finish without cutting off mid-sentence (chunking works)
  2. Player automatically selects the best available Dutch voice without user intervention
  3. User can cycle playback speed (1x/1.25x/1.5x/2x) and the change takes effect on the next sentence
  4. Player shows estimated duration, a progress bar, and visual play state (playing/paused/stopped)
  5. Player looks and works correctly on both phone-sized and desktop screens
**Plans**: TBD
**UI hint**: yes

### Phase 3: Cross-Browser + Error Handling
**Goal**: Plugin works across Chrome, Safari, Firefox, and Edge with graceful error handling on unsupported configurations
**Depends on**: Phase 2
**Requirements**: XBRW-01, XBRW-02, XBRW-03, XBRW-04, XBRW-05, ERR-01, ERR-02, ERR-03
**Success Criteria** (what must be TRUE):
  1. Article plays correctly on Chrome (desktop + Android), Safari (desktop + iOS), Firefox, and Edge
  2. On mobile, playback starts from a user tap (respects gesture requirement) without silent failures
  3. On a browser with no Web Speech API support, the player shows a friendly message instead of broken UI
  4. When no voice is available for the detected language, the player informs the user instead of failing silently
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Block + Core Speech | 0/? | Not started | - |
| 2. Reliable Speech + Full Player | 0/? | Not started | - |
| 3. Cross-Browser + Error Handling | 0/? | Not started | - |
