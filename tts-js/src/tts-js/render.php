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

$wrapper_attributes = get_block_wrapper_attributes( [
	'class'          => 'tts-player',
	'data-tts-text'  => $full_text,
	'data-tts-lang'  => $lang,
	'data-tts-speed' => $speed,
	'data-tts-words' => $word_count,
] );

// SVG icons (20x20 viewBox, currentColor fill -- per UI-SPEC)
$icon_play    = '<svg class="tts-icon tts-icon--play" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><polygon points="5,3 17,10 5,17"/></svg>';
$icon_pause   = '<svg class="tts-icon tts-icon--pause" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><rect x="4" y="3" width="4" height="14"/><rect x="12" y="3" width="4" height="14"/></svg>';
$icon_check   = '<svg class="tts-icon tts-icon--check" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="4,10 8,15 16,5"/></svg>';
$icon_spinner = '<svg class="tts-icon tts-icon--spinner" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 2a8 8 0 0 1 8 8" stroke-linecap="round"/></svg>';
$icon_stop    = '<svg class="tts-icon tts-icon--stop" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><rect x="4" y="4" width="12" height="12"/></svg>';
$icon_error   = '<svg class="tts-icon tts-icon--error" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="10" cy="10" r="8"/><line x1="10" y1="6" x2="10" y2="11"/><circle cx="10" cy="14" r="0.5" fill="currentColor"/></svg>';
?>
<div <?php echo $wrapper_attributes; ?>>
	<button class="tts-play-btn" aria-label="<?php echo esc_attr( $attributes['label'] ?? 'Luister naar artikel' ); ?>">
		<?php echo $icon_play; ?>
		<?php echo $icon_pause; ?>
		<?php echo $icon_check; ?>
		<?php echo $icon_spinner; ?>
		<?php echo $icon_error; ?>
	</button>
	<div class="tts-info">
		<span class="tts-label"><?php echo $label; ?></span>
		<span class="tts-duration" aria-live="polite">~<?php echo $reading_minutes; ?> min</span>
		<div class="tts-progress" role="progressbar"
		     aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"
		     aria-label="Voortgang">
			<div class="tts-progress__fill"></div>
		</div>
	</div>
	<button class="tts-speed-btn" aria-label="Afspeelsnelheid: 1x">1x</button>
	<button class="tts-stop-btn" aria-label="Stop">
		<?php echo $icon_stop; ?>
	</button>
</div>
