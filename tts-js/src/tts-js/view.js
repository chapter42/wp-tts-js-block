/* global speechSynthesis, SpeechSynthesisUtterance, localStorage */

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
 *
 * Phase 3: Capability detection on first play click (D-12), cross-browser
 * voice loading (Chrome async, Safari polling, Firefox sync), ERROR state
 * with inline localized error messages (D-01, D-02, D-05), and enhanced
 * onerror handling for all SpeechSynthesisErrorEvent codes.
 */

import {
	STATES,
	SPEED_STEPS,
	DEFAULT_SPEED_INDEX,
	WORDS_PER_MINUTE,
	VOICE_TIMEOUT_MS,
	VOICE_POLL_INTERVAL_MS,
	splitIntoChunks,
	pickBestVoice,
	estimateDuration,
	formatDuration,
	formatSpeed,
} from './utils';

// =============================================================================
// Section 0: Debug logging (activated by ?tts-debug=1)
// =============================================================================

const TTS_DEBUG = new URLSearchParams( window.location.search ).has(
	'tts-debug'
);

function debugLog( ...args ) {
	if ( TTS_DEBUG ) {
		// eslint-disable-next-line no-console
		console.log( '[TTS-JS]', ...args );
	}
}

function debugWarn( ...args ) {
	if ( TTS_DEBUG ) {
		// eslint-disable-next-line no-console
		console.warn( '[TTS-JS]', ...args );
	}
}

// =============================================================================
// Section 1: resolveVoice (per D-13, RESEARCH Pattern 3)
// =============================================================================

