<!-- GSD:project-start source:PROJECT.md -->
## Project

**TTS-JS — Browser Text-to-Speech WordPress Plugin**

Een WordPress plugin die een clean "Listen to article" player toevoegt als Gutenberg block. Gebruikt de ingebouwde Web Speech API (`speechSynthesis`) van de browser om artikeltekst (headings + body) voor te lezen — geen externe API's of abonnementen nodig. Werkt responsive op desktop en mobiel.

**Core Value:** Bezoekers van chapter42.com kunnen artikelen beluisteren via een native browser TTS player, zonder externe services of kosten.

### Constraints

- **Tech**: Puur browser Web Speech API — geen server-side TTS of API keys
- **Platform**: WordPress plugin met Gutenberg block support
- **Taal**: Primair Nederlandse content, maar moet andere talen aankunnen
- **Kosten**: Gratis — geen externe diensten of abonnementen
- **Compatibiliteit**: Moet werken op Chrome, Safari, Firefox, Edge (desktop + mobiel)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
### Supporting WordPress Packages (Editor Only)
| Package | Purpose | When to Use |
|---------|---------|-------------|
| @wordpress/blocks | registerBlockType() | Block registration |
| @wordpress/block-editor | useBlockProps, InspectorControls | Editor UI, sidebar settings |
| @wordpress/components | PanelBody, ToggleControl, SelectControl | Settings panel UI in editor |
| @wordpress/i18n | __(), _x() | Internationalization strings |
| @wordpress/element | React wrapper | JSX in edit.js (auto-provided by wp-scripts) |
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
## Installation / Scaffolding
# Scaffold the plugin
# The generated project includes:
# - block.json with editorScript, viewScript, style fields
# - wp-scripts build/start commands pre-configured
# - PHP plugin file with register_block_type()
# Development
# No additional npm dependencies needed for the frontend player.
# All WordPress packages are provided at runtime by WordPress itself.
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
