# Technology Stack

**Project:** TTS-JS -- Browser Text-to-Speech WordPress Plugin
**Researched:** 2026-03-27

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| WordPress Block API v3 | WP 6.5+ | Block registration & editor UI | Standard block API; useBlockProps() required; iframe isolation in editor | HIGH |
| @wordpress/create-block | latest (scaffolding only) | Project scaffolding | Official WordPress scaffolding tool; generates correct block.json, build config, PHP bootstrap | HIGH |
| @wordpress/scripts | ^31.x | Build tooling (webpack, Babel, ESLint) | Zero-config build pipeline for blocks; handles JSX compilation, asset generation, dependency extraction | HIGH |
| Web Speech API (speechSynthesis) | Browser native | Text-to-speech engine | Free, no API keys, privacy-friendly, no server needed; ~75/100 browser compat score | HIGH |

### Block Architecture

| Technology | Purpose | Why | Confidence |
|------------|---------|-----|------------|
| Dynamic block (render.php) | Server-side HTML rendering | Player markup is the same for all posts; save() returns null; render.php generates the player HTML with data attributes | HIGH |
| viewScript (vanilla JS) | Frontend player logic | Speech synthesis is imperative (speak/pause/resume/cancel); vanilla JS avoids framework overhead; no reactive state needed | HIGH |
| edit.js (React/JSX) | Editor preview | Standard WordPress approach; uses @wordpress/element (React wrapper) for block editor UI | HIGH |

### Why NOT the Interactivity API

The WordPress Interactivity API (WP 6.5+) is the modern standard for frontend block interactivity. However, for this project it adds unnecessary complexity:

1. **Speech synthesis is imperative** -- you call `speechSynthesis.speak()`, not bind reactive state to DOM
2. **No server-rendered interactive state** -- the player's state (playing/paused/speed) is entirely client-side
3. **Extra build complexity** -- requires `--experimental-modules` flag and `viewScriptModule` instead of `viewScript`
4. **Overhead for simple UI** -- a play/pause button + speed toggle doesn't need Preact signals
5. **Direct DOM manipulation is fine** -- updating a progress indicator and button states is trivial vanilla JS

**Use viewScript with vanilla JavaScript.** Simpler, smaller, faster, zero dependencies on the frontend.

### Supporting WordPress Packages (Editor Only)

| Package | Purpose | When to Use |
|---------|---------|-------------|
| @wordpress/blocks | registerBlockType() | Block registration |
| @wordpress/block-editor | useBlockProps, InspectorControls | Editor UI, sidebar settings |
| @wordpress/components | PanelBody, ToggleControl, SelectControl | Settings panel UI in editor |
| @wordpress/i18n | __(), _x() | Internationalization strings |
| @wordpress/element | React wrapper | JSX in edit.js (auto-provided by wp-scripts) |

These are NOT npm-installed dependencies -- they are WordPress-provided script dependencies declared in block.json or auto-extracted by wp-scripts. WordPress enqueues them at runtime.

### Frontend (Zero Dependencies)

| Technology | Purpose | Why |
|------------|---------|-----|
| Vanilla JavaScript | Player logic + speech synthesis | No framework needed; keeps bundle tiny; speechSynthesis API is native |
| CSS (block style) | Player styling | Single stylesheet via block.json `style` field |

## Key Version Requirements

| Requirement | Minimum | Recommended | Notes |
|-------------|---------|-------------|-------|
| WordPress | 6.5 | 6.7+ | Block API v3 stable from 6.5 |
| PHP | 7.4 | 8.0+ | WordPress minimum; render.php needs nothing special |
| Node.js | 20.10.0 | 22.x LTS | Required by @wordpress/create-block |
| npm | 10.2.3 | 10.x | Required by @wordpress/create-block |

## Web Speech API: Browser Support Matrix

