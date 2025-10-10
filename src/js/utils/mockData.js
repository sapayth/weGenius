/**
 * Mock Data Utility
 *
 * Provides easy access to mock data for testing and development.
 *
 * @since 1.0.0
 */

/**
 * Mock Data API Client
 * 
 * Provides methods to interact with mock data endpoints
 */
export class MockDataAPI {
	constructor() {
		this.baseUrl = '/wp-json/wegenius/v1/mock';
		this.nonce = window.wegeniusAdmin?.nonce || '';
	}

	/**
	 * Get request headers
	 * 
	 * @returns {Object} Headers object
	 */
	getHeaders() {
		return {
			'Content-Type': 'application/json',
			'X-WP-Nonce': this.nonce,
		};
	}

	/**
	 * Make API request
	 * 
	 * @param {string} endpoint API endpoint
	 * @param {Object} options Fetch options
	 * @returns {Promise} API response
	 */
	async request(endpoint, options = {}) {
		const url = `${this.baseUrl}${endpoint}`;
		const config = {
			headers: this.getHeaders(),
			...options,
		};

		try {
			const response = await fetch(url, config);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error('Mock API request failed:', error);
			throw error;
		}
	}

	// Article Management Methods

	/**
	 * Submit article for analysis
	 * 
	 * @param {Object} articleData Article data
	 * @returns {Promise} Submission response
	 */
	async submitArticle(articleData) {
		return this.request('/articles/submit', {
			method: 'POST',
			body: JSON.stringify(articleData),
		});
	}

	/**
	 * Get all analyses
	 * 
	 * @param {Object} params Query parameters
	 * @returns {Promise} Analyses list
	 */
	async getAnalyses(params = {}) {
		const queryString = new URLSearchParams(params).toString();
		const endpoint = `/articles/analyses${queryString ? `?${queryString}` : ''}`;
		return this.request(endpoint);
	}

	/**
	 * Get analysis status
	 * 
	 * @param {number} analysisId Analysis ID
	 * @returns {Promise} Analysis status
	 */
	async getAnalysisStatus(analysisId) {
		return this.request(`/articles/analyses/${analysisId}/status`);
	}

	/**
	 * Get analysis results
	 * 
	 * @param {number} analysisId Analysis ID
	 * @returns {Promise} Analysis results
	 */
	async getAnalysisResults(analysisId) {
		return this.request(`/articles/analyses/${analysisId}/results`);
	}

	/**
	 * Get article history
	 * 
	 * @param {number} postId Post ID
	 * @returns {Promise} Article history
	 */
	async getArticleHistory(postId) {
		return this.request(`/articles/${postId}/history`);
	}

	// Suggestions Methods

	/**
	 * Get suggestions for analysis
	 * 
	 * @param {number} analysisId Analysis ID
	 * @param {Object} params Query parameters
	 * @returns {Promise} Suggestions list
	 */
	async getSuggestions(analysisId, params = {}) {
		const queryString = new URLSearchParams(params).toString();
		const endpoint = `/suggestions/analysis/${analysisId}${queryString ? `?${queryString}` : ''}`;
		return this.request(endpoint);
	}

	/**
	 * Get suggestion details
	 * 
	 * @param {number} suggestionId Suggestion ID
	 * @returns {Promise} Suggestion details
	 */
	async getSuggestionDetails(suggestionId) {
		return this.request(`/suggestions/${suggestionId}`);
	}

	/**
	 * Approve suggestions
	 * 
	 * @param {Array} suggestionIds Array of suggestion IDs
	 * @returns {Promise} Approval response
	 */
	async approveSuggestions(suggestionIds) {
		return this.request('/suggestions/approve', {
			method: 'POST',
			body: JSON.stringify({ suggestion_ids: suggestionIds }),
		});
	}

