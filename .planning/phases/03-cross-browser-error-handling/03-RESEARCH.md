# Phase 3: Cross-Browser + Error Handling - Research

**Researched:** 2026-03-27
**Domain:** Web Speech API cross-browser compatibility and error handling
**Confidence:** HIGH

## Summary

Phase 3 hardens the existing TTS player (built in Phase 1/2) to work reliably across Chrome, Safari, Firefox, and Edge -- including mobile variants -- and adds graceful error handling when speech synthesis is unavailable or voices are missing.

The Web Speech API has significant cross-browser inconsistencies that require careful handling. The three biggest challenges are: (1) voice loading is asynchronous and varies wildly per browser, (2) Android browsers do not support pause/resume at all, and (3) iOS Safari stops speech when the tab backgrounds and cannot recover without user action. The existing Phase 1 `view.js` already has a clean state machine (`STATES` object + `setState()`) that Phase 3 extends with an `ERROR` state.

**Primary recommendation:** Add a capability detection layer that runs on first play click (per D-12), a voice loading abstraction with polling fallback, an `ERROR` state in the state machine, and a `visibilitychange` listener for iOS tab-backgrounding recovery. All error messages flow through `render.php` data attributes keyed by block language.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** When the browser has NO Web Speech API at all, hide the player completely -- visitor never sees it.
- **D-02:** When the API exists but no voice is available for the configured language, show an inline message in the player area (e.g. "Geen stem beschikbaar voor Nederlands").
- **D-03:** If speech fails mid-playback (engine error, iOS tab background), auto-retry once from where it stopped. If retry also fails, show a brief error message and reset to idle.
- **D-04:** Error message language matches the block's language setting (nl-NL -> Dutch errors, en-US -> English errors). Not hardcoded Dutch.
- **D-05:** Error messages appear inline within the player area, replacing the controls. No popups, toasts, or external elements.
- **D-06:** Error tone is friendly and brief -- no technical jargon.
- **D-07:** On iOS background tab (visibilitychange event): auto-retry from where speech stopped when tab returns to foreground. Ties into D-03 auto-retry behavior.
- **D-08:** Silent/mute switch: show a one-time hint on first play -- "Geen geluid? Controleer of je telefoon niet op stil staat." Do not try to detect the switch programmatically.
- **D-09:** iOS voice availability: use best available voice. If no Dutch voice exists at all, trigger the "no voice" message (D-02). No extended wait/timeout for iOS specifically.
- **D-10:** Use feature detection only -- check `'speechSynthesis' in window` and `getVoices()` results. No user-agent sniffing.
- **D-11:** API check only -- no silent test utterance.
- **D-12:** Capability check runs on first play click, not on page load. Player always renders initially; if no support, show inline error on first interaction.

### Claude's Discretion
- Specific error message copy per language (exact wording for each error state)
- How to detect "first play ever" for the iOS silent switch hint (localStorage flag vs. session flag)
- Exact visibilitychange handling implementation details

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| XBRW-01 | Works on Chrome desktop and Android | Chrome voice loading (onvoiceschanged), Android pause-as-cancel behavior, user gesture requirement |
| XBRW-02 | Works on Safari desktop and iOS Safari | getVoices() empty on Safari, iOS background tab stops speech, silent switch hint, voice availability |
| XBRW-03 | Works on Firefox desktop | Firefox loads voices synchronously, uses OS speech engine, fewer built-in voices |
| XBRW-04 | Works on Edge desktop | Same Chromium engine as Chrome -- same workarounds apply |
| XBRW-05 | Respects mobile user gesture requirement (speak() in click handler) | Already handled in Phase 1 (speak() called from click handler); needs verification that retry also uses user context |
| ERR-01 | Player shows friendly message when browser doesn't support Web Speech API | Feature detection pattern + D-01 hide player completely |
| ERR-02 | Player shows message when no voice is available for the detected language | Voice loading + language filtering + D-02 inline message |
| ERR-03 | Player hides gracefully rather than showing broken UI on unsupported browsers | D-01 hide + D-05 inline errors + ERROR state in state machine |

</phase_requirements>

## Architecture Patterns

### Current State Machine (Phase 1)
```
idle -> loading -> playing -> paused -> stopped/finished
```

### Extended State Machine (Phase 3)
```
idle -> loading -> playing -> paused -> stopped/finished
                      |
idle -> loading -> error (no API / no voice / engine failure)
                      |
              playing -> error-retry -> playing (auto-retry once)
                                     -> error (retry failed)
```

