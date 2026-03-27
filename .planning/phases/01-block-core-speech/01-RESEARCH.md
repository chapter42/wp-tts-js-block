# Phase 1: Block + Core Speech - Research

**Researched:** 2026-03-27
**Domain:** WordPress Gutenberg Block + Web Speech API
**Confidence:** HIGH

## Summary

Phase 1 scaffolds a WordPress Gutenberg block plugin using `@wordpress/create-block`, implements a dynamic block with `render.php` that extracts article text server-side, and wires up a vanilla JS frontend player that uses the browser's `speechSynthesis` API for play/pause/stop. The block displays a live (non-playable) preview in the editor with InspectorControls for language, speed, and label settings.

The architecture is well-established: dynamic block with `save() { return null }`, server-side text extraction via `parse_blocks()` to pull only the desired elements (headings, paragraphs, lists, blockquotes), and a viewScript that only loads on pages where the block is present. The Chapter42 brand uses a distinctive palette (navy #002D49, red #FF3349, lime #d3fc51, beige #F3EDE2) with Lovechild (headings) and Poppins (body) fonts.

Text extraction in PHP using `parse_blocks()` is the recommended approach over DOM traversal in JavaScript. WordPress content is already block-structured, so filtering by block name (`core/heading`, `core/paragraph`, `core/list`, `core/quote`) is cleaner and more reliable than DOMDocument or regex. The extracted text is passed to the frontend via a data attribute or inline JSON script tag.

**Primary recommendation:** Scaffold with `@wordpress/create-block`, use `parse_blocks()` for selective text extraction in `render.php`, implement a state-machine-driven vanilla JS player with `speechSynthesis`, and style with Chapter42 brand CSS custom properties.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D1:** Chapter42 brand colors and fonts as basis for player styling
- **D2:** Dutch UI labels ("Luister naar artikel", "~3 min") -- hardcoded NL in v1
- **D3:** Full-width player (width: 100% within content container)
- **D4:** Read: h1 (title), h2-h6 (subheadings), paragraphs (p), lists (ul/ol), blockquotes
- **D5:** Skip: code blocks (pre/code), captions/figcaption, tables (table)
- **D6:** Live preview of player in Gutenberg editor (non-playable)
- **D7:** Block sidebar settings: lang (default nl-NL), speed (default 1.0), label (default "Luister naar artikel"). Content selector deferred to v2.
- **D8:** Play start shows brief loading state while text extracted and voice loaded
- **D9:** End of playback shows checkmark, then resets to idle after ~3 seconds

### Claude's Discretion
None specified -- all decisions locked.

### Deferred Ideas (OUT OF SCOPE)
- Content selector in block settings (deferred to v2)
- i18n/multilingual labels (deferred to v2)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WP-01 | Plugin registers as a Gutenberg block that editors can place in posts/pages | `@wordpress/create-block` scaffolding; `registerBlockType()` in `index.js`; `block.json` metadata |
| WP-02 | Block uses dynamic rendering (render.php, not static save()) | `render` field in `block.json`; `save() { return null }`; `render.php` with `$attributes`, `$content`, `$block` variables |
| WP-03 | Block sidebar (InspectorControls) allows setting language and default speed | `@wordpress/block-editor` InspectorControls; `@wordpress/components` SelectControl, TextControl; block attributes in `block.json` |
| WP-04 | Player script loads only on pages where the block is used | `viewScript` field in `block.json` -- WordPress only enqueues when block is present |
| CONT-01 | Plugin extracts headings (h1-h6) and body text (paragraphs) from the article | `parse_blocks()` filtering by `core/heading`, `core/paragraph`, `core/list`, `core/quote` block names |
| CONT-02 | Non-content elements (nav, footer, ads, sidebars) are excluded | Server-side extraction via `parse_blocks()` operates only on post content, never touches theme chrome |
| CONT-03 | Extracted text is passed to the speech engine in reading order | `parse_blocks()` returns blocks in document order; concatenate `innerHTML` text in sequence |
| SPCH-01 | Text-to-speech uses the browser's Web Speech API (no external API) | `speechSynthesis.speak()` with `SpeechSynthesisUtterance`; zero dependencies |
| PLAY-01 | User can start article playback by pressing a play button | Player UI with play button; `speechSynthesis.speak()` on click; user gesture satisfies mobile requirements |
| PLAY-02 | User can pause and resume playback | `speechSynthesis.pause()` / `speechSynthesis.resume()`; internal state tracking (don't trust `.speaking`/`.paused` properties) |
| PLAY-03 | User can stop playback and reset to the beginning | `speechSynthesis.cancel()`; reset chunk index to 0; return to idle state |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- GSD workflow enforcement: do not make direct repo edits outside a GSD workflow unless user explicitly asks to bypass
- No developer profile configured yet
- No conventions established yet -- will populate as patterns emerge

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @wordpress/create-block | 4.85.0 | Project scaffolding (one-time) | Official WordPress scaffolding tool; generates correct block.json, build config, PHP bootstrap |
| @wordpress/scripts | 31.7.0 | Build tooling (webpack, Babel, ESLint) | Zero-config build pipeline for blocks; handles JSX, asset generation, dependency extraction |
| Web Speech API | Browser native | Text-to-speech engine | Free, no API keys, privacy-first; project requirement |
| WordPress Block API v3 | WP 6.5+ | Block registration and editor UI | Standard block API with useBlockProps(), iframe-isolated editor |

### Supporting (Editor Only -- WordPress-provided at runtime)
| Package | Purpose | When to Use |
|---------|---------|-------------|
| @wordpress/blocks | `registerBlockType()` | Block registration in `index.js` |
| @wordpress/block-editor | `useBlockProps`, `InspectorControls` | Editor UI, sidebar settings panel |
| @wordpress/components | `PanelBody`, `SelectControl`, `TextControl`, `RangeControl` | Settings UI widgets in sidebar |
| @wordpress/i18n | `__()` | String wrapping (prep for future i18n, even though v1 is NL-only) |

### Frontend (Zero Dependencies)
| Technology | Purpose | Why |
|------------|---------|-----|
| Vanilla JavaScript | Player logic + speech synthesis | Imperative API; no framework overhead; tiny bundle |
| CSS custom properties | Player styling | Brand colors as variables; theme-adaptable |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vanilla JS frontend | Interactivity API | Overkill for imperative speech API; adds Preact dependency |
| parse_blocks() in PHP | DOM traversal in JS | JS approach is fragile across themes, picks up sidebar/footer |
| Dynamic block (render.php) | Static save() | save() causes validation errors when HTML changes |
| data attribute for text | wp_add_inline_script() | Data attribute is simpler for Phase 1; switch to inline JSON for long articles in later phase |

**Installation:**
```bash
cd wp-content/plugins/
npx @wordpress/create-block@latest tts-js
cd tts-js
npm start    # Development watch mode
npm run build # Production build
```

**Version verification:** @wordpress/create-block 4.85.0 and @wordpress/scripts 31.7.0 verified via npm registry on 2026-03-27.

## Architecture Patterns

### Recommended Project Structure
```
tts-js/
  build/                    # Compiled output (gitignored)
  src/
    block.json              # Block metadata, attributes, scripts, styles, render
    edit.js                 # Editor component (React/JSX) -- live preview + InspectorControls
    index.js                # Block registration (registerBlockType)
    view.js                 # Frontend player logic (vanilla JS, state machine)
    editor.scss             # Editor-only styles
    style.scss              # Shared styles (editor + frontend)
  render.php                # Server-side HTML output + text extraction
  tts-js.php                # Plugin bootstrap (plugin header, register_block_type)
  package.json
  readme.txt                # WordPress plugin readme
```

### Pattern 1: block.json with Attributes and Render
**What:** Declare block metadata, attributes, and render path in block.json.
**When to use:** Always -- this is the standard WordPress approach.
**Example:**
```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "tts-js/player",
  "version": "1.0.0",
  "title": "Listen to Article",
  "category": "widgets",
  "icon": "controls-volumeon",
  "description": "Add a text-to-speech player to your article",
  "attributes": {
    "lang": {
      "type": "string",
      "default": "nl-NL"
    },
    "speed": {
      "type": "number",
      "default": 1
    },
    "label": {
      "type": "string",
      "default": "Luister naar artikel"
    }
  },
  "supports": {
    "html": false,
    "multiple": false
  },
  "textdomain": "tts-js",
  "editorScript": "file:./index.js",
  "editorStyle": "file:./index.css",
  "style": "file:./style-index.css",
  "render": "file:./render.php",
  "viewScript": "file:./view.js"
}
```
**Source:** [Block Metadata Reference](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/)

### Pattern 2: Text Extraction via parse_blocks() in render.php
**What:** Extract article text server-side by parsing the post's block structure and filtering for desired block types.
**When to use:** Always for this plugin -- it is the core content extraction strategy.
**Why parse_blocks() over DOMDocument:**
- WordPress content is already block-structured; no need to re-parse HTML
- Filtering by block name is exact (no CSS selector fragility)
- Only operates on post content, never touches theme chrome (nav, footer, sidebars)
- Returns blocks in document order
**Example:**
```php
// render.php
<?php
// $attributes, $content, $block are provided by WordPress

$post = get_post();
if ( ! $post ) {
    return '';
}

$blocks = parse_blocks( $post->post_content );
$allowed_blocks = [
    'core/heading',
    'core/paragraph',
    'core/list',
    'core/quote',
];

$text_parts = [];
foreach ( $blocks as $block ) {
    if ( isset( $block['blockName'] ) && in_array( $block['blockName'], $allowed_blocks, true ) ) {
        $rendered = render_block( $block );
        $text_parts[] = wp_strip_all_tags( $rendered );
    }
}

$full_text = implode( "\n\n", array_filter( $text_parts ) );
$word_count = str_word_count( $full_text );
$reading_minutes = max( 1, round( $word_count / 150 ) ); // ~150 wpm for speech

$wrapper_attributes = get_block_wrapper_attributes( [
    'class' => 'tts-player',
    'data-tts-text' => $full_text,
    'data-tts-lang' => esc_attr( $attributes['lang'] ?? 'nl-NL' ),
    'data-tts-speed' => esc_attr( $attributes['speed'] ?? 1 ),
] );

// Player HTML output
?>
<div <?php echo $wrapper_attributes; ?>>
    <button class="tts-play-btn" aria-label="<?php echo esc_attr( $attributes['label'] ?? 'Luister naar artikel' ); ?>">
        <span class="tts-icon tts-icon--play"></span>
    </button>
    <div class="tts-info">
        <span class="tts-label"><?php echo esc_html( $attributes['label'] ?? 'Luister naar artikel' ); ?></span>
        <span class="tts-duration">~<?php echo $reading_minutes; ?> min</span>
    </div>
    <button class="tts-stop-btn" aria-label="Stop">
        <span class="tts-icon tts-icon--stop"></span>
    </button>
</div>
```
**Source:** [parse_blocks() reference](https://developer.wordpress.org/reference/functions/parse_blocks/)

### Pattern 3: Player State Machine in view.js
**What:** Manage player state as a finite state machine: idle -> loading -> playing -> paused -> idle (stop) / finished -> idle.
**When to use:** Frontend player logic.
**Why:** speechSynthesis properties (`.speaking`, `.paused`) are unreliable across browsers. Track state internally.
**Example:**
```javascript
// view.js
const STATES = {
    IDLE: 'idle',
    LOADING: 'loading',
    PLAYING: 'playing',
    PAUSED: 'paused',
    FINISHED: 'finished',
};

class TTSPlayer {
    constructor(container) {
        this.container = container;
        this.text = container.dataset.ttsText;
        this.lang = container.dataset.ttsLang || 'nl-NL';
        this.speed = parseFloat(container.dataset.ttsSpeed) || 1.0;
        this.state = STATES.IDLE;
        this.utterance = null;

        this.playBtn = container.querySelector('.tts-play-btn');
        this.stopBtn = container.querySelector('.tts-stop-btn');

        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.stopBtn.addEventListener('click', () => this.stop());
    }

    setState(newState) {
        this.state = newState;
        this.container.dataset.ttsState = newState;
        // CSS drives visual changes via [data-tts-state="playing"] selectors
    }

    togglePlay() {
        switch (this.state) {
            case STATES.IDLE:
            case STATES.FINISHED:
                this.startPlayback();
                break;
            case STATES.PLAYING:
                this.pause();
                break;
            case STATES.PAUSED:
                this.resume();
                break;
        }
    }

    startPlayback() {
        this.setState(STATES.LOADING);
        speechSynthesis.cancel(); // Clear any pending speech

        this.utterance = new SpeechSynthesisUtterance(this.text);
        this.utterance.lang = this.lang;
        this.utterance.rate = this.speed;

        this.utterance.onstart = () => this.setState(STATES.PLAYING);
        this.utterance.onend = () => this.handleFinished();
        this.utterance.onerror = (e) => {
            if (e.error !== 'canceled') {
                this.setState(STATES.IDLE);
            }
        };

        speechSynthesis.speak(this.utterance);
    }

    pause() {
        speechSynthesis.pause();
        this.setState(STATES.PAUSED);
    }

    resume() {
        speechSynthesis.resume();
        this.setState(STATES.PLAYING);
    }

    stop() {
        speechSynthesis.cancel();
        this.setState(STATES.IDLE);
    }

    handleFinished() {
        this.setState(STATES.FINISHED);
        setTimeout(() => this.setState(STATES.IDLE), 3000);
    }
}

// Initialize all player instances on the page
document.querySelectorAll('.wp-block-tts-js-player').forEach(
    (el) => new TTSPlayer(el)
);
```

### Pattern 4: Editor Preview with InspectorControls
**What:** Render a non-playable visual preview of the player in the Gutenberg editor, with settings in the sidebar.
**When to use:** edit.js
**Example:**
```jsx
// edit.js
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, RangeControl, TextControl } from '@wordpress/components';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
    const { lang, speed, label } = attributes;
    const blockProps = useBlockProps({ className: 'tts-player tts-player--preview' });

    return (
        <>
            <InspectorControls>
                <PanelBody title="Player instellingen">
                    <SelectControl
                        label="Taal"
                        value={lang}
                        options={[
                            { label: 'Nederlands', value: 'nl-NL' },
                            { label: 'English', value: 'en-US' },
                            { label: 'Deutsch', value: 'de-DE' },
                        ]}
                        onChange={(val) => setAttributes({ lang: val })}
                    />
                    <RangeControl
                        label="Snelheid"
                        value={speed}
                        onChange={(val) => setAttributes({ speed: val })}
                        min={0.5}
                        max={2}
                        step={0.25}
                    />
                    <TextControl
                        label="Label"
                        value={label}
                        onChange={(val) => setAttributes({ label: val })}
                    />
                </PanelBody>
            </InspectorControls>
            <div {...blockProps}>
                <button className="tts-play-btn" disabled>
                    <span className="tts-icon tts-icon--play"></span>
                </button>
                <div className="tts-info">
                    <span className="tts-label">{label}</span>
                    <span className="tts-duration">~3 min</span>
                </div>
                <button className="tts-stop-btn" disabled>
                    <span className="tts-icon tts-icon--stop"></span>
                </button>
            </div>
        </>
    );
}
```

### Pattern 5: CSS State-Driven UI
**What:** Use `data-tts-state` attribute on the player container; CSS selectors drive visual changes.
**When to use:** All player state transitions.
**Why:** Decouples visual state from JS logic. JS only sets the attribute; CSS handles icons, colors, animations.
**Example:**
```css
/* Default (idle) */
.tts-player .tts-icon--play { display: inline-block; }
.tts-player .tts-icon--pause { display: none; }
.tts-player .tts-icon--check { display: none; }

/* Playing */
.tts-player[data-tts-state="playing"] .tts-icon--play { display: none; }
.tts-player[data-tts-state="playing"] .tts-icon--pause { display: inline-block; }

/* Loading */
.tts-player[data-tts-state="loading"] .tts-icon--play { display: none; }
.tts-player[data-tts-state="loading"] .tts-icon--spinner { display: inline-block; }

/* Finished */
.tts-player[data-tts-state="finished"] .tts-icon--play { display: none; }
.tts-player[data-tts-state="finished"] .tts-icon--check { display: inline-block; }
```

### Anti-Patterns to Avoid
- **Static save() with player HTML:** Causes "unexpected content" errors on plugin updates. Use dynamic block with `save() { return null }`.
- **React on the frontend:** Adds 40KB+ bundle; WordPress does not ship React to visitors. Use vanilla JS.
- **DOM traversal in JS for text extraction:** Fragile across themes; picks up nav/footer text. Use `parse_blocks()` in PHP.
- **Trusting speechSynthesis.speaking/paused:** These properties lie after `cancel()`. Track state internally.
- **Pre-creating all utterances:** Speed changes mid-playback won't apply. Create utterances on-demand.

## Chapter42 Brand Styling

Brand colors and fonts extracted from chapter42.com on 2026-03-27:

| Token | Value | Usage |
|-------|-------|-------|
| `--c42-primary` | `#FF3349` | Red/pink accent -- buttons, active states |
| `--c42-secondary` | `#d3fc51` | Lime green -- hover states |
| `--c42-dark` | `#002D49` | Navy blue -- dark backgrounds, text |
| `--c42-light` | `#F3EDE2` | Warm beige -- light backgrounds |
| `--c42-teal` | `#8EB5B5` | Muted teal -- secondary accent |
| Font: headings | Lovechild | Custom serif font |
| Font: body | Poppins | Sans-serif, 400/700/900 |
| Border radius | 0 | Sharp corners throughout the site |

**Player design implications:**
- Player background: `--c42-light` (#F3EDE2) or white
- Play button: `--c42-primary` (#FF3349) fill, white icon
- Active/playing state: `--c42-primary`
- Stop/controls: `--c42-dark` (#002D49)
- Label text: Poppins font
- No border-radius (sharp corners match site aesthetic)
- Full width within content column (D3)

**Confidence:** MEDIUM -- colors extracted via web fetch; exact CSS custom property names from the theme may differ. Verify against the live site during implementation.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Plugin scaffolding | Manual webpack/babel/PHP setup | `@wordpress/create-block` | Generates correct block.json, build config, PHP bootstrap; saves hours |
| Block attributes persistence | Custom post meta, options API | block.json `attributes` field | WordPress handles serialization/deserialization automatically |
| Conditional script loading | Custom `wp_enqueue_script` with `has_block()` checks | `viewScript` in block.json | WordPress handles this automatically -- only enqueues when block is present |
| Editor UI components | Custom React components for dropdowns/sliders | `@wordpress/components` | Battle-tested, accessible, theme-consistent |
| Block wrapper attributes | Manual class/style string building | `get_block_wrapper_attributes()` | Handles classes, styles, and data attributes correctly |

**Key insight:** WordPress provides robust infrastructure for block development. The plugin should use standard WordPress patterns for everything except the speech synthesis logic itself (which is the actual product).

## Common Pitfalls

### Pitfall 1: Chrome 15-Second Speech Cutoff
**What goes wrong:** Chrome silently cancels `SpeechSynthesisUtterance` after ~15 seconds. No error event fired.
**Why it happens:** Long-standing Chromium bug (issue #679437, since 2017).
**How to avoid:** For Phase 1, articles are spoken as a single utterance. This WILL hit the 15s limit on longer articles. Phase 2 adds sentence-level chunking. For Phase 1, accept this limitation and document it -- the core UI and state machine are the deliverables.
**Warning signs:** Speech stops mid-article without error. Test with articles longer than 3 paragraphs.

### Pitfall 2: getVoices() Returns Empty Array
**What goes wrong:** `speechSynthesis.getVoices()` returns `[]` on first call in Safari/Firefox.
**Why it happens:** Voices load asynchronously in some browsers.
**How to avoid:** Use `voiceschanged` event. This is Phase 2 scope (SPCH-06), but in Phase 1 we still need a voice. Use a simple fallback: try getVoices(), if empty set `utterance.lang` without explicit voice -- the browser will use its default for that language.
**Warning signs:** No speech or wrong language voice on first load in Safari.

### Pitfall 3: data-tts-text Overflow on Long Articles
**What goes wrong:** Very long articles (10,000+ words) create enormous HTML data attributes.
**Why it happens:** Full article text in a `data-*` attribute.
**How to avoid:** For Phase 1 this is acceptable -- most blog posts are under 3,000 words. In a future phase, switch to `<script type="application/json">` inside the block for large texts.
**Warning signs:** Page source becomes very large; potential attribute size limits in edge cases.

### Pitfall 4: speechSynthesis.speaking Lies After cancel()
**What goes wrong:** After `cancel()`, `.speaking` may still return `true` briefly. State logic breaks.
**Why it happens:** Browser state update is asynchronous.
**How to avoid:** Track state in a JS variable (the state machine pattern). Never use `.speaking` or `.paused` as source of truth.

### Pitfall 5: Pause/Resume Inconsistency
**What goes wrong:** `pause()`/`resume()` behave differently across browsers. Firefox has buggy implementations.
**Why it happens:** Varying browser implementations of the spec.
**How to avoid:** Test on target browsers. In Phase 1, implement pause/resume but accept it may not work perfectly on all browsers (Phase 3 handles cross-browser hardening).

### Pitfall 6: Block Namespace Collision
**What goes wrong:** Using a generic block name like `tts/player` that could conflict with other plugins.
**Why it happens:** Block names must be globally unique in WordPress.
**How to avoid:** Use `tts-js/player` as the block name (matches plugin slug).

## Code Examples

### block.json -- Complete Phase 1 Configuration
```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "tts-js/player",
  "version": "1.0.0",
  "title": "Listen to Article",
  "category": "widgets",
  "icon": "controls-volumeon",
  "description": "Voeg een tekst-naar-spraak player toe aan je artikel",
  "attributes": {
    "lang": {
      "type": "string",
      "default": "nl-NL"
    },
    "speed": {
      "type": "number",
      "default": 1
    },
    "label": {
      "type": "string",
      "default": "Luister naar artikel"
    }
  },
  "supports": {
    "html": false,
    "multiple": false,
    "align": false
  },
  "textdomain": "tts-js",
  "editorScript": "file:./index.js",
  "editorStyle": "file:./index.css",
  "style": "file:./style-index.css",
  "render": "file:./render.php",
  "viewScript": "file:./view.js"
}
```
**Source:** [Block Metadata Reference](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/)

### index.js -- Block Registration
```javascript
import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import metadata from './block.json';
import './style.scss';

registerBlockType(metadata.name, {
    edit: Edit,
    save: () => null, // Dynamic block -- render.php handles output
});
```
**Source:** [Block Editor Handbook](https://developer.wordpress.org/block-editor/getting-started/fundamentals/registration-of-a-block/)

### render.php -- Text Extraction with parse_blocks()
See Pattern 2 above for the complete implementation.

### CSS Custom Properties for Chapter42 Brand
```css
/* style.scss */
:root {
  --tts-primary: #FF3349;
  --tts-dark: #002D49;
  --tts-light: #F3EDE2;
  --tts-secondary: #d3fc51;
  --tts-font: 'Poppins', sans-serif;
}

.wp-block-tts-js-player {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px 20px;
  background: var(--tts-light);
  border: 1px solid rgba(0, 45, 73, 0.1);
  font-family: var(--tts-font);
}

.tts-play-btn {
  width: 48px;
  height: 48px;
  border: none;
  background: var(--tts-primary);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tts-play-btn:hover {
  background: var(--tts-dark);
}

.tts-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tts-label {
  font-weight: 700;
  color: var(--tts-dark);
}

.tts-duration {
  font-size: 0.85em;
  color: rgba(0, 45, 73, 0.6);
}

.tts-stop-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--tts-dark);
  background: transparent;
  color: var(--tts-dark);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| register_block_type() with render_callback | render field in block.json pointing to render.php | WP 6.3+ | Cleaner separation; PHP template file instead of callback function |
| editorScript as .js handle string | editorScript as "file:./index.js" path | WP 6.1+ | Auto-registration of script assets; no manual wp_register_script needed |
| wp_register_script + has_block() for conditional loading | viewScript in block.json | WP 5.9+ | WordPress automatically handles conditional loading |
| Custom webpack config for blocks | @wordpress/scripts zero-config | Ongoing | No webpack.config.js needed; wp-scripts handles everything |

## Open Questions

1. **Exact Chapter42 theme CSS custom property names**
   - What we know: Brand colors extracted from live site
   - What's unclear: Whether the theme defines CSS custom properties we should reference directly, or whether we should define our own
   - Recommendation: Define plugin-own custom properties (--tts-*) that match the brand colors. This avoids coupling to theme internals and works if the theme changes.

2. **Article title (h1) extraction**
   - What we know: D4 says "h1 (titel)" should be read aloud
   - What's unclear: The post title is typically rendered by the theme, not as a `core/heading` block in the content. `parse_blocks()` on post_content won't find it.
   - Recommendation: Prepend `get_the_title()` to the extracted text in `render.php`. This ensures the article title is always read first, regardless of whether an h1 block exists in the content.

3. **Loading state timing**
   - What we know: D8 specifies a brief loading state
   - What's unclear: How long speechSynthesis takes to initialize varies by browser
   - Recommendation: Show loading state immediately on click. Transition to playing on the `utterance.onstart` event. If `onstart` doesn't fire within 3 seconds, show an error or return to idle.

4. **SVG icons or Unicode for player controls**
   - What we know: Player needs play, pause, stop, checkmark, and spinner icons
   - What's unclear: Whether to use inline SVG, icon font, or Unicode characters
   - Recommendation: Inline SVG for play/pause/stop/check icons (crisp at any size, no external dependencies). CSS spinner animation for loading state. Keep icons minimal and consistent with Chapter42's clean aesthetic.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build tooling (@wordpress/scripts) | Yes | 25.8.2 | -- |
| npm | Package management | Yes | 11.11.1 | -- |
| PHP | WordPress plugin runtime | No (not on dev machine) | -- | Need WordPress dev environment (wp-env, Local, or remote) |
| WordPress | Plugin runtime | No (not on dev machine) | -- | Need WordPress dev environment |

**Missing dependencies with no fallback:**
- PHP and WordPress are required to test the plugin. Development machine does not have PHP installed. Options: (1) use `@wordpress/env` which runs WordPress in Docker, (2) use Local by Flywheel, (3) deploy to a staging chapter42.com instance.

**Missing dependencies with fallback:**
- None -- all build tools (Node, npm) are available.

## Sources

### Primary (HIGH confidence)
- [Block Metadata Reference](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/) -- block.json fields, viewScript, render, attributes
- [Static or Dynamic Rendering](https://developer.wordpress.org/block-editor/getting-started/fundamentals/static-dynamic-rendering/) -- render.php pattern, variables available
- [parse_blocks() Reference](https://developer.wordpress.org/reference/functions/parse_blocks/) -- block parsing API
- [SpeechSynthesis on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) -- Web Speech API reference
- [@wordpress/scripts on npm](https://www.npmjs.com/package/@wordpress/scripts) -- v31.7.0 verified
- [@wordpress/create-block on npm](https://www.npmjs.com/package/@wordpress/create-block) -- v4.85.0 verified

### Secondary (MEDIUM confidence)
- chapter42.com brand extraction via WebFetch -- colors, fonts, design aesthetic
- [Chrome 15s speech bug](https://issues.chromium.org/issues/41294170) -- Chromium issue tracker
- [Cross-browser speech synthesis guide](https://dev.to/jankapunkt/cross-browser-speech-synthesis-the-hard-way-and-the-easy-way-353)

### Tertiary (LOW confidence)
- None -- all findings verified against primary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all technologies are official WordPress tooling or browser-native APIs, verified against current npm registry
- Architecture: HIGH -- dynamic block with render.php is the documented WordPress standard; parse_blocks() is a core WordPress function
- Pitfalls: HIGH -- Chrome 15s bug is well-documented; voice async loading is widely reported; state tracking pattern is standard
- Brand styling: MEDIUM -- colors extracted from live site; exact theme integration approach needs validation during implementation

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable domain -- WordPress block API and Web Speech API are mature)
