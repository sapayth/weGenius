import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Modal, Spinner, Button, CheckboxControl } from '@wordpress/components';

/**
 * Analysis Details Modal Component
 * Displays detailed analysis results with suggestions in a modal
 *
 * @since 1.0.0
 * @param {Object} props Component props
 * @param {boolean} props.isOpen Whether the modal is open
 * @param {Function} props.onClose Close modal handler
 * @param {Object} props.analysis Analysis data object
 */
export const AnalysisDetailsModal = ({ isOpen, onClose, analysis }) => {
	console.log('AnalysisDetailsModal: Component rendered with props:', { isOpen, analysis });
	
	const [loading, setLoading] = useState(false);
	const [analysisDetails, setAnalysisDetails] = useState(null);
	const [suggestions, setSuggestions] = useState([]);
	const [selectedSuggestions, setSelectedSuggestions] = useState([]);
	const [error, setError] = useState(null);

	/**
	 * Fetch analysis details and suggestions when modal opens
	 */
	useEffect(() => {
		console.log('AnalysisDetailsModal: useEffect triggered with:', { isOpen, analysis });
		if (isOpen && analysis) {
			console.log('AnalysisDetailsModal: Fetching analysis details...');
			fetchAnalysisDetails();
		}
	}, [isOpen, analysis]);

	/**
	 * Fetch analysis details from API
	 */
	const fetchAnalysisDetails = async () => {
		setLoading(true);
		setError(null);

		try {
			// Fetch analysis results
			const resultsResponse = await fetch(
				`/wp-json/wegenius/v1/articles/analyses/${analysis.id}/results`,
				{
					headers: {
						'X-WP-Nonce': window.wegeniusAdmin?.nonce || window.wegenius?.nonce,
					},
				}
			);

			if (!resultsResponse.ok) {
				throw new Error(__('Failed to fetch analysis results', 'wegenius'));
			}

			const resultsData = await resultsResponse.json();
			setAnalysisDetails(resultsData);

			// Fetch suggestions if available
			const suggestionsResponse = await fetch(
				`/wp-json/wegenius/v1/suggestions/analysis/${analysis.id}`,
				{
					headers: {
						'X-WP-Nonce': window.wegeniusAdmin?.nonce || window.wegenius?.nonce,
					},
				}
			);

			if (suggestionsResponse.ok) {
				const suggestionsData = await suggestionsResponse.json();
				setSuggestions(suggestionsData);
			}
		} catch (err) {
			console.error('Error fetching analysis details:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Handle suggestion checkbox toggle
	 */
	const handleSuggestionToggle = (suggestionId) => {
		setSelectedSuggestions((prev) =>
			prev.includes(suggestionId)
				? prev.filter((id) => id !== suggestionId)
				: [...prev, suggestionId]
		);
	};

	/**
	 * Handle select all suggestions in a category
	 */
	const handleSelectAllInCategory = (categorySuggestions) => {
		const categoryIds = categorySuggestions.map((s) => s.id);
		const allSelected = categoryIds.every((id) => selectedSuggestions.includes(id));

		if (allSelected) {
			setSelectedSuggestions((prev) => prev.filter((id) => !categoryIds.includes(id)));
		} else {
			setSelectedSuggestions((prev) => [...new Set([...prev, ...categoryIds])]);
		}
	};

	/**
	 * Handle save to ideabox
	 */
	const handleSaveToIdeabox = () => {
		// TODO: Implement save to ideabox functionality
		console.log('Save to ideabox:', selectedSuggestions);
		onClose();
	};

	/**
	 * Handle apply changes
	 */
	const handleApplyChanges = () => {
		// TODO: Implement apply changes functionality
		console.log('Apply changes:', selectedSuggestions);
		onClose();
	};

	/**
	 * Group suggestions by type/category
	 */
	const groupSuggestionsByCategory = (suggestions) => {
		const categories = {
			'Content Gap/Missed Sub-topics': [],
			'On-Page SEO Suggestions': [],
			'Readability Improvements': [],
		};

		suggestions.forEach((suggestion) => {
			const type = suggestion.suggestion_type || suggestion.typeKey;
			
			if (type === 'content_gap' || type === 'structure') {
				categories['Content Gap/Missed Sub-topics'].push(suggestion);
			} else if (type === 'seo' || type === 'on_page_seo') {
				categories['On-Page SEO Suggestions'].push(suggestion);
			} else if (type === 'readability') {
				categories['Readability Improvements'].push(suggestion);
			} else {
				// Default to Content Gap if unknown
				categories['Content Gap/Missed Sub-topics'].push(suggestion);
			}
		});

		return categories;
	};

	/**
	 * Render suggestion checkbox item
	 */
	const renderSuggestion = (suggestion) => (
		<div key={suggestion.id} className="border-b border-gray-100 last:border-0">
			<CheckboxControl
				label={
					<span className="text-sm text-gray-900">
						{suggestion.title || suggestion.description}
					</span>
				}
				checked={selectedSuggestions.includes(suggestion.id)}
				onChange={() => handleSuggestionToggle(suggestion.id)}
				className="py-2"
			/>
		</div>
	);

	/**
	 * Render suggestions category section
	 */
	const renderCategorySection = (categoryName, categorySuggestions) => {
		if (categorySuggestions.length === 0) return null;

		const allSelected = categorySuggestions.every((s) =>
			selectedSuggestions.includes(s.id)
		);

		return (
			<div key={categoryName} className="mb-6">
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-base font-semibold text-gray-900">
						{categoryName}
					</h3>
					<button
						onClick={() => handleSelectAllInCategory(categorySuggestions)}
						className="text-sm text-blue-600 hover:text-blue-800"
					>
						{allSelected
							? __('Deselect All', 'wegenius')
							: __('Select All', 'wegenius')}
					</button>
				</div>
				<div className="bg-gray-50 rounded-lg p-4">
					{categorySuggestions.map(renderSuggestion)}
				</div>
			</div>
		);
	};

	console.log('AnalysisDetailsModal: About to render, isOpen:', isOpen);
	
	if (!isOpen) {
		console.log('AnalysisDetailsModal: Modal is closed, returning null');
		return null;
	}

	const groupedSuggestions = suggestions.length > 0 
		? groupSuggestionsByCategory(suggestions)
		: {};

	return (
		<Modal
			title={__('Improvement Suggestions', 'wegenius')}
			onRequestClose={onClose}
			className="wegen-analysis-details-modal"
			style={{ maxWidth: '700px', width: '90%' }}
		>
			<div className="wegen-modal-content">
				{/* Summary Section */}
				<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<p className="text-sm text-gray-700">
						<strong>{__('Summary:', 'wegenius')}</strong>{' '}
						{analysisDetails?.insights?.summary ||
							__('Add a new H2 section for Maintenance and Longevity.', 'wegenius')}
					</p>
				</div>

				{/* Loading State */}
				{loading && (
					<div className="flex items-center justify-center py-8">
						<Spinner />
						<span className="ml-3 text-gray-500">
							{__('Loading suggestions...', 'wegenius')}
						</span>
					</div>
				)}

				{/* Error State */}
				{error && (
					<div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
						<p className="text-sm text-red-700">{error}</p>
					</div>
				)}

				{/* Suggestions Content */}
				{!loading && !error && suggestions.length > 0 && (
					<div className="mb-6">
						{Object.entries(groupedSuggestions).map(([category, categorySuggestions]) =>
							renderCategorySection(category, categorySuggestions)
						)}
					</div>
				)}

				{/* No Suggestions State */}
				{!loading && !error && suggestions.length === 0 && (
					<div className="text-center py-8">
						<p className="text-gray-500">
							{__('No suggestions available for this analysis.', 'wegenius')}
						</p>
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
					<Button
						variant="secondary"
						onClick={handleSaveToIdeabox}
						disabled={selectedSuggestions.length === 0}
					>
						{__('Save to Ideabox', 'wegenius')}
					</Button>
					<Button
						variant="primary"
						onClick={handleApplyChanges}
						disabled={selectedSuggestions.length === 0}
					>
						{__('Apply Changes', 'wegenius')}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

