import { __ } from '@wordpress/i18n';
import { Spinner } from '@wordpress/components';

/**
 * Idea Inbox Table Component
 * Displays content ideas and suggestions in a table format
 *
 * @since 1.0.0
 * @param {Object} props Component props
 * @param {Array} props.ideas Array of idea objects
 * @param {boolean} props.loading Loading state
 */
export const IdeaInboxTable = ({ ideas, loading }) => {
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
	 * Handle action button clicks
	 */
	const handleAction = (action, idea) => {
		switch (action) {
			case 'view':
				// Navigate to view the original analysis
				console.log('View analysis for:', idea.id);
				break;
			case 'draft':
				// Create a draft from the idea
				console.log('Create draft for:', idea.id);
				break;
			case 'run':
				// Run analysis on the idea
				console.log('Run analysis for:', idea.id);
				break;
			case 'refresh':
				// Refresh the idea
				console.log('Refresh idea:', idea.id);
				break;
			default:
				break;
		}
	};

	return (
		<div className="mb-8">
			<h2 className="text-xl font-semibold text-gray-900 mb-4">
				{__('Idea Inbox', 'wegenius')}
			</h2>
			
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<Spinner className="mr-3" />
						<span className="text-gray-500">
							{__('Loading ideas...', 'wegenius')}
						</span>
					</div>
				) : ideas && ideas.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{__('Article Title/Keyword', 'wegenius')}
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{__('Analysis Description', 'wegenius')}
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{__('Analysis Type', 'wegenius')}
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{__('Original Analysis', 'wegenius')}
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{ideas.map((idea, index) => (
									<tr key={index} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{idea.title}
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-500">
												{idea.description}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAnalysisTypeBadge(idea.type)}`}>
												{idea.type}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center space-x-2">
												<button
													onClick={() => handleAction('view', idea)}
													className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
												>
													{__('View', 'wegenius')}
												</button>
												<button
													onClick={() => handleAction('draft', idea)}
													className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium hover:underline"
												>
													<svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
													</svg>
													{__('Draft', 'wegenius')}
												</button>
												<button
													onClick={() => handleAction('run', idea)}
													className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium hover:underline"
												>
													<svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
													</svg>
													{__('Run', 'wegenius')}
												</button>
												<button
													onClick={() => handleAction('refresh', idea)}
													className="text-gray-400 hover:text-gray-600"
												>
													<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
													</svg>
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="text-center py-12">
						<span className="text-4xl" role="img" aria-label="No ideas">
							💡
						</span>
						<p className="text-gray-500 mt-2">
							{__('No ideas in inbox', 'wegenius')}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};
