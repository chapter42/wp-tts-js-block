# Phase 2: Reliable Speech + Full Player - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 02-reliable-speech-full-player
**Areas discussed:** Chunking strategy, Progress bar & duration, Speed control UX, Voice selection logic

---

## Chunking Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Sentence-level | Split at sentence boundaries (. ! ? followed by space/newline). Natural pauses, easy progress tracking. | ✓ |
| Paragraph-level | One chunk per paragraph/heading. Simpler but long paragraphs may hit Chrome's 15s limit. | |
| Fixed character limit | Split at ~200 chars at nearest word boundary. Guarantees no timeout but cuts mid-sentence. | |

**User's choice:** Sentence-level
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Seamless chaining | Queue next chunk via onend callback — natural rhythm, no gaps | ✓ |
| Tiny pause (~100ms) | Brief delay between sentences for breathing room | |
| You decide | Claude picks | |

**User's choice:** Seamless chaining
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Sub-split at clause boundaries | Split at commas/semicolons/dashes if >300 chars | ✓ |
| Keep as one chunk | Trust most Dutch sentences won't hit 15s | |
| You decide | Claude picks based on testing | |

**User's choice:** Sub-split at clause boundaries
**Notes:** None

---

## Progress Bar & Duration

| Option | Description | Selected |
|--------|-------------|----------|
| Word count / speaking rate | Calculate from total words / ~150 wpm, adjusted for speed | ✓ |
| Chunk count x avg time | Estimate from number of sentence chunks | |
| You decide | Claude picks | |

**User's choice:** Word count / speaking rate
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Chunk-based | Progress = completed chunks / total chunks | ✓ |
| Word-based smooth | Progress = words spoken / total words | |
| Time-based estimate | Progress = elapsed / estimated total | |

**User's choice:** Chunk-based
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Show remaining time | Switch from '~3 min' to '~2 min remaining' during playback | ✓ |
| Static estimate only | Keep showing initial estimate throughout | |
| You decide | Claude picks | |

**User's choice:** Show remaining time
**Notes:** None

---

## Speed Control UX

| Option | Description | Selected |
|--------|-------------|----------|
| 1x → 1.25x → 1.5x → 2x | Four steps as in requirements | |
| 1x → 1.5x → 2x | Three steps, simpler | |
| 1x → 1.25x → 1.5x → 1.75x → 2x | Five steps, fine-grained | |
| Custom: 0.8-1.5x in 0.1 steps | User-specified range with 8 speeds | ✓ |

**User's choice:** Custom speeds: 0.8x, 0.9x, 1x, 1.1x, 1.2x, 1.3x, 1.4x, 1.5x
**Notes:** User specifically wants sub-1x speeds (0.8, 0.9) and fine 0.1x granularity. No 2x speed.

| Option | Description | Selected |
|--------|-------------|----------|
| Show multiplier text | Button shows '1x', '1.2x', '0.8x' — compact | ✓ |
| Label + multiplier | 'Snelheid: 1.2x' — more explicit, more space | |
| You decide | Claude picks | |

**User's choice:** Show multiplier text
**Notes:** None

---

## Voice Selection Logic

| Option | Description | Selected |
|--------|-------------|----------|
| Quality heuristic ranking | Score by lang match, name keywords, non-default preference | ✓ |
| First match wins | Pick first voice matching 'nl' | |
| Hardcoded preference list | Maintain known good voices per browser | |

**User's choice:** Quality heuristic ranking
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Fall back to English, show notice | Try English as fallback with notice | |
| Disable player, show message | Don't play — show 'Geen geschikte stem gevonden' | ✓ |
| Use any available voice silently | Pick whatever is available without telling user | |

**User's choice:** Disable player, show message
**Notes:** User prefers clean failure over wrong-language playback

| Option | Description | Selected |
|--------|-------------|----------|
| Wait up to 3s for voices | onvoiceschanged + poll every 100ms, give up after 3s | ✓ |
| Defer until first play | Only resolve voices when user clicks play | |
| You decide | Claude picks | |

**User's choice:** Wait up to 3s for voices
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Cache after first resolution | Store selected voice, reuse on subsequent plays | ✓ |
| Re-evaluate each play | Check available voices each time play is pressed | |
| You decide | Claude picks | |

**User's choice:** Cache after first resolution
**Notes:** None

---

## Claude's Discretion

- Progress bar visual style (color, thickness, animation)
- Mobile responsive breakpoints
- Exact voice quality keywords to score per browser

## Deferred Ideas

None
