# Domain Pitfalls

**Domain:** Browser-based TTS WordPress Plugin
**Researched:** 2026-03-27

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Chrome 15-Second Speech Cutoff
**What goes wrong:** Chrome silently cancels SpeechSynthesisUtterance after approximately 15 seconds of continuous speech. No error event is fired -- the speech simply stops.
**Why it happens:** Long-standing Chromium bug (issue #679437, opened 2017, still open). Affects Chrome, Edge, and all Chromium-based browsers on desktop.
**Consequences:** Users think the article has finished reading when it hasn't. No error feedback. Appears broken.
**Prevention:** Split text into chunks of ~200 characters at sentence boundaries. Chain utterances using the `onend` event. Never speak more than ~15 seconds of text in a single utterance.
**Detection:** Test with articles longer than 3 paragraphs. If speech stops mid-sentence, chunking is broken or missing.

### Pitfall 2: Async Voice Loading (getVoices Returns Empty)
**What goes wrong:** `speechSynthesis.getVoices()` returns an empty array on first call in Safari and Firefox. Code tries to set a voice, gets null, and either crashes or uses a wrong default voice.
**Why it happens:** Browsers load voice data asynchronously. Chrome returns voices synchronously on subsequent page loads (cached), but Safari and Firefox always load async.
**Consequences:** Wrong language voice (English instead of Dutch), or no speech at all.
**Prevention:** Always use the `voiceschanged` event as fallback. Wrap in a Promise that resolves either immediately (if voices available) or on the event.
**Detection:** Test in Safari private browsing (no cache). If no Dutch voice is selected, this is the bug.

### Pitfall 3: iOS Safari Silent Mode / Background Tab
**What goes wrong:** Two separate issues on iOS Safari:
1. When the hardware silent/mute switch is on, speechSynthesis produces no sound (unlike Chrome on iOS, which ignores the switch).
2. When Safari is backgrounded during speech, synthesis stops permanently. Refreshing the page is required.
**Why it happens:** iOS treats speechSynthesis as a "polite" audio source that respects silent mode. Background tab suspension kills the speech engine.
**Consequences:** Users think the feature is broken. No workaround for silent mode -- can only inform users.
**Prevention:** Detect iOS Safari and show a note about the silent switch if no audio plays after a timeout. For background tabs, detect `visibilitychange` event and pause/show a "resume" prompt when user returns.
**Detection:** Test on physical iOS device with silent switch enabled.

### Pitfall 4: Static Block save() Causing Validation Errors
**What goes wrong:** Using a `save()` function that returns player HTML. When you update the HTML structure in a plugin update, all existing blocks show "This block contains unexpected content" errors in the editor.
**Why it happens:** WordPress validates saved HTML against the current save() output. Any mismatch triggers a validation error.
**Consequences:** Every existing post with the block shows an error. Users must manually recover each block.
**Prevention:** Use a dynamic block: `save() { return null; }` with `render.php`. The HTML is generated server-side on each request, so changes are instant across all posts.
**Detection:** Change any HTML in save() and check existing posts in the editor.

## Moderate Pitfalls

### Pitfall 5: Pause/Resume Inconsistency Across Browsers
**What goes wrong:** `speechSynthesis.pause()` and `resume()` behave differently across browsers. Some browsers (Firefox) don't support pause/resume at all or have buggy implementations.
**Prevention:** Test pause/resume on all target browsers. Have a fallback: if resume doesn't work within a short timeout, cancel and restart from the current chunk position.

### Pitfall 6: speechSynthesis.speaking State Lies
**What goes wrong:** After calling `cancel()`, `speechSynthesis.speaking` may still return `true` for a brief period. Code that checks this property to determine state gets confused.
**Prevention:** Track playback state in your own variable (e.g., `this.isPlaying`). Don't rely on `speechSynthesis.speaking` or `speechSynthesis.paused` as the source of truth.

### Pitfall 7: Dutch Voice Quality Varies Dramatically
**What goes wrong:** The automatically selected Dutch voice sounds terrible (robotic, wrong pronunciation) on some browser/OS combinations. Users judge the entire plugin by voice quality.
**Why it happens:** Each browser/OS has different TTS engines. Windows has Microsoft voices (decent), macOS has Apple voices (good), Chrome has Google voices (good), but Firefox on Linux may have espeak (awful).
**Prevention:** Build a voice quality ranking into the selection algorithm. Prefer Google > Microsoft > Apple > other voices. Consider showing "Best experience in Chrome" hint when voice quality is low.

### Pitfall 8: Large Articles Overflowing data-* Attributes
**What goes wrong:** For very long articles (10,000+ words), putting the full text in a `data-tts-text` attribute creates enormous HTML. Some browsers may have attribute size limits, and it's wasteful.
**Prevention:** For very long texts, consider using a `<script type="application/json">` tag inside the block HTML instead of a data attribute. Or use `wp_add_inline_script()` to pass text as a JS variable. Test with articles of 5,000+ words.

## Minor Pitfalls

### Pitfall 9: Rate/Speed Not Applied to Queued Utterances
**What goes wrong:** User changes speed mid-playback, but the remaining queued utterances still use the old rate.
**Prevention:** Don't pre-create all utterances. Create each utterance on-the-fly when the previous one ends. Apply current rate at creation time.

### Pitfall 10: Multiple Players on Same Page
**What goes wrong:** If a page has multiple TTS blocks (e.g., a page with embedded posts), pressing play on one doesn't stop the other. speechSynthesis is a singleton -- both try to speak simultaneously or interfere.
**Prevention:** Before calling `speak()`, always call `speechSynthesis.cancel()` first. Dispatch a custom event so other player instances know to update their UI to "stopped."

### Pitfall 11: Plugin Conflicts with Other TTS Plugins
**What goes wrong:** If another plugin also uses speechSynthesis, the two plugins interfere with each other.
**Prevention:** Namespace your player instance. Use unique CSS classes (prefixed with `tts-js-`). Check if speech was cancelled unexpectedly (another plugin might call `cancel()`).

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Basic playback | Chrome 15s cutoff (#1) | Implement chunking from day one; never test with short text only |
| Voice selection | Async voices (#2), Quality variance (#7) | Use voiceschanged event; build quality ranking |
| Mobile testing | iOS silent mode (#3) | Test on physical iOS device; add user guidance |
| Pause/Resume | Browser inconsistency (#5) | Track state internally; fallback to cancel+restart |
| Speed control | Rate not applied to queue (#9) | Create utterances on-demand, not pre-queued |
| Multi-block pages | Singleton interference (#10) | Cancel before speak; coordinate via custom events |

## Sources

- [Chrome 15s speech bug -- Chromium issue tracker](https://issues.chromium.org/issues/41294170)
- [Safari speech synthesis issues](https://weboutloud.io/bulletin/speech_synthesis_in_safari/)
- [iOS Safari TTS forum thread](https://developer.apple.com/forums/thread/49875)
- [Taming the Web Speech API](https://webreflection.medium.com/taming-the-web-speech-api-ef64f5a245e1)
- [Cross-browser speech synthesis guide](https://dev.to/jankapunkt/cross-browser-speech-synthesis-the-hard-way-and-the-easy-way-353)
- [WordPress block validation](https://developer.wordpress.org/block-editor/getting-started/fundamentals/static-dynamic-rendering/)
- [Lessons learned speechSynthesis](https://talkrapp.com/speechSynthesis.html)
