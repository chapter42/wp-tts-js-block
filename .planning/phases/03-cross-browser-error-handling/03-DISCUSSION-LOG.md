# Phase 3: Cross-Browser + Error Handling - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 03-cross-browser-error-handling
**Areas discussed:** Degradation strategy, Error messages & UX, iOS Safari edge cases, Detection approach

---

## Degradation Strategy

### No Web Speech API

| Option | Description | Selected |
|--------|-------------|----------|
| Hide completely | Player block renders nothing — visitor never knows it exists. Cleanest UX. | ✓ |
| Show message in player area | Show friendly message like 'Voorlezen is niet beschikbaar in deze browser' | |
| Show disabled player | Render player with greyed-out controls and explanation tooltip | |

**User's choice:** Hide completely
**Notes:** None

### No Voice for Language

| Option | Description | Selected |
|--------|-------------|----------|
| Show message in player | Player appears but shows 'Geen stem beschikbaar voor Nederlands' instead of controls | ✓ |
| Try fallback language | Try en-US or any available voice as fallback | |
| Hide player | Same as no API — hide entirely | |

**User's choice:** Show message in player
**Notes:** None

### Mid-Playback Failure

| Option | Description | Selected |
|--------|-------------|----------|
| Show error + reset to idle | Brief inline message, then reset after a few seconds | |
| Auto-retry once | Silently attempt to resume from where it stopped. If retry also fails, show error. | ✓ |
| Just stop silently | Return to idle without explanation | |

**User's choice:** Auto-retry once
**Notes:** None

---

## Error Messages & UX

### Error Message Language

| Option | Description | Selected |
|--------|-------------|----------|
| Always Dutch | Consistent with player labels. Site is primarily Dutch. | |
| Match block language setting | If block is set to nl-NL show Dutch errors, if en-US show English errors. | ✓ |
| You decide | Claude picks | |

**User's choice:** Match block language setting
**Notes:** Multilingual-ready approach chosen over hardcoded Dutch

### Error Message Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Inline in player area | Message replaces controls inside player container | ✓ |
| Below the player | Player shell stays visible, message appears underneath | |
| Replace player entirely | Whole player block becomes just error text | |

**User's choice:** Inline in player area
**Notes:** None

### Error Message Tone

| Option | Description | Selected |
|--------|-------------|----------|
| Friendly + brief | Short, human. No technical jargon. | ✓ |
| Helpful + suggestion | Include a hint pointing to solution | |
| You decide | Claude picks per error type | |

**User's choice:** Friendly + brief
**Notes:** None

---

## iOS Safari Edge Cases

### Background Tab Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-retry on tab return | Detect visibilitychange, auto-retry from where it stopped on foreground | ✓ |
| Pause and let user resume | Show player in paused state on return | |
| You decide | Claude picks | |

**User's choice:** Auto-retry on tab return
**Notes:** Ties into general auto-retry strategy (D-03)

### Silent/Mute Switch

| Option | Description | Selected |
|--------|-------------|----------|
| Ignore it | Don't detect, same as any audio app | |
| Show hint on first play | One-time tip: 'Geen geluid? Controleer of je telefoon niet op stil staat.' | ✓ |
| You decide | Claude picks | |

**User's choice:** Show hint on first play
**Notes:** One-time display only

### iOS Voice Availability

| Option | Description | Selected |
|--------|-------------|----------|
| Use best available voice | Fall back to whatever Dutch-ish voice available. If none, show no-voice message. | ✓ |
| Wait longer for voices | Extended timeout (3s) for iOS before giving up | |
| Both — wait then fallback | Extended wait, then fall back | |

**User's choice:** Use best available voice
**Notes:** No special iOS timeout

---

## Detection Approach

### Feature Detection vs Browser Sniffing

| Option | Description | Selected |
|--------|-------------|----------|
| Feature detection only | Check speechSynthesis in window, test getVoices(), listen for errors. No UA parsing. | ✓ |
| Feature detection + targeted UA sniffing | Feature detect first, also sniff for known problem browsers | |
| You decide | Claude picks | |

**User's choice:** Feature detection only
**Notes:** Most robust and future-proof

### Test Depth

| Option | Description | Selected |
|--------|-------------|----------|
| API check only | Check if speechSynthesis exists and getVoices() returns results. No test utterance. | ✓ |
| Silent test utterance | Speak empty utterance at volume 0 to verify engine works | |
| You decide | Claude picks | |

**User's choice:** API check only
**Notes:** None

### Check Timing

| Option | Description | Selected |
|--------|-------------|----------|
| On page load | Check immediately when player script loads. Hide before visible. | |
| On first play click | Only check when user tries to play. Player always renders initially. | ✓ |
| You decide | Claude picks | |

**User's choice:** On first play click
**Notes:** Player always renders; errors shown on interaction. Means "hide completely" (D-01) triggers on first click, not on load.

---

## Claude's Discretion

- Exact error message copy per language
- iOS silent switch hint persistence mechanism (localStorage vs session)
- visibilitychange implementation details

## Deferred Ideas

None — discussion stayed within phase scope
