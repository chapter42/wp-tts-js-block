/**
 * TTS-JS Frontend Player
 *
 * Production-ready chunked speech engine with voice auto-selection,
 * speed cycling, progress tracking, and duration display.
 *
 * Phase 2: Sentence chunking defeats Chrome's 15s cutoff (SPCH-02),
 * onend chaining provides seamless playback (SPCH-03), voice resolution
 * finds the best Dutch voice (SPCH-05), and speed cycling gives users
 * fine-grained control (SPCH-07, PLAY-06).
 */

// =============================================================================
// Section 1: Constants and configuration
// =============================================================================

const STATES = {
	IDLE: 'idle',
	LOADING: 'loading',
	PLAYING: 'playing',
	PAUSED: 'paused',
	FINISHED: 'finished',
	ERROR: 'error',
};

const SPEED_STEPS = [ 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5 ]; // per D-07
const DEFAULT_SPEED_INDEX = 2; // 1.0x per D-08
const WORDS_PER_MINUTE = 150; // per D-04
const MAX_CHUNK_LENGTH = 300; // per D-02
const VOICE_TIMEOUT_MS = 3000; // per D-13
const VOICE_POLL_INTERVAL_MS = 100; // per D-13

// Common Dutch abbreviations that should NOT trigger sentence splits (per RESEARCH Pitfall 2)
const DUTCH_ABBREVIATIONS = [ 'dhr', 'mevr', 'bijv', 'evt', 'nr', 'ca', 'dr', 'mr', 'prof', 'ing', 'ir' ];

// Voice quality scoring keywords (per D-11 and RESEARCH Pattern 4)
const QUALITY_KEYWORDS = {
	high: [ 'enhanced', 'premium', 'neural', 'natural', 'online', 'hd' ],
	low: [ 'compact' ],
};

// =============================================================================
// Section 2: splitIntoChunks (per D-01, D-02, RESEARCH Pattern 1)
// =============================================================================

/**
 * Split text into speech-safe chunks at sentence boundaries.
 * Uses uppercase-after-period guard to avoid splitting on Dutch abbreviations.
 * Sub-splits long sentences at clause boundaries to stay under MAX_CHUNK_LENGTH.
 *
 * @param {string} text - Full article text to split
 * @return {string[]} Array of non-empty trimmed sentence chunks
 */
function splitIntoChunks( text ) {
	const SENTENCE_END = /(?<=[.!?])\s+(?=[A-Z\u00C0-\u024F])/;
	const CLAUSE_BREAK = /(?<=[,;:\u2014])\s+/;
	const sentences = text.split( SENTENCE_END ).filter( ( s ) => s.trim() );
	const chunks = [];

	for ( const sentence of sentences ) {
		if ( sentence.length <= MAX_CHUNK_LENGTH ) {
			chunks.push( sentence.trim() );
		} else {
			// Sub-split long sentences at clause boundaries (D-02)
			const clauses = sentence.split( CLAUSE_BREAK );
			let buffer = '';
			for ( const clause of clauses ) {
				if (
					( buffer + ' ' + clause ).length > MAX_CHUNK_LENGTH &&
					buffer
				) {
					chunks.push( buffer.trim() );
					buffer = clause;
				} else {
					buffer += ( buffer ? ' ' : '' ) + clause;
				}
			}
			if ( buffer.trim() ) {
				chunks.push( buffer.trim() );
			}
		}
	}
	return chunks.filter( ( c ) => c.trim().length > 0 );
}

// =============================================================================
// Section 3: pickBestVoice (per D-11, RESEARCH Pattern 4)
// =============================================================================

/**
 * Score and rank available voices for a given language code.
 * Scoring: +10 exact lang match, +5 per quality keyword, -5 per low-quality keyword,
 * +2 for non-default voice.
 *
 * @param {SpeechSynthesisVoice[]} voices - Available voices from getVoices()
 * @param {string} langCode - Target language code (e.g. 'nl-NL')
 * @return {SpeechSynthesisVoice|null} Best matching voice, or null if none found
 */