New states/transitions:
- `error` -- terminal error state, shows inline message, replaces controls
- Hidden player -- when `'speechSynthesis' in window` is false (D-01), the player container gets `display: none` or removed from DOM

### Recommended Code Structure Changes

**view.js modifications:**
```
TTSPlayer class additions:
  + ERROR state in STATES enum
  + checkCapabilities() -- runs on first play click (D-12)
  + loadVoices() -- cross-browser voice loading with polling fallback
  + selectVoice(lang) -- best voice for language
  + getErrorMessage(errorType, lang) -- localized error strings
  + showError(message) -- replace controls with inline message (D-05)
  + handleVisibilityChange() -- iOS background tab recovery (D-07)
  + retryPlayback(position) -- auto-retry once from last position (D-03)
  + showMuteHint() -- one-time iOS silent switch hint (D-08)
```

**render.php modifications:**
```
  + data-tts-errors attribute -- JSON-encoded error messages per language
  + OR: error message strings as individual data attributes
```

### Pattern 1: Capability Check on First Play
**What:** Defer all API checking to first user interaction (D-12)
**When to use:** Always -- player renders initially, checks on click

```javascript
// Source: D-12 decision + MDN SpeechSynthesis docs
checkCapabilities() {
  // Step 1: Check API existence
  if (!('speechSynthesis' in window)) {
    this.hidePlayer(); // D-01: hide completely
    return false;
  }

  // Step 2: Load voices and check language availability
  const voices = this.loadVoices();
  const langVoice = voices.find(v => v.lang.startsWith(this.lang.substring(0, 2)));
  if (!langVoice) {
    this.showError(this.getErrorMessage('no-voice', this.lang)); // D-02
    return false;
  }

  this.selectedVoice = langVoice;
  return true;
}
```

### Pattern 2: Cross-Browser Voice Loading
**What:** Handle the three different voice loading patterns across browsers
**When to use:** During capability check before first playback

```javascript
// Source: MDN getVoices docs + dev.to cross-browser guide
loadVoices() {
  return new Promise((resolve) => {
    let voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Chrome/Edge: voices load asynchronously via onvoiceschanged
    // Safari: onvoiceschanged may not fire; use polling fallback
    // Note: Safari does not support addEventListener on speechSynthesis
    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      }
    };

    // Polling fallback for Safari and edge cases
    let elapsed = 0;
    const maxWait = 2000;
    const interval = 250;
    const poll = () => {
      voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }
      elapsed += interval;
      if (elapsed >= maxWait) {
        resolve([]); // No voices found within timeout
        return;
      }
      setTimeout(poll, interval);
    };
    setTimeout(poll, interval);
  });
}
```

### Pattern 3: Visibility Change Handler (iOS Tab Background)
**What:** Detect when iOS Safari backgrounds the tab and retry speech when returning
**When to use:** Active during playback state

```javascript
// Source: D-07 decision + Safari speech synthesis research
handleVisibilityChange() {
  if (document.visibilityState === 'hidden' && this.state === STATES.PLAYING) {
    // Store approximate position for retry
    this.lastPlaybackPosition = this.currentChunkIndex || 0;
    this.wasPlayingBeforeHidden = true;
  }

  if (document.visibilityState === 'visible' && this.wasPlayingBeforeHidden) {
    this.wasPlayingBeforeHidden = false;
    // Check if speech actually stopped
    if (!speechSynthesis.speaking) {
      this.retryPlayback(this.lastPlaybackPosition);
    }
  }
}
```

### Pattern 4: Auto-Retry on Failure
**What:** Retry once from where speech stopped; show error if retry also fails (D-03)
**When to use:** On onerror event (excluding 'canceled')

```javascript
// Source: D-03 decision
handleSpeechError(event) {
  if (event.error === 'canceled' || event.error === 'interrupted') {
    return; // Not a real error
  }

  if (!this.hasRetried) {
    this.hasRetried = true;
    // Retry from current position (invisible to user if it works)
    this.retryPlayback(this.currentChunkIndex || 0);
  } else {
    // Retry already failed; show error and reset
    this.showError(this.getErrorMessage('playback-failed', this.lang));
    setTimeout(() => {
      this.hideError();
      this.setState(STATES.IDLE);
    }, 5000);
    this.hasRetried = false;
  }
}
```

### Pattern 5: Localized Error Messages via Data Attributes
**What:** Pass error message strings from render.php so they match block language (D-04)
**When to use:** render.php generates the data attributes; JS reads them

