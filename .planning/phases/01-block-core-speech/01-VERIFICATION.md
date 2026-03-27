---
phase: 01-block-core-speech
verified: 2026-03-27T16:00:00Z
status: passed
score: 11/11 must-haves verified
---

# Phase 1: Block + Core Speech Verification Report

**Phase Goal:** Editors can place a TTS block in a post and visitors can play/pause/stop article text using browser speech
**Verified:** 2026-03-27
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from ROADMAP Success Criteria)

| #  | Truth                                                                                                    | Status     | Evidence                                                                                    |
|----|----------------------------------------------------------------------------------------------------------|------------|---------------------------------------------------------------------------------------------|
| 1  | Editor can add a "Listen to article" Gutenberg block and configure language/speed in the sidebar        | VERIFIED   | edit.js has InspectorControls with SelectControl (lang), RangeControl (speed), TextControl (label) |
| 2  | Visitor sees a player with play/pause/stop controls on the published post                               | VERIFIED   | render.php outputs .tts-play-btn and .tts-stop-btn; style.scss fully styles both buttons   |
| 3  | Pressing play reads the article's headings and body text aloud using the browser's built-in speech      | VERIFIED   | view.js TTSPlayer reads data-tts-text via speechSynthesis.speak(); render.php extracts text |
| 4  | Player script only loads on pages where the block is present (not site-wide)                            | VERIFIED   | block.json `"viewScript": "file:./view.js"` — WordPress loads viewScript per-block only   |
| 5  | Non-content elements (nav, footer, sidebars) are not read aloud                                        | VERIFIED   | render.php uses parse_blocks($post->post_content) — only post blocks, never theme elements |

**Score:** 5/5 success criteria verified

### Plan-Level Must-Have Truths (combined across 01-01, 01-02, 01-03)

| #  | Truth                                                                                                    | Status     | Evidence                                                                                          |
|----|----------------------------------------------------------------------------------------------------------|------------|---------------------------------------------------------------------------------------------------|
| 1  | Plugin registers a Gutenberg block named tts-js/player                                                  | VERIFIED   | block.json `"name": "tts-js/player"`, index.js `registerBlockType(metadata.name, ...)`          |
| 2  | Block uses dynamic rendering via render.php (save returns null)                                         | VERIFIED   | index.js `save: () => null`; block.json `"render": "file:./render.php"`                          |
| 3  | render.php extracts headings, paragraphs, lists, and blockquotes using parse_blocks()                   | VERIFIED   | render.php lines 16-21 define allowed_blocks array; line 53 calls parse_blocks($post->post_content) |
| 4  | Non-content block types (code, captions, tables, nav, footer) are never extracted                       | VERIFIED   | render.php uses allow-list pattern; grep confirms core/code, core/table, core/preformatted absent |
| 5  | Article title from get_the_title() is prepended to extracted text                                       | VERIFIED   | render.php lines 57-60: get_the_title($post) then array_unshift($text_parts, $title)            |
| 6  | Player script only loads on pages with the block (viewScript in block.json)                             | VERIFIED   | block.json `"viewScript": "file:./view.js"` confirmed                                            |
| 7  | Editor shows a live non-playable preview of the player matching frontend styling                        | VERIFIED   | edit.js renders same HTML structure with disabled buttons and tts-player--preview class           |
| 8  | Sidebar has language dropdown, speed slider, and label text field                                       | VERIFIED   | edit.js: SelectControl (Taal), RangeControl (Snelheid 0.5-2 step 0.25), TextControl (Label)     |
| 9  | CSS drives visual state changes via data-tts-state attribute selectors                                  | VERIFIED   | style.scss has selectors for idle/loading/playing/paused/finished states (9 occurrences)          |
| 10 | Pressing play starts article text via speechSynthesis, play while playing pauses, stop resets to idle  | VERIFIED   | view.js TTSPlayer.togglePlay() state machine + speechSynthesis.speak/pause/resume/cancel         |
| 11 | Player state tracked internally (not relying on speechSynthesis.speaking/paused)                       | VERIFIED   | grep confirms speechSynthesis.speaking/paused not used as conditions in view.js                   |

**Score:** 11/11 must-have truths verified

---

### Required Artifacts

