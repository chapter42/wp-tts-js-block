# Phase 2: Reliable Speech + Full Player - Research

**Researched:** 2026-03-27
**Domain:** Web Speech API chunking, voice selection, responsive player UI
**Confidence:** HIGH

## Summary

Phase 2 transforms a basic single-utterance player into a production-ready speech engine with sentence-level chunking (to defeat Chrome's ~15s cutoff), smart Dutch voice auto-selection, speed cycling, progress tracking, and responsive layout. The technical challenges are well-understood: Chrome's speechSynthesis timeout is a documented bug with proven chunking workarounds, voice loading is async with well-known per-browser patterns, and the UI additions (progress bar, speed button, duration display) are straightforward extensions of the Phase 1 CSS state machine.

The primary risk areas are: (1) sentence splitting for Dutch text (abbreviations like "dhr.", "bijv.", "d.w.z." can fool naive regex splitters), (2) Android's broken pause/resume (where pause() acts as cancel()), and (3) Safari's unpredictable voice loading timing. The chunking approach chosen by the user (sentence boundaries with sub-splitting for long sentences) is the proven pattern -- the alternative pause/resume keepalive hack is fragile and breaks on Android.

**Primary recommendation:** Build a SentenceChunker class that splits text at sentence boundaries, chains chunks via onend callbacks, and tracks progress as completedChunks/totalChunks. Build a VoiceResolver class that combines sync getVoices(), onvoiceschanged listener, and polling fallback with a quality-scoring heuristic. Extend the Phase 1 TTSPlayer class with these two new modules.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Split text at sentence boundaries (`.` `!` `?` followed by space/newline) -- natural pauses, easy progress tracking
- **D-02:** Sub-split long sentences (>300 chars) at clause boundaries (commas, semicolons, dashes) to prevent Chrome timeout on run-on sentences
- **D-03:** Chain chunks seamlessly via `onend` callback -- no artificial pauses between sentences
- **D-04:** Estimated duration calculated from word count / speaking rate (~150 wpm, adjusted for current speed setting)
- **D-05:** Progress bar tracks chunk-based position (completed chunks / total chunks) -- jumps slightly per sentence
- **D-06:** Duration display switches to remaining time once playback starts (e.g. "~3 min" becomes "~2 min resterend")
- **D-07:** Custom 8-step speed cycle: 0.8x, 0.9x, 1x, 1.1x, 1.2x, 1.3x, 1.4x, 1.5x (wraps back to 0.8x after 1.5x)
- **D-08:** Default speed is 1x
- **D-09:** Speed button shows multiplier text only (e.g. "1x", "1.2x", "0.8x") -- compact, updates on each tap
- **D-10:** Speed changes apply to the next chunk (per SPCH-07 requirement)
- **D-11:** Quality heuristic ranking: score voices by (1) exact lang match (nl-NL > nl), (2) name keywords ('enhanced', 'premium', 'neural' score higher), (3) prefer non-default voices. Pick highest score.
- **D-12:** If no Dutch voice found: disable player and show message "Geen geschikte stem gevonden" -- don't fall back to other languages
- **D-13:** Async voice loading: listen for `onvoiceschanged`, poll every 100ms, give up after 3 seconds
- **D-14:** Cache selected voice after first resolution -- subsequent plays reuse it instantly without re-evaluation

### Claude's Discretion
- Progress bar visual style (thin bar, color, animation) -- should match Chapter42 brand from Phase 1
- Mobile responsive breakpoints and layout adjustments
- Exact voice quality keywords to score (research best known voice name patterns per browser)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SPCH-02 | Article text is chunked at sentence boundaries to prevent Chrome's 15s cutoff | Sentence splitting regex pattern, sub-splitting for >300 char sentences, Chrome timeout bug confirmed |
| SPCH-03 | Chunks are chained via onend callbacks for seamless playback | onend callback chain pattern from woollsta gist, recursive chunk advancement |
| SPCH-04 | Language is auto-detected from the page/block setting (default: nl-NL) | Already in Phase 1 as `data-tts-lang` attribute; voice selection uses this lang code |
| SPCH-05 | Best available voice is auto-selected per browser/OS with smart ranking | Voice quality heuristic with Dutch voice names per platform documented |
| SPCH-06 | Async voice loading is handled (Chrome onvoiceschanged, Safari/Firefox patterns) | Three-strategy voice loading pattern (sync, onvoiceschanged, polling) |
| SPCH-07 | Speed changes apply immediately to subsequent chunks | Speed stored in player state; next chunk reads current speed at creation time |
| PLAY-04 | Player shows estimated reading duration | Word count / (150 * speed) calculation; already computed in render.php |
| PLAY-05 | Player shows a progress bar indicating position in the article | Chunk-based progress (completedChunks / totalChunks); CSS transition for smooth visual |
| PLAY-06 | User can cycle playback speed | 8-step speed array; button click advances index with wrap-around |
| PLAY-07 | Player displays current play state visually | Phase 1 `data-tts-state` CSS pattern extended with progress bar and speed button visibility rules |
| PLAY-08 | Player is mobile responsive | Two breakpoints (480px, 360px) per UI-SPEC; speed button repositions on mobile |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Web Speech API (speechSynthesis) | Browser native | TTS engine | Project constraint: free, no API keys |
| @wordpress/scripts | ^31.x | Build tooling | Zero-config for WP blocks; already in Phase 1 |

### Supporting
No additional npm packages needed. Phase 2 is pure vanilla JS extending Phase 1.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom sentence splitter | speak-tts library | speak-tts is unmaintained (last update 2020); custom splitter is ~40 lines |
| Custom voice resolver | EasySpeech library | Adds dependency; our needs are narrow (Dutch only); custom is simpler |
| Pause/resume keepalive | Chunking | Keepalive breaks on Android (pause=cancel); chunking is universally reliable |

## Architecture Patterns

### Recommended Module Structure
```
src/tts-js/
├── view.js              # Main entry: TTSPlayer class (extended from Phase 1)
├── render.php           # Server-side HTML (extended with progress bar, speed button)
├── style.scss           # CSS (extended with progress, speed, mobile, error styles)
├── edit.js              # Editor preview (extended with progress bar, speed button preview)
├── editor.scss          # Editor-specific styles
├── block.json           # Block metadata (unchanged)
└── index.js             # Block registration (unchanged)
```

Phase 2 does NOT add new files. All changes are extensions to existing Phase 1 files. The view.js file grows from ~150 lines to ~350-400 lines. If desired, chunking and voice logic can be extracted into helper functions at the top of view.js (not separate files, since wp-scripts bundles viewScript as a single entry point).

### Pattern 1: Sentence Chunking Engine
**What:** Split extracted text into speech-safe chunks at sentence boundaries
**When to use:** Before starting playback, after text extraction
**Example:**
```javascript
// Source: Adapted from woollsta/2d146f13878a301b36d7 + D-01/D-02
const SENTENCE_END = /(?<=[.!?])\s+/;
const CLAUSE_BREAK = /(?<=[,;:\u2014])\s+/;
const MAX_CHUNK_LENGTH = 300;

function splitIntoChunks(text) {
    // Step 1: Split at sentence boundaries
    const sentences = text.split(SENTENCE_END).filter(s => s.trim());
    const chunks = [];

    for (const sentence of sentences) {
        if (sentence.length <= MAX_CHUNK_LENGTH) {
            chunks.push(sentence.trim());
        } else {
            // Step 2: Sub-split long sentences at clause boundaries (D-02)
            const clauses = sentence.split(CLAUSE_BREAK);
            let buffer = '';
            for (const clause of clauses) {
                if ((buffer + clause).length > MAX_CHUNK_LENGTH && buffer) {
                    chunks.push(buffer.trim());
                    buffer = clause;
                } else {
                    buffer += (buffer ? ' ' : '') + clause;
                }
            }
            if (buffer.trim()) {
                chunks.push(buffer.trim());
            }
        }
    }
    return chunks;
}
```

**IMPORTANT Dutch-specific concern:** The lookbehind `(?<=[.!?])` will false-split on Dutch abbreviations like "dhr. Van der Berg" or "bijv. een kat". Mitigation: require the period to be followed by a space AND the next character to be uppercase, or maintain a small abbreviation exclusion list. See Pitfall 2 below.

### Pattern 2: Chunk Chaining via onend
**What:** Play chunks sequentially, each triggering the next
**When to use:** During playback
**Example:**
```javascript
// Source: woollsta gist pattern adapted for chunk array
playNextChunk() {
    if (this.currentChunkIndex >= this.chunks.length) {
        this.handleFinished();
        return;
    }

    const chunk = this.chunks[this.currentChunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = this.lang;
    utterance.rate = this.speed;        // reads current speed (D-10)
    utterance.voice = this.resolvedVoice; // cached voice (D-14)

    utterance.onend = () => {
        this.currentChunkIndex++;
        this.updateProgress();           // D-05: chunk-based progress
        this.updateRemainingTime();      // D-06: remaining time
        this.playNextChunk();            // chain to next (D-03)
    };

    utterance.onerror = (event) => {
        if (event.error !== 'canceled') {
            this.stop();
        }
    };

    // Keep reference to prevent garbage collection
    this.currentUtterance = utterance;
    speechSynthesis.speak(utterance);
}
```

### Pattern 3: Three-Strategy Voice Loading
**What:** Load voices reliably across all browsers
**When to use:** On first play click (lazy, not at page load)
**Example:**
```javascript
// Source: Cross-browser speech synthesis guide + D-13
function resolveVoice(langCode) {
    return new Promise((resolve) => {
        // Strategy 1: Sync (Firefox, Safari desktop)
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            resolve(pickBestVoice(voices, langCode));
            return;
        }

        // Strategy 2: Async event (Chrome)
        let resolved = false;
        const onVoicesChanged = () => {
            if (resolved) return;
            resolved = true;
            speechSynthesis.onvoiceschanged = null;
            clearInterval(pollId);
            resolve(pickBestVoice(speechSynthesis.getVoices(), langCode));
        };
        speechSynthesis.onvoiceschanged = onVoicesChanged;

        // Strategy 3: Polling fallback (older Safari) -- D-13
        const pollId = setInterval(() => {
            const v = speechSynthesis.getVoices();
            if (v.length > 0) {
                if (resolved) return;
                resolved = true;
                speechSynthesis.onvoiceschanged = null;
                clearInterval(pollId);
                resolve(pickBestVoice(v, langCode));
            }
        }, 100);

        // Timeout after 3 seconds -- D-13
        setTimeout(() => {
            if (resolved) return;
            resolved = true;
            speechSynthesis.onvoiceschanged = null;
            clearInterval(pollId);
            resolve(null); // null = no voice found
        }, 3000);
    });
}
```

### Pattern 4: Voice Quality Heuristic
**What:** Score and rank available Dutch voices
**When to use:** After voices are loaded
**Example:**
```javascript
// Source: Readium Speech nl.json voice data + D-11
const QUALITY_KEYWORDS = {
    high: ['enhanced', 'premium', 'neural', 'natural', 'online'],
    low: ['compact'],
};

function pickBestVoice(voices, langCode) {
    const langPrefix = langCode.split('-')[0]; // 'nl'
    const candidates = voices.filter(v =>
        v.lang === langCode ||
        v.lang.replace('_', '-') === langCode ||
        v.lang.startsWith(langPrefix)
    );

    if (candidates.length === 0) return null;

    return candidates.sort((a, b) => {
        let scoreA = 0, scoreB = 0;

        // Exact lang match scores higher (D-11.1)
        if (a.lang === langCode) scoreA += 10;
        if (b.lang === langCode) scoreB += 10;

        // Quality keywords in name (D-11.2)
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        for (const kw of QUALITY_KEYWORDS.high) {
            if (nameA.includes(kw)) scoreA += 5;
            if (nameB.includes(kw)) scoreB += 5;
        }
        for (const kw of QUALITY_KEYWORDS.low) {
            if (nameA.includes(kw)) scoreA -= 5;
            if (nameB.includes(kw)) scoreB -= 5;
        }

        // Prefer non-default voices (D-11.3) --
        // default voices are often low quality system voices
        if (!a.default) scoreA += 2;
        if (!b.default) scoreB += 2;

        return scoreB - scoreA;
    })[0];
}
```

### Anti-Patterns to Avoid
- **Single utterance for full text:** Chrome cuts off after ~15 seconds. Always chunk.
- **Pause/resume keepalive timer:** Works on Chrome desktop but breaks on Android (pause = cancel). Chunking is universally safe.
- **Relying on speechSynthesis.speaking/paused:** Browser implementations are unreliable (Phase 1 learned this -- use internal state tracking).
- **Calling getVoices() at page load:** Wasteful; voices may not be loaded yet. Resolve lazily on first play.
- **Creating utterances without keeping a reference:** Browser may garbage-collect the utterance, causing onend to never fire.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Full i18n sentence segmentation | Unicode-aware Intl.Segmenter | Simple regex with Dutch abbreviation guard | Intl.Segmenter has good support (Chrome 87+, Safari 15.4+, Firefox 125+) but is overkill for sentence splitting where a regex + abbreviation list handles Dutch well enough |
| Speech synthesis abstraction | Full cross-browser TTS wrapper | Targeted workarounds per known bug | Our scope is narrow: Dutch text, modern browsers. A full library adds complexity without proportional benefit. |

**Key insight:** The Web Speech API's quirks are well-documented and few. A focused set of workarounds (chunking for Chrome, three-strategy voice loading, internal state tracking) covers all cases without needing a library.

## Common Pitfalls

### Pitfall 1: Chrome 15-Second Cutoff
**What goes wrong:** SpeechSynthesisUtterance silently stops speaking after ~14-15 seconds on Chrome desktop.
**Why it happens:** Chromium bug (issues.chromium.org/41294170), open since 2014, never fixed.
**How to avoid:** Split text into sentence-sized chunks (<300 chars). Chain via onend callbacks.
**Warning signs:** Long articles play fine for 15 seconds then go silent with no error event.

### Pitfall 2: Dutch Abbreviation False Splits
**What goes wrong:** Sentence splitter cuts at "dhr." or "bijv." creating unnatural pauses mid-sentence.
**Why it happens:** Naive `.!?` regex treats abbreviation periods as sentence endings.
**How to avoid:** Use a lookbehind that requires the next character after `.` + space to be uppercase: `/(?<=[.!?])\s+(?=[A-Z\u00C0-\u024F])/`. This catches most real sentence boundaries while preserving abbreviations. Alternatively, maintain a short exclusion list of common Dutch abbreviations: `dhr`, `mevr`, `bijv`, `d.w.z`, `o.a`, `evt`, `nr`, `ca`, `m.b.t`.
**Warning signs:** Very short chunks (1-3 words) appearing in the chunk array.

### Pitfall 3: Utterance Garbage Collection
**What goes wrong:** onend callback never fires; playback seems to hang after a chunk.
**Why it happens:** Browser garbage-collects the SpeechSynthesisUtterance object if no reference is kept.
**How to avoid:** Store `this.currentUtterance = utterance` as a class property before calling speak().
**Warning signs:** Random chunks fail to trigger the next chunk, especially on longer articles.

### Pitfall 4: Android Pause = Cancel
**What goes wrong:** Pressing pause on Android stops playback entirely; resume does nothing.
**Why it happens:** Android Chrome implements pause() as cancel() -- this is a known platform bug.
**How to avoid:** With sentence chunking, pause can be implemented by NOT calling playNextChunk() after current chunk ends (let it finish the current sentence, then hold). Resume restarts from the paused chunk index. This avoids speechSynthesis.pause() entirely.
**Warning signs:** Pause works on desktop but permanently stops playback on Android.

### Pitfall 5: Safari Voice Loading Delay
**What goes wrong:** getVoices() returns empty array; onvoiceschanged never fires.
**Why it happens:** Safari (especially iOS) loads voices lazily and may not support onvoiceschanged.
**How to avoid:** Use polling fallback (100ms interval, 3s timeout) as third strategy in voice resolver.
**Warning signs:** Player enters error state on Safari even though voices exist.

### Pitfall 6: onend Fires Immediately on Empty Utterance
**What goes wrong:** A chunk with only whitespace or empty string causes onend to fire instantly, skipping to the next chunk rapidly.
**Why it happens:** SpeechSynthesisUtterance with empty text fires end event synchronously.
**How to avoid:** Filter out empty/whitespace-only chunks during the splitting phase.
**Warning signs:** Progress bar jumps forward multiple steps instantly.

### Pitfall 7: Speed Rate Limits Per Browser
**What goes wrong:** Setting rate to values outside browser's supported range causes silent failure or clamping.
**Why it happens:** Browsers clamp rate to different ranges. Chrome: 0.1-10, Safari: ~0.1-2, Firefox: 0.1-10.
**How to avoid:** The chosen range (0.8x-1.5x) is safely within all browser limits. No action needed, but good to know.
**Warning signs:** Speed changes have no audible effect on some browsers.

## Code Examples

### Duration Calculation (D-04, D-06)
```javascript
// Source: Phase 1 render.php pattern + D-04
const WORDS_PER_MINUTE = 150;

function estimateDuration(wordCount, speed) {
    const minutes = wordCount / (WORDS_PER_MINUTE * speed);
    return Math.max(1, Math.round(minutes));
}

function formatDuration(minutes, isPlaying) {
    if (minutes < 1) {
        return isPlaying ? '< 1 min resterend' : '~1 min';
    }
    return isPlaying ? `~${minutes} min resterend` : `~${minutes} min`;
}

function calculateRemainingMinutes(totalChunks, completedChunks, totalWordCount, speed) {
    const remainingRatio = (totalChunks - completedChunks) / totalChunks;
    const remainingWords = totalWordCount * remainingRatio;
    return Math.max(1, Math.round(remainingWords / (WORDS_PER_MINUTE * speed)));
}
```

### Speed Cycling (D-07, D-08, D-09)
```javascript
// Source: D-07/D-08/D-09/D-10
const SPEED_STEPS = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5];
const DEFAULT_SPEED_INDEX = 2; // 1.0x

function formatSpeed(speed) {
    return Number.isInteger(speed) ? `${speed}x` : `${speed}x`;
}

// In TTSPlayer class:
cycleSpeed() {
    this.speedIndex = (this.speedIndex + 1) % SPEED_STEPS.length;
    this.speed = SPEED_STEPS[this.speedIndex];
    this.speedBtn.textContent = formatSpeed(this.speed);
    this.speedBtn.setAttribute('aria-label', `Afspeelsnelheid: ${formatSpeed(this.speed)}`);
    // Recalculate duration display
    this.updateDuration();
}
```

### Pause Without speechSynthesis.pause() (Android-safe)
```javascript
// Source: Research finding -- Android pause bug workaround
// Instead of speechSynthesis.pause(), let current chunk finish then hold
pause() {
    this.isPausePending = true;
    // Current chunk continues playing to its natural end
    // In playNextChunk(), check isPausePending before advancing:
}

playNextChunk() {
    if (this.isPausePending) {
        this.isPausePending = false;
        this.setState(STATES.PAUSED);
        return; // Don't advance -- wait for resume
    }
    // ... normal chunk advancement
}

resume() {
    this.setState(STATES.PLAYING);
    this.playNextChunk(); // Continue from where we paused
}
```

**Note:** This changes the pause UX slightly -- the current sentence finishes before pausing. This is actually MORE natural than cutting mid-word (which is what speechSynthesis.pause() does on desktop). However, for desktop browsers where pause() works correctly, you could use speechSynthesis.pause()/resume() directly and only fall back to the chunk-boundary approach on Android. The decision here is: consistent behavior everywhere (chunk-boundary pause) vs. more responsive pause on desktop (mid-sentence pause). Recommendation: use chunk-boundary pause everywhere for simplicity and consistency.

### render.php Extensions (New DOM Elements)
```php
<!-- Phase 2 additions inside .tts-info -->
<div class="tts-info">
    <span class="tts-label"><?php echo $label; ?></span>
    <span class="tts-duration" aria-live="polite">~<?php echo $reading_minutes; ?> min</span>
    <div class="tts-progress" role="progressbar"
         aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"
         aria-label="Voortgang">
        <div class="tts-progress__fill"></div>
    </div>
</div>
<!-- Speed button between .tts-info and .tts-stop-btn -->
<button class="tts-speed-btn" aria-label="Afspeelsnelheid: 1x">1x</button>
```

## Dutch Voice Names by Platform

Research from Readium Speech project (nl.json):

| Platform | Voice Names (nl-NL) | Voice Names (nl-BE) | Quality |
|----------|---------------------|---------------------|---------|
| Chrome Desktop | Google Nederlands (female) | -- | High |
| Edge/Windows | Colette, Fenna, Hanna (f), Maarten (m) | Dena (f), Arnaud (m) | Very High |
| macOS/iOS | Claire (f), Xander (m, preloaded) | Ellen (f, preloaded) | Low-Normal |
| Android/ChromeOS | Vrouwelijke stem 1/2/3, Mannelijke stem 1/2 | 1f, 1m | High |
| Windows (SAPI) | Frank (m) | -- | Normal |
| Firefox | Uses OS voices (no own voices) | Uses OS voices | Varies |

**Voice quality keyword recommendations (D-11.2):**
- **Positive keywords:** `enhanced`, `premium`, `neural`, `natural`, `online`, `hd`
- **Negative keywords:** `compact`
- **Browser-specific:** Edge voices containing "Online" are the neural/high-quality variants

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single long utterance | Sentence-level chunking | Always needed for Chrome | Required for articles > 15s of speech |
| speechSynthesis.pause()/resume() for Chrome keepalive | Chunking instead | 2020+ consensus | Pause/resume hack unreliable, especially on Android |
| Eager voice loading at page load | Lazy loading on first play | Best practice | Avoids blocking page render; voices may not be ready at load time anyway |

## Open Questions

1. **Exact pause behavior decision**
   - What we know: Android breaks speechSynthesis.pause(); chunk-boundary pause works everywhere
   - What's unclear: Whether to use mid-sentence pause on desktop (better UX) with chunk-boundary fallback on Android, or chunk-boundary everywhere (simpler code)
   - Recommendation: Start with chunk-boundary pause everywhere. If users report it feeling sluggish on desktop, add platform detection for mid-sentence pause later.

2. **Intl.Segmenter as alternative sentence splitter**
   - What we know: `Intl.Segmenter` with `granularity: 'sentence'` handles abbreviations natively and works in Chrome 87+, Safari 15.4+, Firefox 125+
   - What's unclear: Whether it handles Dutch abbreviations correctly
   - Recommendation: Use regex with abbreviation guard for Phase 2 (simpler, proven). Consider Intl.Segmenter in a future iteration if abbreviation issues arise.

## Project Constraints (from CLAUDE.md)

- **Tech:** Pure browser Web Speech API -- no server-side TTS or API keys
- **Platform:** WordPress plugin with Gutenberg block support
- **Language:** Primary Dutch content, must handle other languages
- **Cost:** Free -- no external services
- **Compatibility:** Chrome, Safari, Firefox, Edge (desktop + mobile)
- **Build:** @wordpress/scripts (zero-config webpack)
- **Block type:** Dynamic block (render.php), viewScript (vanilla JS), edit.js (React/JSX)
- **Frontend:** Zero npm dependencies; all WP packages provided at runtime
- **GSD Workflow:** Do not make direct repo edits outside a GSD workflow

## Sources

### Primary (HIGH confidence)
- [Chrome speechSynthesis 15s timeout bug](https://issues.chromium.org/issues/41294170) -- confirmed still open, chunking is the only reliable workaround
- [Chrome chunking workaround gist (woollsta)](https://gist.github.com/woollsta/2d146f13878a301b36d7) -- regex-based chunk splitting with onend chaining
- [SpeechSynthesis MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) -- API reference, getVoices(), onvoiceschanged
- [SpeechSynthesisVoice MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice) -- voice object properties
- [Readium Speech nl.json](https://github.com/readium/speech/blob/main/json/nl.json) -- Dutch voice names per platform with quality tiers

### Secondary (MEDIUM confidence)
- [Cross-browser speech synthesis guide (dev.to)](https://dev.to/jankapunkt/cross-browser-speech-synthesis-the-hard-way-and-the-easy-way-353) -- voice loading patterns, Android pause bug, browser matrix
- [web-speech-recommended-voices (GitHub)](https://github.com/HadrienGardeur/web-speech-recommended-voices) -- curated voice recommendations per language/platform
- [talkrapp.com speechSynthesis lessons](https://talkrapp.com/speechSynthesis.html) -- iOS voice names (Ellen nl-BE, Xander nl-NL), Chrome cloud voices delay

### Tertiary (LOW confidence)
- Android pause=cancel bug: confirmed by multiple sources but no official Chromium bug tracker link found; behavior may vary by Android version

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, extending Phase 1 vanilla JS
- Architecture: HIGH -- chunking pattern is well-documented with multiple reference implementations
- Voice selection: MEDIUM -- voice names confirmed via Readium Speech data, but actual availability depends on user's browser/OS
- Pitfalls: HIGH -- all documented bugs are long-standing and well-verified

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (Web Speech API is stable; no breaking changes expected)
