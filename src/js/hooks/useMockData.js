/**
 * Mock Data React Hook
 *
 * Provides React hooks for easy access to mock data in components.
 *
 * @since 1.0.0
 */

import { useState, useEffect, useCallback } from '@wordpress/element';
import { mockDataAPI } from '../utils/mockData';

/**
 * Hook for fetching mock data with loading and error states
 * 
 * @param {Function} fetchFunction Function that returns a promise
 * @param {Array} dependencies Dependencies array for useEffect
 * @returns {Object} Hook state and methods
 */
export const useMockData = (fetchFunction, dependencies = []) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchData = useCallback(async () => {
		if (!fetchFunction) return;

		setLoading(true);
		setError(null);

		try {
			const result = await fetchFunction();
			setData(result);
		} catch (err) {
			setError(err.message || 'Failed to fetch data');
			console.error('Mock data fetch error:', err);
		} finally {
			setLoading(false);
		}
	}, [fetchFunction]);

	useEffect(() => {
		fetchData();
	}, dependencies);

	return {
		data,
		loading,
		error,
		refetch: fetchData,
	};
};

/**
 * Hook for mock analyses data
 * 
 * @param {Object} params Query parameters
 * @returns {Object} Analyses hook state
 */
export const useMockAnalyses = (params = {}) => {
	return useMockData(
		() => mockDataAPI.getAnalyses(params),
		[JSON.stringify(params)]
	);
};

/**
 * Hook for mock analysis results
 * 
 * @param {number} analysisId Analysis ID
 * @returns {Object} Analysis results hook state
 */
export const useMockAnalysisResults = (analysisId) => {
	return useMockData(
		() => mockDataAPI.getAnalysisResults(analysisId),
		[analysisId]
	);
};

/**
 * Hook for mock suggestions
 * 
 * @param {number} analysisId Analysis ID
 * @param {Object} params Query parameters
 * @returns {Object} Suggestions hook state
 */
export const useMockSuggestions = (analysisId, params = {}) => {
	return useMockData(
		() => mockDataAPI.getSuggestions(analysisId, params),
		[analysisId, JSON.stringify(params)]
	);
};

/**
 * Hook for mock article history
 * 
 * @param {number} postId Post ID
 * @returns {Object} Article history hook state
 */
export const useMockArticleHistory = (postId) => {
	return useMockData(
		() => mockDataAPI.getArticleHistory(postId),
		[postId]
	);
};

/**
 * Hook for mock content versions
 * 
 * @param {number} postId Post ID
 * @returns {Object} Versions hook state
 */
export const useMockVersions = (postId) => {
	return useMockData(
		() => mockDataAPI.getVersions(postId),
		[postId]
	);
};

/**
 * Hook for mock dashboard overview
 * 
 * @param {Object} filters Filter parameters
 * @returns {Object} Dashboard hook state
 */
export const useMockDashboardOverview = (filters = {}) => {
	return useMockData(
		() => mockDataAPI.getDashboardOverview(filters),
		[JSON.stringify(filters)]
	);
};

/**
 * Hook for mock data with manual refresh capability
 * 
 * @param {Function} fetchFunction Function that returns a promise
 * @param {Array} dependencies Dependencies array for useEffect
 * @returns {Object} Hook state and methods
 */
export const useMockDataWithRefresh = (fetchFunction, dependencies = []) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [lastFetched, setLastFetched] = useState(null);

	const fetchData = useCallback(async () => {
		if (!fetchFunction) return;

		setLoading(true);
		setError(null);

		try {
			const result = await fetchFunction();
			setData(result);
			setLastFetched(new Date());
		} catch (err) {
			setError(err.message || 'Failed to fetch data');
			console.error('Mock data fetch error:', err);
		} finally {
			setLoading(false);
		}
	}, [fetchFunction]);

	useEffect(() => {
		fetchData();
	}, dependencies);

	const refresh = useCallback(() => {
		fetchData();
	}, [fetchData]);

	return {
		data,
		loading,
		error,
		lastFetched,
		refresh,
	};
};

/**
 * Hook for mock data with polling
 * 
 * @param {Function} fetchFunction Function that returns a promise
 * @param {number} interval Polling interval in milliseconds
 * @param {Array} dependencies Dependencies array for useEffect
 * @returns {Object} Hook state and methods
 */
export const useMockDataWithPolling = (fetchFunction, interval = 5000, dependencies = []) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [polling, setPolling] = useState(false);

	const fetchData = useCallback(async () => {
		if (!fetchFunction) return;

		setLoading(true);
		setError(null);

		try {
			const result = await fetchFunction();
			setData(result);
		} catch (err) {
			setError(err.message || 'Failed to fetch data');
			console.error('Mock data fetch error:', err);
		} finally {
			setLoading(false);
		}
	}, [fetchFunction]);

	useEffect(() => {
		fetchData();
	}, dependencies);

	useEffect(() => {
		if (!polling || !interval) return;

		const timer = setInterval(fetchData, interval);
		return () => clearInterval(timer);
	}, [fetchData, polling, interval]);

	const startPolling = useCallback(() => {
		setPolling(true);
	}, []);

	const stopPolling = useCallback(() => {
		setPolling(false);
	}, []);

	return {
		data,
		loading,
		error,
		polling,
		startPolling,
		stopPolling,
		refresh: fetchData,
	};
};

/**
 * Hook for mock data with optimistic updates
 * 
 * @param {Function} fetchFunction Function that returns a promise
 * @param {Function} updateFunction Function for optimistic updates
 * @param {Array} dependencies Dependencies array for useEffect
 * @returns {Object} Hook state and methods
 */
export const useMockDataWithOptimisticUpdates = (fetchFunction, updateFunction, dependencies = []) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [optimisticData, setOptimisticData] = useState(null);

	const fetchData = useCallback(async () => {
		if (!fetchFunction) return;

		setLoading(true);
		setError(null);

		try {
			const result = await fetchFunction();
			setData(result);
			setOptimisticData(null);
		} catch (err) {
			setError(err.message || 'Failed to fetch data');
			console.error('Mock data fetch error:', err);
		} finally {
			setLoading(false);
		}
	}, [fetchFunction]);

	useEffect(() => {
		fetchData();
	}, dependencies);

	const optimisticUpdate = useCallback(async (updateParams) => {
		if (!updateFunction) return;

		// Store current data for rollback
		const previousData = data;

		// Apply optimistic update
		if (updateFunction) {
			const optimisticResult = updateFunction(data, updateParams);
			setOptimisticData(optimisticResult);
		}

		try {
			// Perform actual update
			const result = await updateFunction(updateParams);
			setData(result);
			setOptimisticData(null);
		} catch (err) {
			// Rollback on error
			setData(previousData);
			setOptimisticData(null);
			setError(err.message || 'Update failed');
			throw err;
		}
	}, [data, updateFunction]);

	return {
		data: optimisticData || data,
		loading,
		error,
		optimistic: !!optimisticData,
		refresh: fetchData,
		optimisticUpdate,
	};
};
