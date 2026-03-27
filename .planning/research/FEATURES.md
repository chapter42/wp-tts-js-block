# Feature Landscape

**Domain:** Browser-based Text-to-Speech article reader (WordPress plugin)
**Researched:** 2026-03-27
**Confidence:** HIGH (based on Web Speech API docs, competitor analysis, and cross-browser testing reports)

## Table Stakes

Features users expect from any "listen to article" player. Missing = product feels broken or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Play/Pause toggle | Core interaction; every audio player has this | Low | Must handle `speechSynthesis.pause()` / `.resume()` and their cross-browser quirks. Firefox has a known bug where `pause()` can make `speaking` stay true until browser restart |
| Stop/Reset | User should be able to stop playback and reset to beginning | Low | `speechSynthesis.cancel()` resets state. Important: always cancel before starting a new utterance |
| Automatic content extraction | Users click play and expect article text, not nav/footer/ads | Medium | Use the Gutenberg block context to extract headings + paragraphs. This is a natural advantage over browser extensions (Read Aloud, Speechify) that struggle with content extraction -- Edge's read-aloud reads cookie banners, navigation, footers, and "Subscribe" popups |
| Auto language detection | Dutch content must use Dutch voice | Medium | Match `document.documentElement.lang` or block attribute to available voices. Use BCP 47 tags (nl-NL). Note: some Android versions use underscores (nl_NL) instead of hyphens |
| Auto voice selection | User shouldn't need to pick a voice | Medium | Pick best available voice for detected language. Chrome loads voices asynchronously (requires `onvoiceschanged` handler); Safari/Firefox/Edge have them immediately. All Safari voices return `default: true`, making default detection impossible |
| User gesture to start (mobile) | iOS Safari and Android require user tap to initiate audio; platform requirement | Low | Ensure `speechSynthesis.speak()` is called directly in the click event handler (no async delay). iOS: the "soft mute" hardware switch silences TTS even at full volume -- nothing we can do but document it |
| Mobile responsive layout | Must work on phone screens | Low | Simple flexbox layout; touch-friendly button sizes (min 44x44px for a11y) |
| Visual play state feedback | User must know if audio is playing, paused, or stopped | Low | Toggle icon between play/pause states; show stopped state when utterance ends |
| Long text handling (Chrome 15s bug) | Chrome cancels speech after ~15 seconds on long utterances using remote Google voices | High | **CRITICAL.** Without this fix, the plugin is broken for any article longer than ~50 words on Chrome Desktop. Two approaches: (1) Text chunking -- split text at sentence boundaries, chain utterances via `onend` callbacks. More reliable, enables progress tracking and skip navigation. (2) Pause/resume timer -- call `pause()`+`resume()` every 14 seconds. Simpler but fragile. **Recommend text chunking.** |
| Loading/error states | User needs feedback when voices are loading or TTS unavailable | Low | Show "Loading voices...", "Your browser doesn't support audio playback" rather than a broken player. Check `window.speechSynthesis` existence and `getVoices()` for nl/nl-NL voices |

## Differentiators

