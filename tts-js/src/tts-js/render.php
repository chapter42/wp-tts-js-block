<?php
/**
 * Server-side rendering for the TTS Player block.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content (empty for dynamic blocks).
 * @param WP_Block $block      Block instance.
 */

$post = get_post();
if ( ! $post ) {
	return '';
}

// Allowed block types for text extraction (per D4)
$allowed_blocks = [
	'core/heading',
	'core/paragraph',
	'core/list',
	'core/quote',
];

/**
 * Recursively extract text from blocks.
 * Handles inner blocks (e.g., core/quote contains core/paragraph).
 */
if ( ! function_exists( 'tts_js_extract_text' ) ) {
	function tts_js_extract_text( $blocks, $allowed_blocks ) {
		$text_parts = [];
		foreach ( $blocks as $block ) {
			if ( empty( $block['blockName'] ) ) {
				continue;
			}
			if ( in_array( $block['blockName'], $allowed_blocks, true ) ) {
				$rendered = render_block( $block );
				$stripped = wp_strip_all_tags( $rendered );
				$stripped = trim( $stripped );
				if ( ! empty( $stripped ) ) {
					$text_parts[] = $stripped;
				}
			}
			// Walk inner blocks for nested content (e.g., columns, groups)
			if ( ! empty( $block['innerBlocks'] ) ) {
				$inner_text = tts_js_extract_text( $block['innerBlocks'], $allowed_blocks );
				$text_parts = array_merge( $text_parts, $inner_text );
			}
		}
		return $text_parts;
	}
}

// Extract article text
$blocks     = parse_blocks( $post->post_content );
$text_parts = tts_js_extract_text( $blocks, $allowed_blocks );

// Prepend article title (per RESEARCH Open Question #2 -- title is rendered by theme, not in post_content)
$title = get_the_title( $post );
if ( ! empty( $title ) ) {
	array_unshift( $text_parts, $title );
}

$full_text       = implode( "\n\n", $text_parts );
$word_count      = str_word_count( $full_text );
$reading_minutes = max( 1, round( $word_count / 150 ) ); // ~150 wpm for speech

// Block attributes with defaults (per D7)
$lang  = esc_attr( $attributes['lang'] ?? 'nl-NL' );
$speed = esc_attr( $attributes['speed'] ?? 1 );
$label = esc_html( $attributes['label'] ?? 'Luister naar artikel' );

// Localized error messages (per D-04, D-06 -- keyed by lang, fallback to en-US)
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

$msgs = $error_messages[ $lang ] ?? $error_messages['en-US'];

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'           => 'tts-player',
	'data-tts-text'   => $full_text,
	'data-tts-lang'   => $lang,
	'data-tts-speed'  => $speed,
	'data-tts-words'  => $word_count,
	'data-tts-errors' => wp_json_encode( $msgs ),
] );

// SVG icons (20x20 viewBox, currentColor fill -- per UI-SPEC)
$icon_play    = '<svg class="tts-icon tts-icon--play" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><polygon points="5,3 17,10 5,17"/></svg>';
$icon_pause   = '<svg class="tts-icon tts-icon--pause" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><rect x="4" y="3" width="4" height="14"/><rect x="12" y="3" width="4" height="14"/></svg>';
$icon_check   = '<svg class="tts-icon tts-icon--check" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="4,10 8,15 16,5"/></svg>';
$icon_spinner = '<svg class="tts-icon tts-icon--spinner" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 2a8 8 0 0 1 8 8" stroke-linecap="round"/></svg>';
$icon_stop    = '<svg class="tts-icon tts-icon--stop" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><rect x="4" y="4" width="12" height="12"/></svg>';
$icon_error   = '<svg class="tts-icon tts-icon--error" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="10" cy="10" r="8"/><line x1="10" y1="6" x2="10" y2="11"/><circle cx="10" cy="14" r="0.5" fill="currentColor"/></svg>';
$icon_skip_back = '<svg class="tts-icon tts-icon--skip-back" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><polygon points="10,4 2,10 10,16"/><polygon points="18,4 10,10 18,16"/></svg>';
$icon_skip_forward = '<svg class="tts-icon tts-icon--skip-forward" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><polygon points="2,4 10,10 2,16"/><polygon points="10,4 18,10 10,16"/></svg>';
?>
<div <?php echo $wrapper_attributes; ?>>
	<button type="button" class="tts-skip-btn tts-skip-btn--back" aria-label="Vorige zin" tabindex="-1">
		<?php echo $icon_skip_back; ?>
	</button>
	<button type="button" class="tts-play-btn" aria-label="<?php echo esc_attr( $attributes['label'] ?? 'Luister naar artikel' ); ?>">
		<?php echo $icon_play; ?>
		<?php echo $icon_pause; ?>
		<?php echo $icon_check; ?>
		<?php echo $icon_spinner; ?>
		<?php echo $icon_error; ?>
	</button>
	<button type="button" class="tts-skip-btn tts-skip-btn--forward" aria-label="Volgende zin" tabindex="-1">
		<?php echo $icon_skip_forward; ?>
	</button>
	<div class="tts-info">
		<span class="tts-label"><?php echo $label; ?></span>
		<span class="tts-duration" aria-live="polite">~<?php echo $reading_minutes; ?> min</span>
		<div class="tts-progress" role="progressbar"
		     aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"
		     aria-label="Voortgang">
			<div class="tts-progress__fill"></div>
		</div>
		<span class="tts-sr-announcement" aria-live="polite" aria-atomic="true"></span>
	</div>
	<div class="tts-speed-wrap">
		<button type="button" class="tts-speed-btn" aria-label="Afspeelsnelheid: 1x" aria-expanded="false">1x</button>
		<ul class="tts-speed-menu" role="listbox" aria-label="Kies afspeelsnelheid" aria-hidden="true">
			<?php foreach ( [ 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5 ] as $s ) : ?>
				<li role="option" tabindex="-1" data-speed="<?php echo $s; ?>"<?php echo $s == 1.0 ? ' aria-selected="true" class="tts-speed-menu__active"' : ''; ?>><?php echo $s == (int) $s ? (int) $s . 'x' : $s . 'x'; ?></li>
			<?php endforeach; ?>
		</ul>
	</div>
</div>
