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
		},
		{
			key: 'generated',
			title: __('Total Articles Generated/Improved', 'wegenius'),
			value: data.generated || 0,
		},
		{
			key: 'suggestions',
			title: __('Total Suggestions Saved', 'wegenius'),
			value: data.suggestions || 0,
		},
		{
			key: 'pending',
			title: __('Pending Analyses', 'wegenius'),
			value: data.pending || 0,
		},
		{
			key: 'processing',
			title: __('Processing', 'wegenius'),
			value: data.processing || 0,
		},
		{
			key: 'failed',
			title: __('Failed Analyses', 'wegenius'),
			value: data.failed || 0,
		},
	];


	return (
		<div>
			<h3 className="text-base font-semibold text-gray-900 dark:text-white">
				{__('Analytics Overview', 'wegenius')}
			</h3>
			<dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
				{cards.map((card) => (
					<div key={card.key} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm sm:p-6 dark:bg-gray-800/75 dark:inset-ring dark:inset-ring-white/10">
						<dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
							{card.title}
						</dt>
						<dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
							{loading ? (
								<div className="flex items-center">
									<Spinner className="mr-2" />
									<span className="text-sm text-gray-500">Loading...</span>
								</div>
							) : (
								<>
									{card.value}
									<span className="text-sm font-normal text-gray-500 ml-2">
										{card.value === 1 ? __('post', 'wegenius') : __('posts', 'wegenius')}
									</span>
								</>
							)}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
};
