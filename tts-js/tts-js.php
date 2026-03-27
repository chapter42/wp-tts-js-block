<?php
/**
 * Plugin Name:       TTS JS
 * Description:       Voeg een tekst-naar-spraak player toe aan je artikel. Gebruikt de ingebouwde Web Speech API van de browser.
 * Version:           1.0.0
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            Chapter42
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