| Artifact                                | Expected                                      | Status     | Details                                              |
|-----------------------------------------|-----------------------------------------------|------------|------------------------------------------------------|
| `tts-js/src/tts-js/block.json`          | Block metadata with attributes, viewScript    | VERIFIED   | All 3 attributes present; render + viewScript wired  |
| `tts-js/src/tts-js/index.js`            | Block registration with save() = null         | VERIFIED   | registerBlockType + save: () => null                 |
| `tts-js/src/tts-js/render.php`          | parse_blocks() extraction + player HTML       | VERIFIED   | 99 lines; full implementation                        |
| `tts-js/tts-js.php`                     | Plugin bootstrap with register_block_type     | VERIFIED   | Points to build/tts-js (adapted for create-block v4.85 nesting) |
| `tts-js/src/tts-js/edit.js`             | InspectorControls + live preview              | VERIFIED   | 66 lines; full implementation (not placeholder)      |
| `tts-js/src/tts-js/style.scss`          | Chapter42 brand CSS + state selectors         | VERIFIED   | 159 lines; --tts-primary, --tts-dark, --tts-light present |
| `tts-js/src/tts-js/editor.scss`         | Editor-only preview styles                    | VERIFIED   | tts-player--preview with opacity: 0.8                |
| `tts-js/src/tts-js/view.js`             | TTSPlayer state machine + speechSynthesis     | VERIFIED   | 152 lines; full implementation (min_lines: 80 met)   |
| `tts-js/build/tts-js/`                  | Compiled build output                         | VERIFIED   | block.json, index.js, view.js, style-index.css present |

---

### Key Link Verification

| From                        | To                          | Via                                      | Status     | Details                                                        |
|-----------------------------|-----------------------------|------------------------------------------|------------|----------------------------------------------------------------|
| `block.json`                | `render.php`                | `"render": "file:./render.php"`          | WIRED      | Confirmed in block.json line 33                                |
| `tts-js.php`                | `build/tts-js/`             | `register_block_type`                    | WIRED      | `register_block_type(__DIR__ . '/build/tts-js')` line 19      |
| `edit.js`                   | `block.json` attributes     | `setAttributes({ lang/speed/label })`    | WIRED      | All 3 setAttributes calls confirmed lines 35, 40, 48          |
| `style.scss`                | `render.php` HTML structure | `[data-tts-state]` CSS selectors         | WIRED      | 9 data-tts-state selectors; matches render.php HTML classes    |
| `view.js`                   | `render.php` data attrs     | `container.dataset.ttsText/Lang/Speed`   | WIRED      | Lines 19-21 read all 3 data attributes                         |
| `view.js`                   | `style.scss` state machine  | `container.dataset.ttsState = newState`  | WIRED      | Line 40 sets ttsState; CSS selectors respond                   |

---

### Data-Flow Trace (Level 4)

| Artifact     | Data Variable | Source                          | Produces Real Data     | Status   |
|--------------|---------------|---------------------------------|------------------------|----------|
| `render.php` | $text_parts   | parse_blocks($post->post_content) | Yes — WordPress DB query via WP API | FLOWING |
| `view.js`    | this.text     | container.dataset.ttsText (from render.php) | Yes — populated from PHP | FLOWING |
| `edit.js`    | label         | attributes.label (block.json default) | Yes — WordPress block attributes | FLOWING |

Note: render.php runs server-side on each page request; data-tts-text is populated with real extracted content, not static placeholder values.

---

### Behavioral Spot-Checks

Step 7b: Behavioral spot-checks are SKIPPED for the browser-side player logic (speechSynthesis is a browser API, cannot be invoked in shell). The build output existence and content is verified as a proxy.

| Behavior                                    | Command                                   | Result                                    | Status  |
|---------------------------------------------|-------------------------------------------|-------------------------------------------|---------|
| Build succeeds, view.js not a placeholder   | head -1 build/tts-js/view.js              | Minified TTSPlayer class found            | PASS    |
| build/tts-js/ contains all required files   | ls build/tts-js/                          | block.json, view.js, index.js, CSS files  | PASS    |
| block.json has viewScript + render fields   | grep viewScript/render build/tts-js/block.json | Both fields confirmed                | PASS    |

---

### Requirements Coverage

