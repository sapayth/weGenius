import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { TabPanel } from '@wordpress/components';
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
	const [isSaving, setIsSaving] = useState(false);
	const [saveMessage, setSaveMessage] = useState('');

	/**
	 * Tab configuration
	 */
	const tabs = [
		{
			name: 'api',
			title: __('API Configuration', 'wegenius'),
			className: 'wegenius-tab-api',
		},
		{
			name: 'analysis',
			title: __('Analysis Options', 'wegenius'),
			className: 'wegenius-tab-analysis',
		},
		{
			name: 'content-generation',
			title: __('Content Generation', 'wegenius'),
			className: 'wegenius-tab-content-generation',
		},
		{
			name: 'performance',
			title: __('Performance', 'wegenius'),
			className: 'wegenius-tab-performance',
		},
		{
			name: 'permissions',
			title: __('Permissions', 'wegenius'),
			className: 'wegenius-tab-permissions',
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
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						{__('weGenius Settings', 'wegenius')}
					</h1>
					<p className="text-gray-600">
						{__('Configure your weGenius plugin settings and preferences.', 'wegenius')}
					</p>
				</div>

				{saveMessage && (
					<div className={`mb-6 p-4 rounded-md ${
						saveMessage.includes('successfully') 
							? 'bg-green-50 border border-green-200 text-green-800' 
							: 'bg-red-50 border border-red-200 text-red-800'
					}`}>
						<p className="m-0">{saveMessage}</p>
					</div>
				)}

				<TabPanel
					className="bg-white rounded-lg shadow-sm border border-gray-200"
					activeClass="bg-blue-50 text-blue-700 border-blue-200"
					orientation="horizontal"
					tabs={tabs}
				>
					{(tab) => (
						<div className="p-6">
							{renderTabContent(tab.name)}
						</div>
					)}
				</TabPanel>
			</div>
		</div>
	);
};
