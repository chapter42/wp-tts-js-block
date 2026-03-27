# TTS JS — Listen to Article

A WordPress Gutenberg block that adds a clean "Listen to article" player to your posts. Uses the browser's built-in Web Speech API — no external APIs, no subscriptions, no cost.

## Features

- **Zero dependencies** — runs entirely in the browser using the native Web Speech API
- **Smart chunking** — splits text at sentence boundaries to bypass Chrome's 15-second speech cutoff
- **Voice quality scoring** — automatically picks the best available voice (prefers premium/neural over compact)
- **Speed control** — 8-step speed selection (0.8x to 1.5x) via popup menu
- **Progress tracking** — progress bar and remaining time display
- **Cross-browser** — Chrome, Safari, Firefox, Edge on desktop and mobile
- **Error handling** — localized error messages (Dutch/English), graceful fallback on unsupported browsers
- **Privacy-friendly** — no data leaves the browser, no tracking, no external calls
- **Responsive** — adapts to phone and desktop screens

## Installation

1. Download or clone this repository
2. Copy the `tts-js/` directory to `wp-content/plugins/`
3. Activate "TTS JS — Listen to Article" in WordPress
4. Add the block to any post or page via the Gutenberg editor

### Development

```bash
cd tts-js
npm install
npm run start   # development with hot reload
npm run build   # production build
```

## Configuration

In the Gutenberg editor sidebar:
- **Taal** — language code (default: `nl-NL`)
- **Standaard snelheid** — initial playback speed

## How it works

1. `render.php` extracts headings and paragraphs from the post content using `parse_blocks()`
2. The player markup is rendered server-side as a dynamic block
3. `view.js` initializes the speech engine on pages where the block is present
4. On first play, voices are loaded cross-browser (sync for Firefox, `onvoiceschanged` for Chrome, polling for Safari)
5. Text is split into sentence-level chunks and played sequentially via `onend` chaining
6. CSS state machine (`data-tts-state`) drives all visual transitions

## Browser support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | Yes | Yes |
| Safari | Yes | Yes (iOS) |
| Firefox | Yes | Yes |
| Edge | Yes | Yes |

## Requirements

- WordPress 6.5+
- PHP 7.4+

## License

GPL-2.0-or-later — see [LICENSE](https://www.gnu.org/licenses/gpl-2.0.html)

## Author

**Roy Huiskes** — [chapter42.com](https://www.chapter42.com)
