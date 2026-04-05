=== Luister naar artikel — Text-to-Speech Player ===
Contributors:      royhuiskes
Tags:              text-to-speech, tts, gutenberg, block, accessibility, speech
Tested up to:      6.8
Stable tag:        1.1.2
Requires at least: 6.5
Requires PHP:      7.4
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Voeg een "Luister naar artikel" player toe als Gutenberg block. Gebruikt de Web Speech API van de browser — gratis, zonder externe API's.

== Description ==

TTS JS voegt een compacte text-to-speech player toe aan je WordPress artikelen als Gutenberg block. De plugin gebruikt de ingebouwde Web Speech API van de browser om artikeltekst (headings en body) voor te lezen.

**Kenmerken:**

* Werkt volledig in de browser — geen externe API's, geen abonnementen, geen kosten
* Automatische tekst-extractie uit headings en paragrafen
* Slimme zin-chunking om Chrome's 15-seconden limiet te omzeilen
* Automatische voice selectie met kwaliteitsscoring (prefereert premium/neural voices)
* 8-staps snelheidsregeling (0.8x tot 1.5x) via popup menu
* Voortgangsbalk en resterende leestijd
* Responsive layout voor desktop en mobiel
* Cross-browser: Chrome, Safari, Firefox, Edge (desktop + mobiel)
* Foutafhandeling met lokale foutmeldingen (NL/EN)
* Privacy-friendly — geen data verlaat de browser
* Toets snel vooruit/achteruit per zin (skip controls)
* Onthoud afspeelpositie bij pagina herladen (position memory)
* Markering van de huidige zin tijdens afspelen (highlighting)
* Automatisch TTS player toevoegen aan nieuwe berichten (auto-insert)
* Stemdiagnostiek in de editor sidebar (voice diagnostics)
* Thema-kleuren overerving via WordPress theme.json
* Volledige toetsenbordnavigatie en screenreader ondersteuning
* Dynamische taalselectie op basis van beschikbare browser stemmen

**Taal:** Primair Nederlands, maar werkt met elke taal die je browser ondersteunt.

== Installation ==

1. Download de plugin als ZIP of kloon de repository
2. Upload de `tts-js/` map naar `/wp-content/plugins/`
3. Activeer de plugin via het Plugins scherm in WordPress
4. Voeg het "TTS JS" block toe aan een post of pagina via de Gutenberg editor
5. Configureer taal en standaardsnelheid in de block sidebar

== Frequently Asked Questions ==

= Welke browsers worden ondersteund? =

Chrome (desktop + Android), Safari (desktop + iOS), Firefox en Edge. De plugin detecteert automatisch of je browser de Web Speech API ondersteunt en toont een foutmelding als dat niet het geval is.

= Kost het iets? =

Nee. De plugin gebruikt de gratis Web Speech API die in je browser is ingebouwd. Er zijn geen externe diensten, API keys of abonnementen nodig.

= Kan ik de taal wijzigen? =

Ja, via de block sidebar kun je de taal instellen (standaard: nl-NL). De plugin selecteert automatisch de beste beschikbare stem voor de gekozen taal.

= Waarom stopt de spraak niet na 15 seconden? =

De plugin splitst lange teksten op in zinnen en speelt ze achter elkaar af. Dit omzeilt een bekende Chrome-bug waarbij spraak na ~15 seconden stopt.

== Changelog ==

= 1.1.2 =
* Bugfix: sticky bar nu over volle schermbreedte (was beperkt tot content container)
* Bugfix: zinmarkering (highlight) werkt nu ook buiten het player block
* Bugfix: voice naam verwijderd uit sticky bar (overzichtelijker)
* Sticky bottom player — LinkedIn-style vaste audiobalk onderin het scherm
* Klikbare en versleepbare tijdlijn voor seek-functionaliteit
* 15-seconden vooruit/achteruit skip knoppen
* Vloeiende voortgangsanimatie met requestAnimationFrame
* Toetsenbord-navigatie op tijdlijn (pijltjes = 5% seek)

= 1.1.0 =
* Sticky bottom player — LinkedIn-style vaste audiobalk onderin het scherm
* Klikbare en versleepbare tijdlijn voor seek-functionaliteit
* 15-seconden vooruit/achteruit skip knoppen
* Vloeiende voortgangsanimatie met requestAnimationFrame
* Toetsenbord-navigatie op tijdlijn (pijltjes = 5% seek)
* Skip vooruit/achteruit knoppen voor zin-navigatie
* Afspeelpositie onthouden via localStorage (7 dagen)
* Zinmarkering met auto-scroll tijdens afspelen
* Automatisch TTS player toevoegen aan nieuwe posts (instelbaar via Settings)
* Stemdiagnostiek panel in de editor sidebar met test-functie
* WordPress thema-kleuren via CSS custom properties en theme.json
* Volledige toetsenbordnavigatie (Tab, Enter, Space, Escape, pijltjestoetsen)
* ARIA labels, live regions en screenreader aankondigingen
* Dynamische taalselectie dropdown (10-taal fallback)
* Focus-indicatoren en reduced-motion ondersteuning
* Output escaping audit voor WordPress.org compliance
* Unit tests voor core functies (Jest)
* ESLint/Stylelint configuratie met husky pre-commit hooks

= 1.0.0 =
* Gutenberg block met "Luister naar artikel" player
* Chunked speech engine met zin-splitsing
* Automatische voice selectie met kwaliteitsscoring
* 8-staps snelheidsregeling via popup menu
* Voortgangsbalk en resterende leestijd
* Cross-browser ondersteuning (Chrome, Safari, Firefox, Edge)
* Foutafhandeling met lokale foutmeldingen (NL/EN)
* Responsive layout (desktop + mobiel)

== Links ==

* [GitHub Repository](https://github.com/chapter42/wp-tts-js-block)
* [chapter42.com](https://www.chapter42.com)
* [Auteur: Roy Huiskes](https://www.chapter42.com/over-roy/)
