import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { StatusCards } from './StatusCards';
import { RecentAnalysisTable } from './RecentAnalysisTable';
import { API_ENDPOINTS, getApiHeaders } from '../../constants/api';

/**
 * Main Dashboard Overview Component
 *
 * @since 1.0.0
 */
export const DashboardOverview = () => {
	const [dashboardData, setDashboardData] = useState({
		overview: {
			analyzed: 0,
			generated: 0,
			suggestions: 0,
		},
		thisWeek: {
			articlesGenerated: 0,
		},
		recentAnalyses: [],
		ideaInbox: [],
		loading: true,
	});

	useEffect(() => {
		loadDashboardData();
	}, []);

	/**
	 * Load dashboard data from external API
	 */
	const loadDashboardData = async () => {
		try {
			setDashboardData(prev => ({ ...prev, loading: true }));

		// Get analyses from external API
		const url = API_ENDPOINTS.getAnalyses({ limit: 50, status: 'completed' });
		const headers = getApiHeaders();
		
		console.log('Dashboard: API_ENDPOINTS.getAnalyses result:', url);
		console.log('Dashboard: Headers:', headers);
		console.log('Dashboard: Full request details:', { url, headers, method: 'GET' });
			
			const response = await fetch(url, {
				method: 'GET',
				headers,
			});

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

		const analysesResponse = await response.json();
		console.log('Dashboard: Raw API response:', analysesResponse);
		
		// Extract analyses array from the response structure
		const analyses = analysesResponse.data?.analyses || analysesResponse.analyses || [];
		console.log('Dashboard: Processed analyses data:', analyses);
		console.log('Dashboard: Number of analyses:', analyses.length);
			
		// Calculate dashboard data from analyses
		const overview = calculateOverviewStats(analyses);
		const recentAnalyses = formatRecentAnalyses(analyses.slice(0, 10));
		const thisWeek = calculateThisWeekData(analyses);
		
		console.log('Dashboard: Calculated overview:', overview);
		console.log('Dashboard: Recent analyses (first 3):', recentAnalyses.slice(0, 3));
		console.log('Dashboard: This week data:', thisWeek);
		
		setDashboardData({
			overview,
			thisWeek,
			recentAnalyses,
			ideaInbox: [],
			loading: false,
		});
			
		} catch (error) {
			console.error('External API dashboard data loading error:', error);
			setDashboardData(prev => ({
				...prev,
				loading: false,
			}));
		}
	};

	/**
	 * Calculate overview statistics from external API data
	 */
	const calculateOverviewStats = (analyses) => {
		const stats = {
			analyzed: 0,
			generated: 0,
			suggestions: 0,
		};

		// Track unique articles to avoid double counting
		const analyzedArticles = new Set();
		const generatedArticles = new Set();

		analyses.forEach(analysis => {
			const status = analysis.status || 'unknown';
			const type = analysis.analysis_type || 'unknown';
			const postId = analysis.wordpress_post?.wp_post_id || analysis.wordpress_post_id;

			// Count analyzed articles (completed analyses) - unique articles only
			if (status === 'completed' && postId) {
				analyzedArticles.add(postId);
				
				// Count generated articles (improvement, content_gap, new_article types) - unique articles only
				if (['improve', 'content_gap', 'new_article'].includes(type)) {
					generatedArticles.add(postId);
				}
			}

			// Count suggestions (if available in the analysis data)
			if (analysis.analysis_results?.suggestions_count) {
				stats.suggestions += parseInt(analysis.analysis_results.suggestions_count);
			}
		});

		// Set the final counts based on unique articles
		stats.analyzed = analyzedArticles.size;
		stats.generated = generatedArticles.size;

		return stats;
	};

	/**
	 * Format recent analyses from external API data
	 */
	const formatRecentAnalyses = (analyses) => {
		return analyses.map(analysis => {
			// Format analysis type for display
			const typeLabels = {
				'improve': __('Content Improvement', 'wegenius'),
				'content_gap': __('Content Gap Analysis', 'wegenius'),
				'new_article': __('New Article Ideas', 'wegenius'),
				'trends': __('Trend Analysis', 'wegenius'),
			};

			const typeDisplay = typeLabels[analysis.analysis_type] || 
				analysis.analysis_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

			// Extract post data from wordpress_post object
			const post = analysis.wordpress_post || {};
			
			return {
				id: analysis.id,
				title: post.title || __('Untitled', 'wegenius'),
				postId: post.wp_post_id || 0,
				permalink: post.permalink || '',
				author: post.author_name || '',
				lastAnalyzed: analysis.created_at || '',
				updatedAt: analysis.updated_at || '',
				type: typeDisplay,
				typeKey: analysis.analysis_type,
				status: analysis.status?.charAt(0).toUpperCase() + analysis.status?.slice(1) || 'Unknown',
				statusKey: analysis.status,
				statusColor: getStatusColor(analysis.status),
				statusIcon: getStatusIcon(analysis.status),
				hasResults: !!(analysis.analysis_results),
				scores: analysis.analysis_results?.metrics || null,
			};
		});
	};

	/**
	 * Calculate this week's data from external API data
	 */
	const calculateThisWeekData = (analyses) => {
		const weekStart = new Date();
		weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
		weekStart.setHours(0, 0, 0, 0);
		
		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekEnd.getDate() + 6); // Sunday
		weekEnd.setHours(23, 59, 59, 999);

		let articlesGenerated = 0;

		analyses.forEach(analysis => {
			const createdAt = new Date(analysis.created_at || '');
			
			if (createdAt >= weekStart && createdAt <= weekEnd) {
				if (analysis.status === 'completed' && 
					['improve', 'content_gap', 'new_article'].includes(analysis.analysis_type)) {
					articlesGenerated++;
				}
			}
		});

		return {
			articlesGenerated,
		};
	};

	/**
	 * Get status color for display
	 */
	const getStatusColor = (status) => {
		const colors = {
			'completed': 'bg-green-100 text-green-800',
			'processing': 'bg-blue-100 text-blue-800',
			'failed': 'bg-red-100 text-red-800',
			'pending': 'bg-yellow-100 text-yellow-800',
		};
		return colors[status] || 'bg-gray-100 text-gray-800';
	};

	/**
	 * Get status icon for display
	 */
	const getStatusIcon = (status) => {
		const icons = {
			'completed': 'check-circle',
			'processing': 'clock',
			'failed': 'x-circle',
			'pending': 'hourglass',
		};
		return icons[status] || 'question-mark-circle';
	};


	/**
	 * Refresh dashboard data
	 */
	const handleRefresh = () => {
		loadDashboardData();
	};

	return (
		<div className="wegenius-container">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								{__('weGenius Dashboard', 'wegenius')}
							</h1>
							<p className="mt-2 text-sm text-gray-600">
								{__('AI-powered content analysis and optimization', 'wegenius')}
							</p>
						</div>
					</div>
				</div>

				<div className="space-y-8">
					<StatusCards
						data={dashboardData.overview}
						loading={dashboardData.loading}
					/>

					<RecentAnalysisTable
						analyses={dashboardData.recentAnalyses}
						loading={dashboardData.loading}
					/>
				</div>
			</div>
		</div>
	);
};