function pickBestVoice( voices, langCode ) {
	const langPrefix = langCode.split( '-' )[ 0 ];
	const candidates = voices.filter(
		( v ) =>
			v.lang === langCode ||
			v.lang.replace( '_', '-' ) === langCode ||
			v.lang.startsWith( langPrefix + '-' ) ||
			v.lang === langPrefix
	);

	if ( candidates.length === 0 ) {
		return null;
	}

	return candidates.sort( ( a, b ) => {
		let scoreA = 0,
			scoreB = 0;

		// Exact lang match scores higher (D-11.1)
		if (
			a.lang === langCode ||
			a.lang.replace( '_', '-' ) === langCode
		) {
			scoreA += 10;
		}
		if (
			b.lang === langCode ||
			b.lang.replace( '_', '-' ) === langCode
		) {
			scoreB += 10;
		}

		// Quality keywords in voice name (D-11.2)
		const nameA = a.name.toLowerCase();
		const nameB = b.name.toLowerCase();
		for ( const kw of QUALITY_KEYWORDS.high ) {
			if ( nameA.includes( kw ) ) {
				scoreA += 5;
			}
			if ( nameB.includes( kw ) ) {
				scoreB += 5;
			}
		}
		for ( const kw of QUALITY_KEYWORDS.low ) {
			if ( nameA.includes( kw ) ) {
				scoreA -= 5;
			}
			if ( nameB.includes( kw ) ) {
				scoreB -= 5;
			}
		}

		// Prefer non-default voices (D-11.3)
		if ( ! a.default ) {
			scoreA += 2;
		}
		if ( ! b.default ) {
			scoreB += 2;
		}

		return scoreB - scoreA;
	} )[ 0 ];
}

// =============================================================================
// Section 4: resolveVoice (per D-13, RESEARCH Pattern 3)
// =============================================================================

/**
 * Three-strategy async voice loading.
 * Strategy 1: Sync getVoices() (Firefox, Safari desktop)
 * Strategy 2: onvoiceschanged listener (Chrome)
 * Strategy 3: Polling fallback (older Safari)
 * Timeout after VOICE_TIMEOUT_MS (3000ms).
 *
 * @param {string} langCode - Target language code (e.g. 'nl-NL')
 * @return {Promise<SpeechSynthesisVoice|null>} Best voice or null if none found
 */
function resolveVoice( langCode ) {
	return new Promise( ( resolve ) => {
		let resolved = false;

		const done = ( voice ) => {
			if ( resolved ) {
				return;
			}
			resolved = true;
			speechSynthesis.onvoiceschanged = null;
			clearInterval( pollId );
			clearTimeout( timeoutId );
			resolve( voice );
		};

		// Strategy 1: Sync (Firefox, Safari desktop)
		const voices = speechSynthesis.getVoices();
		if ( voices.length > 0 ) {
			done( pickBestVoice( voices, langCode ) );
			return;
		}

		// Strategy 2: Async event (Chrome)
		speechSynthesis.onvoiceschanged = () => {
			done(
				pickBestVoice( speechSynthesis.getVoices(), langCode )
			);
		};

		// Strategy 3: Polling fallback (older Safari) -- D-13
		const pollId = setInterval( () => {
			const v = speechSynthesis.getVoices();
			if ( v.length > 0 ) {
				done( pickBestVoice( v, langCode ) );
			}
		}, VOICE_POLL_INTERVAL_MS );

		// Timeout after 3 seconds -- D-13
		const timeoutId = setTimeout( () => {
			done( null );
		}, VOICE_TIMEOUT_MS );
	} );
}

// =============================================================================
// Section 5: Duration helper functions (per D-04, D-06)
// =============================================================================

/**
 * Estimate total reading duration in minutes.
 *
 * @param {number} wordCount - Total word count
 * @param {number} speed - Current playback speed multiplier
 * @return {number} Estimated minutes (minimum 1)
 */
function estimateDuration( wordCount, speed ) {
	return Math.max( 1, Math.round( wordCount / ( WORDS_PER_MINUTE * speed ) ) );
}

/**
 * Format a duration value for display.
 * During playback shows "resterend" (remaining), otherwise shows estimate.
 *
 * @param {number} minutes - Duration in minutes
 * @param {boolean} isPlaying - Whether playback is active
 * @return {string} Formatted duration string
 */
function formatDuration( minutes, isPlaying ) {
	if ( isPlaying ) {
		return minutes < 1
			? '< 1 min resterend'
			: `~${ minutes } min resterend`;
	}
	return `~${ Math.max( 1, minutes ) } min`;
}

/**
 * Format a speed value for button display.
 *
 * @param {number} speed - Speed multiplier (e.g. 1, 1.2)
 * @return {string} Formatted speed string (e.g. "1x", "1.2x")
 */
function formatSpeed( speed ) {
	return Number.isInteger( speed ) ? `${ speed }x` : `${ speed }x`;
}

// =============================================================================
// Section 6: TTSPlayer class
// =============================================================================

