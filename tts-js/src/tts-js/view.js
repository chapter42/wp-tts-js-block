/**
 * TTS-JS Frontend Player
 *
 * State machine-driven player using the Web Speech API (speechSynthesis).
 * Phase 1: Single utterance (no chunking). Chrome will cut off after ~15s.
 */

const STATES = {
	IDLE: 'idle',
	LOADING: 'loading',
	PLAYING: 'playing',
	PAUSED: 'paused',
	FINISHED: 'finished',
};

class TTSPlayer {
	constructor( container ) {
		this.container = container;
		this.text = container.dataset.ttsText || '';
		this.lang = container.dataset.ttsLang || 'nl-NL';
		this.speed = parseFloat( container.dataset.ttsSpeed ) || 1.0;
		this.state = STATES.IDLE;
		this.utterance = null;
		this.loadingTimeout = null;

		// DOM references
		this.playBtn = container.querySelector( '.tts-play-btn' );
		this.stopBtn = container.querySelector( '.tts-stop-btn' );

		// Event listeners
		this.playBtn.addEventListener( 'click', () => this.togglePlay() );
		this.stopBtn.addEventListener( 'click', () => this.stop() );

		// Set initial state
		this.setState( STATES.IDLE );
	}

	setState( newState ) {
		this.state = newState;
		this.container.dataset.ttsState = newState;
	}

	togglePlay() {
		switch ( this.state ) {
			case STATES.IDLE:
			case STATES.FINISHED:
				this.startPlayback();
				break;
			case STATES.PLAYING:
				this.pause();
				break;
			case STATES.PAUSED:
				this.resume();
				break;
			case STATES.LOADING:
				// Ignore clicks while loading
				break;
		}
	}

	startPlayback() {
		if ( ! this.text ) {
			return;
		}

		this.setState( STATES.LOADING );

		// Clear any pending speech (per RESEARCH Pattern 3)
		speechSynthesis.cancel();

		// Clear any previous loading timeout
		if ( this.loadingTimeout ) {
			clearTimeout( this.loadingTimeout );
		}

		// Create utterance
		this.utterance = new SpeechSynthesisUtterance( this.text );
		this.utterance.lang = this.lang;
		this.utterance.rate = this.speed;

		// Transition to playing when speech actually starts
		this.utterance.onstart = () => {
			if ( this.loadingTimeout ) {
				clearTimeout( this.loadingTimeout );
				this.loadingTimeout = null;
			}
			this.setState( STATES.PLAYING );
		};

		// Handle speech completion (per D9 — checkmark then reset after 3s)
		this.utterance.onend = () => {
			this.handleFinished();
		};

		// Handle errors (per RESEARCH Pitfall 4)
		this.utterance.onerror = ( event ) => {
			// 'canceled' fires after manual cancel() — not a real error
			if ( event.error !== 'canceled' ) {
				this.setState( STATES.IDLE );
			}
		};

		// Start speaking
		speechSynthesis.speak( this.utterance );

		// Loading timeout: if onstart doesn't fire in 3 seconds, reset to idle
		// (per UI-SPEC: loading -> 3 second timeout -> idle)
		this.loadingTimeout = setTimeout( () => {
			if ( this.state === STATES.LOADING ) {
				speechSynthesis.cancel();
				this.setState( STATES.IDLE );
			}
			this.loadingTimeout = null;
		}, 3000 );
	}

	pause() {
		speechSynthesis.pause();
		this.setState( STATES.PAUSED );
	}

	resume() {
		speechSynthesis.resume();
		this.setState( STATES.PLAYING );
	}

	stop() {
		if ( this.loadingTimeout ) {
			clearTimeout( this.loadingTimeout );
			this.loadingTimeout = null;
		}
		speechSynthesis.cancel();
		this.utterance = null;
		this.setState( STATES.IDLE );
	}

	handleFinished() {
		this.setState( STATES.FINISHED );
		// Per D9: show checkmark, then reset to idle after 3 seconds
		setTimeout( () => {
			if ( this.state === STATES.FINISHED ) {
				this.setState( STATES.IDLE );
			}
		}, 3000 );
	}
}

// Initialize all player instances on the page
// WordPress viewScript ensures this only runs on pages with the block (WP-04)
document.querySelectorAll( '.wp-block-tts-js-player' ).forEach( ( el ) => {
	new TTSPlayer( el );
} );
