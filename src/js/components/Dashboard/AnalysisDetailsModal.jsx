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
	const [loading, setLoading] = useState(false);
	const [analysisDetails, setAnalysisDetails] = useState(null);
	const [suggestions, setSuggestions] = useState([]);
	const [selectedSuggestions, setSelectedSuggestions] = useState([]);
	const [error, setError] = useState(null);

	/**
	 * Fetch analysis details and suggestions when modal opens
	 */
	useEffect(() => {
		if (isOpen && analysis) {
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

	if (!isOpen) {
		return null;
	}

	const groupedSuggestions = suggestions.length > 0 
		? groupSuggestionsByCategory(suggestions)
		: {};

	return (
		<div 
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
			onClick={onClose}
		>
			<div 
				className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900">
						{__('Improvement Suggestions', 'wegenius')}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
					>
						×
					</button>
				</div>
				<div className="p-6">
					
					{/* Summary Section */}
					{analysisDetails && (
						<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
								<div className="text-center">
									<div className="text-2xl font-bold text-blue-600">
										{analysisDetails.scores?.overall || 'N/A'}
									</div>
									<div className="text-sm text-gray-600">{__('Overall Score', 'wegenius')}</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-green-600">
										{analysisDetails.scores?.seo || 'N/A'}
									</div>
									<div className="text-sm text-gray-600">{__('SEO Score', 'wegenius')}</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-purple-600">
										{analysisDetails.scores?.readability || 'N/A'}
									</div>
									<div className="text-sm text-gray-600">{__('Readability', 'wegenius')}</div>
								</div>
							</div>
							{analysisDetails.insights?.summary && (
								<p className="text-sm text-gray-700">
									<strong>{__('Summary:', 'wegenius')}</strong>{' '}
									{analysisDetails.insights.summary}
								</p>
							)}
						</div>
					)}

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
					{!loading && !error && analysisDetails?.results?.improve?.suggestions && (
						<div className="mb-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								{__('Improvement Suggestions', 'wegenius')}
							</h3>
							<div className="space-y-4">
								{analysisDetails.results.improve.suggestions.map((suggestion, index) => (
									<div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<span className={`px-2 py-1 text-xs font-medium rounded-full ${
														suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
														suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
														'bg-green-100 text-green-800'
													}`}>
														{suggestion.priority}
													</span>
													<span className={`px-2 py-1 text-xs font-medium rounded-full ${
														suggestion.type === 'seo' ? 'bg-blue-100 text-blue-800' :
														suggestion.type === 'readability' ? 'bg-purple-100 text-purple-800' :
														'bg-orange-100 text-orange-800'
													}`}>
														{suggestion.type}
													</span>
												</div>
												<h4 className="font-medium text-gray-900 mb-2">
													{suggestion.title}
												</h4>
												<p className="text-sm text-gray-600 mb-2">
													{suggestion.description}
												</p>
												{suggestion.impact && (
													<p className="text-sm text-green-600 font-medium">
														{suggestion.impact}
													</p>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* No Suggestions State */}
					{!loading && !error && (!analysisDetails?.results?.improve?.suggestions || analysisDetails.results.improve.suggestions.length === 0) && (
						<div className="text-center py-8">
							<p className="text-gray-500">
								{__('No suggestions available for this analysis.', 'wegenius')}
							</p>
						</div>
					)}

					{/* Insights Section */}
					{analysisDetails?.insights && (
						<div className="mb-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								{__('Analysis Insights', 'wegenius')}
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{/* Strengths */}
								{analysisDetails.insights.strengths && analysisDetails.insights.strengths.length > 0 && (
									<div className="bg-green-50 border border-green-200 rounded-lg p-4">
										<h4 className="font-medium text-green-800 mb-2">
											{__('Strengths', 'wegenius')}
										</h4>
										<ul className="text-sm text-green-700 space-y-1">
											{analysisDetails.insights.strengths.map((strength, index) => (
												<li key={index} className="flex items-start">
													<span className="text-green-500 mr-2">✓</span>
													{strength}
												</li>
											))}
										</ul>
									</div>
								)}

								{/* Improvements */}
								{analysisDetails.insights.improvements && analysisDetails.insights.improvements.length > 0 && (
									<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
										<h4 className="font-medium text-yellow-800 mb-2">
											{__('Areas for Improvement', 'wegenius')}
										</h4>
										<ul className="text-sm text-yellow-700 space-y-1">
											{analysisDetails.insights.improvements.map((improvement, index) => (
												<li key={index} className="flex items-start">
													<span className="text-yellow-500 mr-2">⚠</span>
													{improvement}
												</li>
											))}
										</ul>
									</div>
								)}

								{/* Recommendations */}
								{analysisDetails.insights.recommendations && analysisDetails.insights.recommendations.length > 0 && (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
										<h4 className="font-medium text-blue-800 mb-2">
											{__('Recommendations', 'wegenius')}
										</h4>
										<ul className="text-sm text-blue-700 space-y-1">
											{analysisDetails.insights.recommendations.map((recommendation, index) => (
												<li key={index} className="flex items-start">
													<span className="text-blue-500 mr-2">💡</span>
													{recommendation}
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
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
			</div>
		</div>
	);
};

