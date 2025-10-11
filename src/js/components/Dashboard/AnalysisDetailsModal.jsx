import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Modal, Spinner, Button, Notice, TabPanel } from '@wordpress/components';
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
	const [applyingSuggestion, setApplyingSuggestion] = useState(null);

	/**
	 * Fetch analysis details and suggestions when modal opens
	 */
	useEffect(() => {
		if (isOpen && analysis) {
			console.log('AnalysisDetailsModal: Modal opened with analysis data:', analysis);
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
			console.log('AnalysisDetailsModal: Full API response data:', resultsData);
			console.log('AnalysisDetailsModal: Processed data:', data);

			// Handle the response data - array of analyses, get the latest one
			let analysisData = null;
			let suggestionsData = null;

			if (data.analyses && data.analyses.length > 0) {
				// Get the latest analysis
				const latestAnalysis = data.analyses[0];
				analysisData = latestAnalysis.analysis;
				suggestionsData = latestAnalysis.suggestions;
				console.log('AnalysisDetailsModal: Using latest analysis from API');
				console.log('AnalysisDetailsModal: Latest analysis data:', latestAnalysis);
				console.log('AnalysisDetailsModal: Analysis data:', analysisData);
				console.log('AnalysisDetailsModal: Suggestions data:', suggestionsData);
			} else {
				throw new Error(__('No completed analysis found for this post.', 'wegenius'));
			}

			if (!analysisData) {
				throw new Error(__('No completed analysis found for this post.', 'wegenius'));
			}
			
			const analysisDetailsData = {
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
			};
			
			console.log('AnalysisDetailsModal: Setting analysis details:', analysisDetailsData);
			setAnalysisDetails(analysisDetailsData);

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
				console.log('AnalysisDetailsModal: Processed suggestions:', allSuggestions);
				setSuggestions(allSuggestions);
			} else {
				console.log('AnalysisDetailsModal: No suggestions data available');
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
			setApplyingSuggestion(suggestion.id);
			console.log('AnalysisDetailsModal: Applying suggestion:', suggestion);
			
			// Use direct external API call to apply suggestion
			const url = API_ENDPOINTS.applySuggestion(suggestion.id);
			const headers = getApiHeaders();
			
			console.log('AnalysisDetailsModal: Calling apply-suggestion API:', url);
			
			const response = await fetch(url, {
				method: 'POST',
				headers,
				body: JSON.stringify({}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error('AnalysisDetailsModal: API error response:', errorText);
				throw new Error(`Failed to apply suggestion: ${response.status} - ${errorText}`);
			}

			const result = await response.json();
			console.log('AnalysisDetailsModal: Apply-suggestion API response:', result);
			
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
		} finally {
			setApplyingSuggestion(null);
		}
	};


	if (!isOpen) {
		return null;
	}

	console.log('AnalysisDetailsModal: Rendering modal with isOpen:', isOpen);
	console.log('AnalysisDetailsModal: Current analysisDetails state:', analysisDetails);
	console.log('AnalysisDetailsModal: Current suggestions state:', suggestions);
	console.log('AnalysisDetailsModal: Current loading state:', loading);
	console.log('AnalysisDetailsModal: Current error state:', error);
	
	return (
		<Modal
			title={__('Analysis Details', 'wegenius')}
			onRequestClose={onClose}
			className="wegen-analysis-modal"
			shouldCloseOnClickOutside={true}
			size="large"
		>
			<div className="wegen-modal-content" style={{ 
				padding: '0',
				overflowY: 'auto'
			}}>
				
				{/* Header Section */}
				<div style={{ 
					padding: '24px 24px 0 24px',
					borderBottom: '1px solid #e0e0e0'
				}}>
					<div style={{ 
						display: 'flex', 
						justifyContent: 'space-between', 
						alignItems: 'center',
						marginBottom: '24px'
					}}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
							<div style={{ 
								width: '24px', 
								height: '24px', 
								backgroundColor: '#0073aa',
								borderRadius: '4px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'white',
								fontSize: '12px',
								fontWeight: 'bold'
							}}>
								📊
							</div>
							<h2 style={{ 
								fontSize: '24px', 
								fontWeight: '600', 
								margin: 0,
								color: '#1a1a1a'
							}}>
								{__('Analysis Results', 'wegenius')}
							</h2>
						</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
							<span style={{ 
								fontSize: '14px', 
								color: '#666',
								fontWeight: '500'
							}}>
								{__('Completed:', 'wegenius')} {analysis?.completed_at ? new Date(analysis.completed_at).toLocaleDateString('en-US', {
									month: 'short',
									day: '2-digit',
									year: 'numeric',
									hour: '2-digit',
									minute: '2-digit'
								}) : 'N/A'}
							</span>
						</div>
					</div>

					{/* Overall Score Display */}
					{analysisDetails && (
						<div style={{ 
							textAlign: 'center',
							marginBottom: '32px'
						}}>
							<div style={{ 
								fontSize: '48px', 
								fontWeight: 'bold', 
								color: '#dc2626',
								marginBottom: '8px'
							}}>
								{analysisDetails.scores?.overall || 0}/100
							</div>
							<div style={{ 
								fontSize: '16px', 
								color: '#666',
								fontWeight: '500',
								marginBottom: '16px'
							}}>
								{__('Overall Content Score', 'wegenius')}
							</div>
							<div style={{ 
								width: '100%', 
								height: '8px', 
								backgroundColor: '#e5e7eb', 
								borderRadius: '4px',
								position: 'relative',
								overflow: 'hidden'
							}}>
								<div style={{ 
									width: `${Math.min(analysisDetails.scores?.overall || 0, 100)}%`, 
									height: '100%', 
									backgroundColor: '#dc2626',
									borderRadius: '4px',
									transition: 'width 0.3s ease'
								}} />
							</div>
						</div>
					)}
				</div>

				{/* Metric Scores */}
				{analysisDetails && (
					<div style={{ 
						padding: '24px',
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
						gap: '16px',
						borderBottom: '1px solid #e0e0e0'
					}}>
						{[
							{ label: __('Content Quality', 'wegenius'), score: analysisDetails.scores?.overall || 0, color: '#dc2626' },
							{ label: __('SEO Optimization', 'wegenius'), score: analysisDetails.scores?.seo || 0, color: '#dc2626' },
							{ label: __('Readability', 'wegenius'), score: analysisDetails.scores?.readability || 0, color: '#dc2626' },
							{ label: __('Engagement', 'wegenius'), score: Math.max(0, (analysisDetails.scores?.overall || 0) - 5), color: '#dc2626' }
						].map((metric, index) => (
							<div key={index} style={{ 
								backgroundColor: 'white',
								border: '1px solid #e0e0e0',
								borderRadius: '8px',
								padding: '20px',
								textAlign: 'center'
							}}>
								<div style={{ 
									fontSize: '32px', 
									fontWeight: 'bold', 
									color: metric.color,
									marginBottom: '8px'
								}}>
									{metric.score}
								</div>
								<div style={{ 
									fontSize: '14px', 
									color: '#666',
									fontWeight: '500',
									marginBottom: '12px'
								}}>
									{metric.label}
								</div>
								<div style={{ 
									width: '100%', 
									height: '6px', 
									backgroundColor: '#f3f4f6', 
									borderRadius: '3px',
									overflow: 'hidden'
								}}>
									<div style={{ 
										width: `${Math.min(metric.score, 100)}%`, 
										height: '100%', 
										backgroundColor: metric.color,
										borderRadius: '3px',
										transition: 'width 0.3s ease'
									}} />
								</div>
							</div>
						))}
					</div>
				)}


				{/* Tab Content */}
				<div style={{ padding: '24px' }}>
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

					{/* AI Suggestions Content */}
					{!loading && !error && suggestions && suggestions.length > 0 && (
						<div>
							{suggestions.map((suggestion, index) => {
								console.log('AnalysisDetailsModal: Rendering suggestion:', index, suggestion);
								return (
								<div 
									key={suggestion.id || index} 
									style={{ 
										border: '1px solid #e0e0e0', 
										borderRadius: '8px', 
										padding: '20px',
										backgroundColor: '#fff',
										marginBottom: '16px',
										boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
									}}
								>
									{/* Suggestion Header */}
									<div style={{ 
										display: 'flex', 
										justifyContent: 'space-between', 
										alignItems: 'flex-start',
										marginBottom: '16px'
									}}>
										<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
											<span style={{ 
												padding: '4px 8px', 
												fontSize: '12px', 
												fontWeight: '500',
												borderRadius: '12px',
												backgroundColor: suggestion.type === 'seo' ? '#dbeafe' :
													suggestion.type === 'readability' ? '#e0e7ff' :
													suggestion.type === 'engagement' ? '#fef3c7' : '#f3f4f6',
												color: suggestion.type === 'seo' ? '#1e40af' :
													suggestion.type === 'readability' ? '#3730a3' :
													suggestion.type === 'engagement' ? '#92400e' : '#374151'
											}}>
												{suggestion.type}
											</span>
											<span style={{ 
												padding: '4px 8px', 
												fontSize: '12px', 
												fontWeight: '500',
												borderRadius: '12px',
												backgroundColor: '#f3f4f6',
												color: '#374151'
											}}>
												overall
											</span>
											<span style={{ 
												fontSize: '12px', 
												color: '#666',
												marginLeft: '8px'
											}}>
												{__('Position', 'wegenius')} • {__('Created', 'wegenius')} {analysis?.completed_at ? new Date(analysis.completed_at).toLocaleDateString('en-US', {
													month: 'short',
													day: '2-digit',
													year: 'numeric',
													hour: '2-digit',
													minute: '2-digit'
												}) : 'N/A'}
											</span>
										</div>
										<span style={{ 
											padding: '4px 8px', 
											fontSize: '12px', 
											fontWeight: '500',
											borderRadius: '12px',
											backgroundColor: '#f3f4f6',
											color: '#666'
										}}>
											{__('pending', 'wegenius')}
										</span>
									</div>

									{/* Suggestion Content */}
									<div style={{ marginBottom: '16px' }}>
										<h4 style={{ 
											fontSize: '14px', 
											fontWeight: '600', 
											marginBottom: '8px',
											color: '#1a1a1a'
										}}>
											{__('Suggestion:', 'wegenius')}
										</h4>
										{suggestion.suggested_content && Array.isArray(suggestion.suggested_content) && (
											<div style={{ 
												fontSize: '14px', 
												lineHeight: '1.5',
												color: '#374151'
											}}>
												{console.log('AnalysisDetailsModal: Suggestion suggested_content:', suggestion.suggested_content)}
												{suggestion.suggested_content.map((item, index) => (
													<div key={index} style={{ marginBottom: '4px' }}>
														<span style={{ marginRight: '8px', fontWeight: '500' }}>{index + 1}.</span>
														{item}
													</div>
												))}
											</div>
										)}
									</div>

									{/* Explanation */}
									{suggestion.explanation && (
										<div style={{ marginBottom: '16px' }}>
											<h4 style={{ 
												fontSize: '14px', 
												fontWeight: '600', 
												marginBottom: '8px',
												color: '#1a1a1a'
											}}>
												{__('Explanation:', 'wegenius')}
											</h4>
											<p style={{ 
												fontSize: '14px', 
												color: '#374151',
												margin: 0,
												lineHeight: '1.5'
											}}>
												{console.log('AnalysisDetailsModal: Suggestion explanation:', suggestion.explanation)}
												{suggestion.explanation}
											</p>
										</div>
									)}

									{/* Priority and Action */}
									<div style={{ 
										display: 'flex', 
										justifyContent: 'space-between', 
										alignItems: 'center'
									}}>
										{suggestion.priority && (
											<div>
												<h4 style={{ 
													fontSize: '14px', 
													fontWeight: '600', 
													marginBottom: '4px',
													color: '#1a1a1a'
												}}>
													{__('Priority:', 'wegenius')}
												</h4>
												<span style={{ 
													fontSize: '14px', 
													color: suggestion.priority === 'high' ? '#dc2626' : 
														suggestion.priority === 'medium' ? '#d97706' : '#059669',
													fontWeight: '500'
												}}>
													{suggestion.priority}
												</span>
											</div>
										)}
										<Button
											variant="primary"
											size="small"
											onClick={() => handleApplySuggestion(suggestion)}
											disabled={loading || applyingSuggestion === suggestion.id}
											style={{ 
												backgroundColor: '#1a1a1a',
												borderColor: '#1a1a1a',
												color: 'white',
												fontWeight: '500'
											}}
										>
											{applyingSuggestion === suggestion.id ? (
												<>
													<Spinner style={{ marginRight: '8px' }} />
													{__('Applying...', 'wegenius')}
												</>
											) : (
												__('Apply Suggestion', 'wegenius')
											)}
										</Button>
									</div>
								</div>
								);
							})}
						</div>
					)}

					{/* No Suggestions State */}
					{!loading && !error && (!suggestions || suggestions.length === 0) && (
						<Notice status="info" isDismissible={false}>
							<p>{__('No suggestions available for this analysis.', 'wegenius')}</p>
						</Notice>
					)}

				</div>
			</div>
		</Modal>
	);
};
