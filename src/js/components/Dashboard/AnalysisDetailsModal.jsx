import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Modal, Spinner, Button } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

// Configure apiFetch to use the nonce for authentication
if ( window.wegeniusAdmin && window.wegeniusAdmin.nonce ) {
    apiFetch.use( apiFetch.createNonceMiddleware( window.wegeniusAdmin.nonce ) );
}

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
	 * Fetch analysis details from WordPress REST API
	 */
	const fetchAnalysisDetails = async () => {
		setLoading(true);
		setError(null);

		try {
			if (!analysis || !analysis.id) {
				throw new Error(__('Analysis data not available.', 'wegenius'));
			}

			// Fetch analysis results from WordPress REST API using apiFetch
			const resultsData = await apiFetch({
				path: `/wegenius/v1/articles/analyses/${analysis.id}/results`,
				method: 'GET',
			});

			setAnalysisDetails(resultsData);

			// For now, we'll use mock suggestions since the suggestions API isn't implemented yet
			// TODO: Implement suggestions API endpoint
			const mockSuggestions = [
				{
					id: 1,
					title: 'Add more internal links',
					description: 'Include links to related articles to improve SEO and user experience',
					content: 'Consider adding 2-3 internal links to related posts about similar topics.',
					priority: 'high',
					suggestion_type: 'seo',
					status: 'pending',
					impact_score: 8.5
				},
				{
					id: 2,
					title: 'Improve readability',
					description: 'Break up long paragraphs for better readability',
					content: 'Split the second paragraph into 2-3 shorter paragraphs for better readability.',
					priority: 'medium',
					suggestion_type: 'readability',
					status: 'pending',
					impact_score: 6.2
				},
				{
					id: 3,
					title: 'Add missing subheading',
					description: 'Include a subheading about implementation details',
					content: 'Add a "Implementation Steps" section with numbered steps.',
					priority: 'low',
					suggestion_type: 'structure',
					status: 'pending',
					impact_score: 4.1
				}
			];
			
			setSuggestions(mockSuggestions);
		} catch (err) {
			console.error('Error fetching analysis details:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Handle apply suggestion
	 */
	const handleApplySuggestion = async (suggestion) => {
		try {
			// TODO: Implement apply suggestion functionality
			// For now, just show a success message
			alert(__('Suggestion applied successfully!', 'wegenius'));
			
			// Refresh the analysis details to show updated state
			fetchAnalysisDetails();
		} catch (err) {
			console.error('Error applying suggestion:', err);
			alert(__('Failed to apply suggestion. Please try again.', 'wegenius'));
		}
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
	 * Render suggestion item
	 */
	const renderSuggestion = (suggestion) => (
		<div key={suggestion.id} className="border-b border-gray-100 last:border-0 py-2">
			<div className="text-sm text-gray-900">
				{suggestion.title || suggestion.description}
			</div>
		</div>
	);

	/**
	 * Render suggestions category section
	 */
	const renderCategorySection = (categoryName, categorySuggestions) => {
		if (categorySuggestions.length === 0) return null;

		return (
			<div key={categoryName} className="mb-6">
				<div className="mb-3">
					<h3 className="text-base font-semibold text-gray-900">
						{categoryName}
					</h3>
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
					{!loading && !error && suggestions && suggestions.length > 0 && (
						<div className="mb-6">
							<div className="mb-4">
								<h3 className="text-lg font-semibold text-gray-900">
									{__('Improvement Suggestions', 'wegenius')}
								</h3>
							</div>
							<div className="space-y-4">
								{suggestions.map((suggestion, index) => (
									<div key={suggestion.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													{suggestion.priority && (
														<span className={`px-2 py-1 text-xs font-medium rounded-full ${
															suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
															suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
															'bg-green-100 text-green-800'
														}`}>
															{suggestion.priority}
														</span>
													)}
													{suggestion.suggestion_type && (
														<span className={`px-2 py-1 text-xs font-medium rounded-full ${
															suggestion.suggestion_type === 'seo' ? 'bg-blue-100 text-blue-800' :
															suggestion.suggestion_type === 'readability' ? 'bg-purple-100 text-purple-800' :
															suggestion.suggestion_type === 'structure' ? 'bg-orange-100 text-orange-800' :
															'bg-gray-100 text-gray-800'
														}`}>
															{suggestion.suggestion_type}
														</span>
													)}
													{suggestion.status && (
														<span className={`px-2 py-1 text-xs font-medium rounded-full ${
															suggestion.status === 'approved' ? 'bg-green-100 text-green-800' :
															suggestion.status === 'rejected' ? 'bg-red-100 text-red-800' :
															suggestion.status === 'implemented' ? 'bg-blue-100 text-blue-800' :
															'bg-yellow-100 text-yellow-800'
														}`}>
															{suggestion.status}
														</span>
													)}
												</div>
												<h4 className="font-medium text-gray-900 mb-2">
													{suggestion.title}
												</h4>
												{suggestion.description && (
													<p className="text-sm text-gray-600 mb-2">
														{suggestion.description}
													</p>
												)}
												{suggestion.content && (
													<div className="text-sm text-gray-700 mb-2 p-3 bg-gray-50 rounded">
														{suggestion.content}
													</div>
												)}
												{suggestion.impact_score && (
													<p className="text-sm text-green-600 font-medium">
														{__('Impact Score:', 'wegenius')} {suggestion.impact_score}
													</p>
												)}
											</div>
											<div className="ml-4 flex-shrink-0">
												<Button
													variant="primary"
													size="small"
													onClick={() => handleApplySuggestion(suggestion)}
													disabled={loading}
													className="wegen-apply-suggestion-btn"
													style={{
														backgroundColor: '#0073aa',
														borderColor: '#0073aa',
														color: '#ffffff',
														fontSize: '12px',
														fontWeight: '500',
														padding: '6px 12px',
														borderRadius: '4px',
														boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
														transition: 'all 0.2s ease',
														minWidth: '120px',
														textTransform: 'none',
														letterSpacing: '0.025em'
													}}
													onMouseEnter={(e) => {
														if (!loading) {
															e.target.style.backgroundColor = '#005a87';
															e.target.style.borderColor = '#005a87';
															e.target.style.transform = 'translateY(-1px)';
															e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.15)';
														}
													}}
													onMouseLeave={(e) => {
														if (!loading) {
															e.target.style.backgroundColor = '#0073aa';
															e.target.style.borderColor = '#0073aa';
															e.target.style.transform = 'translateY(0)';
															e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.1)';
														}
													}}
												>
													{__('Apply Suggestion', 'wegenius')}
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* No Suggestions State */}
					{!loading && !error && (!suggestions || suggestions.length === 0) && (
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

				</div>
			</div>
		</div>
	);
};

