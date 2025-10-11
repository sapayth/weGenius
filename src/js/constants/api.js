/**
 * API Constants for WeGenius Plugin
 * Centralized endpoint configuration
 * 
 * @package WeGenius
 * @since 1.0.0
 */

export const API_CONFIG = {
    // Base URLs
    BASE_URL: 'https://wegenius.fahmidsroadmap.com',
    
    // API Endpoints
    ENDPOINTS: {
        // Articles
        ARTICLES: {
            SUBMIT: 'api/ai/articles/submit',
            ANALYSES: 'api/ai/articles/analyses',
            ANALYSES_BY_POST: 'api/ai/articles/analyses_by_post_id',
            HISTORY: 'api/ai/articles',
        },
        
        // Analysis
        ANALYSIS: {
            STATUS: 'api/ai/articles/analyses',
            RESULTS: 'results',
            RETRY: 'api/ai/articles/analyses',
        },
        
        // Suggestions
        SUGGESTIONS: {
            GET: 'api/ai/suggestions/analysis',
            DETAIL: 'api/ai/suggestions',
            APPROVE: 'api/ai/suggestions/approve',
            REJECT: 'api/ai/suggestions/reject',
            IMPLEMENT: 'api/ai/suggestions/implement',
            EXPORT: 'api/ai/suggestions/analysis',
            GENERATE_IMAGE: 'api/ai/suggestions',
            IMAGE_STATUS: 'api/ai/suggestions',
        },
        
        // Posts
        POSTS: {
            ANALYZE: 'api/ai/posts',
            VERSIONS: 'api/ai/posts',
            COMPARE: 'api/ai/posts',
            APPLY_SUGGESTION: 'api/ai/posts',
        },
        
        // Keywords
        KEYWORDS: {
            SUGGESTIONS: 'api/ai/keywords/suggestions',
            RELATED: 'api/ai/keywords/related',
            ANALYZE: 'api/ai/keywords/analyze',
            BATCH_ANALYZE: 'api/ai/keywords/batch-analyze',
        },
        
        // System
        SYSTEM: {
            HEALTH: 'health',
            DOCS: 'docs',
        }
    },
    
    // Request Configuration
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
    },
    
    // Timeout settings
    TIMEOUT: 30000,
};

/**
 * Build API URL helper
 * 
 * @param {string} endpoint - The API endpoint
 * @param {Object} params - Path parameters to replace
 * @returns {string} Complete API URL
 */
export const buildApiUrl = (endpoint, params = {}) => {
    let url = `${API_CONFIG.BASE_URL}/${endpoint}`;
    
    console.log('buildApiUrl: Input endpoint:', endpoint);
    console.log('buildApiUrl: Input params:', params);
    console.log('buildApiUrl: Initial URL:', url);
    
    // Replace path parameters like {postId}, {analysisId}, etc.
    Object.keys(params).forEach(key => {
        url = url.replace(`{${key}}`, params[key]);
    });
    
    console.log('buildApiUrl: After path parameter replacement:', url);
    
    // Add query parameters if any remain after path parameter replacement
    const queryParams = Object.keys(params).filter(key => !url.includes(`{${key}}`));
    console.log('buildApiUrl: Query params to add:', queryParams);
    
    if (queryParams.length > 0) {
        const queryString = queryParams
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
        url += `?${queryString}`;
        console.log('buildApiUrl: Final URL with query params:', url);
    }
    
    console.log('buildApiUrl: Final URL:', url);
    return url;
};

/**
 * Get headers with API key
 * 
 * @param {string} apiKey - Optional API key, falls back to window.wegeniusAdmin.apiKey
 * @returns {Object} Headers object
 */
export const getApiHeaders = (apiKey) => {
    return {
        ...API_CONFIG.DEFAULT_HEADERS,
        'X-API-Key': apiKey || window.wegeniusAdmin?.apiKey || '',
    };
};

/**
 * Pre-built endpoint functions
 * All functions return complete URLs ready for use
 */
