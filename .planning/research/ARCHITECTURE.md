# Architecture Patterns

**Domain:** Browser-based TTS WordPress Plugin
**Researched:** 2026-03-27

## Recommended Architecture

### High-Level Overview

```
WordPress Editor (admin)          WordPress Frontend (visitor)
========================          ============================

edit.js (React/JSX)               render.php (PHP)
  - Block preview UI                - Outputs player HTML
  - InspectorControls               - Extracts article content
  - Settings (speed, etc)           - Passes text via data attributes

         |                                    |
    block.json                          view.js (vanilla JS)
  (metadata, scripts,                    - speechSynthesis controller
   styles, attributes)                   - Text chunking engine
                                         - Voice selection logic
                                         - UI state management
                                         - Event listeners
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `tts-js.php` | Plugin bootstrap; register_block_type() | WordPress core |
| `block.json` | Block metadata: name, attributes, script/style registration | WordPress block registry |
| `src/index.js` | registerBlockType() call; imports edit component | WordPress blocks API |
| `src/edit.js` | Editor UI: preview player, block settings sidebar | WordPress block-editor, components |
| `render.php` | Server-side HTML: outputs player markup + article text as data attribute | WordPress post content |
| `src/view.js` | Frontend player: speech synthesis, UI controls, chunking | Browser speechSynthesis API, DOM |
| `src/style.scss` | Player styling (both editor + frontend) | CSS only |
| `src/editor.scss` | Editor-only styles | CSS only |

### Data Flow

```
1. EDITOR (content creation):
   Author places TTS block --> edit.js renders preview
   Author configures settings --> stored as block attributes in post_content

2. SAVE (post publish):
   save() returns null --> no markup stored in post_content (dynamic block)
   Block attributes serialized as HTML comment: <!-- wp:tts-js/player {"speed":1} /-->

3. RENDER (page view):
   WordPress encounters block --> calls render.php
   render.php extracts surrounding post content (headings + paragraphs)
   render.php outputs: <div class="wp-block-tts-js-player" data-text="..." data-lang="nl">
     <button class="tts-play">...</button>
     <span class="tts-time">...</span>
     <button class="tts-speed">1x</button>
   </div>

4. FRONTEND (visitor interaction):
   view.js finds .wp-block-tts-js-player elements
   Reads data-text attribute
   On play click: chunks text --> creates utterances --> speaks
   Updates UI state (playing/paused/progress)
```

## Patterns to Follow

### Pattern 1: Text Extraction in PHP (render.php)

**What:** Extract article text server-side, pass to frontend via data attribute.
**Why:** Avoids complex DOM traversal in JavaScript; PHP has access to post content; text is ready when JS initializes.

```php
// render.php
$post_content = get_the_content();
$text = wp_strip_all_tags( $post_content );
$text = preg_replace( '/\s+/', ' ', trim( $text ) );
$lang = get_locale(); // e.g., 'nl_NL'
$lang_short = substr( $lang, 0, 2 ); // 'nl'

printf(
    '<div %1$s data-tts-text="%2$s" data-tts-lang="%3$s">%4$s</div>',
    get_block_wrapper_attributes(),
    esc_attr( $text ),
    esc_attr( $lang_short ),
    $player_html
);
```

### Pattern 2: Sentence-Based Text Chunking

**What:** Split long text into sentence-sized utterances to avoid Chrome's ~15 second cutoff.
**Why:** Chrome cancels SpeechSynthesisUtterance after ~15 seconds of continuous speech. Chunking at sentence boundaries sounds natural.

```javascript
function chunkText(text, maxLength = 200) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLength && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
```

### Pattern 3: Voice Selection with Fallback Chain

**What:** Automatically pick the best voice for the content language.
**Why:** Voice availability varies wildly across browsers and OS. Need a reliable fallback chain.

```javascript
function selectVoice(lang = 'nl') {
  const voices = speechSynthesis.getVoices();
  const preferred = ['Google Nederlands', 'Microsoft Frank', 'Xander'];

  for (const name of preferred) {
    const voice = voices.find(v => v.name.includes(name) && v.lang.startsWith(lang));
    if (voice) return voice;
  }

  const langMatch = voices.find(v => v.lang.startsWith(lang));
  if (langMatch) return langMatch;

  return voices.find(v => v.default) || voices[0] || null;
}
```

### Pattern 4: Utterance Queue with Event Chaining

**What:** Chain multiple SpeechSynthesisUtterance objects for continuous playback of chunks.
**Why:** Each chunk is a separate utterance; onend event triggers next chunk.

```javascript
class TTSPlayer {
  constructor(text, lang) {
    this.chunks = chunkText(text);
    this.currentIndex = 0;
    this.voice = null;
    this.rate = 1.0;
    this.lang = lang;
  }

