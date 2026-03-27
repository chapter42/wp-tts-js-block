import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
	const { lang, speed, label } = attributes;
	const blockProps = useBlockProps({ className: 'tts-player tts-player--preview' });

	// Same SVG icons as render.php (20x20 viewBox, currentColor fill)
	const iconPlay = (
		<svg className="tts-icon tts-icon--play" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
			<polygon points="5,3 17,10 5,17" />
		</svg>
	);
	const iconStop = (
		<svg className="tts-icon tts-icon--stop" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
			<rect x="4" y="4" width="12" height="12" />
		</svg>
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title="Player instellingen">
					<SelectControl
						label="Taal"
						value={lang}
						options={[
							{ label: 'Nederlands', value: 'nl-NL' },
							{ label: 'English', value: 'en-US' },
							{ label: 'Deutsch', value: 'de-DE' },
							{ label: 'Francais', value: 'fr-FR' },
							{ label: 'Espanol', value: 'es-ES' },
						]}
						onChange={(val) => setAttributes({ lang: val })}
					/>
					<SelectControl
						label="Standaard snelheid"
						value={speed}
						options={[
							{ label: '0.8x', value: 0.8 },
							{ label: '0.9x', value: 0.9 },
							{ label: '1x', value: 1 },
							{ label: '1.1x', value: 1.1 },
							{ label: '1.2x', value: 1.2 },
							{ label: '1.3x', value: 1.3 },
							{ label: '1.4x', value: 1.4 },
							{ label: '1.5x', value: 1.5 },
						]}
						onChange={(val) => setAttributes({ speed: parseFloat(val) })}
					/>
					<TextControl
						label="Label"
						value={label}
						onChange={(val) => setAttributes({ label: val })}
					/>
				</PanelBody>
			</InspectorControls>
			<div {...blockProps}>
				<button className="tts-play-btn" disabled aria-label={label}>
					{iconPlay}
				</button>
				<div className="tts-info">
					<span className="tts-label">{label}</span>
					<span className="tts-duration">~3 min</span>
					<div className="tts-progress tts-progress--preview" style={{ display: 'block' }}>
						<div className="tts-progress__fill" style={{ width: '40%' }}></div>
					</div>
				</div>
				<button className="tts-speed-btn" disabled aria-label="Afspeelsnelheid: 1x">1x</button>
				<button className="tts-stop-btn" disabled aria-label="Stop">
					{iconStop}
				</button>
			</div>
		</>
	);
}