Features that set this plugin apart from competitors. Not universally expected, but valued when present.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Speed control (1x/1.25x/1.5x/2x) | Power users want faster playback; every major TTS player offers this | Low | Set `SpeechSynthesisUtterance.rate` property (0.1 to 10 range). Discrete step cycling via button is cleaner than a slider. Note: when using text chunking, rate must be set on each new utterance |
| Estimated duration display | Sets expectations before pressing play; Google Blog player shows this | Medium | Calculate from word count. ~150 WPM at 1x rate is reasonable for Dutch speech synthesis. Recalculate when speed changes. Display as "~X min" |
| Zero configuration | No API keys, no account, no settings page needed. Install block, done | Low | **Core differentiator.** AtlasVoice pushes toward paid cloud voices. GSpeech requires API key for quality voices. Trinity Audio is a paid SaaS. BeyondWords is a paid platform. Our plugin: install, add block, works |
| Privacy-first (no external calls) | All processing in-browser; no data sent to servers | Low | Inherent to Web Speech API. Worth explicitly calling out for GDPR-conscious users. Caveat: Edge's "natural" ML voices stream from Microsoft servers -- this is browser behavior, not the plugin's doing |
| Clean Google Blog-style UI | Professional, minimal player matching the project inspiration | Low-Med | Minimal player bar with play/pause, duration, speed button. Not cluttered with voice pickers, download buttons, sharing icons |
| Progress bar | Visual indication of how far through the article | Medium | Cannot rely on `elapsedTime` (Chrome uses milliseconds, Edge uses seconds, values unreliable). Instead: with text chunking, track current chunk index / total chunks. With boundary events, track `charIndex` / total char count. Falls back to elapsed-time estimation where events are unreliable |
| Graceful degradation | Works when TTS is unavailable; doesn't show broken UI | Low | Hide player entirely or show friendly message if `speechSynthesis` not supported |
| Smart voice ranking | Automatically pick the best available Dutch voice per browser/OS | Medium | Build a ranked preference list. Prefer "natural"/"enhanced"/"premium" voices over "compact" ones. Reference the [Readium Speech](https://github.com/readium/speech) project for voice name patterns across platforms. macOS offers downloadable high-quality Dutch voices. Edge has the best selection (250+ voices, 75 languages) |
| Keyboard accessibility | Play/pause with Space/Enter when player is focused | Low | Good a11y practice; `keydown` handlers on the player container |

## Anti-Features

Features to explicitly NOT build. These add complexity without proportional value for this use case.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Voice selection dropdown | Adds UI complexity. Most users don't know voice names. GSpeech shows 230+ voices which overwhelms. Voices vary per browser/OS so the list changes everywhere | Auto-select best voice via ranking algorithm. Already marked out of scope in PROJECT.md |
| Audio export/download to MP3 | Web Speech API is real-time streaming only. MediaRecorder hack is unreliable cross-browser and produces poor quality. This is a fundamentally different product (BeyondWords, Amazon Polly) | Keep real-time only. Already out of scope |
| Floating/sticky player | Significant CSS/JS complexity (z-index wars, scroll tracking, viewport collision with theme elements). Trinity Audio does this; it's distracting on content-focused blogs | Keep player in-place as a Gutenberg block. Already out of scope |
| Cloud/AI voice fallback | Defeats core value proposition (free, no API keys, privacy-first). Competing on voice quality against Google/Amazon/ElevenLabs is a losing battle | Own the "zero cost, zero config" niche |
| Word-level text highlighting | `boundary` events provide `charIndex`/`charLength` but: (1) boundary events do NOT fire on Android, (2) Safari omits `charLength`, (3) requires mapping char positions back to DOM text nodes which is fragile with formatted HTML content. Extremely high complexity for unreliable results | Simple progress bar is more reliable and sufficient. Consider sentence-level highlighting as a future enhancement if there's demand |
| Podcast feed / RSS generation | Trinity Audio generates podcast feeds from articles. Massive scope creep (RSS management, hosting, metadata, distribution) | Out of scope. Different product category entirely |
| Analytics / listener tracking | Some plugins track play counts, completion rates, listen time. Requires server-side component or external service | Unnecessary for a personal blog. Can be added later via WordPress hooks if needed |
| Multi-language auto-detection per paragraph | Detecting language changes mid-article and switching voices is extremely complex | Set language at block/site level. The site is primarily Dutch |
| Settings page in wp-admin | Block-level settings are sufficient for a single-purpose plugin | Use InspectorControls (Gutenberg block sidebar) for any editor-facing settings |
| Volume control | Browser already has system/tab volume control. Adding another slider is redundant UI clutter | Let the browser/OS handle volume |
| Inline text editing before speech | BeyondWords lets you edit text before synthesis (fix pronunciation). Requires CMS layer | Edit the article content itself if pronunciation is wrong |

## Feature Dependencies

```
Content Extraction ──→ Text Chunking for Chrome bug (need parsed text to split)
       │                    │
       │                    ├──→ Skip Forward/Back (chunks enable natural navigation)
       │                    │
       │                    └──→ Progress Bar (track chunk index / total)
       │
       ├──→ Duration Estimate (need word count from extracted text)
       │         │
       │         └──← Speed Control (recalculate when rate changes)
       │
       └──→ Play/Pause/Stop (need text before you can speak it)
                 │
                 └──← User Gesture Handling (mobile tap must trigger speak())

Language Detection ──→ Voice Selection (need language to filter voices)
                           │
                           └──→ Smart Voice Ranking (enhanced selection per platform)

Voice Loading (async) ──→ Voice Selection (must wait for onvoiceschanged in Chrome)
                              │
                              └──→ Loading State UI (show "loading" until voices ready)
```

## MVP Recommendation

### Phase 1: Core Playback (must work reliably)
1. **Content extraction** from Gutenberg block context (headings + paragraphs)
2. **Play/Pause/Stop** with proper state management
3. **Auto voice selection** with Dutch preference (basic: first nl-NL voice found, handle async loading in Chrome)
4. **Text chunking** for Chrome long-text fix -- without this, plugin is broken on Chrome
5. **User gesture handling** for mobile (iOS Safari, Android Chrome)
6. **Graceful degradation** when speech synthesis is unavailable
7. **Basic responsive layout**

### Phase 2: Polish
8. **Speed control** (1x, 1.25x, 1.5x, 2x cycle button)
9. **Estimated duration** display
10. **Smart voice ranking** (platform-aware preference list for better Dutch voices)
11. **Clean UI** matching Google Blog player inspiration

### Phase 3: Enhanced UX (defer)
12. **Progress bar** with chunk-based tracking
13. **Keyboard accessibility** (Space/Enter to play/pause)
14. **Skip forward/back** by paragraph/chunk

**Phase ordering rationale:**
- Phase 1 tackles the hardest technical risks (Chrome 15s bug, cross-browser voice loading, mobile gesture requirements). If these don't work reliably, we know immediately and can adjust.
- Phase 2 is pure UX polish with low technical risk. Speed control and duration are straightforward once Phase 1's foundation is solid.
- Phase 3 features depend on Phase 1's text chunking infrastructure and are nice-to-have, not essential.

## Competitive Landscape

| Plugin/Tool | Model | Dutch Support | Key Differentiator | Weakness for our case |
|-------------|-------|---------------|--------------------|-----------------------|
| AtlasVoice (Text to Audio) | Freemium (browser free, cloud paid) | Via browser voices | Zero-config free tier, 315K+ downloads | Pushes toward paid cloud voices |
| GSpeech | Freemium | 230+ cloud voices | Google-quality voices | Requires API key for good voices |
| Trinity Audio | SaaS | 125 languages, 600+ voices | Full platform: podcast feeds, sharing, analytics | Paid service, overkill for blog |
| BeyondWords | SaaS | Yes (cloud) | Content editing, podcast distribution | Paid, complex, enterprise-focused |
| Reinvent WP | Freemium | Via browser/ElevenLabs | Multi-provider flexibility | Configuration complexity |
| Read Aloud (Chrome extension) | Free | Via browser voices | Works on any website | Not embedded, content extraction issues |
| Edge Read Aloud (built-in) | Free | Excellent natural voices | Best voice quality, no install | Reads entire page including nav/ads/footer |
| **Our plugin (tts-js)** | **Free, browser-only** | **Via browser voices** | **Zero config, zero cost, privacy-first, Gutenberg-native, reads only article content** | **Voice quality limited by browser/OS** |

**Our niche:** The intersection of "free + zero config + privacy-first + clean article extraction" that no competitor occupies. Competitors either charge money (Trinity, BeyondWords), require API keys (GSpeech, Reinvent WP), or have content extraction problems (browser extensions, Edge built-in).

## Sources

- [AtlasVoice / Text To Speech TTS Accessibility](https://wordpress.org/plugins/text-to-audio/) - WordPress.org plugin page
- [GSpeech TTS Plugin](https://gspeech.io/text-to-speech-wordpress-tts-plugin) - Feature overview
- [Trinity Audio WordPress Plugin](https://wordpress.org/plugins/trinity-audio/) - Player features and UI
- [Trinity Audio Player](https://www.trinityaudio.ai/trinity-player) - Commercial player features
- [Reinvent WP Text to Speech](https://wordpress.org/plugins/natural-text-to-speech/) - Multi-provider plugin
- [Web Speech Recommended Voices](https://github.com/HadrienGardeur/web-speech-recommended-voices) - Voice ranking reference (now Readium Speech)
- [easy-speech library](https://github.com/leaonline/easy-speech) - Cross-browser TTS wrapper
- [Chrome speechSynthesis 15s bug](https://issues.chromium.org/issues/41294170) - Chromium issue tracker
- [Chrome 15s workaround gist](https://gist.github.com/woollsta/2d146f13878a301b36d7) - Text chunking implementation
- [Boundary event MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/boundary_event) - Event API reference
- [SpeechSynthesisUtterance MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance) - Full API reference
- [Cross-browser speech synthesis guide](https://dev.to/jankapunkt/cross-browser-speech-synthesis-the-hard-way-and-the-easy-way-353) - Implementation patterns
- [Exploring the Web Speech API (De Voorhoede)](https://www.voorhoede.nl/en/blog/exploring-the-web-speech-api/) - Dutch agency's deep dive
- [JavaScript TTS quirks](https://codersblock.com/blog/javascript-text-to-speech-and-its-many-quirks/) - Cross-browser quirks catalog
- [Taming the Web Speech API](https://webreflection.medium.com/taming-the-web-speech-api-ef64f5a245e1) - Mobile workarounds
- [Spoken Word WP Plugin](https://weston.ruter.net/2018/02/21/spoken-word-read-along-tts/) - Word highlighting reference
- [Speech Synthesis on Can I Use](https://caniuse.com/speech-synthesis) - Browser support matrix
- [iOS Safari TTS issues](https://developer.apple.com/forums/thread/49875) - Apple Developer Forums
- [Firefox pause() bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1258526) - Mozilla bug tracker
