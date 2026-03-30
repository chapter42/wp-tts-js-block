import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { Button, PanelBody, SelectControl, TextControl, ToggleControl } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import './editor.scss';

const FALLBACK_LANGUAGES = {
	nl: { name: 'Dutch', variants: [ { code: 'nl-NL', label: 'nl-NL' } ] },
	en: {
		name: 'English',
		variants: [
			{ code: 'en-US', label: 'en-US' },
			{ code: 'en-GB', label: 'en-GB' },
		],
	},
	de: { name: 'German', variants: [ { code: 'de-DE', label: 'de-DE' } ] },
	fr: { name: 'French', variants: [ { code: 'fr-FR', label: 'fr-FR' } ] },
	es: { name: 'Spanish', variants: [ { code: 'es-ES', label: 'es-ES' } ] },
	it: { name: 'Italian', variants: [ { code: 'it-IT', label: 'it-IT' } ] },
	pt: {
		name: 'Portuguese',
		variants: [
			{ code: 'pt-BR', label: 'pt-BR' },
			{ code: 'pt-PT', label: 'pt-PT' },
		],
	},
	ja: { name: 'Japanese', variants: [ { code: 'ja-JP', label: 'ja-JP' } ] },
	zh: {
		name: 'Chinese',
		variants: [
			{ code: 'zh-CN', label: 'zh-CN' },
			{ code: 'zh-TW', label: 'zh-TW' },
		],
	},
	ko: { name: 'Korean', variants: [ { code: 'ko-KR', label: 'ko-KR' } ] },
};

function getLanguageName( baseLang ) {
	try {
		const displayNames = new Intl.DisplayNames( [ 'en' ], {
			type: 'language',
		} );
		return displayNames.of( baseLang );
	} catch {
		return baseLang;
	}
}

function useAvailableLanguages() {
	const [ languages, setLanguages ] = useState( null );

	useEffect( () => {
		const synth =
			window.speechSynthesis ||
			( window.parent && window.parent.speechSynthesis );

		if ( ! synth ) {
			setLanguages( FALLBACK_LANGUAGES );
			return;
		}

		const processVoices = ( voices ) => {
			const langMap = {};
			voices.forEach( ( v ) => {
				const code = v.lang.replace( '_', '-' );
				const baseLang = code.split( '-' )[ 0 ];
				if ( ! langMap[ baseLang ] ) {
					langMap[ baseLang ] = {
						name: getLanguageName( baseLang ),
						variants: [],
					};
				}
				if (
					! langMap[ baseLang ].variants.some(
						( x ) => x.code === code
					)
				) {
					langMap[ baseLang ].variants.push( { code, label: code } );
				}
			} );
			return langMap;
		};

		const voices = synth.getVoices();
		if ( voices.length > 0 ) {
			setLanguages( processVoices( voices ) );
			return;
		}

		const handleVoicesChanged = () => {
			const v = synth.getVoices();
			if ( v.length > 0 ) {
				setLanguages( processVoices( v ) );
			}
		};
		synth.addEventListener( 'voiceschanged', handleVoicesChanged );

		const timeout = setTimeout( () => {
			setLanguages( ( current ) => current || FALLBACK_LANGUAGES );
		}, 3000 );

		return () => {
			clearTimeout( timeout );
			synth.removeEventListener( 'voiceschanged', handleVoicesChanged );
		};
	}, [] );

	return languages;
}

function getVoicesForLang( langCode ) {
	const synth = window.speechSynthesis || ( window.parent && window.parent.speechSynthesis );
	if ( ! synth ) return [];
	const voices = synth.getVoices();
	const langPrefix = langCode.split( '-' )[ 0 ];
	return voices.filter( ( v ) => {
		const code = v.lang.replace( '_', '-' );
		return code === langCode || code.startsWith( langPrefix + '-' );
	} );
}

function testVoice( voice, langCode ) {
	const synth = window.speechSynthesis || ( window.parent && window.parent.speechSynthesis );
	if ( ! synth ) return;
	synth.cancel();
	const sampleText = langCode.startsWith( 'nl' )
		? 'Dit is een testbericht van de voorleesfunctie.'
		: 'This is a test message from the text-to-speech player.';
	const utterance = new SpeechSynthesisUtterance( sampleText );
	utterance.voice = voice;
	utterance.lang = langCode;
	utterance.rate = 1;
	synth.speak( utterance );
}

