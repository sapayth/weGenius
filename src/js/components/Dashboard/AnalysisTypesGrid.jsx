import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader, Button } from '@wordpress/components';
import { Spinner } from '@wordpress/components';

/**
 * Analysis Types Grid Component
 * Displays analysis type statistics with quick access links
 *
 * @since 1.0.0
 * @param {Object} props Component props
 * @param {Object} props.data Analysis type data
 * @param {number} props.data.improve Number of improvement results
 * @param {number} props.data.gaps Number of gap analysis results
 * @param {number} props.data.ideas Number of idea suggestions
 * @param {number} props.data.trends Number of trend insights
 * @param {boolean} props.loading Loading state
 */
export const AnalysisTypesGrid = ({ data, loading }) => {
	const analysisTypes = [
		{
			key: 'improve',
			title: __('Improvements', 'wegenius'),
			icon: '🔧',
			color: 'wegen-blue',
			description: __('Content improvement suggestions', 'wegenius'),
			value: data.improve,
			link: 'admin.php?page=wegenius-reports&tab=improvements',
		},
		{
			key: 'gaps',
			title: __('Content Gaps', 'wegenius'),
			icon: '🔍',
			color: 'wegen-purple',
			description: __('Missing content opportunities', 'wegenius'),
			value: data.gaps,
			link: 'admin.php?page=wegenius-reports&tab=gaps',
		},
		{
			key: 'ideas',
			title: __('Content Ideas', 'wegenius'),
			icon: '💡',
			color: 'wegen-green',
			description: __('New article suggestions', 'wegenius'),
			value: data.ideas,
			link: 'admin.php?page=wegenius-reports&tab=ideas',
		},
		{
			key: 'trends',
			title: __('Trends', 'wegenius'),
			icon: '📈',
			color: 'wegen-orange',
			description: __('Performance insights', 'wegenius'),
			value: data.trends,
			link: 'admin.php?page=wegenius-reports&tab=trends',
		},
	];

	/**
	 * Handle view all click
	 */
	const handleViewAll = (link) => {
		window.location.href = link;
	};

	const getTypeColors = (key) => {
		const colors = {
			improve: 'border-blue-200 hover:border-blue-300 bg-blue-50',
			gaps: 'border-purple-200 hover:border-purple-300 bg-purple-50',
			ideas: 'border-green-200 hover:border-green-300 bg-green-50',
			trends: 'border-orange-200 hover:border-orange-300 bg-orange-50',
		};
		return colors[key] || 'border-gray-200 hover:border-gray-300 bg-gray-50';
	};

	return (
		<div className="mb-8">
			<h2 className="text-xl font-semibold text-gray-900 mb-6">
				{__('Analysis Types Overview', 'wegenius')}
			</h2>
			
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{analysisTypes.map((type) => (
					<div
						key={type.key}
						className={`bg-white rounded-lg shadow-sm border ${getTypeColors(type.key)} hover:shadow-md transition-all duration-200 p-6`}
					>
						<div className="flex items-center space-x-3 mb-4">
							<span className="text-2xl" role="img" aria-label={type.title}>
								{type.icon}
							</span>
							<h3 className="text-lg font-medium text-gray-900">
								{type.title}
							</h3>
						</div>
						
						<div className="mb-4">
							{loading ? (
								<div className="flex items-center space-x-2">
									<Spinner className="mr-2" />
									<span className="text-sm text-gray-500">
										{__('Loading...', 'wegenius')}
									</span>
								</div>
							) : (
								<div className="flex items-baseline">
									<p className="text-3xl font-bold text-gray-900">
										{type.value}
									</p>
									<p className="text-sm text-gray-500 ml-2">
										{type.value === 1 ? __('result', 'wegenius') : __('results', 'wegenius')}
									</p>
								</div>
							)}
						</div>
						
						<p className="text-sm text-gray-600 mb-4">
							{type.description}
						</p>
						
						<button
							className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={() => handleViewAll(type.link)}
							disabled={loading || type.value === 0}
						>
							{__('View All', 'wegenius')}
						</button>
					</div>
				))}
			</div>
		</div>
	);
};
