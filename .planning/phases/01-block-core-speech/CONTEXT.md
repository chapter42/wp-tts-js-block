# Phase 1 Context: Block + Core Speech

**Phase:** 1 — Block + Core Speech
**Created:** 2026-03-27
**Status:** Decided

## Decisions

### D1: Player visuele stijl
**Decision:** Chapter42 brand kleuren en fonts gebruiken als basis
**Rationale:** Plugin is specifiek voor chapter42.com, moet naadloos aansluiten bij bestaande site styling
**Impact:** CSS moet brandkleuren als CSS custom properties / variabelen gebruiken, zodat het bij de site past. Research moet chapter42.com styling ophalen.

### D2: Player labels in het Nederlands
**Decision:** Nederlandse UI labels ("Luister naar artikel", "~3 min")
**Rationale:** Site is primair Nederlandstalig
**Impact:** Hardcoded NL labels in v1 (i18n is v2)

### D3: Volledige breedte player
**Decision:** Player vult de hele content-kolom
**Rationale:** Consistent met Google Blog stijl referentie, maximale leesbaarheid
**Impact:** CSS: width: 100% binnen de content container

### D4: Text extractie scope — wat WEL voorlezen
**Decision:** h1 (titel), h2-h6 (subheadings), paragrafen (p), lijsten (ul/ol), blockquotes
**Rationale:** Dekt alle lopende content die je als lezer zou willen horen
**Impact:** DOM walker moet deze elementen selecteren in reading order

### D5: Text extractie scope — wat NIET voorlezen
**Decision:** Code blocks (pre/code), captions/figcaption, tabellen (table)
**Rationale:** Code is niet zinvol om voor te lezen, captions zijn redundant, tabellen zijn onleesbaar als speech
**Impact:** DOM walker moet deze elementen expliciet skippen

### D6: Editor preview — live preview
**Decision:** Het block toont een live preview van de player in de Gutenberg editor (niet-afspeelbaar)
**Rationale:** WYSIWYG — redacteur ziet precies hoe de player eruit zal zien
**Impact:** Block edit.js moet dezelfde player UI renderen als de frontend, maar zonder speech functionaliteit

### D7: Block sidebar instellingen
**Decision:** Vier instellingen in InspectorControls:
1. **Taal selectie** — dropdown (default: nl-NL)
2. **Standaard snelheid** — dropdown (default: 1x)
3. **Label tekst** — tekstveld (default: "Luister naar artikel")
4. **Content selector** — tekstveld, UITGESTELD naar v2

**Rationale:** Goede defaults zodat het block direct werkt zonder configuratie. Content selector is te geavanceerd voor v1.
**Impact:** Block attributes: `lang` (string, default "nl-NL"), `speed` (float, default 1.0), `label` (string, default "Luister naar artikel"). Content selector uitgesteld.

### D8: Play start — kort laden
**Decision:** Bij eerste play-klik: toon korte laadstatus terwijl tekst geëxtraheerd en stem geladen wordt
**Rationale:** Gebruiker krijgt feedback dat er iets gebeurt, voorkomt verwarring bij langzame voice loading
**Impact:** Player state machine: idle → loading → playing → paused → stopped/finished. Loading state met spinner/indicator.

### D9: Einde — checkmark dan reset
**Decision:** Na afspelen: toon ✓ checkmark dat het klaar is, na enkele seconden reset naar initiële state
**Rationale:** Geeft duidelijke feedback dat alles is afgespeeld, dan klaarzetten voor opnieuw afspelen
**Impact:** Player state machine: finished state met ✓ icoon, setTimeout naar idle state (bijv. 3 seconden)

## Deferred to Later Phases

| Item | Deferred To | Reason |
|------|-------------|--------|
| Content selector in block settings | v2 | Te geavanceerd voor v1; standaard DOM walker is voldoende |
| i18n/meertalige labels | v2 | Site is primair NL; internationalisatie later |

## Open Questions for Research

- Exacte chapter42.com brand kleuren en fonts ophalen voor CSS matching
- WordPress `@wordpress/create-block` v31.x setup en best practices
- Dynamic block render.php patronen
- Optimale DOM walking strategie voor WordPress post content
