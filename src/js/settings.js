import { createRoot } from '@wordpress/element';
import { SettingsTabs } from './components/Settings/SettingsTabs';
import '../css/main.css';

/**
 * Settings Entry Point
 * Renders the settings interface
 *
 * @since 1.0.0
 */
const initSettings = () => {
	const container = document.getElementById('wegenius-settings-root');
	if (container) {
		const root = createRoot(container);
		root.render(<SettingsTabs />);
	}
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initSettings);
} else {
	initSettings();
}
