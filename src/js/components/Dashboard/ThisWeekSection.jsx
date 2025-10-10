import { __ } from '@wordpress/i18n';
import { Spinner } from '@wordpress/components';

/**
 * This Week Section Component
 * Displays weekly statistics
 *
 * @since 1.0.0
 * @param {Object} props Component props
 * @param {Object} props.data Weekly data
 * @param {number} props.data.articlesGenerated Number of articles generated this week
 * @param {boolean} props.loading Loading state
 */
export const ThisWeekSection = ({ data, loading }) => {
	return (
		<div className="mb-8">
			<h2 className="text-xl font-semibold text-gray-900 mb-4">
				{__('This week', 'wegenius')}
			</h2>
			
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div className="flex items-center space-x-4">
					<div className="bg-gray-100 rounded-lg p-4">
						{loading ? (
							<div className="flex items-center">
								<Spinner className="mr-2" />
								<span className="text-sm text-gray-500">Loading...</span>
							</div>
						) : (
							<p className="text-3xl font-bold text-gray-900">
								{data?.articlesGenerated || 0}
							</p>
						)}
					</div>
					<div>
						<p className="text-sm font-medium text-gray-900">
							{__('Articles Generated/Improved', 'wegenius')}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
