/**
 * TTS-JS Utility Functions
 *
 * Pure functions and constants extracted from view.js for testability.
 * These have no browser API dependencies (no speechSynthesis, no DOM).
 */

/**
 * @typedef {Object} SpeechSynthesisVoice
 * @property {string}  lang         - BCP 47 language tag
 * @property {string}  name         - Human-readable voice name
 * @property {boolean} default      - Whether this is the default voice
 * @property {boolean} localService - Whether this is a local voice
 * @property {string}  voiceURI     - Voice URI identifier
 */

// =============================================================================
// Constants
// =============================================================================

export const STATES = {
	IDLE: 'idle',
	LOADING: 'loading',
	PLAYING: 'playing',
	PAUSED: 'paused',
	FINISHED: 'finished',
	ERROR: 'error',
};

export const SPEED_STEPS = [ 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5 ]; // per D-07
export const DEFAULT_SPEED_INDEX = 2; // 1.0x per D-08
export const WORDS_PER_MINUTE = 150; // per D-04
export const MAX_CHUNK_LENGTH = 300; // per D-02
export const VOICE_TIMEOUT_MS = 3000; // per D-13
export const VOICE_POLL_INTERVAL_MS = 100; // per D-13

// Common Dutch abbreviations that should NOT trigger sentence splits (per RESEARCH Pitfall 2)
export const DUTCH_ABBREVIATIONS = [
	'dhr',
	'mevr',
	'bijv',
	'evt',
	'nr',
	'ca',
	'dr',
	'mr',
	'prof',
	'ing',
	'ir',
];

// Voice quality scoring keywords (per D-11 and RESEARCH Pattern 4)
export const QUALITY_KEYWORDS = {
	high: [ 'enhanced', 'premium', 'neural', 'natural', 'online', 'hd' ],
	low: [ 'compact' ],
};

// =============================================================================
// splitIntoChunks (per D-01, D-02, RESEARCH Pattern 1)
// =============================================================================

/**
 * Split text into speech-safe chunks at sentence boundaries.
 * Uses uppercase-after-period guard to avoid splitting on Dutch abbreviations.
 * Sub-splits long sentences at clause boundaries to stay under MAX_CHUNK_LENGTH.
 *
 * @param {string} text - Full article text to split
 * @return {string[]} Array of non-empty trimmed sentence chunks
 */
export function splitIntoChunks( text ) {
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
// pickBestVoice (per D-11, RESEARCH Pattern 4)
// =============================================================================

/**
 * Score and rank available voices for a given language code.
 * Scoring: +10 exact lang match, +5 per quality keyword, -5 per low-quality keyword,
 * +2 for non-default voice.
 *
 * @param {SpeechSynthesisVoice[]} voices   - Available voices from getVoices()
 * @param {string}                 langCode - Target language code (e.g. 'nl-NL')
 * @return {SpeechSynthesisVoice|null} Best matching voice, or null if none found
 */
export function pickBestVoice( voices, langCode ) {
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
		if ( a.lang === langCode || a.lang.replace( '_', '-' ) === langCode ) {
			scoreA += 10;
		}
		if ( b.lang === langCode || b.lang.replace( '_', '-' ) === langCode ) {
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
// Duration helper functions (per D-04, D-06)
// =============================================================================

/**
 * Estimate total reading duration in minutes.
 *
 * @param {number} wordCount - Total word count
 * @param {number} speed     - Current playback speed multiplier
 * @return {number} Estimated minutes (minimum 1)
 */
export function estimateDuration( wordCount, speed ) {
	return Math.max(
		1,
		Math.round( wordCount / ( WORDS_PER_MINUTE * speed ) )
	);
}

/**
 * Format a duration value for display.
 * During playback shows "resterend" (remaining), otherwise shows estimate.
 *
 * @param {number}  minutes   - Duration in minutes
 * @param {boolean} isPlaying - Whether playback is active
 * @return {string} Formatted duration string
 */
export function formatDuration( minutes, isPlaying ) {
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
export function formatSpeed( speed ) {
	return Number.isInteger( speed ) ? `${ speed }x` : `${ speed }x`;
}

// =============================================================================
// Timestamp helper functions (Phase 9 -- sticky bar time display)
// =============================================================================

/**
 * Format seconds as m:ss timestamp (e.g., 62 -> "1:02", 0 -> "0:00").
 *
 * @param {number} seconds - Time in seconds (will be floored)
 * @return {string} Formatted timestamp
 */
export function formatTimestamp( seconds ) {
	const totalSecs = Math.max( 0, Math.floor( seconds ) );
	const mins = Math.floor( totalSecs / 60 );
	const secs = totalSecs % 60;
	return mins + ':' + String( secs ).padStart( 2, '0' );
}

/**
 * Build cumulative start-time array for chunks at 1x speed.
 * Each entry is the time offset (in seconds) where that chunk begins.
 * Uses WORDS_PER_MINUTE to estimate chunk duration from word count.
 *
 * @param {string[]} chunks - Array of text chunks
 * @return {{ chunkTimes: number[], totalDuration: number }}
 */
export function buildChunkTimes( chunks ) {
	const chunkTimes = [];
	let cumulative = 0;
	for ( const chunk of chunks ) {
		chunkTimes.push( cumulative );
		const words = chunk.split( /\s+/ ).filter( ( w ) => w.length > 0 ).length;
		cumulative += ( words / WORDS_PER_MINUTE ) * 60;
	}
	return { chunkTimes, totalDuration: cumulative };
}
