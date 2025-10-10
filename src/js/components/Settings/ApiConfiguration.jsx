import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader, TextControl, Button, Notice } from '@wordpress/components';
import { Spinner } from '@wordpress/components';

/**
 * API Configuration Component
 * Handles API endpoint and authentication settings
 *
 * @since 1.0.0
 * @param {Object} props Component props
 * @param {Function} props.onSave Save handler
 * @param {boolean} props.isSaving Saving state
 */
export const ApiConfiguration = ({ onSave, isSaving }) => {
	const [settings, setSettings] = useState({
		apiEndpoint: '',
		apiKey: '',
		timeout: 30,
		rateLimit: 10,
		retryAttempts: 3,
	});

	const [isTesting, setIsTesting] = useState(false);
	const [testResult, setTestResult] = useState(null);

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
				setSettings(prev => ({ ...prev, ...data.api }));
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
	 * Test API connection
	 */
	const testApiConnection = async () => {
		setIsTesting(true);
		setTestResult(null);

		try {
			const response = await fetch('/wp-json/wegenius/v1/settings/test-api', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': window.wegeniusAdmin.nonce,
				},
				body: JSON.stringify({
					apiEndpoint: settings.apiEndpoint,
					apiKey: settings.apiKey,
				}),
			});

			const result = await response.json();
			setTestResult({
				success: response.ok,
				message: result.message || (response.ok ? __('Connection successful!', 'wegenius') : __('Connection failed', 'wegenius')),
			});
		} catch (error) {
			setTestResult({
				success: false,
				message: __('Connection test failed. Please check your settings.', 'wegenius'),
			});
		} finally {
			setIsTesting(false);
		}
	};

	/**
	 * Handle form save
	 */
	const handleSave = () => {
		onSave({ api: settings });
	};

	return (
		<div className="wegenius-api-configuration">
			<Card className="mb-6">
				<CardHeader>
					<h2 className="text-lg font-semibold text-gray-900 m-0">
						{__('API Configuration', 'wegenius')}
					</h2>
					<p className="text-sm text-gray-600 mt-1 m-0">
						{__('Configure your weGenius API connection settings.', 'wegenius')}
					</p>
				</CardHeader>
				<CardBody>
					<div className="space-y-6">
						<TextControl
							label={__('API Endpoint', 'wegenius')}
							value={settings.apiEndpoint}
							onChange={(value) => handleSettingChange('apiEndpoint', value)}
							placeholder="https://api.wegenius.com/v1/analyze"
							help={__('Enter the full URL to your weGenius API endpoint.', 'wegenius')}
							className="wegen-textcontrol-full-width"
						/>

						<TextControl
							label={__('API Key', 'wegenius')}
							value={settings.apiKey}
							onChange={(value) => handleSettingChange('apiKey', value)}
							type="password"
							placeholder="••••••••••••••••"
							help={__('Your weGenius API authentication key.', 'wegenius')}
							className="wegen-textcontrol-full-width"
						/>

						<div className="flex items-center space-x-4">
							<Button
								variant="secondary"
								onClick={testApiConnection}
								disabled={isTesting || !settings.apiEndpoint || !settings.apiKey}
							>
								{isTesting ? (
									<>
										<Spinner className="wegenius-spinner" />
										{__('Testing...', 'wegenius')}
									</>
								) : (
									__('Test Connection', 'wegenius')
								)}
							</Button>

							{testResult && (
								<Notice
									status={testResult.success ? 'success' : 'error'}
									isDismissible={false}
									className="wegenius-test-result"
								>
									{testResult.message}
								</Notice>
							)}
						</div>
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
						__('Save API Settings', 'wegenius')
					)}
				</Button>
			</div>
		</div>
	);
};
