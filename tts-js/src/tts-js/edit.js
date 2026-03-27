import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
	return (
		<div { ...useBlockProps() }>
			<p>TTS Player (preview coming soon)</p>
		</div>
	);
}
