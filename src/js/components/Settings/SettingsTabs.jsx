import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ApiConfiguration } from './ApiConfiguration';
import { AnalysisOptions } from './AnalysisOptions';
import { ContentGenerationSettings } from './ContentGenerationSettings';
import { PerformanceSettings } from './PerformanceSettings';
import { PermissionsSettings } from './PermissionsSettings';

/**
 * Settings Tabs Component
 * Main settings interface with tabbed navigation
 *
 * @since 1.0.0
 */
export const SettingsTabs = () => {
	const [activeTab, setActiveTab] = useState('api');
	const [isSaving, setIsSaving] = useState(false);
	const [saveMessage, setSaveMessage] = useState('');

	/**
	 * Tab configuration
	 */
	const tabs = [
		{
			name: 'api',
			title: __('API Configuration', 'wegenius'),
			icon: '🔌',
		},
		{
			name: 'analysis',
			title: __('Analysis Options', 'wegenius'),
			icon: '🔍',
		},
		{
			name: 'content-generation',
			title: __('Content Generation', 'wegenius'),
			icon: '✍️',
		},
		{
			name: 'performance',
			title: __('Performance', 'wegenius'),
			icon: '⚡',
		},
		{
			name: 'permissions',
			title: __('Permissions', 'wegenius'),
			icon: '🔒',
		},
	];

	/**
	 * Handle settings save
	 */
	const handleSave = async (settings) => {
		setIsSaving(true);
		setSaveMessage('');

		try {
			const response = await fetch('/wp-json/wegenius/v1/settings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': window.wegeniusAdmin.nonce,
				},
				body: JSON.stringify(settings),
			});

			if (!response.ok) {
				throw new Error('Failed to save settings');
			}

			setSaveMessage(__('Settings saved successfully!', 'wegenius'));
			setTimeout(() => setSaveMessage(''), 3000);
		} catch (error) {
			console.error('Settings save error:', error);
			setSaveMessage(__('Failed to save settings. Please try again.', 'wegenius'));
		} finally {
			setIsSaving(false);
		}
	};

	/**
	 * Render tab content
	 */
	const renderTabContent = (tabName) => {
		switch (tabName) {
			case 'api':
				return <ApiConfiguration onSave={handleSave} isSaving={isSaving} />;
			case 'analysis':
				return <AnalysisOptions onSave={handleSave} isSaving={isSaving} />;
			case 'content-generation':
				return <ContentGenerationSettings onSave={handleSave} isSaving={isSaving} />;
			case 'performance':
				return <PerformanceSettings onSave={handleSave} isSaving={isSaving} />;
			case 'permissions':
				return <PermissionsSettings onSave={handleSave} isSaving={isSaving} />;
			default:
				return null;
		}
	};

	return (
		<div className="wegenius-container">
			<div className="wegen-settings-wrapper">
				{/* Header Section */}
				<div className="wegen-settings-header">
					<div className="wegen-settings-header-content">
						<h1 className="wegen-settings-title">
							{__('weGenius Settings', 'wegenius')}
						</h1>
						<p className="wegen-settings-subtitle">
							{__('Configure your weGenius plugin settings and preferences.', 'wegenius')}
						</p>
					</div>

					{/* Success/Error Message */}
					{saveMessage && (
						<div className={`wegen-settings-message ${
							saveMessage.includes('successfully') 
								? 'wegen-settings-message-success' 
								: 'wegen-settings-message-error'
						}`}>
							<p className="m-0">{saveMessage}</p>
						</div>
					)}
				</div>

				{/* Main Content Area */}
				<div className="wegen-settings-main">
					{/* Left Sidebar Navigation */}
					<nav className="wegen-settings-sidebar">
						<ul className="wegen-settings-nav" role="tablist">
							{tabs.map((tab) => (
								<li key={tab.name} role="presentation">
									<button
										className={`wegen-settings-nav-item ${
											activeTab === tab.name ? 'wegen-settings-nav-item-active' : ''
										}`}
										onClick={() => setActiveTab(tab.name)}
										role="tab"
										aria-selected={activeTab === tab.name}
										aria-controls={`panel-${tab.name}`}
									>
										<span className="wegen-settings-nav-icon">{tab.icon}</span>
										<span className="wegen-settings-nav-title">{tab.title}</span>
									</button>
								</li>
							))}
						</ul>
					</nav>

					{/* Right Content Area */}
					<div className="wegen-settings-content">
						<div
							className="wegen-settings-panel"
							role="tabpanel"
							id={`panel-${activeTab}`}
							aria-labelledby={`tab-${activeTab}`}
						>
							{renderTabContent(activeTab)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
