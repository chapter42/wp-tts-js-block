# TTS-JS — Browser Text-to-Speech WordPress Plugin

## What This Is

Een WordPress plugin die een clean "Listen to article" player toevoegt als Gutenberg block. Gebruikt de ingebouwde Web Speech API (`speechSynthesis`) van de browser om artikeltekst (headings + body) voor te lezen — geen externe API's of abonnementen nodig. Werkt responsive op desktop en mobiel.

## Core Value

Bezoekers van chapter42.com kunnen artikelen beluisteren via een native browser TTS player, zonder externe services of kosten.

## Requirements

### Validated

- [x] Browser Web Speech API gebruiken voor text-to-speech (geen externe API) — Validated in Phase 1: Block + Core Speech
- [x] Leest headings en body tekst van het artikel voor — Validated in Phase 1: Block + Core Speech
- [x] WordPress Gutenberg block voor eenvoudige plaatsing — Validated in Phase 1: Block + Core Speech

### Active

- [ ] Clean, minimale player UI: play/pause knop, geschatte tijdsduur, snelheidsknop
- [ ] Mobile responsive — werkt op mobiel en desktop
- [ ] Snelheidsregeling (bijv. 1x, 1.25x, 1.5x, 2x)

### Validated (Phase 3)

- [x] Cross-browser compatibiliteit (Chrome, Safari, Firefox, Edge) — Validated in Phase 3: Cross-Browser + Error Handling
- [x] Automatische taalselectie (primair Nederlands) — Validated in Phase 3: Cross-Browser + Error Handling
- [x] Automatische stemselectie (beste beschikbare stem per browser) — Validated in Phase 3: Cross-Browser + Error Handling

### Out of Scope

- Externe TTS API's (Google Cloud, Amazon Polly, etc.) — moet gratis en zonder API keys werken
- Stemkeuze dropdown voor gebruikers — automatisch de beste stem kiezen
- Audio opname/export naar MP3 — browser TTS is real-time alleen
- Sticky floating player — player blijft in het WordPress block
- Trinity Audio / betaalde dienst integratie — hele punt is dit te vermijden

## Context

- Website: chapter42.com, draait op WordPress
- Content is voornamelijk in het Nederlands
- Inspiratie: Google Blog "Listen to article" player (clean, minimaal) en Fortune/Trinity Audio player (als referentie voor controls)
- Web Speech API (`speechSynthesis`) is breed ondersteund: Chrome, Safari, Edge, Firefox
- Op mobiel (iOS Safari, Android Chrome) zijn er platform-specifieke beperkingen (bijv. user gesture vereist om audio te starten)
- Nederlandse stemmen variëren sterk per browser/OS — sommige hebben geen goede NL stem

## Constraints

- **Tech**: Puur browser Web Speech API — geen server-side TTS of API keys
- **Platform**: WordPress plugin met Gutenberg block support
- **Taal**: Primair Nederlandse content, maar moet andere talen aankunnen
- **Kosten**: Gratis — geen externe diensten of abonnementen
- **Compatibiliteit**: Moet werken op Chrome, Safari, Firefox, Edge (desktop + mobiel)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web Speech API i.p.v. externe API | Gratis, geen API keys, privacy-friendly, geen server nodig | Validated Phase 1 |
| WordPress Gutenberg block | Redactionele controle over plaatsing, past in WordPress workflow | Validated Phase 1 |
| Dynamic block (render.php) | save() returns null, avoids block validation errors, consistent HTML | Validated Phase 1 |
| parse_blocks() text extraction | Block-aware filtering, automatic exclusion of nav/footer/sidebars | Validated Phase 1 |
| CSS state machine (data-tts-state) | JS sets attribute, CSS drives all visual changes — clean separation | Validated Phase 1 |
| Minimale UI (Google Blog stijl) | Clean en niet-opdringerig, met optionele snelheidsknop | — Pending |
| Automatische stemkeuze | Minder UI complexiteit, betere UX voor bezoekers | Validated Phase 3 |
| Cross-browser voice loading | onvoiceschanged + polling fallback for Safari | Validated Phase 3 |
| Inline error messages (D-05) | Errors replace controls inline, no modal/toast | Validated Phase 3 |
| Auto-retry once on failure (D-03) | Invisible retry before showing error | Validated Phase 3 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-27 after Phase 3 completion*