	/**
	 * Reject suggestions
	 * 
	 * @param {Array} suggestionIds Array of suggestion IDs
	 * @param {string} reason Rejection reason
	 * @returns {Promise} Rejection response
	 */
	async rejectSuggestions(suggestionIds, reason = '') {
		return this.request('/suggestions/reject', {
			method: 'POST',
			body: JSON.stringify({ 
				suggestion_ids: suggestionIds,
				reason: reason 
			}),
		});
	}

	/**
	 * Mark suggestions as implemented
	 * 
	 * @param {Array} suggestionIds Array of suggestion IDs
	 * @returns {Promise} Implementation response
	 */
	async implementSuggestions(suggestionIds) {
		return this.request('/suggestions/implement', {
			method: 'POST',
			body: JSON.stringify({ suggestion_ids: suggestionIds }),
		});
	}

	// Content Versions Methods

	/**
	 * Get content versions
	 * 
	 * @param {number} postId Post ID
	 * @returns {Promise} Versions list
	 */
	async getVersions(postId) {
		return this.request(`/posts/${postId}/versions`);
	}

	/**
	 * Get specific version
	 * 
	 * @param {number} postId Post ID
	 * @param {number} versionId Version ID
	 * @returns {Promise} Version details
	 */
	async getVersion(postId, versionId) {
		return this.request(`/posts/${postId}/versions/${versionId}`);
	}

	/**
	 * Compare versions
	 * 
	 * @param {number} postId Post ID
	 * @param {number} version1 Version 1 ID
	 * @param {number} version2 Version 2 ID
	 * @returns {Promise} Comparison results
	 */
	async compareVersions(postId, version1, version2) {
		return this.request(`/posts/${postId}/versions/compare`, {
			method: 'POST',
			body: JSON.stringify({
				version1: version1,
				version2: version2,
			}),
		});
	}

	// Content Analysis Methods

	/**
	 * Analyze post
	 * 
	 * @param {number} postId Post ID
	 * @param {string} analysisType Analysis type
	 * @returns {Promise} Analysis response
	 */
	async analyzePost(postId, analysisType = 'content_optimization') {
		return this.request(`/posts/${postId}/analyze`, {
			method: 'POST',
			body: JSON.stringify({ analysis_type: analysisType }),
		});
	}

	/**
	 * Get post analyses
	 * 
	 * @param {number} postId Post ID
	 * @returns {Promise} Post analyses
	 */
	async getPostAnalyses(postId) {
		return this.request(`/posts/${postId}/analyses`);
	}

	/**
	 * Get single analysis
	 * 
	 * @param {number} analysisId Analysis ID
	 * @returns {Promise} Analysis details
	 */
	async getAnalysis(analysisId) {
		return this.request(`/analyses/${analysisId}`);
	}

	/**
	 * Apply suggestion
	 * 
	 * @param {number} postId Post ID
	 * @param {number} suggestionId Suggestion ID
	 * @returns {Promise} Application response
	 */
	async applySuggestion(postId, suggestionId) {
		return this.request(`/posts/${postId}/apply-suggestion`, {
			method: 'POST',
			body: JSON.stringify({ suggestion_id: suggestionId }),
		});
	}

	// Dashboard Methods

	/**
	 * Get dashboard overview
	 * 
	 * @param {Object} filters Filter parameters
	 * @returns {Promise} Dashboard data
	 */
	async getDashboardOverview(filters = {}) {
		return this.request('/dashboard/overview', {
			method: 'POST',
			body: JSON.stringify(filters),
		});
	}

	// Utility Methods

	/**
	 * Health check
	 * 
	 * @returns {Promise} Health status
	 */
	async healthCheck() {
		return this.request('/health');
	}

	/**
	 * Get API documentation
	 * 
	 * @returns {Promise} API documentation
	 */
	async getDocumentation() {
		return this.request('/docs');
	}
}

// Create and export a singleton instance
export const mockDataAPI = new MockDataAPI();

// Export default for convenience
export default mockDataAPI;