| Requirement | Source Plan | Description                                                              | Status    | Evidence                                                        |
|-------------|-------------|--------------------------------------------------------------------------|-----------|-----------------------------------------------------------------|
| WP-01       | 01-01       | Plugin registers as a Gutenberg block editors can place in posts/pages   | SATISFIED | block.json name: tts-js/player; tts-js.php register_block_type |
| WP-02       | 01-01       | Block uses dynamic rendering (render.php, not static save())             | SATISFIED | save: () => null; block.json render: file:./render.php          |
| WP-03       | 01-02       | Block sidebar allows setting language and default speed                  | SATISFIED | edit.js InspectorControls with SelectControl and RangeControl   |
| WP-04       | 01-01       | Player script loads only on pages where the block is used                | SATISFIED | block.json viewScript field (WordPress per-block loading)       |
| CONT-01     | 01-01       | Plugin extracts headings (h1-h6) and body text (paragraphs)              | SATISFIED | render.php allowed_blocks includes core/heading, core/paragraph |
| CONT-02     | 01-01       | Non-content elements (nav, footer, ads, sidebars) are excluded           | SATISFIED | parse_blocks($post->post_content) scope-limits to post blocks only |
| CONT-03     | 01-01       | Extracted text is passed to speech engine in reading order               | SATISFIED | $text_parts array preserves document order; data-tts-text attribute |
| SPCH-01     | 01-03       | Text-to-speech uses the browser's Web Speech API (no external API)       | SATISFIED | view.js uses speechSynthesis (native browser API), no external calls |
| PLAY-01     | 01-03       | User can start article playback by pressing a play button                | SATISFIED | view.js togglePlay() -> startPlayback() -> speechSynthesis.speak() |
| PLAY-02     | 01-03       | User can pause and resume playback                                       | SATISFIED | view.js pause() -> speechSynthesis.pause(); resume() -> speechSynthesis.resume() |
| PLAY-03     | 01-03       | User can stop playback and reset to the beginning                        | SATISFIED | view.js stop() -> speechSynthesis.cancel() -> setState(IDLE)    |

**Coverage: 11/11 Phase 1 requirements satisfied**

**Orphaned requirements check:** No requirements mapped to Phase 1 in REQUIREMENTS.md traceability table are missing from the plans. All 11 are accounted for across plans 01-01, 01-02, 01-03.

---

### Anti-Patterns Found

| File                   | Line | Pattern                             | Severity | Impact                                                           |
|------------------------|------|-------------------------------------|----------|------------------------------------------------------------------|
| `tts-js/src/tts-js/edit.js` | 59 | `~3 min` hardcoded duration     | Info     | Expected and documented — actual duration is computed server-side in render.php at render time |

No blocking or warning-level anti-patterns found. The hardcoded "~3 min" in edit.js is an intentional editor-preview placeholder (documented in SUMMARY 01-02), not a stub — the actual value comes from render.php's $reading_minutes calculation which uses str_word_count() on real content.

---

### Human Verification Required

The following behaviors require a running WordPress install with the plugin active:

**1. Editor Block Placement**
- **Test:** Open a post in the Gutenberg editor, add the "Listen to Article" block from the widget category
- **Expected:** Block appears with the player preview (play button, label text, stop button); sidebar shows "Player instellingen" panel with Taal dropdown, Snelheid slider, Label field
- **Why human:** Block editor UI rendering cannot be verified via file inspection

**2. Live Label Binding**
- **Test:** Change the Label field in the sidebar; observe the preview
- **Expected:** The tts-label text in the preview updates in real-time as you type
- **Why human:** React state reactivity requires a running editor

**3. Frontend Playback**
- **Test:** Publish a post with the block; visit the published URL; click the play button
- **Expected:** Brief loading spinner, then the article text (starting with title) is read aloud in Dutch; play button changes to pause icon; stop button becomes visible
- **Why human:** speechSynthesis requires a browser with audio output

**4. Pause/Resume Cycle**
- **Test:** During playback, click play again; then click play again
- **Expected:** First click pauses (play icon returns); second click resumes (pause icon shows again)
- **Why human:** speechSynthesis state changes require live browser testing

**5. Stop and Reset**
- **Test:** During playback, click the stop button
- **Expected:** Speech stops immediately; player returns to idle state (play icon, stop button hidden)
- **Why human:** Requires live browser + audio

---

### Gaps Summary

No gaps found. All 11 must-have truths are verified at all four levels:
- Level 1 (exists): All artifacts present on disk
- Level 2 (substantive): No stubs — edit.js (66 lines), view.js (152 lines), render.php (99 lines) are complete implementations
- Level 3 (wired): All key links confirmed — block.json -> render.php, view.js -> data attributes, edit.js -> setAttributes, style.scss -> data-tts-state
- Level 4 (data flows): render.php populates data-tts-text from real post content; view.js reads it; no hardcoded empty values in the data path

The one known deviation from the plans (nested src/tts-js/ directory from create-block v4.85 vs. expected src/) was properly auto-fixed: tts-js.php points to build/tts-js (not build/), and build output confirms the correct location.

---

_Verified: 2026-03-27_
_Verifier: Claude (gsd-verifier)_
