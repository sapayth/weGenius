<?php
/**
 * External API Client
 *
 * Handles communication with the external WeGenius API.
 *
 * @package WeGenius
 * @since 1.0.0
 */

namespace WeGenius\API;

/**
 * External API Client Class
 *
 * @since 1.0.0
 */
class ExternalApiClient {
    /**
     * External API base URL.
     *
     * @var string
     */
    public $api_base_url;

    /**
     * API key for authentication.
     *
     * @var string
     */
    public $api_key;

    /**
     * Constructor.
     */
    public function __construct() {
        $settings = get_option( 'wegenius_settings', [] );
        $this->api_base_url = $settings['api']['apiEndpoint'] ?? '';
        $this->api_key = $settings['api']['apiKey'] ?? '';
    }

    /**
     * Check if API is properly configured.
     *
     * @return bool
     */
    public function is_configured() {
        return ! empty( $this->api_base_url ) && ! empty( $this->api_key );
    }

    /**
     * Make HTTP request to external API.
     *
     * @param string $endpoint API endpoint.
     * @param array  $data Request data.
     * @param string $method HTTP method.
     *
     * @return array|\WP_Error
     */
    private function make_request( $endpoint, $data = [], $method = 'GET' ) {
        // Check if API is configured
        if ( ! $this->is_configured() ) {
            return new \WP_Error(
                'api_not_configured',
                __( 'External API not configured. Please set API endpoint and key in settings.', 'wegenius' ),
                [ 'status' => 400 ]
            );
        }

        $url = rtrim( $this->api_base_url, '/' ) . '/' . ltrim( $endpoint, '/' );
        
        $args = [
            'method'  => $method,
            'headers' => [
                'Content-Type' => 'application/json',
                'X-API-Key'    => $this->api_key,
            ],
            'timeout' => 30,
        ];

        if ( ! empty( $data ) && in_array( $method, [ 'POST', 'PUT', 'PATCH' ], true ) ) {
            $args['body'] = wp_json_encode( $data );
        } elseif ( ! empty( $data ) && $method === 'GET' ) {
            $url = add_query_arg( $data, $url );
        }

        $response = wp_remote_request( $url, $args );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $status_code = wp_remote_retrieve_response_code( $response );
        $body = wp_remote_retrieve_body( $response );

        if ( $status_code >= 400 ) {
            return new \WP_Error(
                'api_error',
                sprintf( 'API request failed with status %d: %s', $status_code, $body ),
                [ 'status' => $status_code ]
            );
        }

        $decoded = json_decode( $body, true );
        if ( json_last_error() !== JSON_ERROR_NONE ) {
            return new \WP_Error(
                'json_decode_error',
                'Failed to decode API response: ' . json_last_error_msg()
            );
        }

        return $decoded;
    }

    /**
     * Get all analyses.
     *
     * @param array $params Query parameters.
     *
     * @return array|\WP_Error
     */
    public function get_analyses( $params = [] ) {
        return $this->make_request( 'api/ai/articles/analyses', $params, 'GET' );
    }

    /**
     * Get analysis status.
     *
     * @param int $analysis_id Analysis ID.
     *
     * @return array|\WP_Error
     */
    public function get_analysis_status( $analysis_id ) {
        return $this->make_request( "api/ai/articles/analyses/{$analysis_id}/status", [], 'GET' );
    }

    /**
     * Get analysis results.
     *
     * @param int $analysis_id Analysis ID.
     *
     * @return array|\WP_Error
     */
    public function get_analysis_results( $analysis_id ) {
        return $this->make_request( "api/ai/articles/analyses/{$analysis_id}/results", [], 'GET' );
    }

    /**
     * Submit article for analysis.
     *
     * @param array $article_data Article data.
     *
     * @return array|\WP_Error
     */
    public function submit_article( $article_data ) {
        return $this->make_request( 'api/ai/articles/submit', $article_data, 'POST' );
    }

    /**
     * Get article history.
     *
     * @param int $post_id WordPress post ID.
     *
     * @return array|\WP_Error
     */
    public function get_article_history( $post_id ) {
        return $this->make_request( "api/ai/articles/{$post_id}/history", [], 'GET' );
    }

    /**
     * Get suggestions for analysis.
     *
     * @param int $analysis_id Analysis ID.
     *
     * @return array|\WP_Error
     */
    public function get_suggestions( $analysis_id ) {
        return $this->make_request( "api/ai/suggestions/analysis/{$analysis_id}", [], 'GET' );
    }

    /**
     * Approve suggestions.
     *
     * @param array $suggestion_ids Array of suggestion IDs.
     *
     * @return array|\WP_Error
     */
    public function approve_suggestions( $suggestion_ids ) {
        return $this->make_request( 'api/ai/suggestions/approve', [ 'suggestion_ids' => $suggestion_ids ], 'POST' );
    }

    /**
     * Reject suggestions.
     *
     * @param array $suggestion_ids Array of suggestion IDs.
     * @param string $reason Rejection reason.
     *
     * @return array|\WP_Error
     */
    public function reject_suggestions( $suggestion_ids, $reason = '' ) {
        $data = [ 'suggestion_ids' => $suggestion_ids ];
        if ( ! empty( $reason ) ) {
            $data['reason'] = $reason;
        }
        return $this->make_request( 'api/ai/suggestions/reject', $data, 'POST' );
    }

    /**
     * Mark suggestions as implemented.
     *
     * @param array $suggestion_ids Array of suggestion IDs.
     *
     * @return array|\WP_Error
     */
    public function implement_suggestions( $suggestion_ids ) {
        return $this->make_request( 'api/ai/suggestions/implement', [ 'suggestion_ids' => $suggestion_ids ], 'POST' );
    }

    /**
     * Get versions for a post.
     *
     * @param int $post_id WordPress post ID.
     *
     * @return array|\WP_Error
     */
    public function get_versions( $post_id ) {
        return $this->make_request( "api/ai/posts/{$post_id}/versions", [], 'GET' );
    }

    /**
     * Get specific version.
     *
     * @param int $post_id WordPress post ID.
     * @param int $version_id Version ID.
     *
     * @return array|\WP_Error
     */
    public function get_version( $post_id, $version_id ) {
        return $this->make_request( "api/ai/posts/{$post_id}/versions/{$version_id}", [], 'GET' );
    }

    /**
     * Compare versions.
     *
     * @param int $post_id WordPress post ID.
     * @param array $version_data Version comparison data.
     *
     * @return array|\WP_Error
     */
    public function compare_versions( $post_id, $version_data ) {
        return $this->make_request( "api/ai/posts/{$post_id}/versions/compare", $version_data, 'POST' );
    }

    /**
     * Test API connection.
     *
     * @return array|\WP_Error
     */
    public function test_connection() {
        if ( ! $this->is_configured() ) {
            return new \WP_Error(
                'api_not_configured',
                __( 'External API not configured. Please set API endpoint and key in settings.', 'wegenius' ),
                [ 'status' => 400 ]
            );
        }

        // Try a simple health check or ping endpoint
        $result = $this->make_request( 'health', [], 'GET' );
        
        if ( is_wp_error( $result ) ) {
            return $result;
        }

        return [
            'success' => true,
            'message' => __( 'API connection successful!', 'wegenius' ),
        ];
    }
}