export default function Edit( { attributes, setAttributes } ) {
	const { lang, speed, label, enableHighlighting } = attributes;
	const blockProps = useBlockProps( {
		className: 'tts-player tts-player--preview',
	} );
	const languages = useAvailableLanguages();
	const [ voicesForLang, setVoicesForLang ] = useState( [] );

	useEffect( () => {
		const updateVoices = () => {
			setVoicesForLang( getVoicesForLang( lang ) );
		};
		updateVoices();
		const synth = window.speechSynthesis || ( window.parent && window.parent.speechSynthesis );
		if ( synth ) {
			synth.addEventListener( 'voiceschanged', updateVoices );
			return () => synth.removeEventListener( 'voiceschanged', updateVoices );
		}
	}, [ lang ] );

	// Same SVG icons as render.php (20x20 viewBox, currentColor fill)
	const iconPlay = (
		<svg
			className="tts-icon tts-icon--play"
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="currentColor"
			aria-hidden="true"
		>
			<polygon points="5,3 17,10 5,17" />
		</svg>
	);
	const iconStop = (
		<svg
			className="tts-icon tts-icon--stop"
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="currentColor"
			aria-hidden="true"
		>
			<rect x="4" y="4" width="12" height="12" />
		</svg>
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title="Player instellingen">
					<SelectControl
						label="Taal"
						value={ lang }
						onChange={ ( val ) =>
							setAttributes( { lang: val } )
						}
						disabled={ ! languages }
						help={
							! languages ? 'Talen laden...' : undefined
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						{ languages &&
							Object.entries( languages )
								.sort( ( [ , a ], [ , b ] ) =>
									a.name.localeCompare( b.name )
								)
								.map( ( [ baseLang, group ] ) => (
									<optgroup
										key={ baseLang }
										label={ group.name }
									>
										{ group.variants.map( ( v ) => (
											<option
												key={ v.code }
												value={ v.code }
											>
												{ v.label }
											</option>
										) ) }
									</optgroup>
								) ) }
					</SelectControl>
					<SelectControl
						label="Standaard snelheid"
						value={ speed }
						options={ [
							{ label: '0.8x', value: 0.8 },
							{ label: '0.9x', value: 0.9 },
							{ label: '1x', value: 1 },
							{ label: '1.1x', value: 1.1 },
							{ label: '1.2x', value: 1.2 },
							{ label: '1.3x', value: 1.3 },
							{ label: '1.4x', value: 1.4 },
							{ label: '1.5x', value: 1.5 },
						] }
						onChange={ ( val ) =>
							setAttributes( { speed: parseFloat( val ) } )
						}
					/>
					<TextControl
						label="Label"
						value={ label }
						onChange={ ( val ) => setAttributes( { label: val } ) }
					/>
					<ToggleControl
						label="Tekst markeren tijdens afspelen"
						checked={ enableHighlighting !== false }
						onChange={ ( val ) =>
							setAttributes( { enableHighlighting: val } )
						}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
				<PanelBody title="Voice Diagnostics" initialOpen={ false }>
					{ voicesForLang.length === 0 ? (
						<p>No voices available for <strong>{ lang }</strong></p>
					) : (
						<>
							<p>{ voicesForLang.length } voice{ voicesForLang.length !== 1 ? 's' : '' } available for <strong>{ lang }</strong>:</p>
							<ul style={ { margin: '8px 0', paddingLeft: '20px' } }>
								{ voicesForLang.map( ( v ) => (
									<li key={ v.name } style={ { marginBottom: '4px' } }>
										{ v.name } <small>({ v.lang.replace( '_', '-' ) })</small>
									</li>
								) ) }
							</ul>
						</>
					) }
					<Button
						variant="secondary"
						onClick={ () => {
							if ( voicesForLang.length > 0 ) {
								testVoice( voicesForLang[ 0 ], lang );
							}
						} }
						disabled={ voicesForLang.length === 0 }
					>
						Test Voice
					</Button>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<button className="tts-skip-btn tts-skip-btn--back" disabled aria-label="Vorige zin" style={ { display: 'flex' } }>
					<svg className="tts-icon tts-icon--skip-back" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<polygon points="10,4 2,10 10,16" />
						<polygon points="18,4 10,10 18,16" />
					</svg>
				</button>
				<button className="tts-play-btn" disabled aria-label={ label }>
					{ iconPlay }
				</button>
				<button className="tts-skip-btn tts-skip-btn--forward" disabled aria-label="Volgende zin" style={ { display: 'flex' } }>
					<svg className="tts-icon tts-icon--skip-forward" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
						<polygon points="2,4 10,10 2,16" />
						<polygon points="10,4 18,10 10,16" />
					</svg>
				</button>
				<div className="tts-info">
					<span className="tts-label">{ label }</span>
					<span className="tts-duration">~3 min</span>
					<div
						className="tts-progress tts-progress--preview"
						style={ { display: 'block' } }
					>
						<div
							className="tts-progress__fill"
							style={ { width: '40%' } }
						></div>
					</div>
				</div>
				<button
					className="tts-speed-btn"
					disabled
					aria-label="Afspeelsnelheid: 1x"
				>
					1x
				</button>
				<button className="tts-stop-btn" disabled aria-label="Stop">
					{ iconStop }
				</button>
			</div>
		</>
	);
}
