import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';

/**
 * Content Filters Component
 * Provides filtering options for dashboard content
 *
 * @since 1.0.0
 * @param {Object} props Component props
 * @param {Object} props.filters Current filter values
 * @param {string} props.filters.postType Selected post type
 * @param {string} props.filters.category Selected category
 * @param {string} props.filters.dateRange Selected date range
 * @param {Function} props.onFilterChange Filter change handler
 */
export const ContentFilters = ({ filters, onFilterChange }) => {
	/**
	 * Post type options
	 */
	const postTypeOptions = [
		{ label: __('All Post Types', 'wegenius'), value: 'all' },
		{ label: __('Posts', 'wegenius'), value: 'post' },
		{ label: __('Pages', 'wegenius'), value: 'page' },
		{ label: __('Custom Post Types', 'wegenius'), value: 'custom' },
	];

	/**
	 * Category options (would be loaded from API in real implementation)
	 */
	const categoryOptions = [
		{ label: __('All Categories', 'wegenius'), value: 'all' },
		{ label: __('Uncategorized', 'wegenius'), value: 'uncategorized' },
		// More categories would be loaded dynamically
	];

	/**
	 * Date range options
	 */
	const dateRangeOptions = [
		{ label: __('Last 7 days', 'wegenius'), value: '7' },
		{ label: __('Last 30 days', 'wegenius'), value: '30' },
		{ label: __('Last 90 days', 'wegenius'), value: '90' },
		{ label: __('Last year', 'wegenius'), value: '365' },
		{ label: __('All time', 'wegenius'), value: 'all' },
	];

	return (
		<div className="mb-8">
			<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							{__('Content Type', 'wegenius')}
						</label>
						<SelectControl
							value={filters.postType}
							options={postTypeOptions}
							onChange={(value) => onFilterChange('postType', value)}
							className="w-full"
						/>
					</div>
					
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							{__('Category', 'wegenius')}
						</label>
						<SelectControl
							value={filters.category}
							options={categoryOptions}
							onChange={(value) => onFilterChange('category', value)}
							className="w-full"
						/>
					</div>
					
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							{__('Date Range', 'wegenius')}
						</label>
						<SelectControl
							value={filters.dateRange}
							options={dateRangeOptions}
							onChange={(value) => onFilterChange('dateRange', value)}
							className="w-full"
						/>
					</div>
					
					<div>
						<button
							className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							onClick={() => {
								onFilterChange('postType', 'all');
								onFilterChange('category', 'all');
								onFilterChange('dateRange', '30');
							}}
						>
							<svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							{__('Reset Filters', 'wegenius')}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
