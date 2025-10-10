import { __ } from '@wordpress/i18n';
import { Spinner } from '@wordpress/components';

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
	/**
	 * Get status badge styling
	 */
	const getStatusBadge = (status) => {
		const statusStyles = {
			'In Progress': 'bg-gray-100 text-gray-800',
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

	return (
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
				) : analyses && analyses.length > 0 ? (
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
										{__('Analysis Type', 'wegenius')}
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{__('Status', 'wegenius')}
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{analyses.map((analysis, index) => (
									<tr key={index} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{analysis.title}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatDate(analysis.lastAnalyzed)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAnalysisTypeBadge(analysis.type)}`}>
												{analysis.type}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(analysis.status)}`}>
													{analysis.status}
												</span>
												{analysis.status === 'In Progress' && (
													<svg className="ml-2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
													</svg>
												)}
											</div>
										</td>
									</tr>
								))}
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
	);
};