```php
// render.php addition
$error_messages = [
  'nl-NL' => [
    'no-support' => 'Voorlezen is niet beschikbaar in deze browser.',
    'no-voice'   => 'Geen stem beschikbaar voor Nederlands.',
    'failed'     => 'Voorlezen is helaas mislukt. Probeer het opnieuw.',
    'mute-hint'  => 'Geen geluid? Controleer of je telefoon niet op stil staat.',
  ],
  'en-US' => [
    'no-support' => 'Text-to-speech is not available in this browser.',
    'no-voice'   => 'No voice available for this language.',
    'failed'     => 'Playback failed. Please try again.',
    'mute-hint'  => 'No sound? Check if your phone is not on silent mode.',
  ],
];
$lang_key = $lang; // from block attributes
$msgs = $error_messages[$lang_key] ?? $error_messages['en-US'];
// Add as data attribute
// data-tts-errors='{"no-support":"...","no-voice":"...","failed":"...","mute-hint":"..."}'
```

### Anti-Patterns to Avoid
- **User-agent sniffing for capability detection:** Use feature detection only (D-10). UA strings are unreliable and break with new browser versions.
- **Silent test utterance:** Do not speak at volume 0 to test capabilities (D-11). Some browsers count this as user-gesture-less speech and block it.
- **addEventListener on speechSynthesis:** Safari does not support `addEventListener` on the `speechSynthesis` object. Use `onvoiceschanged` property assignment instead.
- **Relying on pause/resume on Android:** Android Chrome/Firefox treat `pause()` as `cancel()`. Phase 2 may already handle this; Phase 3 must verify.
- **Assuming onend fires after cancel():** Safari does NOT fire the `end` event when `cancel()` is called. Only fires on natural completion.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Full speech synthesis wrapper | Complete cross-browser abstraction library | Targeted workarounds in existing TTSPlayer class | The player already has a clean architecture; a full wrapper adds unnecessary abstraction. Target the 4-5 specific quirks directly. |
| Language detection | Custom language detection from page content | Block `lang` attribute (already exists in block.json) | Language is a user-set block attribute; no need to auto-detect from page content for error messages. |
| Mobile platform detection | UA-string parser | Feature detection (D-10) + behavior-based fallbacks | Detect capabilities, not platforms. Android pause-as-cancel can be detected by attempting pause then checking `.paused` property. |

## Common Pitfalls

### Pitfall 1: getVoices() Returns Empty on Chrome First Call
**What goes wrong:** `speechSynthesis.getVoices()` returns `[]` on Chrome/Edge because voices load asynchronously (remote Google/Microsoft voices).
**Why it happens:** Chrome fetches cloud voices after page load; they are not available synchronously.
**How to avoid:** Use `onvoiceschanged` callback + polling fallback pattern (see Pattern 2 above).
**Warning signs:** Voice selection returns null; utterance plays with system default voice instead of desired language.

### Pitfall 2: Safari onvoiceschanged May Not Fire
**What goes wrong:** Safari sometimes never fires `onvoiceschanged`, and `getVoices()` may return empty or inconsistent results.
**Why it happens:** Safari's Web Speech API implementation is incomplete and buggy, especially on iOS.
**How to avoid:** Always include polling fallback (250ms intervals, 2s max). Accept that Safari may only provide a limited voice set.
**Warning signs:** Player stays in loading state indefinitely on Safari.

### Pitfall 3: Android Pause Behaves as Cancel
**What goes wrong:** Calling `speechSynthesis.pause()` on Android Chrome/Firefox actually stops/cancels playback entirely instead of pausing.
**Why it happens:** Android browsers implement pause as cancel -- this is a known platform limitation, not a bug.
**How to avoid:** Either disable pause on Android (show stop instead) or re-implement pause as "remember position + cancel, then resume from position on unpause." Phase 2 chunking makes position tracking feasible.
**Warning signs:** User presses pause on Android, then resume does nothing (speech was cancelled).

### Pitfall 4: SpeechSynthesisUtterance Garbage Collection
**What goes wrong:** The utterance object gets garbage collected before speech completes, causing `onend` and `onerror` callbacks to never fire.
**Why it happens:** If the utterance is only referenced inside a local function scope, the JS engine may GC it.
**How to avoid:** Store utterance as an instance property (`this.utterance = ...`). The current Phase 1 code already does this correctly.
**Warning signs:** Speech plays but `onend` never fires; player stays in "playing" state forever.

### Pitfall 5: iOS Silent Switch Silences Speech
**What goes wrong:** Speech synthesis produces no audible output when the iOS hardware silent switch is on.
**Why it happens:** iOS treats speechSynthesis audio the same as notification audio -- silenced by the mute switch.
**How to avoid:** Cannot detect programmatically (D-08). Show a one-time hint on first play suggesting user check mute switch.
**Warning signs:** User reports "nothing happens" on iOS despite player showing playing state.

