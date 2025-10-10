import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { StatusCards } from './StatusCards';
import { RecentAnalysisTable } from './RecentAnalysisTable';

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
	 * Load dashboard data from API
	 */
	const loadDashboardData = async () => {
		try {
			setDashboardData(prev => ({ ...prev, loading: true }));

			// Use WordPress apiFetch instead of native fetch
			const data = await apiFetch({
				path: '/wegenius/v1/dashboard/test',
				method: 'GET',
			});
			
			// Debug: Log the received data
			console.log('Dashboard data received:', data);
			
			setDashboardData(prev => ({
				...prev,
				...data,
				loading: false,
			}));
		} catch (error) {
			console.error('Dashboard data loading error:', error);
			setDashboardData(prev => ({
				...prev,
				loading: false,
			}));
		}
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
						<button
							className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={handleRefresh}
							disabled={dashboardData.loading}
						>
							{dashboardData.loading ? (
								<>
									<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									{__('Refreshing...', 'wegenius')}
								</>
							) : (
								<>
									<svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
									</svg>
									{__('Refresh', 'wegenius')}
								</>
							)}
						</button>
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