| Browser | speechSynthesis | Dutch Voices | Notes |
|---------|----------------|--------------|-------|
| Chrome (desktop) | YES | YES (Google NL) | **Critical bug:** stops after ~15s on long text; needs chunking workaround |
| Chrome (Android) | YES | YES (device voices) | Requires user gesture to start |
| Safari (macOS) | YES | YES (system voices) | getVoices() may return empty initially; needs onvoiceschanged listener |
| Safari (iOS) | YES | LIMITED | Silent when soft-mute switch is on; stops if Safari goes to background; voice list issues |
| Firefox | YES | VARIES | Depends on OS speech engine; fewer built-in voices |
| Edge | YES | YES (Microsoft NL) | Uses same engine as Chrome (Chromium) |

**Overall confidence:** HIGH -- speechSynthesis is well-supported. Dutch voice availability varies but is present on major platforms.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Frontend framework | Vanilla JS | Interactivity API | Overkill; adds Preact dependency; speech synthesis is imperative not reactive |
| Frontend framework | Vanilla JS | React on frontend | Huge bundle; WordPress doesn't ship React to frontend by default |
| Block type | Dynamic (render.php) | Static (save function) | Player HTML should be consistent; dynamic is cleaner for blocks with JS behavior |
| Build tool | @wordpress/scripts | Custom webpack/Vite | wp-scripts is zero-config for blocks; handles dependency extraction; community standard |
| Scaffolding | @wordpress/create-block | Manual setup | Official tool; correct structure guaranteed; saves hours of boilerplate |
| TTS engine | Web Speech API | External API (Polly/Google) | Project requirement: free, no API keys, no server |
| Text chunking | Custom sentence splitter | Library (e.g. speak-tts) | speak-tts is unmaintained; custom chunking is ~30 lines; avoids dependency |

## Project Structure (Generated by create-block)

```
tts-js/
  build/                    # Compiled output (gitignored)
  src/
    block.json              # Block metadata, scripts, styles
    edit.js                 # Editor component (React/JSX)
    index.js                # Block registration (registerBlockType)
    view.js                 # Frontend player logic (vanilla JS)
    editor.scss             # Editor-only styles
    style.scss              # Shared styles (editor + frontend)
  render.php                # Server-side HTML output
  tts-js.php                # Plugin bootstrap (plugin header, block registration)
  package.json
  readme.txt                # WordPress plugin readme
```

## Installation / Scaffolding

```bash
# Scaffold the plugin
cd wp-content/plugins/
npx @wordpress/create-block@latest tts-js

# The generated project includes:
# - block.json with editorScript, viewScript, style fields
# - wp-scripts build/start commands pre-configured
# - PHP plugin file with register_block_type()

# Development
npm start          # Watch mode with hot reload
npm run build      # Production build

# No additional npm dependencies needed for the frontend player.
# All WordPress packages are provided at runtime by WordPress itself.
```

## Sources

- [@wordpress/create-block official docs](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-create-block/)
- [@wordpress/scripts on npm](https://www.npmjs.com/package/@wordpress/scripts) -- v31.7.0 as of 2026-03-20
- [Block Editor Handbook](https://developer.wordpress.org/block-editor/)
- [Static or Dynamic rendering](https://developer.wordpress.org/block-editor/getting-started/fundamentals/static-dynamic-rendering/)
- [SpeechSynthesis on MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [SpeechSynthesis browser compat on Can I Use](https://caniuse.com/mdn-api_speechsynthesis)
- [Chrome speechSynthesis 15s timeout bug](https://issues.chromium.org/issues/41294170)
- [Safari speech synthesis issues](https://weboutloud.io/bulletin/speech_synthesis_in_safari/)
- [iOS Safari TTS issues](https://developer.apple.com/forums/thread/49875)
- [Interactivity API reference](https://developer.wordpress.org/block-editor/reference-guides/interactivity-api/)
- [viewScriptModule in WP 6.5](https://make.wordpress.org/core/2024/03/04/block-metadata-viewscriptmodule-field-in-6-5/)
- [10up Block Editor Best Practices](https://gutenberg.10up.com/reference/Blocks/custom-blocks/)
- [Cross-browser speech synthesis guide](https://dev.to/jankapunkt/cross-browser-speech-synthesis-the-hard-way-and-the-easy-way-353)
- [Chrome chunking workaround gist](https://gist.github.com/woollsta/2d146f13878a301b36d7)
