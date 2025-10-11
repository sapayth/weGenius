import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Modal, Spinner, Button, Notice } from '@wordpress/components';
import { API_ENDPOINTS, getApiHeaders } from '../../constants/api';

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
	 * Fetch analysis details from external API
	 */
	const fetchAnalysisDetails = async () => {
		setLoading(true);
		setError(null);

		try {
			if (!analysis || !analysis.id) {
				throw new Error(__('Analysis data not available.', 'wegenius'));
			}

			const wpPostId = analysis.wp_post_id || 0;
			const url = API_ENDPOINTS.getAnalysisResultsByPostId(wpPostId);
			const headers = getApiHeaders();
			
			console.log('AnalysisDetailsModal: Fetching from endpoint:', url);
			
			const response = await fetch(url, {
				method: 'GET',
				headers,
			});

			if (!response.ok) {
				// Try to get the error response body for more details
				try {
					const errorData = await response.json();
					
					// Handle specific error cases
					if (response.status === 404) {
						if (errorData.message && errorData.message.includes('No completed')) {
							throw new Error(__('No completed analysis found for this post. Please run an analysis first.', 'wegenius'));
						} else {
							throw new Error(__('Analysis not found. Please run an analysis first.', 'wegenius'));
						}
					}
				} catch (e) {
					if (e.message.includes('No completed') || e.message.includes('Analysis not found')) {
						throw e; // Re-throw our custom error messages
					}
				}
				throw new Error(`API request failed: ${response.status}`);
			}

			const resultsData = await response.json();
			const data = resultsData.success ? resultsData.data : resultsData;
			console.log('AnalysisDetailsModal: API response successful');

			// Handle the response data - array of analyses, get the latest one
			let analysisData = null;
			let suggestionsData = null;

			if (data.analyses && data.analyses.length > 0) {
				// Get the latest analysis
				const latestAnalysis = data.analyses[0];
				analysisData = latestAnalysis.analysis;
				suggestionsData = latestAnalysis.suggestions;
				console.log('AnalysisDetailsModal: Using latest analysis from API');
			} else {
				throw new Error(__('No completed analysis found for this post.', 'wegenius'));
			}

			if (!analysisData) {
				throw new Error(__('No completed analysis found for this post.', 'wegenius'));
			}
			
			setAnalysisDetails({
				analysis: analysisData,
				post: data.post,
				metrics: analysisData?.metrics || {},
				scores: {
					overall: analysisData?.metrics?.overall_score || 0,
					seo: analysisData?.metrics?.seo_score || 0,
					readability: analysisData?.metrics?.readability_score || 0
				},
				insights: {
					summary: analysisData?.results?.analysis_summary || '',
					strengths: analysisData?.results?.strengths || [],
					improvements: analysisData?.results?.improvements || [],
					recommendations: analysisData?.results?.recommendations || []
				}
			});

			// Handle suggestions from the analysis
			if (suggestionsData) {
				// Flatten all suggestions into a single array for compatibility
				const allSuggestions = [];
				Object.keys(suggestionsData).forEach(type => {
					if (Array.isArray(suggestionsData[type])) {
						suggestionsData[type].forEach(suggestion => {
							allSuggestions.push({
								...suggestion,
								suggestion_type: type
							});
						});
					}
				});
				setSuggestions(allSuggestions);
			} else {
				setSuggestions([]);
			}

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
			const postId = analysis?.wp_post_id || 0;
			const url = API_ENDPOINTS.applySuggestion(postId);
			const headers = getApiHeaders();
			
			const response = await fetch(url, {
				method: 'POST',
				headers,
				body: JSON.stringify({
					suggestion_id: suggestion.id,
					action: 'apply'
				}),
			});

			if (!response.ok) {
				throw new Error(`Failed to apply suggestion: ${response.status}`);
			}

			const result = await response.json();
			
			if (result.success) {
				alert(__('Suggestion applied successfully!', 'wegenius'));
				// Refresh the analysis details to show updated state
				fetchAnalysisDetails();
			} else {
				throw new Error(result.message || 'Failed to apply suggestion');
			}
		} catch (err) {
			console.error('Error applying suggestion:', err);
			alert(__('Failed to apply suggestion. Please try again.', 'wegenius'));
		}
	};


	if (!isOpen) {
		return null;
	}

	return (
		<Modal
			title={__('Analysis Details', 'wegenius')}
			onRequestClose={onClose}
			className="wegen-analysis-modal"
			shouldCloseOnClickOutside={true}
			style={{ maxWidth: '900px' }}
		>
			<div className="wegen-modal-content">
				
				{/* Summary Section */}
				{analysisDetails && (
					<div style={{ 
						marginBottom: '1.5rem', 
						padding: '1rem', 
						backgroundColor: '#f0f6fc', 
						border: '1px solid #c5d9ed', 
						borderRadius: '4px' 
					}}>
						<div style={{ 
							display: 'grid', 
							gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
							gap: '1rem', 
							marginBottom: '1rem' 
						}}>
							<div style={{ textAlign: 'center' }}>
								<div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0073aa' }}>
									{analysisDetails.scores?.overall || 'N/A'}
								</div>
								<div style={{ fontSize: '0.875rem', color: '#666' }}>
									{__('Overall Score', 'wegenius')}
								</div>
							</div>
							<div style={{ textAlign: 'center' }}>
								<div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00a32a' }}>
									{analysisDetails.scores?.seo || 'N/A'}
								</div>
								<div style={{ fontSize: '0.875rem', color: '#666' }}>
									{__('SEO Score', 'wegenius')}
								</div>
							</div>
							<div style={{ textAlign: 'center' }}>
								<div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#826eb4' }}>
									{analysisDetails.scores?.readability || 'N/A'}
								</div>
								<div style={{ fontSize: '0.875rem', color: '#666' }}>
									{__('Readability', 'wegenius')}
								</div>
							</div>
						</div>
						{analysisDetails.insights?.summary && (
							<p style={{ fontSize: '0.875rem', margin: 0 }}>
								<strong>{__('Summary:', 'wegenius')}</strong>{' '}
								{analysisDetails.insights.summary}
							</p>
						)}
					</div>
				)}

				{/* Loading State */}
				{loading && (
					<div style={{ 
						display: 'flex', 
						alignItems: 'center', 
						justifyContent: 'center', 
						padding: '2rem' 
					}}>
						<Spinner />
						<span style={{ marginLeft: '0.75rem', color: '#666' }}>
							{__('Loading suggestions...', 'wegenius')}
						</span>
					</div>
				)}

				{/* Error State */}
				{error && (
					<Notice status="error" isDismissible={false}>
						<strong>{__('Analysis Error', 'wegenius')}</strong>
						<p>{error}</p>
						{error.includes('No completed analysis') && (
							<div style={{ marginTop: '0.75rem' }}>
								<p><strong>{__('To get analysis results:', 'wegenius')}</strong></p>
								<ol style={{ marginLeft: '1.5rem' }}>
									<li>{__('Select an analysis type (Improve, Gaps, or Ideas)', 'wegenius')}</li>
									<li>{__('Click the "Scan" button to start the analysis', 'wegenius')}</li>
									<li>{__('Wait for the analysis to complete', 'wegenius')}</li>
									<li>{__('Then click "Details" to view the results', 'wegenius')}</li>
								</ol>
							</div>
						)}
					</Notice>
				)}

				{/* Suggestions Content */}
				{!loading && !error && suggestions && suggestions.length > 0 && (
					<div style={{ marginBottom: '1.5rem' }}>
						<h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
							{__('Improvement Suggestions', 'wegenius')}
						</h3>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
							{suggestions.map((suggestion, index) => (
								<div 
									key={suggestion.id || index} 
									style={{ 
										border: '1px solid #ddd', 
										borderRadius: '4px', 
										padding: '1rem',
										backgroundColor: '#fff'
									}}
								>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
										<div style={{ flex: 1 }}>
											<div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
												{suggestion.priority && (
													<span style={{ 
														padding: '0.25rem 0.5rem', 
														fontSize: '0.75rem', 
														fontWeight: '500',
														borderRadius: '999px',
														backgroundColor: suggestion.priority === 'high' ? '#fee' : 
															suggestion.priority === 'medium' ? '#fef3cd' : '#d1e7dd',
														color: suggestion.priority === 'high' ? '#c00' : 
															suggestion.priority === 'medium' ? '#856404' : '#0f5132'
													}}>
														{suggestion.priority}
													</span>
												)}
												{suggestion.suggestion_type && (
													<span style={{ 
														padding: '0.25rem 0.5rem', 
														fontSize: '0.75rem', 
														fontWeight: '500',
														borderRadius: '999px',
														backgroundColor: suggestion.suggestion_type === 'seo' ? '#cfe2ff' :
															suggestion.suggestion_type === 'readability' ? '#e0cffc' :
															suggestion.suggestion_type === 'structure' ? '#ffd8b2' : '#e9ecef',
														color: suggestion.suggestion_type === 'seo' ? '#084298' :
															suggestion.suggestion_type === 'readability' ? '#59359a' :
															suggestion.suggestion_type === 'structure' ? '#ca6510' : '#495057'
													}}>
														{suggestion.suggestion_type}
													</span>
												)}
											</div>
											<h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
												{suggestion.title}
											</h4>
											{suggestion.description && (
												<p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
													{suggestion.description}
												</p>
											)}
											{suggestion.content && (
												<div style={{ 
													fontSize: '0.875rem', 
													padding: '0.75rem', 
													backgroundColor: '#f8f9fa', 
													borderRadius: '4px',
													marginBottom: '0.5rem'
												}}>
													{suggestion.content}
												</div>
											)}
											{suggestion.impact_score && (
												<p style={{ fontSize: '0.875rem', color: '#00a32a', fontWeight: '500' }}>
													{__('Impact Score:', 'wegenius')} {suggestion.impact_score}
												</p>
											)}
										</div>
										<div style={{ marginLeft: '1rem' }}>
											<Button
												variant="primary"
												size="small"
												onClick={() => handleApplySuggestion(suggestion)}
												disabled={loading}
											>
												{__('Apply', 'wegenius')}
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
					<Notice status="info" isDismissible={false}>
						<p>{__('No suggestions available for this analysis.', 'wegenius')}</p>
					</Notice>
				)}

				{/* Insights Section */}
				{analysisDetails?.insights && (
					<div>
						<h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
							{__('Analysis Insights', 'wegenius')}
						</h3>
						<div style={{ 
							display: 'grid', 
							gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
							gap: '1rem' 
						}}>
							{/* Strengths */}
							{analysisDetails.insights.strengths && analysisDetails.insights.strengths.length > 0 && (
								<div style={{ 
									backgroundColor: '#d1e7dd', 
									border: '1px solid #badbcc', 
									borderRadius: '4px', 
									padding: '1rem' 
								}}>
									<h4 style={{ fontWeight: '600', color: '#0f5132', marginBottom: '0.5rem' }}>
										{__('Strengths', 'wegenius')}
									</h4>
									<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
										{analysisDetails.insights.strengths.map((strength, index) => (
											<li key={index} style={{ 
												display: 'flex', 
												alignItems: 'flex-start', 
												fontSize: '0.875rem',
												color: '#0f5132',
												marginBottom: '0.25rem'
											}}>
												<span style={{ marginRight: '0.5rem', color: '#198754' }}>✓</span>
												{strength}
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Improvements */}
							{analysisDetails.insights.improvements && analysisDetails.insights.improvements.length > 0 && (
								<div style={{ 
									backgroundColor: '#fef3cd', 
									border: '1px solid #ffeaa7', 
									borderRadius: '4px', 
									padding: '1rem' 
								}}>
									<h4 style={{ fontWeight: '600', color: '#856404', marginBottom: '0.5rem' }}>
										{__('Areas for Improvement', 'wegenius')}
									</h4>
									<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
										{analysisDetails.insights.improvements.map((improvement, index) => (
											<li key={index} style={{ 
												display: 'flex', 
												alignItems: 'flex-start', 
												fontSize: '0.875rem',
												color: '#856404',
												marginBottom: '0.25rem'
											}}>
												<span style={{ marginRight: '0.5rem', color: '#ffc107' }}>⚠</span>
												{improvement}
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Recommendations */}
							{analysisDetails.insights.recommendations && analysisDetails.insights.recommendations.length > 0 && (
								<div style={{ 
									backgroundColor: '#cfe2ff', 
									border: '1px solid #b6d4fe', 
									borderRadius: '4px', 
									padding: '1rem' 
								}}>
									<h4 style={{ fontWeight: '600', color: '#084298', marginBottom: '0.5rem' }}>
										{__('Recommendations', 'wegenius')}
									</h4>
									<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
										{analysisDetails.insights.recommendations.map((recommendation, index) => (
											<li key={index} style={{ 
												display: 'flex', 
												alignItems: 'flex-start', 
												fontSize: '0.875rem',
												color: '#084298',
												marginBottom: '0.25rem'
											}}>
												<span style={{ marginRight: '0.5rem' }}>💡</span>
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
		</Modal>
	);
};
