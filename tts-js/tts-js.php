<?php
/**
 * Plugin Name:       Luister naar artikel — Text-to-Speech Player
 * Plugin URI:        https://github.com/chapter42/wp-tts-js-block
 * Description:       Voeg een "Luister naar artikel" player toe als Gutenberg block. Leest artikelen voor met de ingebouwde Web Speech API van de browser — geen externe API's, geen kosten, privacy-friendly.
 * Version:           1.0.0
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