class TTSPlayer {
	constructor( container ) {
		this.container = container;
		this.text = container.dataset.ttsText || '';
		this.lang = container.dataset.ttsLang || 'nl-NL';
		this.speed = parseFloat( container.dataset.ttsSpeed ) || 1.0;
		this.state = STATES.IDLE;

		// Word count for duration calculation
		this.wordCount = parseInt( container.dataset.ttsWords ) || 0;

		// Chunk state
		this.chunks = [];
		this.currentChunkIndex = 0;
		this.currentUtterance = null; // Prevent GC (RESEARCH Pitfall 3)

		// Voice state (cached per D-14)
		this.resolvedVoice = null;

		// Android-safe pause (RESEARCH Pitfall 4)
		this.isPausePending = false;

		// Loading timeout reference
		this.loadingTimeout = null;

		// Speed state: find index of initial speed in SPEED_STEPS
		this.speedIndex = SPEED_STEPS.indexOf( this.speed );
		if ( this.speedIndex === -1 ) {
			this.speedIndex = DEFAULT_SPEED_INDEX;
			this.speed = SPEED_STEPS[ this.speedIndex ];
		}

		// DOM references
		this.playBtn = container.querySelector( '.tts-play-btn' );
		this.stopBtn = container.querySelector( '.tts-stop-btn' );
		this.speedBtn = container.querySelector( '.tts-speed-btn' );
		this.durationEl = container.querySelector( '.tts-duration' );
		this.progressBar = container.querySelector( '.tts-progress' );
		this.progressFill = container.querySelector( '.tts-progress__fill' );

		// Event listeners
		this.playBtn.addEventListener( 'click', () => this.togglePlay() );
		this.stopBtn.addEventListener( 'click', () => this.stop() );
		this.speedBtn.addEventListener( 'click', () => this.cycleSpeed() );

		// Set initial state and duration display
		this.setState( STATES.IDLE );
		this.updateDuration();
	}

	/**
	 * Set player state on both internal property and DOM attribute.
	 * CSS drives all visual changes based on data-tts-state.
	 *
	 * @param {string} newState - One of STATES values
	 */
	setState( newState ) {
		this.state = newState;
		this.container.dataset.ttsState = newState;
	}

