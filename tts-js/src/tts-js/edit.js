import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, RangeControl, TextControl } from '@wordpress/components';
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
					<RangeControl
						label="Snelheid"
						value={speed}
						onChange={(val) => setAttributes({ speed: val })}
						min={0.5}
						max={2}
						step={0.25}
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
				</div>
				<button className="tts-stop-btn" disabled aria-label="Stop">
					{iconStop}
				</button>
			</div>
		</>
	);
}