/**
 * Three-strategy async voice loading.
 * Strategy 1: Sync getVoices() (Firefox, Safari desktop)
 * Strategy 2: onvoiceschanged listener (Chrome)
 * Strategy 3: Polling fallback (older Safari)
 * Timeout after VOICE_TIMEOUT_MS (3000ms).
 *
 * @param {string} langCode - Target language code (e.g. 'nl-NL')
 * @return {Promise<Object|null>} Best voice or null if none found
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
			done( pickBestVoice( speechSynthesis.getVoices(), langCode ) );
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
// Section 2: TTSPlayer class
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

		// Error messages from render.php (Phase 3 -- D-04, D-06)
		this.errorMessages = JSON.parse( container.dataset.ttsErrors || '{}' );

		// Capability detection state (Phase 3 -- D-12)
		this.selectedVoice = null;
		this.capabilitiesChecked = false;

		// Resilience state (Phase 3 Plan 03 -- D-03, D-07, D-08)
		this.hasRetried = false;
		this.lastChunkIndex = 0;
		this.wasPlayingBeforeHidden = false;

		// Speed state: find index of initial speed in SPEED_STEPS
		this.speedIndex = SPEED_STEPS.indexOf( this.speed );
		if ( this.speedIndex === -1 ) {
			this.speedIndex = DEFAULT_SPEED_INDEX;
			this.speed = SPEED_STEPS[ this.speedIndex ];
		}

		// DOM references
		this.playBtn = container.querySelector( '.tts-play-btn' );
		this.speedBtn = container.querySelector( '.tts-speed-btn' );
		this.speedMenu = container.querySelector( '.tts-speed-menu' );
		this.durationEl = container.querySelector( '.tts-duration' );
		this.progressBar = container.querySelector( '.tts-progress' );
		this.progressFill = container.querySelector( '.tts-progress__fill' );

		// Event listeners
		this.playBtn.addEventListener( 'click', () => this.togglePlay() );
		this.speedBtn.addEventListener( 'click', ( e ) => {
			e.stopPropagation();
			this.toggleSpeedMenu();
		} );
		if ( this.speedMenu ) {
			this.speedMenu.addEventListener( 'click', ( e ) => {
				const li = e.target.closest( 'li[data-speed]' );
				if ( li ) {
					this.setSpeed( parseFloat( li.dataset.speed ) );
					this.closeSpeedMenu();
				}
			} );
		}
		// Close speed menu when clicking outside
		document.addEventListener( 'click', () => this.closeSpeedMenu() );

		// iOS tab background recovery (D-07)
		document.addEventListener( 'visibilitychange', () =>
			this.handleVisibilityChange()
		);

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
		debugLog( 'state:', this.state, '->', newState );
		this.state = newState;
		this.container.dataset.ttsState = newState;
	}

	/**
	 * Show an inline error message, replacing controls (D-05).
	 * Creates a .tts-error element with role="status" inside .tts-info.
	 *
	 * @param {string} message - Localized error message to display
	 */
	showError( message ) {
		this.setState( STATES.ERROR );
		let errorEl = this.container.querySelector( '.tts-error' );
		if ( ! errorEl ) {
			errorEl = document.createElement( 'div' );
			errorEl.className = 'tts-error';
			errorEl.setAttribute( 'role', 'status' );
			this.container.querySelector( '.tts-info' ).appendChild( errorEl );
		}
		errorEl.textContent = message;
	}

	/**
	 * Clear inline error message text.
	 */
	hideError() {
		const errorEl = this.container.querySelector( '.tts-error' );
		if ( errorEl ) {
			errorEl.textContent = '';
		}
	}

	/**
	 * Load voices cross-browser (Phase 3 -- RESEARCH Pattern 2).
	 * Chrome/Edge: voices load async via onvoiceschanged.
	 * Safari: onvoiceschanged may not fire; uses polling fallback.
	 * Firefox: voices available synchronously.
	 *
	 * IMPORTANT: Uses onvoiceschanged property assignment (NOT addEventListener)
	 * because Safari does not support addEventListener on speechSynthesis.
	 *
	 * @return {Promise<Object[]>} Array of available voices
	 */
	loadVoices() {
		return new Promise( ( resolve ) => {
			let voices = speechSynthesis.getVoices();
			if ( voices.length > 0 ) {
				resolve( voices );
				return;
			}

			// Chrome/Edge: voices load async via onvoiceschanged
			// Safari: onvoiceschanged may not fire; use polling fallback
			speechSynthesis.onvoiceschanged = () => {
				voices = speechSynthesis.getVoices();
				if ( voices.length > 0 ) {
					resolve( voices );
				}
			};

			// Polling fallback for Safari and edge cases (250ms intervals, 2s max)
			let elapsed = 0;
			const maxWait = 2000;
			const interval = 250;
			const poll = () => {
				voices = speechSynthesis.getVoices();
				if ( voices.length > 0 ) {
					resolve( voices );
					return;
				}
				elapsed += interval;
				if ( elapsed >= maxWait ) {
					resolve( [] ); // No voices found within timeout
					return;
				}
				setTimeout( poll, interval );
			};
			setTimeout( poll, interval );
		} );
	}

	/**
	 * Check browser capabilities on first play click (D-12).
	 * - D-10: Feature detection only, no UA sniffing
	 * - D-11: No silent test utterance
	 * - D-01: Hide player completely when no speechSynthesis API
	 * - D-02: Show inline error when no voice for language
	 * - D-09: Best available voice (exact match first, then prefix)
	 *
	 * @return {Promise<boolean>} true if capable, false otherwise
	 */
	async checkCapabilities() {
		// D-10: Feature detection only, no UA sniffing
		if ( ! ( 'speechSynthesis' in window ) ) {
			// D-01: Hide player completely (no DOM, not just display:none)
			this.container.style.display = 'none';
			return false;
		}

		// D-11: No silent test utterance -- check API + voices only
		const voices = await this.loadVoices();

		// D-09: Best available voice using quality scoring (pickBestVoice)
		// Prefers enhanced/premium/neural voices over compact ones
		debugLog( 'voices found:', voices.length );
		const bestVoice = pickBestVoice( voices, this.lang );
		debugLog( 'selected voice:', bestVoice?.name, bestVoice?.lang );

		if ( bestVoice ) {
			this.selectedVoice = bestVoice;
		} else {
			// D-02: No voice for this language -- show inline error
			this.showError(
				this.errorMessages[ 'no-voice' ] ||
					'No voice available for this language.'
			);
			return false;
		}

		return true;
	}

	/**
	 * Toggle play/pause based on current state.
	 * Gates first play on checkCapabilities() (D-12).
	 */
	async togglePlay() {
		switch ( this.state ) {
			case STATES.IDLE:
			case STATES.FINISHED:
				// Claim user gesture for speechSynthesis BEFORE any async work.
				// Chrome requires speak() in the direct click call stack.
				// A silent utterance unlocks the audio context.
				{
					const unlock = new SpeechSynthesisUtterance( '' );
					speechSynthesis.speak( unlock );
					speechSynthesis.cancel();
				}
				// D-12: Check capabilities on first play click
				if ( ! this.capabilitiesChecked ) {
					this.capabilitiesChecked = true;
					const capable = await this.checkCapabilities();
					if ( ! capable ) {
						return;
					}
				}
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
			case STATES.ERROR:
				// Ignore clicks in error state
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

		// Split text into chunks if not already done
		if ( ! this.chunks.length ) {
			this.chunks = splitIntoChunks( this.text );
			debugLog(
				'chunks:',
				this.chunks.length,
				'avg length:',
				Math.round(
					this.chunks.reduce( ( s, c ) => s + c.length, 0 ) /
						this.chunks.length
				)
			);
		}

		// Reset chunk position
		this.currentChunkIndex = 0;

		// Resolve voice on first play (cached per D-14)
		// Phase 3: Use selectedVoice from checkCapabilities() if available,
		// fall back to resolveVoice() for backward compatibility
		if ( this.resolvedVoice === null ) {
			if ( this.selectedVoice ) {
				this.resolvedVoice = this.selectedVoice;
			} else {
				const voice = await resolveVoice( this.lang );
				if ( voice === null ) {
					// No suitable voice found -- show localized error (D-02)
					this.showError(
						this.errorMessages[ 'no-voice' ] ||
							'No voice available for this language.'
					);
					return;
				}
				this.resolvedVoice = voice;
			}
		}

		// Clear any pending speech before starting fresh
		speechSynthesis.cancel();

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

		debugLog(
			'playing chunk:',
			this.currentChunkIndex,
			'/',
			this.chunks.length
		);
		const chunk = this.chunks[ this.currentChunkIndex ];
		const utterance = new SpeechSynthesisUtterance( chunk );
		utterance.lang = this.lang;
		utterance.rate = this.speed; // Reads current speed (D-10)
		if ( this.selectedVoice ) {
			utterance.voice = this.selectedVoice;
		} else if ( this.resolvedVoice ) {
			utterance.voice = this.resolvedVoice; // Cached voice (D-14)
		}

		// Transition to playing when speech actually starts
		utterance.onstart = () => {
			if ( this.state === STATES.LOADING ) {
				this.setState( STATES.PLAYING );
			}
			if ( this.loadingTimeout ) {
				clearTimeout( this.loadingTimeout );
				this.loadingTimeout = null;
			}
			// Reset retry flag on successful start -- allows future retries
			this.hasRetried = false;
		};

		// Chain to next chunk on completion (D-03)
		utterance.onend = () => {
			this.currentChunkIndex++;
			this.updateProgress();
			this.updateRemainingTime();
			this.playNextChunk();
		};

		// Handle errors per SpeechSynthesisErrorEvent error codes (Phase 3)
		utterance.onerror = ( event ) => {
			debugWarn(
				'speech error:',
				event.error,
				'chunk:',
				this.currentChunkIndex
			);
			// 'canceled' and 'interrupted' fire after manual cancel() -- not real errors
			if ( event.error === 'canceled' || event.error === 'interrupted' ) {
				return;
			}
			// language-unavailable / voice-unavailable -> show no-voice error (D-02)
			if (
				event.error === 'language-unavailable' ||
				event.error === 'voice-unavailable'
			) {
				this.showError(
					this.errorMessages[ 'no-voice' ] ||
						'No voice available for this language.'
				);
				return;
			}
			// synthesis-unavailable / not-allowed -> show no-support error (D-01 variant)
			if (
				event.error === 'synthesis-unavailable' ||
				event.error === 'not-allowed'
			) {
				this.showError(
					this.errorMessages[ 'no-support' ] ||
						'Text-to-speech is not available in this browser.'
				);
				return;
			}
			// All other errors (audio-busy, audio-hardware, network, synthesis-failed): D-03 auto-retry
			if ( ! this.hasRetried ) {
				this.hasRetried = true;
				this.retryPlayback( this.lastChunkIndex );
			} else {
				// Retry already failed -- show error and reset after 5s
				this.showError(
					this.errorMessages.failed ||
						'Playback failed. Please try again.'
				);
				setTimeout( () => {
					this.hideError();
					this.setState( STATES.IDLE );
					this.hasRetried = false;
				}, 5000 );
			}
		};

		// Keep reference to prevent garbage collection (RESEARCH Pitfall 3)
		this.currentUtterance = utterance;
		speechSynthesis.speak( utterance );

		// D-08: One-time mute hint on first play for touch devices
		this.showMuteHintIfNeeded();
	}

	/**
	 * Pause playback. Uses speechSynthesis.pause() on desktop for instant
	 * response. Falls back to chunk-boundary pause on touch devices (Android
	 * treats pause() as cancel).
	 */
	pause() {
		if ( 'ontouchstart' in window ) {
			// Mobile: chunk-boundary pause (Android-safe)
			this.isPausePending = true;
		} else {
			// Desktop: instant pause
			speechSynthesis.pause();
		}
		this.setState( STATES.PAUSED );
	}

	/**
	 * Resume playback from the paused position.
	 */
	resume() {
		this.setState( STATES.PLAYING );
		if ( speechSynthesis.paused ) {
			// Desktop: was paused via speechSynthesis.pause()
			speechSynthesis.resume();
		} else {
			// Mobile: was paused at chunk boundary
			this.playNextChunk();
		}
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
		this.hasRetried = false;

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
	 * Retry playback after a failure (D-03).
	 * Cancels current speech and restarts from the given chunk index.
	 * Phase 2 chunking is already in place, so retry resumes from lastChunkIndex.
	 *
	 * @param {number} fromChunkIndex - Chunk index to resume from
	 */
	retryPlayback( fromChunkIndex ) {
		speechSynthesis.cancel();
		this.currentUtterance = null;
		this.currentChunkIndex = fromChunkIndex;
		this.setState( STATES.LOADING );
		this.playNextChunk();
	}

	/**
	 * Handle tab visibility changes for iOS background recovery (D-07).
	 * When tab goes hidden during playback, stores position.
	 * When tab returns, checks if speech stopped and retries if needed.
	 */
	handleVisibilityChange() {
		if (
			document.visibilityState === 'hidden' &&
			this.state === STATES.PLAYING
		) {
			this.lastChunkIndex = this.currentChunkIndex;
			this.wasPlayingBeforeHidden = true;
		}

		if (
			document.visibilityState === 'visible' &&
			this.wasPlayingBeforeHidden
		) {
			this.wasPlayingBeforeHidden = false;
			// Check if speech actually stopped (iOS Safari stops speech on background)
			if ( ! speechSynthesis.speaking ) {
				// D-03: Use retry mechanism (counts as one retry attempt)
				if ( ! this.hasRetried ) {
					this.hasRetried = true;
					this.retryPlayback( this.lastChunkIndex );
				} else {
					// Already retried once -- show error and reset
					this.showError(
						this.errorMessages.failed ||
							'Playback failed. Please try again.'
					);
					setTimeout( () => {
						this.hideError();
						this.setState( STATES.IDLE );
						this.hasRetried = false;
					}, 5000 );
				}
			}
		}
	}

	/**
	 * Show a one-time mute hint on touch devices (D-08).
	 * Uses localStorage to ensure the hint only appears once across sessions.
	 * Auto-dismisses after 6 seconds.
	 */
	showMuteHintIfNeeded() {
		// Only show on touch devices (proxy for mobile -- per D-08)
		if ( ! ( 'ontouchstart' in window ) ) {
			return;
		}

		// One-time: use localStorage so hint doesn't reappear across sessions
		const hintKey = 'tts-mute-hint-shown';
		if ( localStorage.getItem( hintKey ) ) {
			return;
		}

		const hint = document.createElement( 'div' );
		hint.className = 'tts-mute-hint';
		hint.textContent =
			this.errorMessages[ 'mute-hint' ] ||
			'No sound? Check if your phone is not on silent mode.';
		this.container.querySelector( '.tts-info' ).appendChild( hint );

		localStorage.setItem( hintKey, '1' );

		// Auto-dismiss after 6 seconds
		setTimeout( () => {
			hint.remove();
		}, 6000 );
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
					this.progressBar.setAttribute( 'aria-valuenow', '0' );
				}
				this.updateDuration();
				this.setState( STATES.IDLE );
			}
		}, 3000 );
	}

	/**
	 * Toggle the speed selection popup menu.
	 */
	toggleSpeedMenu() {
		if ( ! this.speedMenu ) {
			return;
		}
		const isOpen = this.speedMenu.getAttribute( 'aria-hidden' ) === 'false';
		if ( isOpen ) {
			this.closeSpeedMenu();
		} else {
			this.speedMenu.setAttribute( 'aria-hidden', 'false' );
			this.speedBtn.setAttribute( 'aria-expanded', 'true' );
		}
	}

	/**
	 * Close the speed selection popup menu.
	 */
	closeSpeedMenu() {
		if ( ! this.speedMenu ) {
			return;
		}
		this.speedMenu.setAttribute( 'aria-hidden', 'true' );
		this.speedBtn.setAttribute( 'aria-expanded', 'false' );
	}

	/**
	 * Set playback speed directly. If currently playing, restarts the
	 * current chunk immediately at the new speed.
	 *
	 * @param {number} newSpeed - New playback speed multiplier
	 */
	setSpeed( newSpeed ) {
		debugLog( 'speed changed to:', newSpeed );
		this.speed = newSpeed;
		this.speedIndex = SPEED_STEPS.indexOf( newSpeed );
		if ( this.speedIndex === -1 ) {
			this.speedIndex = DEFAULT_SPEED_INDEX;
		}

		this.speedBtn.textContent = formatSpeed( this.speed );
		this.speedBtn.setAttribute(
			'aria-label',
			'Afspeelsnelheid: ' + formatSpeed( this.speed )
		);

		// Update active state in menu
		if ( this.speedMenu ) {
			this.speedMenu.querySelectorAll( 'li' ).forEach( ( li ) => {
				const isActive = parseFloat( li.dataset.speed ) === newSpeed;
				li.classList.toggle( 'tts-speed-menu__active', isActive );
				li.setAttribute( 'aria-selected', isActive ? 'true' : 'false' );
			} );
		}

		// Instant speed switch: if playing, restart current chunk at new rate
		if ( this.state === STATES.PLAYING && this.currentUtterance ) {
			speechSynthesis.cancel();
			setTimeout( () => this.playNextChunk(), 50 );
		}

		this.updateDuration();
	}

	/**
	 * Update progress bar based on current chunk position (D-05).
	 */
	updateProgress() {
		if ( ! this.chunks.length ) {
			return;
		}
		const percent = ( this.currentChunkIndex / this.chunks.length ) * 100;
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
			Math.round( remainingWords / ( WORDS_PER_MINUTE * this.speed ) )
		);
		this.durationEl.textContent = formatDuration( remainingMinutes, true );
	}

	/**
	 * Recalculate duration display based on current state and speed.
	 * In idle: shows estimated total. During playback: shows remaining.
	 */
	updateDuration() {
		if ( ! this.durationEl ) {
			return;
		}
		if ( this.state === STATES.PLAYING || this.state === STATES.PAUSED ) {
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
// Section 3: Initialization
// =============================================================================

// Initialize all player instances on the page
// WordPress viewScript ensures this only runs on pages with the block
document.querySelectorAll( '.wp-block-tts-js-player' ).forEach( ( el ) => {
	new TTSPlayer( el );
} );