  play() {
    if (this.currentIndex >= this.chunks.length) return;
    const utterance = new SpeechSynthesisUtterance(this.chunks[this.currentIndex]);
    utterance.voice = this.voice;
    utterance.rate = this.rate;
    utterance.lang = this.lang;
    utterance.onend = () => {
      this.currentIndex++;
      if (this.currentIndex < this.chunks.length) {
        this.play();
      } else {
        this.onComplete();
      }
    };
    speechSynthesis.speak(utterance);
  }

  pause()  { speechSynthesis.pause(); }
  resume() { speechSynthesis.resume(); }
  stop()   { speechSynthesis.cancel(); this.currentIndex = 0; }
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Speaking Entire Article as One Utterance
**What:** Creating a single SpeechSynthesisUtterance with the full article text.
**Why bad:** Chrome silently stops after ~15 seconds. No error event fired. User thinks it finished.
**Instead:** Chunk text into sentences/paragraphs and chain utterances.

### Anti-Pattern 2: Calling getVoices() Synchronously on Load
**What:** `const voices = speechSynthesis.getVoices()` immediately returns empty array in some browsers.
**Why bad:** Safari and Firefox load voices asynchronously. First call returns `[]`.
**Instead:** Listen for `voiceschanged` event, then call getVoices().

```javascript
function getVoicesAsync() {
  return new Promise(resolve => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) return resolve(voices);
    speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices());
  });
}
```

### Anti-Pattern 3: Storing Player HTML in save()
**What:** Having the save function return the player markup.
**Why bad:** If you change the player HTML later, all existing blocks show "block validation failed" errors.
**Instead:** Dynamic block with `save() { return null; }` and `render.php`.

### Anti-Pattern 4: Using React on the Frontend
**What:** Importing @wordpress/element or React for the frontend player.
**Why bad:** Adds ~40KB+ to frontend; WordPress doesn't enqueue React for visitors by default; massive overhead for a play button.
**Instead:** Vanilla JavaScript. The player UI is simple enough.

### Anti-Pattern 5: DOM Traversal for Text Extraction on Frontend
**What:** Using JavaScript to walk the DOM and extract article text.
**Why bad:** Fragile across themes; picks up sidebar/footer text; race conditions with lazy-loaded content.
**Instead:** Extract text in PHP (render.php) where you have reliable access to post content.

## Scalability Considerations

Not relevant for this plugin -- it runs entirely in the browser. No server resources consumed beyond standard WordPress page rendering.

| Concern | Approach |
|---------|----------|
| Very long articles (10,000+ words) | Chunking handles this; test with large texts |
| Multiple TTS blocks on one page | Each block instance gets its own TTSPlayer; only one speaks at a time (speechSynthesis is global singleton) |
| Theme compatibility | use get_block_wrapper_attributes() for proper class/style injection |

## Sources

- [WordPress Dynamic Blocks](https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/creating-dynamic-blocks/)
- [render.php in block.json](https://developer.wordpress.org/block-editor/getting-started/fundamentals/static-dynamic-rendering/)
- [Chrome 15s speech timeout](https://issues.chromium.org/issues/41294170)
- [Chunking workaround gist](https://gist.github.com/woollsta/2d146f13878a301b36d7)
- [Cross-browser speech synthesis](https://dev.to/jankapunkt/cross-browser-speech-synthesis-the-hard-way-and-the-easy-way-353)
- [10up Block Best Practices](https://gutenberg.10up.com/reference/Blocks/custom-blocks/)
