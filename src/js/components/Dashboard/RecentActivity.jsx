import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader, Spinner } from '@wordpress/components';

/**
 * Recent Activity Component
 * Displays recent analysis activities and system events
 *
 * @since 1.0.0
 * @param {Object} props Component props
 * @param {Array} props.activities Array of activity objects
 * @param {boolean} props.loading Loading state
 */
export const RecentActivity = ({ activities, loading }) => {
	/**
	 * Get activity icon based on type
	 */
	const getActivityIcon = (type) => {
		const icons = {
			analyzed: '✅',
			analyzing: '⏳',
			failed: '❌',
			completed: '🎉',
			error: '⚠️',
		};
		return icons[type] || '📝';
	};

	/**
	 * Get activity color based on type
	 */
	const getActivityColor = (type) => {
		const colors = {
			analyzed: 'wegen-green',
			analyzing: 'wegen-yellow',
			failed: 'wegen-red',
			completed: 'wegen-green',
			error: 'wegen-red',
		};
		return colors[type] || 'wegen-gray';
	};

	/**
	 * Format relative time
	 */
	const formatRelativeTime = (timestamp) => {
		const now = new Date();
		const time = new Date(timestamp);
		const diffInMinutes = Math.floor((now - time) / (1000 * 60));

		if (diffInMinutes < 1) {
			return __('Just now', 'wegenius');
		} else if (diffInMinutes < 60) {
			return __('%d minutes ago', 'wegenius').replace('%d', diffInMinutes);
		} else if (diffInMinutes < 1440) {
			const hours = Math.floor(diffInMinutes / 60);
			return __('%d hours ago', 'wegenius').replace('%d', hours);
		} else {
			const days = Math.floor(diffInMinutes / 1440);
			return __('%d days ago', 'wegenius').replace('%d', days);
		}
	};

	return (
		<div>
			<h2 className="text-xl font-semibold text-gray-900 mb-6">
				{__('Recent Activity', 'wegenius')}
			</h2>
			
			<div className="bg-white rounded-lg shadow-sm border border-gray-200">
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<Spinner className="mr-3" />
						<span className="text-gray-500">
							{__('Loading activities...', 'wegenius')}
						</span>
					</div>
				) : activities && activities.length > 0 ? (
					<div className="divide-y divide-gray-200">
						{activities.map((activity, index) => (
							<div
								key={index}
								className="flex items-start space-x-4 p-6 hover:bg-gray-50 transition-colors duration-150"
							>
								<div className="flex-shrink-0">
									<span
										className="text-lg"
										role="img"
										aria-label={activity.type}
									>
										{getActivityIcon(activity.type)}
									</span>
								</div>
								
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium text-gray-900">
											{activity.message}
										</p>
										<p className="text-xs text-gray-500">
											{formatRelativeTime(activity.timestamp)}
										</p>
									</div>
									
									{activity.details && (
										<p className="text-xs text-gray-600 mt-1">
											{activity.details}
										</p>
									)}
								</div>
								
								{activity.action && (
									<div className="flex-shrink-0">
										<button
											className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
											onClick={() => {
												if (activity.action.url) {
													window.location.href = activity.action.url;
												} else if (activity.action.callback) {
													activity.action.callback();
												}
											}}
										>
											{activity.action.label}
										</button>
									</div>
								)}
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<span className="text-4xl" role="img" aria-label="No activity">
							📝
						</span>
						<p className="text-gray-500 mt-2">
							{__('No recent activity', 'wegenius')}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};
