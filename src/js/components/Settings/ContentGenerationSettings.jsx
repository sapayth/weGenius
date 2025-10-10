import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader, ToggleControl, SelectControl, Button, RangeControl, TextControl } from '@wordpress/components';
import { Spinner } from '@wordpress/components';

/**
 * Content Generation Settings Component
 * Handles content generation settings including writing tones, word count, and SEO features
 *
 * @since 1.0.0
 * @param {Object} props Component props
 * @param {Function} props.onSave Save handler
 * @param {boolean} props.isSaving Saving state
 */
export const ContentGenerationSettings = ({ onSave, isSaving }) => {
	const [settings, setSettings] = useState({
		// Core Content Settings
		writingTones: {
			primary: 'professional',
			secondary: 'authoritative'
		},
		targetWordCount: 1000,
		targetAudience: 'Parents',
		includeFeaturedImage: false,
		
		// SEO Meta-Data Settings
		location: 'Texas, USA',
		includeTableOfContents: false,
		generateShortVideo: false,
		videoStyle: 'professional',
		videoLength: 60,
		includeVoiceover: false,
		voiceGender: 'male',
		addBackgroundMusic: false,
		musicMood: 'calm'
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
				setSettings(prev => ({ ...prev, ...data.contentGeneration }));
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
	 * Handle nested setting change
	 */
	const handleNestedSettingChange = (parentKey, childKey, value) => {
		setSettings(prev => ({
			...prev,
			[parentKey]: {
				...prev[parentKey],
				[childKey]: value,
			},
		}));
	};

	/**
	 * Handle form save
	 */
	const handleSave = () => {
		onSave({ contentGeneration: settings });
	};

	// Writing tone options
	const toneOptions = [
		{ label: __('Professional', 'wegenius'), value: 'professional' },
		{ label: __('Conversational', 'wegenius'), value: 'conversational' },
		{ label: __('Authoritative', 'wegenius'), value: 'authoritative' },
		{ label: __('Humorous', 'wegenius'), value: 'humorous' },
		{ label: __('Enthusiastic', 'wegenius'), value: 'enthusiastic' },
		{ label: __('Casual', 'wegenius'), value: 'casual' },
	];

	// Video style options
	const videoStyleOptions = [
		{ label: __('Professional', 'wegenius'), value: 'professional' },
		{ label: __('Animated Explainer', 'wegenius'), value: 'animated' },
		{ label: __('Realistic Stock Footage', 'wegenius'), value: 'stock' },
		{ label: __('Text-on-Screen', 'wegenius'), value: 'text' },
		{ label: __('Abstract Visuals', 'wegenius'), value: 'abstract' },
	];

	// Voice gender options
	const voiceOptions = [
		{ label: __('Male (Standard)', 'wegenius'), value: 'male' },
		{ label: __('Female (Standard)', 'wegenius'), value: 'female' },
		{ label: __('Male (Deep)', 'wegenius'), value: 'male_deep' },
		{ label: __('Female (Energetic)', 'wegenius'), value: 'female_energetic' },
		{ label: __('Neutral', 'wegenius'), value: 'neutral' },
	];

	// Music mood options
	const musicOptions = [
		{ label: __('Uplifting', 'wegenius'), value: 'uplifting' },
		{ label: __('Calm', 'wegenius'), value: 'calm' },
		{ label: __('Energetic', 'wegenius'), value: 'energetic' },
		{ label: __('Corporate', 'wegenius'), value: 'corporate' },
		{ label: __('Inspiring', 'wegenius'), value: 'inspiring' },
		{ label: __('Ambient', 'wegenius'), value: 'ambient' },
	];

	return (
		<div className="wegenius-content-generation-settings">
			{/* Core Content Settings */}
			<Card className="mb-6">
				<CardHeader>
					<h2 className="text-lg font-semibold text-gray-900 m-0">
						{__('Core Content Settings', 'wegenius')}
					</h2>
					<p className="text-sm text-gray-600 mt-1 m-0">
						{__('Configure the basic content generation parameters.', 'wegenius')}
					</p>
				</CardHeader>
				<CardBody>
					<div className="space-y-6">
						{/* Writing Tones */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<SelectControl
								label={__('Primary Writing Tone', 'wegenius')}
								value={settings.writingTones.primary}
								options={toneOptions}
								onChange={(value) => handleNestedSettingChange('writingTones', 'primary', value)}
								help={__('Main tone for content generation', 'wegenius')}
							/>
							<SelectControl
								label={__('Secondary Writing Tone', 'wegenius')}
								value={settings.writingTones.secondary}
								options={toneOptions}
								onChange={(value) => handleNestedSettingChange('writingTones', 'secondary', value)}
								help={__('Secondary tone for content variation', 'wegenius')}
							/>
						</div>

						{/* Target Word Count */}
						<RangeControl
							label={__('Target Word Count', 'wegenius')}
							value={settings.targetWordCount}
							onChange={(value) => handleSettingChange('targetWordCount', value)}
							min={100}
							max={5000}
							step={50}
							help={__('Desired word count for generated content', 'wegenius')}
						/>

						{/* Target Audience */}
						<TextControl
							label={__('Target Audience', 'wegenius')}
							value={settings.targetAudience}
							onChange={(value) => handleSettingChange('targetAudience', value)}
							help={__('Primary audience for the content', 'wegenius')}
						/>

						{/* Optional Add-ons */}
						<div className="space-y-4">
							<h4 className="text-md font-medium text-gray-900">
								{__('Optional Add-ons & Features', 'wegenius')}
							</h4>
							<ToggleControl
								label={__('Include Featured Image', 'wegenius')}
								checked={settings.includeFeaturedImage}
								onChange={(value) => handleSettingChange('includeFeaturedImage', value)}
								help={__('Generate featured image suggestions for content', 'wegenius')}
							/>
						</div>
					</div>
				</CardBody>
			</Card>

			{/* SEO Meta-Data Settings */}
			<Card className="mb-6">
				<CardHeader>
					<h2 className="text-lg font-semibold text-gray-900 m-0">
						{__('Add SEO Meta-Data (in prompt)', 'wegenius')}
					</h2>
					<p className="text-sm text-gray-600 mt-1 m-0">
						{__('Configure additional SEO and media generation features.', 'wegenius')}
					</p>
				</CardHeader>
				<CardBody>
					<div className="space-y-6">
						{/* Location */}
						<TextControl
							label={__('Location', 'wegenius')}
							value={settings.location}
							onChange={(value) => handleSettingChange('location', value)}
							help={__('Geographic location for SEO optimization', 'wegenius')}
						/>

						{/* Table of Contents */}
						<ToggleControl
							label={__('Include a Table of Contents', 'wegenius')}
							checked={settings.includeTableOfContents}
							onChange={(value) => handleSettingChange('includeTableOfContents', value)}
							help={__('Generate table of contents for longer content', 'wegenius')}
						/>

						{/* Video Generation */}
						<div className="space-y-4">
							<ToggleControl
								label={__('Generate Short Video', 'wegenius')}
								checked={settings.generateShortVideo}
								onChange={(value) => handleSettingChange('generateShortVideo', value)}
								help={__('Create a short (30-60 second) video summary or explainer based on the article content', 'wegenius')}
							/>

							{settings.generateShortVideo && (
								<div className="pl-6 space-y-4 border-l-2 border-blue-200">
									<SelectControl
										label={__('Video Style', 'wegenius')}
										value={settings.videoStyle}
										options={videoStyleOptions}
										onChange={(value) => handleSettingChange('videoStyle', value)}
										help={__('Visual style for the generated video', 'wegenius')}
									/>

									<RangeControl
										label={__('Video Length', 'wegenius')}
										value={settings.videoLength}
										onChange={(value) => handleSettingChange('videoLength', value)}
										min={30}
										max={120}
										step={15}
										help={__('Duration of the generated video in seconds', 'wegenius')}
									/>

									<ToggleControl
										label={__('Include AI-Generated Voiceover', 'wegenius')}
										checked={settings.includeVoiceover}
										onChange={(value) => handleSettingChange('includeVoiceover', value)}
										help={__('Add AI-generated voiceover to the video', 'wegenius')}
									/>

									{settings.includeVoiceover && (
										<SelectControl
											label={__('Voice Gender/Type', 'wegenius')}
											value={settings.voiceGender}
											options={voiceOptions}
											onChange={(value) => handleSettingChange('voiceGender', value)}
											help={__('Voice characteristics for the voiceover', 'wegenius')}
										/>
									)}

									<ToggleControl
										label={__('Add Background Music', 'wegenius')}
										checked={settings.addBackgroundMusic}
										onChange={(value) => handleSettingChange('addBackgroundMusic', value)}
										help={__('Include background music in the video', 'wegenius')}
									/>

									{settings.addBackgroundMusic && (
										<SelectControl
											label={__('Music Mood/Genre', 'wegenius')}
											value={settings.musicMood}
											options={musicOptions}
											onChange={(value) => handleSettingChange('musicMood', value)}
											help={__('Musical style and mood for the background', 'wegenius')}
										/>
									)}
								</div>
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
						__('Save Content Generation Settings', 'wegenius')
					)}
				</Button>
			</div>
		</div>
	);
};
