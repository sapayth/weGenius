import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader, ToggleControl, SelectControl, Button } from '@wordpress/components';
import { Spinner } from '@wordpress/components';

/**
 * Analysis Options Component
 * Handles analysis behavior and default settings
 *
 * @since 1.0.0
 * @param {Object} props Component props
 * @param {Function} props.onSave Save handler
 * @param {boolean} props.isSaving Saving state
 */
export const AnalysisOptions = ({ onSave, isSaving }) => {
	const [settings, setSettings] = useState({
		defaultAnalysisTypes: ['improve', 'gaps', 'ideas'],
		autoAnalyze: false,
		reanalysisFrequency: 'never',
		minContentLength: 100,
		contentTypes: ['post'],
		categories: [],
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
				setSettings(prev => ({ ...prev, ...data.analysis }));
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
		onSave({ analysis: settings });
	};

	return (
		<div className="wegenius-analysis-options">
			<Card className="mb-6">
				<CardHeader>
					<h2 className="text-lg font-semibold text-gray-900 m-0">
						{__('Default Analysis Types', 'wegenius')}
					</h2>
					<p className="text-sm text-gray-600 mt-1 m-0">
						{__('Select which analysis types should be enabled by default.', 'wegenius')}
					</p>
				</CardHeader>
				<CardBody>
					<div className="space-y-4">
						<ToggleControl
							label={__('Improve Content', 'wegenius')}
							checked={settings.defaultAnalysisTypes.includes('improve')}
							onChange={(checked) => {
								const types = checked
									? [...settings.defaultAnalysisTypes, 'improve']
									: settings.defaultAnalysisTypes.filter(t => t !== 'improve');
								handleSettingChange('defaultAnalysisTypes', types);
							}}
							help={__('Enable content improvement suggestions by default', 'wegenius')}
						/>

						<ToggleControl
							label={__('Content Gaps', 'wegenius')}
							checked={settings.defaultAnalysisTypes.includes('gaps')}
							onChange={(checked) => {
								const types = checked
									? [...settings.defaultAnalysisTypes, 'gaps']
									: settings.defaultAnalysisTypes.filter(t => t !== 'gaps');
								handleSettingChange('defaultAnalysisTypes', types);
							}}
							help={__('Enable content gap analysis by default', 'wegenius')}
						/>

						<ToggleControl
							label={__('Content Ideas', 'wegenius')}
							checked={settings.defaultAnalysisTypes.includes('ideas')}
							onChange={(checked) => {
								const types = checked
									? [...settings.defaultAnalysisTypes, 'ideas']
									: settings.defaultAnalysisTypes.filter(t => t !== 'ideas');
								handleSettingChange('defaultAnalysisTypes', types);
							}}
							help={__('Enable content idea suggestions by default', 'wegenius')}
						/>
					</div>
				</CardBody>
			</Card>

			<Card className="mb-6">
				<CardHeader>
					<h3 className="text-md font-semibold text-gray-900 m-0">
						{__('Auto-Analysis Settings', 'wegenius')}
					</h3>
				</CardHeader>
				<CardBody>
					<div className="space-y-6">
						<ToggleControl
							label={__('Auto-analyze on publish', 'wegenius')}
							checked={settings.autoAnalyze}
							onChange={(value) => handleSettingChange('autoAnalyze', value)}
							help={__('Automatically analyze content when posts are published or updated', 'wegenius')}
						/>

						<SelectControl
							label={__('Re-analysis Frequency', 'wegenius')}
							value={settings.reanalysisFrequency}
							options={[
								{ label: __('Never', 'wegenius'), value: 'never' },
								{ label: __('Weekly', 'wegenius'), value: 'weekly' },
								{ label: __('Monthly', 'wegenius'), value: 'monthly' },
								{ label: __('Custom', 'wegenius'), value: 'custom' },
							]}
							onChange={(value) => handleSettingChange('reanalysisFrequency', value)}
							help={__('How often to re-analyze existing content', 'wegenius')}
						/>

						<SelectControl
							label={__('Minimum Content Length', 'wegenius')}
							value={settings.minContentLength.toString()}
							options={[
								{ label: __('50 words', 'wegenius'), value: '50' },
								{ label: __('100 words', 'wegenius'), value: '100' },
								{ label: __('200 words', 'wegenius'), value: '200' },
								{ label: __('500 words', 'wegenius'), value: '500' },
							]}
							onChange={(value) => handleSettingChange('minContentLength', parseInt(value))}
							help={__('Skip analysis for content shorter than this length', 'wegenius')}
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
						__('Save Analysis Settings', 'wegenius')
					)}
				</Button>
			</div>
		</div>
	);
};
