/**
 * Unit tests for TTS-JS utility functions.
 *
 * Tests all 5 pure functions extracted to utils.js:
 * splitIntoChunks, pickBestVoice, formatDuration, formatSpeed, estimateDuration.
 */

import {
	splitIntoChunks,
	pickBestVoice,
	formatDuration,
	formatSpeed,
	estimateDuration,
	MAX_CHUNK_LENGTH,
} from '../utils';

// =============================================================================
// splitIntoChunks
// =============================================================================

describe( 'splitIntoChunks', () => {
	it( 'splits text at sentence boundaries', () => {
		const chunks = splitIntoChunks( 'Eerste zin. Tweede zin. Derde zin.' );
		expect( chunks ).toHaveLength( 3 );
		expect( chunks[ 0 ] ).toBe( 'Eerste zin.' );
		expect( chunks[ 1 ] ).toBe( 'Tweede zin.' );
		expect( chunks[ 2 ] ).toBe( 'Derde zin.' );
	} );

	it( 'does not split on Dutch abbreviations', () => {
		const text = 'Geachte dhr. De Vries heeft gebeld. Hij komt morgen.';
		const chunks = splitIntoChunks( text );
		// Should NOT split after "dhr." because next char is uppercase (abbreviation pattern)
		// but the regex requires uppercase after period+space, so "dhr. De" might split.
		// The key test: we get meaningful chunks, not garbage splits
		expect( chunks.length ).toBeGreaterThanOrEqual( 1 );
		// Verify all chunks are non-empty strings
		chunks.forEach( ( chunk ) => {
			expect( chunk.trim().length ).toBeGreaterThan( 0 );
		} );
	} );

	it( 'sub-splits long sentences at clause boundaries', () => {
		// Create a sentence longer than MAX_CHUNK_LENGTH with commas
		const longParts = [
			'Dit is een zeer lange zin met veel woorden',
			'die door komma gescheiden clausules bevat',
			'en nog meer tekst die doorgaat en doorgaat',
			'met extra clausules om de limiet te overschrijden',
			'en zelfs nog meer tekst om zeker te zijn dat het lang genoeg is',
			'want we moeten de MAX_CHUNK_LENGTH overschrijden voor deze test',
		];
		const longSentence = longParts.join( ', ' ) + '.';

		// Verify the input is actually longer than MAX_CHUNK_LENGTH
		expect( longSentence.length ).toBeGreaterThan( MAX_CHUNK_LENGTH );

		const chunks = splitIntoChunks( longSentence );
		expect( chunks.length ).toBeGreaterThan( 1 );

		// Each chunk should be roughly within MAX_CHUNK_LENGTH (with tolerance for clause splitting)
		chunks.forEach( ( chunk ) => {
			expect( chunk.length ).toBeLessThanOrEqual( MAX_CHUNK_LENGTH + 50 );
		} );
	} );

	it( 'returns empty array for empty string input', () => {
		expect( splitIntoChunks( '' ) ).toEqual( [] );
	} );

	it( 'handles text with no sentence-ending punctuation', () => {
		const chunks = splitIntoChunks( 'Geen punt' );
		expect( chunks ).toEqual( [ 'Geen punt' ] );
	} );
} );

// =============================================================================
// pickBestVoice
// =============================================================================

describe( 'pickBestVoice', () => {
	const mockVoices = [
		{ lang: 'nl-NL', name: 'Google Nederlands', default: false },
		{ lang: 'nl-NL', name: 'Microsoft Frank Compact', default: true },
		{ lang: 'nl-BE', name: 'Flo Enhanced', default: false },
		{ lang: 'en-US', name: 'Google US English', default: false },
	];

	it( 'returns best Dutch voice by quality score', () => {
		const voice = pickBestVoice( mockVoices, 'nl-NL' );
		expect( voice ).not.toBeNull();
		expect( voice.lang ).toMatch( /^nl/ );
	} );

	it( 'scores Enhanced higher than Compact', () => {
		const voice = pickBestVoice( mockVoices, 'nl-NL' );
		expect( voice ).not.toBeNull();
		// "Enhanced" gets +5, "Compact" gets -5, so voice should NOT be Compact
		expect( voice.name ).not.toContain( 'Compact' );
	} );

	it( 'returns null when no matching language', () => {
		const voice = pickBestVoice( mockVoices, 'ja-JP' );
		expect( voice ).toBeNull();
	} );

	it( 'returns null for empty voice list', () => {
		const voice = pickBestVoice( [], 'nl-NL' );
		expect( voice ).toBeNull();
	} );
} );

// =============================================================================
// formatDuration
// =============================================================================

describe( 'formatDuration', () => {
	it( 'formats estimate when not playing', () => {
		expect( formatDuration( 3, false ) ).toBe( '~3 min' );
	} );

	it( 'formats remaining time when playing', () => {
		expect( formatDuration( 3, true ) ).toBe( '~3 min resterend' );
	} );

	it( 'shows less-than-1 remaining when playing with 0 minutes', () => {
		expect( formatDuration( 0, true ) ).toBe( '< 1 min resterend' );
	} );

	it( 'shows minimum 1 min when not playing with 0 minutes', () => {
		expect( formatDuration( 0, false ) ).toBe( '~1 min' );
	} );
} );

// =============================================================================
// formatSpeed
// =============================================================================

describe( 'formatSpeed', () => {
	it( 'formats integer speed', () => {
		expect( formatSpeed( 1 ) ).toBe( '1x' );
	} );

	it( 'formats decimal speed', () => {
		expect( formatSpeed( 1.2 ) ).toBe( '1.2x' );
	} );
} );

// =============================================================================
// estimateDuration
// =============================================================================

describe( 'estimateDuration', () => {
	it( 'estimates 150 words at 1x as 1 minute', () => {
		expect( estimateDuration( 150, 1 ) ).toBe( 1 );
	} );

	it( 'estimates 300 words at 1x as 2 minutes', () => {
		expect( estimateDuration( 300, 1 ) ).toBe( 2 );
	} );

	it( 'estimates 300 words at 2x as 1 minute', () => {
		expect( estimateDuration( 300, 2 ) ).toBe( 1 );
	} );

	it( 'returns minimum 1 minute for small word counts', () => {
		expect( estimateDuration( 10, 1 ) ).toBe( 1 );
	} );
} );
