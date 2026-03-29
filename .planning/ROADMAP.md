# Roadmap: TTS-JS

## Overview

This roadmap delivers a browser-based TTS WordPress plugin. Milestone v1.0 delivered the core plugin in three phases. Milestone v1.1 adds enhanced UX, quality assurance, and WordPress.org publishing readiness.

## Milestone: v1.1 — Enhanced UX & Quality

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Block + Core Speech** - WordPress Gutenberg block with basic play/pause/stop and text extraction (completed 2026-03-27)
- [x] **Phase 2: Reliable Speech + Full Player** - Chunked speech engine, voice selection, speed control, progress, and responsive UI (completed 2026-03-27)
- [x] **Phase 3: Cross-Browser + Error Handling** - Works on all target browsers with graceful degradation (completed 2026-03-27)

### v1.1 Phases

- [ ] **Phase 4: Testing & Quality Assurance** - Unit tests, linting, cross-browser verification on live site, error logging
- [ ] **Phase 5: Accessibility & Keyboard Controls** - Keyboard navigation, focus indicators, screen reader support, reduced motion
- [ ] **Phase 6: Theme Integration & Language Selection** - WordPress theme color inheritance, language dropdown in block settings, custom CSS classes
- [ ] **Phase 7: Enhanced Player Features** - Skip forward/back, remember position, sentence highlighting
- [ ] **Phase 8: Auto-Insert & WordPress.org Publishing** - Auto-insert player on all posts, voice diagnostics, screenshots, WP.org compliance

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
**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — Scaffold WordPress plugin, configure block.json, implement render.php text extraction
- [x] 01-02-PLAN.md — Editor preview with InspectorControls, Chapter42 brand CSS, state-driven styling
- [x] 01-03-PLAN.md — Frontend player state machine with speechSynthesis integration

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
**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md — Player UI markup, CSS states, progress bar, speed button, mobile responsive, editor preview
- [x] 02-02-PLAN.md — Chunked speech engine with voice resolver, speed cycling, progress tracking in view.js
- [ ] 02-03-PLAN.md — Build verification and human acceptance testing

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
**Plans:** 3/3 plans complete

Plans:
- [x] 03-01-PLAN.md — Localized error messages in render.php + error/mute-hint CSS states
- [x] 03-02-PLAN.md — Capability detection, cross-browser voice loading, error state machine in view.js
- [x] 03-03-PLAN.md — Auto-retry on failure, iOS visibility change recovery, one-time mute hint

### Phase 4: Testing & Quality Assurance
**Goal**: Plugin has unit tests, linting, documented UAT protocol, and verified cross-browser behavior on production
**Depends on**: Phase 3
**Requirements**: —
**Sources**: todos/testing-complete.md, todos/verify-all-browsers.md, todos/error-logging.md
**Plans:** 1/3 plans executed

Plans:
- [x] 04-01-PLAN.md — Extract pure functions to utils.js, write Jest unit tests for all 5 functions
- [x] 04-02-PLAN.md — WordPress lint standards, husky pre-commit hooks, debug logging via ?tts-debug=1
- [x] 04-03-PLAN.md — Manual UAT checklist for 9 browser/device combinations

### Phase 5: Accessibility & Keyboard Controls
**Goal**: Player is fully keyboard-navigable, screen reader friendly, and respects motion preferences
**Depends on**: Phase 4
**Requirements**: UX-01
**Sources**: todos/a11y-accessible.md
**Plans:** 2 plans

Plans:
- [x] 05-01-PLAN.md — Accessibility markup in render.php + focus indicators and reduced motion in style.scss
- [x] 05-02-PLAN.md — Keyboard navigation, aria-label updates, and screen reader announcements in view.js

### Phase 6: Theme Integration & Language Selection
**Goal**: Player inherits WordPress theme colors and offers a language dropdown instead of manual text input
**Depends on**: Phase 4
**Requirements**: ADV-03
**Sources**: todos/theme-colors.md, todos/all-browser-languages.md
**Plans:** 2 plans

Plans:
- [ ] 06-01-PLAN.md — Refactor CSS custom properties to WordPress theme.json color inheritance with neutral gray fallbacks
- [ ] 06-02-PLAN.md — Dynamic language dropdown from browser voices, className passthrough verification, build

### Phase 7: Enhanced Player Features
**Goal**: Users can skip between chunks, resume where they left off, and see highlighted text during playback
**Depends on**: Phase 5
**Requirements**: UX-03, UX-04, ADV-01
**Plans:** Not planned yet

### Phase 8: Auto-Insert & WordPress.org Publishing
**Goal**: Plugin can auto-insert on all posts, has voice diagnostics, and is ready for WordPress.org submission
**Depends on**: Phase 6
**Requirements**: UX-02, ADV-02
**Sources**: todos/wp-repo-compliance.md, todos/screenshot-github.md
**Plans:** Not planned yet

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 (v1.0) → 4 → 5 → 6 → 7 → 8 (v1.1)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Block + Core Speech | 3/3 | Complete | 2026-03-27 |
| 2. Reliable Speech + Full Player | 3/3 | Complete | 2026-03-27 |
| 3. Cross-Browser + Error Handling | 3/3 | Complete | 2026-03-27 |
| 4. Testing & Quality Assurance | 1/3 | In Progress|  |
| 5. Accessibility & Keyboard Controls | 0/2 | Planned | — |
| 6. Theme Integration & Language Selection | 0/2 | Planned | — |
| 7. Enhanced Player Features | 0/0 | Not planned | — |
| 8. Auto-Insert & WP.org Publishing | 0/0 | Not planned | — |
