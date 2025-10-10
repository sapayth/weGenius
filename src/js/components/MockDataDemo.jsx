/**
 * Mock Data Demo Component
 *
 * Demonstrates the usage of mock data API and hooks.
 *
 * @since 1.0.0
 */

import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader, Button, Spinner, Notice } from '@wordpress/components';
import { useMockAnalyses, useMockDashboardOverview, useMockDataWithRefresh } from '../hooks/useMockData';
import { mockDataAPI } from '../utils/mockData';

/**
 * Mock Data Demo Component
 * 
 * @param {Object} props Component props
 */
export const MockDataDemo = (props) => {
	const [selectedAnalysisId, setSelectedAnalysisId] = useState(1);
	const [selectedPostId, setSelectedPostId] = useState(123);

	// Use mock data hooks
	const { data: analyses, loading: analysesLoading, error: analysesError, refetch: refetchAnalyses } = useMockAnalyses({ limit: 5 });
	const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refresh: refreshDashboard } = useMockDataWithRefresh(() => mockDataAPI.getDashboardOverview());
	const { data: analysisResults, loading: resultsLoading, error: resultsError, refresh: refreshResults } = useMockDataWithRefresh(() => mockDataAPI.getAnalysisResults(selectedAnalysisId), [selectedAnalysisId]);

	// Manual API calls
	const [manualData, setManualData] = useState(null);
	const [manualLoading, setManualLoading] = useState(false);
	const [manualError, setManualError] = useState(null);

	const handleManualCall = async () => {
		setManualLoading(true);
		setManualError(null);

		try {
			const result = await mockDataAPI.getArticleHistory(selectedPostId);
			setManualData(result);
		} catch (error) {
			setManualError(error.message);
		} finally {
			setManualLoading(false);
		}
	};

	const handleSubmitArticle = async () => {
		setManualLoading(true);
		setManualError(null);

		try {
			const articleData = {
				wp_post_id: selectedPostId,
				title: 'Sample Article for Testing',
				content: '<p>This is a sample article content for testing the mock API.</p>',
				permalink: 'https://example.com/sample-article',
				featured_image: 'https://example.com/sample-image.jpg',
				status: 'published',
				published_at: new Date().toISOString(),
				author_name: 'Test Author',
				action_type: 'improve',
				meta_data: {
					categories: ['Testing', 'Mock Data'],
					tags: ['demo', 'testing'],
					excerpt: 'Sample article for testing purposes'
				}
			};

			const result = await mockDataAPI.submitArticle(articleData);
			setManualData(result);
		} catch (error) {
			setManualError(error.message);
		} finally {
			setManualLoading(false);
		}
	};

	return (
		<div className="wegenius-mock-data-demo">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					{__('Mock Data Demo', 'wegenius')}
				</h2>
				<p className="text-gray-600">
					{__('This component demonstrates the mock data API functionality for testing and development.', 'wegenius')}
				</p>
			</div>

			{/* Dashboard Overview */}
			<Card className="mb-6">
				<CardHeader>
					<h3 className="text-lg font-semibold text-gray-900 m-0">
						{__('Dashboard Overview', 'wegenius')}
					</h3>
					<Button 
						variant="secondary" 
						size="small" 
						onClick={refreshDashboard}
						disabled={dashboardLoading}
					>
						{dashboardLoading ? <Spinner /> : __('Refresh', 'wegenius')}
					</Button>
				</CardHeader>
				<CardBody>
					{dashboardError && (
						<Notice status="error" isDismissible={false}>
							{dashboardError}
						</Notice>
					)}
					{dashboardLoading && <Spinner />}
					{dashboardData && (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="bg-blue-50 p-4 rounded-lg">
								<div className="text-2xl font-bold text-blue-600">
									{dashboardData.overview?.analyzed || 0}
								</div>
								<div className="text-sm text-blue-800">
									{__('Analyzed', 'wegenius')}
								</div>
							</div>
							<div className="bg-yellow-50 p-4 rounded-lg">
								<div className="text-2xl font-bold text-yellow-600">
									{dashboardData.overview?.pending || 0}
								</div>
								<div className="text-sm text-yellow-800">
									{__('Pending', 'wegenius')}
								</div>
							</div>
							<div className="bg-red-50 p-4 rounded-lg">
								<div className="text-2xl font-bold text-red-600">
									{dashboardData.overview?.failed || 0}
								</div>
								<div className="text-sm text-red-800">
									{__('Failed', 'wegenius')}
								</div>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg">
								<div className="text-2xl font-bold text-gray-600">
									{dashboardData.overview?.neverAnalyzed || 0}
								</div>
								<div className="text-sm text-gray-800">
									{__('Never Analyzed', 'wegenius')}
								</div>
							</div>
						</div>
					)}
				</CardBody>
			</Card>

			{/* Analyses List */}
			<Card className="mb-6">
				<CardHeader>
					<h3 className="text-lg font-semibold text-gray-900 m-0">
						{__('Recent Analyses', 'wegenius')}
					</h3>
					<Button 
						variant="secondary" 
						size="small" 
						onClick={refetchAnalyses}
						disabled={analysesLoading}
					>
						{analysesLoading ? <Spinner /> : __('Refresh', 'wegenius')}
					</Button>
				</CardHeader>
				<CardBody>
					{analysesError && (
						<Notice status="error" isDismissible={false}>
							{analysesError}
						</Notice>
					)}
					{analysesLoading && <Spinner />}
					{analyses && (
						<div className="space-y-3">
							{analyses.map((analysis) => (
								<div 
									key={analysis.id}
									className={`p-4 rounded-lg border cursor-pointer transition-colors ${
										selectedAnalysisId === analysis.id 
											? 'border-blue-500 bg-blue-50' 
											: 'border-gray-200 hover:border-gray-300'
									}`}
									onClick={() => setSelectedAnalysisId(analysis.id)}
								>
									<div className="flex justify-between items-center">
										<div>
											<div className="font-medium text-gray-900">
												{__('Analysis', 'wegenius')} #{analysis.id}
											</div>
											<div className="text-sm text-gray-600">
												{__('Type:', 'wegenius')} {analysis.analysis_type} | 
												{__('Status:', 'wegenius')} {analysis.status}
											</div>
										</div>
										<div className="text-right">
											<div className="text-sm text-gray-600">
												{__('Progress:', 'wegenius')} {analysis.progress}%
											</div>
											<div className="text-xs text-gray-500">
												{new Date(analysis.created_at).toLocaleDateString()}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardBody>
			</Card>

			{/* Analysis Results */}
			<Card className="mb-6">
				<CardHeader>
					<h3 className="text-lg font-semibold text-gray-900 m-0">
						{__('Analysis Results', 'wegenius')}
					</h3>
					<Button 
						variant="secondary" 
						size="small" 
						onClick={refreshResults}
						disabled={resultsLoading}
					>
						{resultsLoading ? <Spinner /> : __('Refresh', 'wegenius')}
					</Button>
				</CardHeader>
				<CardBody>
					{resultsError && (
						<Notice status="error" isDismissible={false}>
							{resultsError}
						</Notice>
					)}
					{resultsLoading && <Spinner />}
					{analysisResults && (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-green-50 p-4 rounded-lg">
								<div className="text-2xl font-bold text-green-600">
									{analysisResults.scores?.overall || 0}%
								</div>
								<div className="text-sm text-green-800">
									{__('Overall Score', 'wegenius')}
								</div>
							</div>
							<div className="bg-blue-50 p-4 rounded-lg">
								<div className="text-2xl font-bold text-blue-600">
									{analysisResults.scores?.seo || 0}%
								</div>
								<div className="text-sm text-blue-800">
									{__('SEO Score', 'wegenius')}
								</div>
							</div>
							<div className="bg-purple-50 p-4 rounded-lg">
								<div className="text-2xl font-bold text-purple-600">
									{analysisResults.scores?.readability || 0}%
								</div>
								<div className="text-sm text-purple-800">
									{__('Readability Score', 'wegenius')}
								</div>
							</div>
						</div>
					)}
				</CardBody>
			</Card>

			{/* Manual API Calls */}
			<Card className="mb-6">
				<CardHeader>
					<h3 className="text-lg font-semibold text-gray-900 m-0">
						{__('Manual API Calls', 'wegenius')}
					</h3>
				</CardHeader>
				<CardBody>
					<div className="space-y-4">
						<div className="flex gap-4">
							<Button 
								variant="primary" 
								onClick={handleSubmitArticle}
								disabled={manualLoading}
							>
								{manualLoading ? <Spinner /> : __('Submit Article', 'wegenius')}
							</Button>
							<Button 
								variant="secondary" 
								onClick={handleManualCall}
								disabled={manualLoading}
							>
								{manualLoading ? <Spinner /> : __('Get Article History', 'wegenius')}
							</Button>
						</div>

						{manualError && (
							<Notice status="error" isDismissible={false}>
								{manualError}
							</Notice>
						)}

						{manualData && (
							<div className="bg-gray-50 p-4 rounded-lg">
								<h4 className="font-medium text-gray-900 mb-2">
									{__('API Response:', 'wegenius')}
								</h4>
								<pre className="text-sm text-gray-700 overflow-auto">
									{JSON.stringify(manualData, null, 2)}
								</pre>
							</div>
						)}
					</div>
				</CardBody>
			</Card>

			{/* API Documentation */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold text-gray-900 m-0">
						{__('Available Mock Endpoints', 'wegenius')}
					</h3>
				</CardHeader>
				<CardBody>
					<div className="space-y-2 text-sm">
						<div><strong>GET</strong> /wp-json/wegenius/v1/mock/articles/analyses</div>
						<div><strong>GET</strong> /wp-json/wegenius/v1/mock/articles/analyses/{selectedAnalysisId}/status</div>
						<div><strong>GET</strong> /wp-json/wegenius/v1/mock/articles/analyses/{selectedAnalysisId}/results</div>
						<div><strong>GET</strong> /wp-json/wegenius/v1/mock/articles/{selectedPostId}/history</div>
						<div><strong>GET</strong> /wp-json/wegenius/v1/mock/suggestions/analysis/{selectedAnalysisId}</div>
						<div><strong>GET</strong> /wp-json/wegenius/v1/mock/posts/{selectedPostId}/versions</div>
						<div><strong>POST</strong> /wp-json/wegenius/v1/mock/articles/submit</div>
						<div><strong>POST</strong> /wp-json/wegenius/v1/mock/dashboard/overview</div>
						<div><strong>GET</strong> /wp-json/wegenius/v1/mock/health</div>
						<div><strong>GET</strong> /wp-json/wegenius/v1/mock/docs</div>
					</div>
				</CardBody>
			</Card>
		</div>
	);
};
