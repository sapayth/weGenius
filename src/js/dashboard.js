import { createRoot } from '@wordpress/element';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import '../css/main.css';

/**
 * Dashboard Entry Point
 * Renders the main dashboard component
 *
 * @since 1.0.0
 */
const initDashboard = () => {
	const container = document.getElementById('wegenius-dashboard-root');
	if (container) {
		const root = createRoot(container);
		root.render(<DashboardOverview />);
	}
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initDashboard);
} else {
	initDashboard();
}
