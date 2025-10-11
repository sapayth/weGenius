import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Spinner } from '@wordpress/components';
import { AnalysisDetailsModal } from './AnalysisDetailsModal';

/**
 * Recent Analysis Table Component
 * Displays recent analysis activities in a table format
 *
 * @since 1.0.0
 * @param {Object} props Component props
 * @param {Array} props.analyses Array of analysis objects
 * @param {boolean} props.loading Loading state
 */
export const RecentAnalysisTable = ({ analyses, loading }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedAnalysis, setSelectedAnalysis] = useState(null);
	/**
	 * Get status badge styling
	 */
	const getStatusBadge = (status) => {
		const statusStyles = {
			'Processing': 'bg-blue-100 text-blue-800',
			'Complete': 'bg-green-100 text-green-800',
			'Failed': 'bg-red-100 text-red-800',
			'Pending': 'bg-yellow-100 text-yellow-800',
		};
		
		return statusStyles[status] || 'bg-gray-100 text-gray-800';
	};

	/**
	 * Get analysis type badge styling
	 */
	const getAnalysisTypeBadge = (type) => {
		const typeStyles = {
			'Improvement': 'bg-orange-100 text-orange-800',
			'Content Gap': 'bg-blue-100 text-blue-800',
			'Idea': 'bg-purple-100 text-purple-800',
			'Trend': 'bg-green-100 text-green-800',
		};
		
		return typeStyles[type] || 'bg-gray-100 text-gray-800';
	};

	/**
	 * Format date for display
	 */
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	};

	/**
	 * Group analyses by article title
	 */
	const groupAnalysesByTitle = (analyses) => {
		if (!analyses || !Array.isArray(analyses)) {
			return [];
		}

		const grouped = analyses.reduce((acc, analysis) => {
			const title = analysis.title || __('Untitled', 'wegenius');
			
			if (!acc[title]) {
				acc[title] = {
					title,
					analyses: [],
					lastAnalyzed: analysis.lastAnalyzed,
					postId: analysis.postId,
					permalink: analysis.permalink,
					author: analysis.author
				};
			}
			
			acc[title].analyses.push(analysis);
			
			// Keep the most recent date
			if (new Date(analysis.lastAnalyzed) > new Date(acc[title].lastAnalyzed)) {
				acc[title].lastAnalyzed = analysis.lastAnalyzed;
			}
			
			return acc;
		}, {});

		return Object.values(grouped);
	};

	/**
	 * Get combined status for grouped analyses
	 */
	const getCombinedStatus = (analyses) => {
		const statusCounts = analyses.reduce((acc, analysis) => {
			// Map API status values to our display values
			const statusKey = analysis.statusKey || analysis.status;
			acc[statusKey] = (acc[statusKey] || 0) + 1;
			return acc;
		}, {});

		const total = analyses.length;
		const completed = statusCounts['completed'] || 0;
		const processing = statusCounts['processing'] || 0;
		const failed = statusCounts['failed'] || 0;
		const pending = statusCounts['pending'] || 0;

		if (completed === total) {
			return { status: 'Complete', count: total, color: 'bg-green-100 text-green-800' };
		} else if (processing > 0) {
			return { status: 'Processing', count: processing, color: 'bg-blue-100 text-blue-800' };
		} else if (failed > 0) {
			return { status: 'Failed', count: failed, color: 'bg-red-100 text-red-800' };
		} else if (pending > 0) {
			return { status: 'Pending', count: pending, color: 'bg-yellow-100 text-yellow-800' };
		}

		return { status: 'Unknown', count: total, color: 'bg-gray-100 text-gray-800' };
	};

	/**
	 * Handle row click to open modal
	 */
	const handleRowClick = (group) => {
		// Create a combined analysis object with all analysis data from the group
		const firstAnalysis = group.analyses[0];
		const selectedAnalysisData = {
			...firstAnalysis,
			title: group.title,
			postId: group.postId,
			permalink: group.permalink,
			author: group.author,
			allAnalyses: group.analyses,
		};
		
		setSelectedAnalysis(selectedAnalysisData);
		setIsModalOpen(true);
		
		// Debug: Check if modal appears in DOM
		setTimeout(() => {
			const modal = document.querySelector('.wegen-analysis-modal');
			const modalOverlay = document.querySelector('.components-modal__screen-overlay');
			console.log('RecentAnalysisTable: Modal in DOM:', !!modal);
			console.log('RecentAnalysisTable: Modal overlay in DOM:', !!modalOverlay);
			if (modal) {
				console.log('RecentAnalysisTable: Modal display:', window.getComputedStyle(modal).display);
				console.log('RecentAnalysisTable: Modal visibility:', window.getComputedStyle(modal).visibility);
			}
		}, 100);
	};

	/**
	 * Handle modal close
	 */
	const handleCloseModal = () => {
		console.log('RecentAnalysisTable: handleCloseModal called');
		setIsModalOpen(false);
		setSelectedAnalysis(null);
	};

	// Group analyses by title
	const groupedAnalyses = groupAnalysesByTitle(analyses);

	console.log('RecentAnalysisTable: Rendering with state:', { isModalOpen, selectedAnalysis });

	return (
		<>
			<AnalysisDetailsModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				analysis={selectedAnalysis}
			/>
		<div className="mb-8">
			<h2 className="text-xl font-semibold text-gray-900 mb-4">
				{__('Recent Analysis', 'wegenius')}
			</h2>
			
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<Spinner className="mr-3" />
						<span className="text-gray-500">
							{__('Loading analyses...', 'wegenius')}
						</span>
					</div>
				) : groupedAnalyses && groupedAnalyses.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{__('Article Title', 'wegenius')}
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{__('Last Analyzed Date', 'wegenius')}
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{__('Analysis Types', 'wegenius')}
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{__('Status', 'wegenius')}
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{groupedAnalyses.map((group, index) => {
									const combinedStatus = getCombinedStatus(group.analyses);
									return (
										<tr
											key={index}
											className="hover:bg-gray-50 cursor-pointer transition-colors"
											onClick={(e) => {
												console.log('RecentAnalysisTable: Row clicked, event:', e);
												console.log('RecentAnalysisTable: Group data:', group);
												handleRowClick(group);
											}}
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900">
													{group.title}
												</div>
												{group.author && (
													<div className="text-xs text-gray-500">
														{__('by', 'wegenius')} {group.author}
													</div>
												)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{formatDate(group.lastAnalyzed)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex flex-wrap gap-1">
													{group.analyses.map((analysis, analysisIndex) => (
														<span 
															key={analysisIndex}
															className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAnalysisTypeBadge(analysis.type)}`}
														>
															{analysis.type}
														</span>
													))}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${combinedStatus.color}`}>
														{combinedStatus.status}
														{combinedStatus.count > 1 && (
															<span className="ml-1">({combinedStatus.count})</span>
														)}
													</span>
													{combinedStatus.status === 'Processing' && (
														<svg className="ml-2 h-4 w-4 text-blue-400 animate-spin" fill="currentColor" viewBox="0 0 20 20">
															<path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
														</svg>
													)}
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				) : (
					<div className="text-center py-12">
						<span className="text-4xl" role="img" aria-label="No analyses">
							📊
						</span>
						<p className="text-gray-500 mt-2">
							{__('No recent analyses', 'wegenius')}
						</p>
					</div>
				)}
			</div>
		</div>
		</>
	);
};
