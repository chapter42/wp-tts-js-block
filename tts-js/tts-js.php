<?php
/**
 * Plugin Name:       Luister naar artikel — Text-to-Speech Player
 * Plugin URI:        https://github.com/chapter42/wp-tts-js-block
 * Description:       Voeg een "Luister naar artikel" player toe als Gutenberg block. Leest artikelen voor met de ingebouwde Web Speech API van de browser — geen externe API's, geen kosten, privacy-friendly.
 * Version:           1.1.0
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            Roy Huiskes | chapter42.com
 * Author URI:        https://www.chapter42.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       tts-js
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function tts_js_block_init() {
	register_block_type( __DIR__ . '/build/tts-js' );
}
add_action( 'init', 'tts_js_block_init' );

/**
 * Register plugin settings.
 *
 * Uses admin_init hook per WordPress Settings API best practice.
 */
function tts_js_register_settings() {
	register_setting( 'tts_js_settings', 'tts_js_auto_insert', array(
		'type'              => 'boolean',
		'default'           => false,
		'sanitize_callback' => 'rest_sanitize_boolean',
	) );

	register_setting( 'tts_js_settings', 'tts_js_sticky_player', array(
		'type'              => 'boolean',
		'default'           => false,
		'sanitize_callback' => 'rest_sanitize_boolean',
	) );
}
add_action( 'admin_init', 'tts_js_register_settings' );

/**
 * Add settings page under Settings menu.
 */
function tts_js_add_settings_page() {
	add_options_page(
		__( 'TTS Player Settings', 'tts-js' ),
		__( 'TTS Player', 'tts-js' ),
		'manage_options',
		'tts-js-settings',
		'tts_js_render_settings_page'
	);
}
add_action( 'admin_menu', 'tts_js_add_settings_page' );

/**
 * Render the settings page with a single auto-insert toggle.
 */
function tts_js_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	?>
	<div class="wrap">
		<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
		<form action="options.php" method="post">
			<?php settings_fields( 'tts_js_settings' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row">
						<?php esc_html_e( 'Auto-insert', 'tts-js' ); ?>
					</th>
					<td>
						<label>
							<input type="checkbox" name="tts_js_auto_insert" value="1"
								<?php checked( get_option( 'tts_js_auto_insert', false ) ); ?> />
							<?php esc_html_e( 'Automatically add TTS player to new posts', 'tts-js' ); ?>
						</label>
						<p class="description">
							<?php esc_html_e( 'When enabled, new posts will include the TTS player block at the top of the editor.', 'tts-js' ); ?>
						</p>
					</td>
				</tr>
				<tr>
					<th scope="row">
						<?php esc_html_e( 'Sticky player', 'tts-js' ); ?>
					</th>
					<td>
						<label>
							<input type="checkbox" name="tts_js_sticky_player" value="1"
								<?php checked( get_option( 'tts_js_sticky_player', false ) ); ?> />
							<?php esc_html_e( 'Gebruik sticky bottom player', 'tts-js' ); ?>
						</label>
						<p class="description">
							<?php esc_html_e( 'Toont een vaste balk onderaan de pagina tijdens het afspelen', 'tts-js' ); ?>
						</p>
					</td>
				</tr>
			</table>
			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}

/**
 * Conditionally register the TTS block in the post template.
 *
 * Only active when the auto-insert option is enabled (D-04).
 * Merges with existing template if one is already set (Pitfall 1).
 * No template_lock — user can freely move/remove the block (D-03).
 */
function tts_js_register_post_template() {
	if ( ! get_option( 'tts_js_auto_insert', false ) ) {
		return;
	}
	$post_type_object = get_post_type_object( 'post' );
	if ( $post_type_object ) {
		// Merge with existing template if another plugin/theme set one.
		$existing = $post_type_object->template ? $post_type_object->template : array();
		array_unshift( $existing, array( 'tts-js/player', array() ) );
		$post_type_object->template = $existing;
		// D-03: No template_lock — user can freely move/remove.
	}
}
add_action( 'init', 'tts_js_register_post_template' );

/**
 * Inject viewport-fit=cover for iOS safe-area insets (per D-14).
 *
 * Only when sticky player is enabled. Uses JS to non-destructively
 * add viewport-fit=cover to the existing viewport meta tag.
 */
function tts_js_add_viewport_fit() {
	if ( ! get_option( 'tts_js_sticky_player', false ) ) {
		return;
	}
	?>
	<script>
	(function() {
		var meta = document.querySelector('meta[name="viewport"]');
		if (meta && meta.content.indexOf('viewport-fit') === -1) {
			meta.content += ', viewport-fit=cover';
		}
	})();
	</script>
	<?php
}
add_action( 'wp_head', 'tts_js_add_viewport_fit', 1 );