export const API_ENDPOINTS = {
    // Article endpoints
    submitArticle: () => buildApiUrl(API_CONFIG.ENDPOINTS.ARTICLES.SUBMIT),
    
    getAnalyses: (params = {}) => {
        const endpoint = API_CONFIG.ENDPOINTS.ARTICLES.ANALYSES;
        return buildApiUrl(endpoint, params);
    },
    
    getAnalysisStatus: (analysisId) => 
        buildApiUrl(`${API_CONFIG.ENDPOINTS.ANALYSIS.STATUS}/{analysisId}/status`, { analysisId }),
    
    getAnalysisResults: (analysisId) => 
        buildApiUrl(`${API_CONFIG.ENDPOINTS.ANALYSIS.STATUS}/{analysisId}/results`, { analysisId }),
    
    getAnalysisResultsByPostId: (postId) => 
        buildApiUrl(`${API_CONFIG.ENDPOINTS.ARTICLES.ANALYSES_BY_POST}/{postId}/results`, { postId }),
    
    getAnalysisResultsByPostIdAndType: (postId, analysisType) => 
        buildApiUrl(`${API_CONFIG.ENDPOINTS.ARTICLES.ANALYSES_BY_POST}/{postId}/results/{analysisType}`, { postId, analysisType }),
    
    getArticleHistory: (postId) => 
        buildApiUrl(`${API_CONFIG.ENDPOINTS.ARTICLES.HISTORY}/{postId}/history`, { postId }),
    
    // Suggestion endpoints
    getSuggestions: (analysisId) => 
        buildApiUrl(`${API_CONFIG.ENDPOINTS.SUGGESTIONS.GET}/{analysisId}`, { analysisId }),
    
    getSuggestionDetail: (suggestionId) => 
        buildApiUrl(`${API_CONFIG.ENDPOINTS.SUGGESTIONS.DETAIL}/{suggestionId}`, { suggestionId }),
    
    approveSuggestions: () => buildApiUrl(API_CONFIG.ENDPOINTS.SUGGESTIONS.APPROVE),
    
    rejectSuggestions: () => buildApiUrl(API_CONFIG.ENDPOINTS.SUGGESTIONS.REJECT),
    
    implementSuggestions: () => buildApiUrl(API_CONFIG.ENDPOINTS.SUGGESTIONS.IMPLEMENT),
    
    exportSuggestions: (analysisId) => 
        buildApiUrl(`${API_CONFIG.ENDPOINTS.SUGGESTIONS.EXPORT}/{analysisId}/export`, { analysisId }),
    
    toggleImageGeneration: (suggestionId) => 
        buildApiUrl(`${API_CONFIG.ENDPOINTS.SUGGESTIONS.GENERATE_IMAGE}/{suggestionId}/generate-image`, { suggestionId }),
    
    getImageStatus: (suggestionId) => 
        buildApiUrl(`${API_CONFIG.ENDPOINTS.SUGGESTIONS.IMAGE_STATUS}/{suggestionId}/image-status`, { suggestionId }),
    
    // Post endpoints
    analyzePost: (postId) => 
        buildApiUrl(`${API_CONFIG.ENDPOINTS.POSTS.ANALYZE}/{postId}/analyze`, { postId }),
    
    getPostAnalyses: (postId) => 
        buildApiUrl(`${API_CONFIG.ENDPOINTS.POSTS.ANALYZE}/{postId}/analyses`, { postId }),
    
    applySuggestion: (postId) => 
        buildApiUrl(`${API_CONFIG.ENDPOINTS.POSTS.APPLY_SUGGESTION}/{postId}/apply-suggestion`, { postId }),
    
    getVersions: (postId) => 
        buildApiUrl(`${API_CONFIG.ENDPOINTS.POSTS.VERSIONS}/{postId}/versions`, { postId }),
    
    getVersion: (postId, versionId) => 
        buildApiUrl(`${API_CONFIG.ENDPOINTS.POSTS.VERSIONS}/{postId}/versions/{versionId}`, { postId, versionId }),
    
    compareVersions: (postId) => 
        buildApiUrl(`${API_CONFIG.ENDPOINTS.POSTS.COMPARE}/{postId}/versions/compare`, { postId }),
    
    // Keyword endpoints
    getKeywordSuggestions: () => buildApiUrl(API_CONFIG.ENDPOINTS.KEYWORDS.SUGGESTIONS),
    
    getRelatedKeywords: () => buildApiUrl(API_CONFIG.ENDPOINTS.KEYWORDS.RELATED),
    
    analyzeKeyword: () => buildApiUrl(API_CONFIG.ENDPOINTS.KEYWORDS.ANALYZE),
    
    batchAnalyzeKeywords: () => buildApiUrl(API_CONFIG.ENDPOINTS.KEYWORDS.BATCH_ANALYZE),
    
    // System endpoints
    healthCheck: () => buildApiUrl(API_CONFIG.ENDPOINTS.SYSTEM.HEALTH),
    
    getDocumentation: () => buildApiUrl(API_CONFIG.ENDPOINTS.SYSTEM.DOCS),
};

/**
 * API Request Helper
 * Centralized function for making API requests
 * 
 * @param {string} endpoint - The endpoint function from API_ENDPOINTS
 * @param {Object} options - Fetch options
 * @param {string} apiKey - Optional API key
 * @returns {Promise} Fetch response
 */
export const apiRequest = async (endpoint, options = {}, apiKey = null) => {
    const url = typeof endpoint === 'function' ? endpoint() : endpoint;
    const headers = getApiHeaders(apiKey);
    
    const defaultOptions = {
        method: 'GET',
        headers,
        timeout: API_CONFIG.TIMEOUT,
    };
    
    const requestOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
    };
    
    try {
        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

/**
 * Legacy endpoint support
 * For backward compatibility with existing code
 */
export const LEGACY_ENDPOINTS = {
    // Legacy article submission
    submitArticleLegacy: () => buildApiUrl('api/ai/article/submit'),
};
