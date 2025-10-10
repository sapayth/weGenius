import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader, Spinner } from '@wordpress/components';

/**
 * Status Cards Component
 * Displays overview statistics with visual indicators
 *
 * @since 1.0.0
 * @param {Object} props Component props
 * @param {Object} props.data Status data
 * @param {number} props.data.analyzed Number of analyzed posts
 * @param {number} props.data.pending Number of pending analyses
 * @param {number} props.data.failed Number of failed analyses
 * @param {number} props.data.neverAnalyzed Number of never analyzed posts
 * @param {boolean} props.loading Loading state
 */
export const StatusCards = ({ data, loading }) => {
	const cards = [
		{
			key: 'analyzed',
			title: __('Total Articles Analyzed', 'wegenius'),
			value: data.analyzed || 0,
			icon: '📊',
			color: 'wegen-green',
			description: __('Posts with completed analysis', 'wegenius'),
		},
		{
			key: 'generated',
			title: __('Total Articles Generated/Improved', 'wegenius'),
			value: data.generated || 0,
			icon: '✨',
			color: 'wegen-blue',
			description: __('Articles created or enhanced', 'wegenius'),
		},
		{
			key: 'suggestions',
			title: __('Total Suggestions Saved', 'wegenius'),
			value: data.suggestions || 0,
			icon: '💡',
			color: 'wegen-purple',
			description: __('Saved content suggestions', 'wegenius'),
		},
		{
			key: 'pending',
			title: __('Pending Analyses', 'wegenius'),
			value: data.pending || 0,
			icon: '⏳',
			color: 'wegen-yellow',
			description: __('Analyses waiting to start', 'wegenius'),
		},
		{
			key: 'processing',
			title: __('Processing', 'wegenius'),
			value: data.processing || 0,
			icon: '🔄',
			color: 'wegen-blue',
			description: __('Analyses currently running', 'wegenius'),
		},
		{
			key: 'failed',
			title: __('Failed Analyses', 'wegenius'),
			value: data.failed || 0,
			icon: '❌',
			color: 'wegen-red',
			description: __('Analyses that encountered errors', 'wegenius'),
		},
	];

	const getCardColors = (key) => {
		const colors = {
			analyzed: 'border-l-green-500 bg-green-50',
			generated: 'border-l-blue-500 bg-blue-50',
			suggestions: 'border-l-purple-500 bg-purple-50',
			pending: 'border-l-yellow-500 bg-yellow-50',
			processing: 'border-l-blue-500 bg-blue-50',
			failed: 'border-l-red-500 bg-red-50',
		};
		return colors[key] || 'border-l-gray-500 bg-gray-50';
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{cards.map((card) => (
				<div
					key={card.key}
					className={`relative bg-white rounded-lg shadow-sm border-l-4 ${getCardColors(card.key)} hover:shadow-md transition-all duration-200 p-6`}
				>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-sm font-medium text-gray-900">
							{card.title}
						</h3>
						<span className="text-2xl" role="img" aria-label={card.title}>
							{card.icon}
						</span>
					</div>
					
					<div className="flex items-baseline mb-2">
						{loading ? (
							<div className="flex items-center">
								<Spinner className="mr-2" />
								<span className="text-sm text-gray-500">Loading...</span>
							</div>
						) : (
							<>
								<p className="text-3xl font-bold text-gray-900">
									{card.value}
								</p>
								<p className="text-sm text-gray-500 ml-2">
									{card.value === 1 ? __('post', 'wegenius') : __('posts', 'wegenius')}
								</p>
							</>
						)}
					</div>
					
					<p className="text-xs text-gray-600">
						{card.description}
					</p>
				</div>
			))}
		</div>
	);
};
