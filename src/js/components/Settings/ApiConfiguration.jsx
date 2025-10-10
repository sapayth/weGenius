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
						/>

						<TextControl
							label={__('API Key', 'wegenius')}
							value={settings.apiKey}
							onChange={(value) => handleSettingChange('apiKey', value)}
							type="password"
							placeholder="••••••••••••••••"
							help={__('Your weGenius API authentication key.', 'wegenius')}
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

			<Card className="mb-6">
				<CardHeader>
					<h3 className="text-md font-semibold text-gray-900 m-0">
						{__('Advanced Settings', 'wegenius')}
					</h3>
				</CardHeader>
				<CardBody>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<TextControl
							label={__('Timeout (seconds)', 'wegenius')}
							value={settings.timeout}
							onChange={(value) => handleSettingChange('timeout', parseInt(value) || 30)}
							type="number"
							min="5"
							max="300"
							help={__('Request timeout in seconds', 'wegenius')}
						/>

						<TextControl
							label={__('Rate Limit (requests/minute)', 'wegenius')}
							value={settings.rateLimit}
							onChange={(value) => handleSettingChange('rateLimit', parseInt(value) || 10)}
							type="number"
							min="1"
							max="100"
							help={__('Maximum requests per minute', 'wegenius')}
						/>

						<TextControl
							label={__('Retry Attempts', 'wegenius')}
							value={settings.retryAttempts}
							onChange={(value) => handleSettingChange('retryAttempts', parseInt(value) || 3)}
							type="number"
							min="0"
							max="10"
							help={__('Number of retry attempts for failed requests', 'wegenius')}
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
						__('Save API Settings', 'wegenius')
					)}
				</Button>
			</div>
		</div>
	);
};
