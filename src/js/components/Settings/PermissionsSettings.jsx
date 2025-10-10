import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader, SelectControl, ToggleControl, Button } from '@wordpress/components';
import { Spinner } from '@wordpress/components';

/**
 * Permissions Settings Component
 * Handles user role and capability settings
 *
 * @since 1.0.0
 * @param {Object} props Component props
 * @param {Function} props.onSave Save handler
 * @param {boolean} props.isSaving Saving state
 */
export const PermissionsSettings = ({ onSave, isSaving }) => {
	const [settings, setSettings] = useState({
		canAnalyze: ['administrator', 'editor'],
		canViewResults: ['administrator', 'editor', 'author'],
		canConfigure: ['administrator'],
		canBulkAnalyze: ['administrator', 'editor'],
		canExport: ['administrator'],
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
				setSettings(prev => ({ ...prev, ...data.permissions }));
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
	 * Handle role toggle
	 */
	const handleRoleToggle = (capability, role, checked) => {
		const currentRoles = settings[capability] || [];
		const newRoles = checked
			? [...currentRoles, role]
			: currentRoles.filter(r => r !== role);
		
		handleSettingChange(capability, newRoles);
	};

	/**
	 * Handle form save
	 */
	const handleSave = () => {
		onSave({ permissions: settings });
	};

	const roles = [
		{ value: 'administrator', label: __('Administrator', 'wegenius') },
		{ value: 'editor', label: __('Editor', 'wegenius') },
		{ value: 'author', label: __('Author', 'wegenius') },
		{ value: 'contributor', label: __('Contributor', 'wegenius') },
	];

	const capabilities = [
		{
			key: 'canAnalyze',
			title: __('Can Trigger Analysis', 'wegenius'),
			description: __('Who can start content analysis', 'wegenius'),
		},
		{
			key: 'canViewResults',
			title: __('Can View Results', 'wegenius'),
			description: __('Who can view analysis results', 'wegenius'),
		},
		{
			key: 'canConfigure',
			title: __('Can Configure Settings', 'wegenius'),
			description: __('Who can modify plugin settings', 'wegenius'),
		},
		{
			key: 'canBulkAnalyze',
			title: __('Can Bulk Analyze', 'wegenius'),
			description: __('Who can run bulk analysis operations', 'wegenius'),
		},
		{
			key: 'canExport',
			title: __('Can Export Data', 'wegenius'),
			description: __('Who can export analysis data', 'wegenius'),
		},
	];

	return (
		<div className="wegenius-permissions-settings">
			<Card className="mb-6">
				<CardHeader>
					<h2 className="text-lg font-semibold text-gray-900 m-0">
						{__('User Permissions', 'wegenius')}
					</h2>
					<p className="text-sm text-gray-600 mt-1 m-0">
						{__('Configure which user roles can perform different actions.', 'wegenius')}
					</p>
				</CardHeader>
				<CardBody>
					<div className="space-y-8">
						{capabilities.map((capability) => (
							<div key={capability.key} className="border-b border-gray-200 pb-6 last:border-b-0">
								<h3 className="text-md font-medium text-gray-900 mb-2">
									{capability.title}
								</h3>
								<p className="text-sm text-gray-600 mb-4">
									{capability.description}
								</p>
								
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									{roles.map((role) => (
										<ToggleControl
											key={role.value}
											label={role.label}
											checked={settings[capability.key]?.includes(role.value) || false}
											onChange={(checked) => handleRoleToggle(capability.key, role.value, checked)}
										/>
									))}
								</div>
							</div>
						))}
					</div>
				</CardBody>
			</Card>

			<Card className="mb-6">
				<CardHeader>
					<h3 className="text-md font-semibold text-gray-900 m-0">
						{__('Security Notes', 'wegenius')}
					</h3>
				</CardHeader>
				<CardBody>
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<ul className="text-sm text-blue-800 space-y-2">
							<li>• {__('Administrators always have full access regardless of these settings', 'wegenius')}</li>
							<li>• {__('Analysis results may contain sensitive content - restrict viewing appropriately', 'wegenius')}</li>
							<li>• {__('Bulk operations can be resource-intensive - limit to trusted roles', 'wegenius')}</li>
							<li>• {__('Export functionality may expose all analysis data - use with caution', 'wegenius')}</li>
						</ul>
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
						__('Save Permission Settings', 'wegenius')
					)}
				</Button>
			</div>
		</div>
	);
};