### Pitfall 6: Safari Does Not Fire 'end' Event on cancel()
**What goes wrong:** After calling `speechSynthesis.cancel()`, Safari does not fire the `end` event on the utterance.
**Why it happens:** Safari implementation difference -- only fires `end` on natural completion.
**How to avoid:** Do not rely on `onend` to clean up after manual cancellation. Perform cleanup directly in the `stop()` method (current Phase 1 code already handles this correctly by resetting state in `stop()` rather than waiting for `onend`).
**Warning signs:** Player gets stuck in playing state after stop on Safari.

### Pitfall 7: Rate Values Above 2 Break Chrome
**What goes wrong:** Setting `utterance.rate` above 2 causes Chrome to silently fail -- no speech output.
**Why it happens:** Chrome enforces a max rate of ~2.0 but does not throw an error.
**How to avoid:** Clamp rate to range [0.1, 2.0]. Phase 1 speed options (1x, 1.25x, 1.5x, 2x) are already within safe range.
**Warning signs:** No speech output at higher speeds.

## SpeechSynthesisErrorEvent Error Codes Reference

All possible `event.error` values from the onerror handler:

| Error Code | Meaning | Action in This Plugin |
|------------|---------|----------------------|
| `canceled` | Utterance removed from queue by `cancel()` | Ignore -- not a real error |
| `interrupted` | Utterance interrupted by `cancel()` mid-speech | Ignore -- not a real error |
| `audio-busy` | Audio output device busy | Show playback-failed error (D-03 retry) |
| `audio-hardware` | No audio output device found | Show playback-failed error (D-03 retry) |
| `network` | Network communication failed (cloud voices) | Show playback-failed error (D-03 retry) |
| `synthesis-unavailable` | No synthesis engine available | Show no-support error (D-01) |
| `synthesis-failed` | Synthesis engine error | Show playback-failed error (D-03 retry) |
| `language-unavailable` | No voice for the set language | Show no-voice error (D-02) |
| `voice-unavailable` | Specified voice not available | Show no-voice error (D-02) |
| `text-too-long` | Text exceeds max length | Should not happen with chunking (Phase 2) |
| `invalid-argument` | Bad rate/pitch/volume value | Should not happen with clamped values |
| `not-allowed` | Operation not permitted | Show no-support error; likely autoplay blocked |

Source: [MDN SpeechSynthesisErrorEvent.error](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisErrorEvent/error)

## Code Examples

### Complete Feature Detection Flow (D-10, D-11, D-12)
```javascript
// Source: MDN + cross-browser research
// Runs on FIRST PLAY CLICK only (D-12)
async checkCapabilities() {
  // D-10: Feature detection only, no UA sniffing
  if (!('speechSynthesis' in window)) {
    this.container.style.display = 'none'; // D-01: hide completely
    return false;
  }

  // D-11: No silent test utterance -- check API + voices only
  const voices = await this.loadVoices();

  // D-09: Best available voice for language
  const langPrefix = this.lang.substring(0, 2); // 'nl' from 'nl-NL'
  const exactMatch = voices.find(v => v.lang === this.lang);
  const prefixMatch = voices.find(v => v.lang.startsWith(langPrefix));

  if (exactMatch) {
    this.selectedVoice = exactMatch;
  } else if (prefixMatch) {
    this.selectedVoice = prefixMatch;
  } else {
    // D-02: No voice for language
    const msg = this.errorMessages['no-voice'] || 'No voice available.';
    this.showError(msg);
    return false;
  }

  return true;
}
```

### Inline Error Display (D-05)
```javascript
// Source: D-05 decision -- errors replace controls inline
showError(message) {
  this.setState('error');
  // Hide controls, show message in same container space
  this.playBtn.style.display = 'none';
  this.stopBtn.style.display = 'none';

  let errorEl = this.container.querySelector('.tts-error');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'tts-error';
    errorEl.setAttribute('role', 'status');
    this.container.querySelector('.tts-info').appendChild(errorEl);
  }
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

hideError() {
  const errorEl = this.container.querySelector('.tts-error');
  if (errorEl) errorEl.style.display = 'none';
  this.playBtn.style.display = '';
  this.stopBtn.style.display = '';
}
```