	/**
	 * Toggle play/pause based on current state.
	 */
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
			case STATES.ERROR:
				// Ignore clicks while loading or in error state
				break;
		}
	}

	/**
	 * Start playback from the beginning.
	 * Resolves voice on first play (cached for subsequent plays per D-14).
	 * Splits text into chunks on first play.
	 */
	async startPlayback() {
		if ( ! this.text ) {
			return;
		}

		this.setState( STATES.LOADING );

		// Clear any pending speech (per RESEARCH Pattern 3)
		speechSynthesis.cancel();

		// Split text into chunks if not already done
		if ( ! this.chunks.length ) {
			this.chunks = splitIntoChunks( this.text );
		}

		// Reset chunk position
		this.currentChunkIndex = 0;

		// Resolve voice on first play (cached per D-14)
		if ( this.resolvedVoice === null ) {
			const voice = await resolveVoice( this.lang );
			if ( voice === null ) {
				// No suitable voice found (D-12)
				const labelEl =
					this.container.querySelector( '.tts-label' );
				if ( labelEl ) {
					labelEl.textContent =
						'Geen geschikte stem gevonden';
				}
				this.durationEl.textContent =
					'Probeer een andere browser';
				this.setState( STATES.ERROR );
				return;
			}
			this.resolvedVoice = voice;
		}

		// Start chunk playback
		this.playNextChunk();

		// Loading timeout: if onstart doesn't fire in 3 seconds, reset
		this.loadingTimeout = setTimeout( () => {
			if ( this.state === STATES.LOADING ) {
				speechSynthesis.cancel();
				this.setState( STATES.IDLE );
			}
			this.loadingTimeout = null;
		}, 3000 );
	}

	/**
	 * Play the next chunk in sequence.
	 * Implements Android-safe pause via isPausePending check.
	 * Chains chunks via onend callback (D-03).
	 */
	playNextChunk() {
		// Android-safe pause: hold at chunk boundary (RESEARCH Pitfall 4)
		if ( this.isPausePending ) {
			this.isPausePending = false;
			this.setState( STATES.PAUSED );
			return;
		}

		// All chunks played
		if ( this.currentChunkIndex >= this.chunks.length ) {
			this.handleFinished();
			return;
		}

		const chunk = this.chunks[ this.currentChunkIndex ];
		const utterance = new SpeechSynthesisUtterance( chunk );
		utterance.lang = this.lang;
		utterance.rate = this.speed; // Reads current speed (D-10)
		utterance.voice = this.resolvedVoice; // Cached voice (D-14)

		// Transition to playing when speech actually starts
		utterance.onstart = () => {
			if ( this.state === STATES.LOADING ) {
				this.setState( STATES.PLAYING );
			}
			if ( this.loadingTimeout ) {
				clearTimeout( this.loadingTimeout );
				this.loadingTimeout = null;
			}
		};

		// Chain to next chunk on completion (D-03)
		utterance.onend = () => {
			this.currentChunkIndex++;
			this.updateProgress();
			this.updateRemainingTime();
			this.playNextChunk();
		};

		// Handle errors (ignore 'canceled' from manual cancel)
		utterance.onerror = ( event ) => {
			if ( event.error !== 'canceled' ) {
				this.stop();
			}
		};

		// Keep reference to prevent garbage collection (RESEARCH Pitfall 3)
		this.currentUtterance = utterance;
		speechSynthesis.speak( utterance );
	}

	/**
	 * Pause playback at chunk boundary (Android-safe).
	 * Does NOT call speechSynthesis.pause() -- lets current sentence finish naturally.
	 */
	pause() {
		this.isPausePending = true;
	}

	/**
	 * Resume playback from the paused chunk position.
	 */
	resume() {
		this.setState( STATES.PLAYING );
		this.playNextChunk();
	}

	/**
	 * Stop playback completely and reset to idle state.
	 */
	stop() {
		if ( this.loadingTimeout ) {
			clearTimeout( this.loadingTimeout );
			this.loadingTimeout = null;
		}
		speechSynthesis.cancel();
		this.currentUtterance = null;
		this.currentChunkIndex = 0;
		this.isPausePending = false;

		// Reset progress bar
		if ( this.progressFill ) {
			this.progressFill.style.width = '0%';
		}
		if ( this.progressBar ) {
			this.progressBar.setAttribute( 'aria-valuenow', '0' );
		}

		// Reset duration to estimated total
		this.updateDuration();

		this.setState( STATES.IDLE );
	}

	/**
	 * Handle playback completion.
	 * Shows finished state, then resets to idle after 3 seconds.
	 */
	handleFinished() {
		this.setState( STATES.FINISHED );

		// Set progress to 100%
		if ( this.progressFill ) {
			this.progressFill.style.width = '100%';
		}
		if ( this.progressBar ) {
			this.progressBar.setAttribute( 'aria-valuenow', '100' );
		}

		// Reset to idle after 3 seconds
		setTimeout( () => {
			if ( this.state === STATES.FINISHED ) {
				if ( this.progressFill ) {
					this.progressFill.style.width = '0%';
				}
				if ( this.progressBar ) {
					this.progressBar.setAttribute(
						'aria-valuenow',
						'0'
					);
				}
				this.updateDuration();
				this.setState( STATES.IDLE );
			}
		}, 3000 );
	}

	/**
	 * Cycle through speed steps (D-07/D-09/D-10).
	 * Wraps from 1.5x back to 0.8x.
	 */
	cycleSpeed() {
		this.speedIndex =
			( this.speedIndex + 1 ) % SPEED_STEPS.length;
		this.speed = SPEED_STEPS[ this.speedIndex ];
		this.speedBtn.textContent = formatSpeed( this.speed );
		this.speedBtn.setAttribute(
			'aria-label',
			'Afspeelsnelheid: ' + formatSpeed( this.speed )
		);
		this.updateDuration();
	}

	/**
	 * Update progress bar based on current chunk position (D-05).
	 */
	updateProgress() {
		if ( ! this.chunks.length ) {
			return;
		}
		const percent =
			( this.currentChunkIndex / this.chunks.length ) * 100;
		if ( this.progressFill ) {
			this.progressFill.style.width = percent + '%';
		}
		if ( this.progressBar ) {
			this.progressBar.setAttribute(
				'aria-valuenow',
				Math.round( percent ).toString()
			);
		}
	}

	/**
	 * Update remaining time display during playback (D-06).
	 */
	updateRemainingTime() {
		if ( ! this.chunks.length || ! this.durationEl ) {
			return;
		}
		const remainingRatio =
			( this.chunks.length - this.currentChunkIndex ) /
			this.chunks.length;
		const remainingWords = this.wordCount * remainingRatio;
		const remainingMinutes = Math.max(
			1,
			Math.round(
				remainingWords / ( WORDS_PER_MINUTE * this.speed )
			)
		);
		this.durationEl.textContent = formatDuration(
			remainingMinutes,
			true
		);
	}

	/**
	 * Recalculate duration display based on current state and speed.
	 * In idle: shows estimated total. During playback: shows remaining.
	 */
	updateDuration() {
		if ( ! this.durationEl ) {
			return;
		}
		if (
			this.state === STATES.PLAYING ||
			this.state === STATES.PAUSED
		) {
			this.updateRemainingTime();
		} else {
			this.durationEl.textContent = formatDuration(
				estimateDuration( this.wordCount, this.speed ),
				false
			);
		}
	}
}

// =============================================================================
// Section 7: Initialization
// =============================================================================

// Initialize all player instances on the page
// WordPress viewScript ensures this only runs on pages with the block
document.querySelectorAll( '.wp-block-tts-js-player' ).forEach( ( el ) => {
	new TTSPlayer( el );
} );
