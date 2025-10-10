import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader, SelectControl, TextControl, Button } from '@wordpress/components';
import { Spinner } from '@wordpress/components';

/**
 * Performance Settings Component
 * Handles performance and caching configuration
 *
 * @since 1.0.0
 * @param {Object} props Component props
 * @param {Function} props.onSave Save handler
 * @param {boolean} props.isSaving Saving state
 */
export const PerformanceSettings = ({ onSave, isSaving }) => {
	const [settings, setSettings] = useState({
		cacheDuration: '1hour',
		batchSize: 5,
		backgroundPriority: 'normal',
		memoryLimit: 128,
		cleanupDays: 90,
	});

	useEffect(() => {
		loadSettings();
	}, []);

	/**
	 * Load current settings
	 */
	const loadSettings = async () => {
		try {
			const response = await fetch('/wp-json/wegenius/v1/settings', {
				headers: {
					'X-WP-Nonce': window.wegeniusAdmin.nonce,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setSettings(prev => ({ ...prev, ...data.performance }));
			}
		} catch (error) {
			console.error('Failed to load settings:', error);
		}
	};

	/**
	 * Handle setting change
	 */
	const handleSettingChange = (key, value) => {
		setSettings(prev => ({
			...prev,
			[key]: value,
		}));
	};

	/**
	 * Handle form save
	 */
	const handleSave = () => {
		onSave({ performance: settings });
	};

	return (
		<div className="wegenius-performance-settings">
			<Card className="mb-6">
				<CardHeader>
					<h2 className="text-lg font-semibold text-gray-900 m-0">
						{__('Caching Settings', 'wegenius')}
					</h2>
					<p className="text-sm text-gray-600 mt-1 m-0">
						{__('Configure how long to cache analysis results.', 'wegenius')}
					</p>
				</CardHeader>
				<CardBody>
					<div className="space-y-6">
						<SelectControl
							label={__('Cache Duration', 'wegenius')}
							value={settings.cacheDuration}
							options={[
								{ label: __('1 Hour', 'wegenius'), value: '1hour' },
								{ label: __('1 Day', 'wegenius'), value: '1day' },
								{ label: __('1 Week', 'wegenius'), value: '1week' },
								{ label: __('Never Cache', 'wegenius'), value: 'never' },
							]}
							onChange={(value) => handleSettingChange('cacheDuration', value)}
							help={__('How long to cache analysis results', 'wegenius')}
						/>
					</div>
				</CardBody>
			</Card>

			<Card className="mb-6">
				<CardHeader>
					<h3 className="text-md font-semibold text-gray-900 m-0">
						{__('Background Processing', 'wegenius')}
					</h3>
				</CardHeader>
				<CardBody>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<SelectControl
							label={__('Batch Size', 'wegenius')}
							value={settings.batchSize.toString()}
							options={[
								{ label: __('1 analysis', 'wegenius'), value: '1' },
								{ label: __('5 analyses', 'wegenius'), value: '5' },
								{ label: __('10 analyses', 'wegenius'), value: '10' },
								{ label: __('20 analyses', 'wegenius'), value: '20' },
							]}
							onChange={(value) => handleSettingChange('batchSize', parseInt(value))}
							help={__('Number of concurrent analyses', 'wegenius')}
						/>

						<SelectControl
							label={__('Background Priority', 'wegenius')}
							value={settings.backgroundPriority}
							options={[
								{ label: __('Low', 'wegenius'), value: 'low' },
								{ label: __('Normal', 'wegenius'), value: 'normal' },
								{ label: __('High', 'wegenius'), value: 'high' },
							]}
							onChange={(value) => handleSettingChange('backgroundPriority', value)}
							help={__('Processing priority for background tasks', 'wegenius')}
						/>
					</div>
				</CardBody>
			</Card>

			<Card className="mb-6">
				<CardHeader>
					<h3 className="text-md font-semibold text-gray-900 m-0">
						{__('Resource Limits', 'wegenius')}
					</h3>
				</CardHeader>
				<CardBody>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<TextControl
							label={__('Memory Limit (MB)', 'wegenius')}
							value={settings.memoryLimit.toString()}
							onChange={(value) => handleSettingChange('memoryLimit', parseInt(value) || 128)}
							type="number"
							min="64"
							max="512"
							help={__('Maximum memory usage for analysis', 'wegenius')}
						/>

						<TextControl
							label={__('Cleanup After (Days)', 'wegenius')}
							value={settings.cleanupDays.toString()}
							onChange={(value) => handleSettingChange('cleanupDays', parseInt(value) || 90)}
							type="number"
							min="7"
							max="365"
							help={__('Remove old analysis data after this many days', 'wegenius')}
						/>
					</div>
				</CardBody>
			</Card>

			<div className="wegenius-settings-actions">
				<Button
					variant="primary"
					onClick={handleSave}
					disabled={isSaving}
					className="wegenius-save-button"
				>
					{isSaving ? (
						<>
							<Spinner className="wegenius-spinner" />
							{__('Saving...', 'wegenius')}
						</>
					) : (
						__('Save Performance Settings', 'wegenius')
					)}
				</Button>
			</div>
		</div>
	);
};