### One-Time iOS Mute Hint (D-08)
```javascript
// Source: D-08 decision
// Recommendation: use localStorage for persistence across sessions
showMuteHintIfNeeded() {
  // Only show on touch devices (proxy for mobile)
  if (!('ontouchstart' in window)) return;

  const hintKey = 'tts-mute-hint-shown';
  if (localStorage.getItem(hintKey)) return;

  // Show hint briefly after first play starts
  const hint = document.createElement('div');
  hint.className = 'tts-mute-hint';
  hint.textContent = this.errorMessages['mute-hint']
    || 'No sound? Check if your phone is not on silent mode.';
  this.container.appendChild(hint);

  localStorage.setItem(hintKey, '1');

  // Auto-dismiss after 6 seconds
  setTimeout(() => {
    hint.remove();
  }, 6000);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| UA sniffing for browser detection | Feature detection + capability checks | Ongoing best practice | More reliable, future-proof |
| Single getVoices() call | onvoiceschanged + polling fallback | Chrome 33+ (async voices) | Required for Chrome/Edge voice loading |
| Relying on pause/resume everywhere | Platform-aware pause behavior | Android has never supported real pause | Must handle Android pause-as-cancel |
| Assuming onend always fires | Defensive cleanup in stop/cancel methods | Safari has never fired onend on cancel | Clean up state in the action method, not the callback |

## Open Questions

1. **Android pause/resume behavior with Phase 2 chunking**
   - What we know: Android treats `pause()` as `cancel()`. Phase 2 adds chunking with `onend` chaining.
   - What's unclear: How Phase 2 will implement pause -- if it stores chunk position, Android pause could work as "stop at current chunk + resume from next chunk."
   - Recommendation: Phase 3 plan should verify Phase 2's pause implementation and adapt if needed. If Phase 2 already tracks chunk position, Android "pause" can be implemented as cancel-current-chunk + remember-position.

2. **Exact retry position tracking**
   - What we know: D-03 says retry from where speech stopped. Phase 2 adds chunking.
   - What's unclear: Whether `charIndex` from boundary events is reliable enough for mid-chunk retry.
   - Recommendation: Retry from the start of the current/last chunk rather than mid-chunk. Chunk-level granularity is good enough for user experience and avoids unreliable `charIndex` values.

3. **Voice quality ranking**
   - What we know: Phase 2 handles voice selection (SPCH-05). Phase 3 only needs to detect "no voice available."
   - What's unclear: Whether Phase 2's voice selection is robust enough or Phase 3 needs to add fallback logic.
   - Recommendation: Phase 3 should wrap Phase 2's voice selection with a null-check. If Phase 2 returns no voice, show D-02 error.

## Sources

### Primary (HIGH confidence)
- [MDN SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) - API reference, feature detection
- [MDN SpeechSynthesisErrorEvent.error](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisErrorEvent/error) - Complete error code reference
- [Can I Use: Speech Synthesis](https://caniuse.com/speech-synthesis) - Browser support matrix

### Secondary (MEDIUM confidence)
- [Cross-browser speech synthesis guide (dev.to)](https://dev.to/jankapunkt/cross-browser-speech-synthesis-the-hard-way-and-the-easy-way-353) - Comprehensive cross-browser patterns, voice loading strategies, Android/Chrome/Safari workarounds
- [JavaScript TTS Quirks (Coder's Block)](https://codersblock.com/blog/javascript-text-to-speech-and-its-many-quirks/) - Safari addEventListener issue, Android pause behavior, rate limits, event quirks
- [Safari Speech Synthesis State (WebOutLoud)](https://weboutloud.io/bulletin/speech_synthesis_in_safari/) - Safari getVoices() empty, iOS background tab stops, voice selection broken
- [SpeechSynthesis Lessons (TalkrApp)](https://talkrapp.com/speechSynthesis.html) - GC of utterance objects, iOS voice filtering, autoplay restrictions

### Tertiary (LOW confidence)
- [Apple Developer Forums: iOS TTS](https://developer.apple.com/forums/thread/49875) - iOS-specific issues (community reports, not official docs)

## Metadata

**Confidence breakdown:**
- Cross-browser quirks: HIGH - Multiple independent sources confirm the same issues (getVoices async, Android pause-as-cancel, Safari onend-on-cancel)
- Error handling patterns: HIGH - MDN error codes are authoritative; mapping to user decisions is straightforward
- iOS background tab recovery: MEDIUM - Behavior is well-documented but recovery via visibilitychange is community-sourced, not officially documented by Apple
- Voice availability: MEDIUM - Voice lists vary by OS version and device; testing on real devices is the only reliable verification

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (Web Speech API is stable/stagnant; browser quirks change slowly)
