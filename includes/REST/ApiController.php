<?php
/**
 * REST API Controller
 *
 * @since   1.0.0
 * @package WeGenius
 */

namespace WeGenius\REST;

/**
 * REST API Controller Class
 *
 * @since 1.0.0
 */
class ApiController {
    /**
     * Namespace for the REST API.
     *
     * @var string
     */
    const NAMESPACE = 'wegenius/v1';

    /**
     * Analysis job handler instance.
     *
     * @var \WeGenius\Analysis\AnalysisJobHandler
     */
    private $job_handler;

    /**
     * Constructor.
     */
    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    /**
     * Register REST API routes.
     *
     * @return void
     */
    public function register_routes()
    : void {
        // Article Management endpoints (matching external API)
        register_rest_route(
            self::NAMESPACE,
            '/articles/submit',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'submit_article' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/articles/analyses',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_analyses' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/articles/analyses/(?P<analysis_id>\d+)/status',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_analysis_status' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/articles/analyses/(?P<analysis_id>\d+)/results',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_analysis_results' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/articles/(?P<post_id>\d+)/history',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_article_history' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        // Suggestions endpoints
        register_rest_route(
            self::NAMESPACE,
            '/suggestions/analysis/(?P<analysis_id>\d+)',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_suggestions' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/suggestions/(?P<suggestion_id>\d+)',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_suggestion_details' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/suggestions/approve',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'approve_suggestions' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/suggestions/reject',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'reject_suggestions' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/suggestions/implement',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'implement_suggestions' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        // Content Versions endpoints
        register_rest_route(
            self::NAMESPACE,
            '/posts/(?P<post_id>\d+)/versions',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_versions' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/posts/(?P<post_id>\d+)/versions/(?P<version_id>\d+)',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_version' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/posts/(?P<post_id>\d+)/versions/compare',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'compare_versions' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        // Content Analysis endpoints
        register_rest_route(
            self::NAMESPACE,
            '/posts/(?P<post_id>\d+)/analyze',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'analyze_post' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/posts/(?P<post_id>\d+)/analyses',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_post_analyses' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/analyses/(?P<analysis_id>\d+)',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_analysis' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        // Apply Suggestions endpoint
        register_rest_route(
            self::NAMESPACE,
            '/posts/(?P<post_id>\d+)/apply-suggestion',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'apply_suggestion' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        // Settings endpoints (keeping existing)
        register_rest_route(
            self::NAMESPACE,
            '/settings',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_settings' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/settings',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'update_settings' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/settings/test-api',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'test_api_connection' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        // Analysis endpoints for posts page integration
        register_rest_route(
            self::NAMESPACE,
            '/analysis/start',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'start_analysis' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        register_rest_route(
            self::NAMESPACE,
            '/analysis/restart',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'restart_analysis' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        // Dashboard endpoints (keeping existing)
        register_rest_route(
            self::NAMESPACE,
            '/dashboard/overview',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_dashboard_overview' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        // Status polling endpoint
        register_rest_route(
            self::NAMESPACE,
            '/analysis/status/(?P<post_id>\d+)',
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_analysis_status_for_post' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
        // Scan endpoint for editor integration
        register_rest_route(
            self::NAMESPACE,
            '/scan',
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'scan_article' ],
                'permission_callback' => [ $this, 'check_permissions' ],
            ]
        );
    }

    /**
     * Check if user has permission to access the API.
     *
     * @param \WP_REST_Request $request The request object.
     *
     * @return bool
     */
    public function check_permissions( $request )
    : bool {
        // Check if user is logged in
        if ( ! is_user_logged_in() ) {
            return false;
        }
        // Check if user has manage_options capability
        if ( ! current_user_can( 'manage_options' ) ) {
            return false;
        }
        // Verify nonce for authenticated requests
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( $nonce && ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return false;
        }

        return true;
    }

    /**
     * Submit article for analysis (matching external API format).
     *
     * @param \WP_REST_Request $request The request object.
     *
     * @return \WP_REST_Response|\WP_Error
     */
    public function submit_article( $request ) {
        $data = $request->get_json_params();
        // Validate required fields
        $required_fields = [ 'wp_post_id', 'title', 'content' ];
        foreach ( $required_fields as $field ) {
            if ( empty( $data[ $field ] ) ) {
                return new \WP_Error(
                    'missing_required_field',
                    sprintf( __( 'Missing required field: %s', 'wegenius' ), $field ),
                    [ 'status' => 400 ]
                );
            }
        }
        // Create article record
        $article_id = $this->create_article_record( $data );
        // Submit to external API
        $external_response = $this->submit_to_external_api( $data );
        if ( is_wp_error( $external_response ) ) {
            return $external_response;
        }
        // Create analysis record
        $analysis_id = $this->create_analysis_record( $article_id, $data['action_type'] ?? 'improve' );

        return rest_ensure_response(
            [
                'success'              => true,
                'message'              => __( 'Article submitted for analysis successfully.', 'wegenius' ),
                'article_id'           => $article_id,
                'analysis_id'          => $analysis_id,
                'external_analysis_id' => $external_response['analysis_id'] ?? null,
            ]
        );
    }

    /**
     * Get all analyses.
     *
     * @param \WP_REST_Request $request The request object.
     *
     * @return \WP_REST_Response
     */
    public function get_analyses( $request ) {
        $status = $request->get_param( 'status' );
        $limit  = $request->get_param( 'limit' ) ?: 10;
        global $wpdb;
        $table_name = $wpdb->prefix . 'wegenius_analyses';
        $where_clause = '';
        $params       = [];
        if ( $status ) {
            $where_clause = 'WHERE status = %s';
            $params[]     = $status;
        }
        $query    = "SELECT * FROM $table_name $where_clause ORDER BY created_at DESC LIMIT %d";
        $params[] = $limit;
        if ( ! empty( $params ) ) {
            $results = $wpdb->get_results( $wpdb->prepare( $query, $params ) );
        } else {
            $results = $wpdb->get_results( $wpdb->prepare( $query, $limit ) );
        }

        return rest_ensure_response( $results );
    }

    /**
     * Get analysis status.
     *
     * @param \WP_REST_Request $request The request object.
     *
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_analysis_status( $request ) {
        $analysis_id = $request->get_param( 'analysis_id' );
        global $wpdb;
        $table_name = $wpdb->prefix . 'wegenius_analyses';
        $analysis = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $table_name WHERE id = %d",
                $analysis_id
            )
        );
        if ( ! $analysis ) {
            return new \WP_Error(
                'analysis_not_found',
                __( 'Analysis not found.', 'wegenius' ),
                [ 'status' => 404 ]
            );
        }

        return rest_ensure_response(
            [
                'id'         => $analysis->id,
                'status'     => $analysis->status,
                'progress'   => $this->get_analysis_progress( $analysis ),
                'created_at' => $analysis->created_at,
                'updated_at' => $analysis->updated_at,
            ]
        );
    }

    /**
     * Get analysis results.
     *
     * @param \WP_REST_Request $request The request object.
     *
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_analysis_results( $request ) {
        $analysis_id = $request->get_param( 'analysis_id' );
        global $wpdb;
        $table_name = $wpdb->prefix . 'wegenius_analyses';
        $analysis = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $table_name WHERE id = %d",
                $analysis_id
            )
        );
        if ( ! $analysis ) {
            return new \WP_Error(
                'analysis_not_found',
                __( 'Analysis not found.', 'wegenius' ),
                [ 'status' => 404 ]
            );
        }
        $results = [
            'id'          => $analysis->id,
            'status'      => $analysis->status,
            'results'     => $analysis->results ? json_decode( $analysis->results, true ) : null,
            'scores'      => $analysis->scores ? json_decode( $analysis->scores, true ) : null,
            'insights'    => $analysis->insights ? json_decode( $analysis->insights, true ) : null,
            'token_usage' => $analysis->token_usage,
            'created_at'  => $analysis->created_at,
            'updated_at'  => $analysis->updated_at,
        ];

        return rest_ensure_response( $results );
    }

    /**
     * Get article history.
     *
     * @param \WP_REST_Request $request The request object.
     *
     * @return \WP_REST_Response
     */
    public function get_article_history( $request ) {
        $post_id = $request->get_param( 'post_id' );
        global $wpdb;
        $articles_table = $wpdb->prefix . 'wegenius_articles';
        $analyses_table = $wpdb->prefix . 'wegenius_analyses';
        // Get article
        $article = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $articles_table WHERE wp_post_id = %d",
                $post_id
            )
        );
        if ( ! $article ) {
            return rest_ensure_response( [] );
        }
        // Get all analyses for this article
        $analyses = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $analyses_table WHERE article_id = %d ORDER BY created_at DESC",
                $article->id
            )
        );
        // Get all versions for this article
        $versions_table = $wpdb->prefix . 'wegenius_versions';
        $versions       = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $versions_table WHERE article_id = %d ORDER BY version_number DESC",
                $article->id
            )
        );

        return rest_ensure_response(
            [
                'article'  => $article,
                'analyses' => $analyses,
                'versions' => $versions,
            ]
        );
    }

    /**
     * Start analysis for a post.
     *
     * @param \WP_REST_Request $request The request object.
     *
     * @return \WP_REST_Response|\WP_Error
     */
    public function start_analysis( $request ) {
        $data           = $request->get_json_params();
        $post_id        = $data['postId'] ?? null;
        $analysis_types = $data['analysisTypes'] ?? [];
        // Validate required fields
        if ( ! $post_id ) {
            return new \WP_Error(
                'missing_post_id',
                __( 'Post ID is required.', 'wegenius' ),
                [ 'status' => 400 ]
            );
        }
        // Validate post exists
        $post = get_post( $post_id );
        if ( ! $post ) {
            return new \WP_Error(
                'post_not_found',
                __( 'Post not found.', 'wegenius' ),
                [ 'status' => 404 ]
            );
        }
        // Use provided analysis types or get defaults from settings
        if ( empty( $analysis_types ) ) {
            $settings       = get_option( 'wegenius_settings', [] );
            $analysis_types = $settings['analysis']['defaultAnalysisTypes'] ?? [ 'improve', 'gaps', 'ideas' ];
        }
        // Create article record if it doesn't exist
        $article_id = $this->get_or_create_article_record( $post );
        // Create analysis record
        $analysis_id = $this->create_analysis_record( $article_id, $analysis_types );
        // Schedule analysis job
        $this->schedule_analysis( $analysis_id, $post_id, $analysis_types );

        return rest_ensure_response(
            [
                'success'    => true,
                'message'    => __( 'Analysis started successfully.', 'wegenius' ),
                'analysisId' => $analysis_id,
            ]
        );
    }

    /**
     * Restart analysis for a post.
     *
     * @param \WP_REST_Request $request The request object.
     *
     * @return \WP_REST_Response|\WP_Error
     */
    public function restart_analysis( $request ) {
        $data    = $request->get_json_params();
        $post_id = $data['postId'] ?? null;
        // Validate required fields
        if ( ! $post_id ) {
            return new \WP_Error(
                'missing_post_id',
                __( 'Post ID is required.', 'wegenius' ),
                [ 'status' => 400 ]
            );
        }
        // Validate post exists
        $post = get_post( $post_id );
        if ( ! $post ) {
            return new \WP_Error(
                'post_not_found',
                __( 'Post not found.', 'wegenius' ),
                [ 'status' => 404 ]
            );
        }
        // Get default analysis types from settings
        $settings      = get_option( 'wegenius_settings', [] );
        $default_types = $settings['analysis']['defaultAnalysisTypes'] ?? [ 'improve', 'gaps', 'ideas' ];
        // Create or get article record
        $article_id = $this->get_or_create_article_record( $post );
        // Create new analysis record
        $analysis_id = $this->create_analysis_record( $article_id, $default_types );
        // Schedule analysis job
        $this->schedule_analysis( $analysis_id, $post_id, $default_types );

        return rest_ensure_response(
            [
                'success'    => true,
                'message'    => __( 'Analysis restarted successfully.', 'wegenius' ),
                'analysisId' => $analysis_id,
            ]
        );
    }

    /**
     * Get plugin settings.
     *
     * @param \WP_REST_Request $request The request object.
     *
     * @return \WP_REST_Response
     */
    public function get_settings( $request ) {
        $settings = get_option( 'wegenius_settings', [] );
        // Set default values if not set
        $default_settings = [
            'api'               => [
                'apiEndpoint'   => '',
                'apiKey'        => '',
                'timeout'       => 30,
                'rateLimit'     => 10,
                'retryAttempts' => 3,
            ],
            'analysis'          => [
                'defaultAnalysisTypes' => [ 'improve', 'gaps', 'ideas' ],
                'autoAnalyze'          => false,
                'reanalysisFrequency'  => 'never',
                'minContentLength'     => 100,
                'contentTypes'         => [ 'post' ],
                'categories'           => [],
            ],
            'contentGeneration' => [
                'writingTones'           => [
                    'primary'   => 'professional',
                    'secondary' => 'authoritative',
                ],
                'targetWordCount'        => 1000,
                'targetAudience'         => 'Parents',
                'includeFeaturedImage'   => false,
                'location'               => 'Texas, USA',
                'includeTableOfContents' => false,
                'generateShortVideo'     => false,
                'videoStyle'             => 'professional',
                'videoLength'            => 60,
                'includeVoiceover'       => false,
                'voiceGender'            => 'male',
                'addBackgroundMusic'     => false,
                'musicMood'              => 'calm',
            ],
            'performance'       => [
                'cacheResults' => true,
                'cacheExpiry'  => 7, // days
                'batchSize'    => 10,
            ],
            'permissions'       => [
                'allowedRoles'     => [ 'administrator', 'editor' ],
                'allowBulkActions' => true,
            ],
        ];
        $settings = wp_parse_args( $settings, $default_settings );

        return rest_ensure_response( $settings );
    }

    /**
     * Update plugin settings.
     *
     * @param \WP_REST_Request $request The request object.
     *
     * @return \WP_REST_Response|\WP_Error
     */
    public function update_settings( $request ) {
        $settings = $request->get_json_params();
        // Sanitize and validate settings
        $sanitized_settings = $this->sanitize_settings( $settings );
        // Save settings
        $updated = update_option( 'wegenius_settings', $sanitized_settings );
        if ( $updated ) {
            return rest_ensure_response(
                [
                    'success' => true,
                    'message' => __( 'Settings saved successfully.', 'wegenius' ),
                ]
            );
        } else {
            return new \WP_Error(
                'settings_update_failed',
                __( 'Failed to save settings.', 'wegenius' ),
                [ 'status' => 500 ]
            );
        }
    }

    /**
     * Test API connection.
     *
     * @param \WP_REST_Request $request The request object.
     *
     * @return \WP_REST_Response|\WP_Error
     */
    public function test_api_connection( $request ) {
        $params       = $request->get_json_params();
        $api_endpoint = sanitize_url( $params['apiEndpoint'] ?? '' );
        $api_key      = sanitize_text_field( $params['apiKey'] ?? '' );
        if ( empty( $api_endpoint ) || empty( $api_key ) ) {
            return new \WP_Error(
                'missing_credentials',
                __( 'API endpoint and key are required.', 'wegenius' ),
                [ 'status' => 400 ]
            );
        }
        // Test API connection (placeholder implementation)
        $test_result = $this->test_api_endpoint( $api_endpoint, $api_key );
        if ( $test_result['success'] ) {
            return rest_ensure_response(
                [
                    'success' => true,
                    'message' => __( 'API connection successful!', 'wegenius' ),
                ]
            );
        } else {
            return new \WP_Error(
                'api_connection_failed',
                $test_result['message'],
                [ 'status' => 400 ]
            );
        }
    }

    /**
     * Get dashboard overview data.
     *
     * @param \WP_REST_Request $request The request object.
     *
     * @return \WP_REST_Response
     */
    public function get_dashboard_overview( $request ) {
        // Get query parameters for filters
        $filters = [
            'postType' => $request->get_param( 'postType' ) ?: 'post',
            'category' => $request->get_param( 'category' ) ?: 'all',
            'dateRange' => $request->get_param( 'dateRange' ) ?: '30',
        ];
        
        // Get analysis statistics
        $overview = $this->get_analysis_statistics( $filters );
        $this_week = $this->get_this_week_data( $filters );
        $recent_analyses = $this->get_recent_analyses( $filters );
        $idea_inbox = $this->get_idea_inbox( $filters );

        return rest_ensure_response(
            [
                'overview' => $overview,
                'thisWeek' => $this_week,
                'recentAnalyses' => $recent_analyses,
                'ideaInbox' => $idea_inbox,
            ]
        );
    }

    /**
     * Create article record in database.
     *
     * @param array $data Article data.
     *
     * @return int Article ID.
     */
    private function create_article_record( $data ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'wegenius_articles';
        $wpdb->insert(
            $table_name,
            [
                'wp_post_id'     => $data['wp_post_id'],
                'title'          => $data['title'],
                'content'        => $data['content'],
                'permalink'      => $data['permalink'] ?? '',
                'featured_image' => $data['featured_image'] ?? '',
                'status'         => $data['status'] ?? 'published',
                'published_at'   => $data['published_at'] ?? current_time( 'mysql' ),
                'author_name'    => $data['author_name'] ?? '',
                'action_type'    => $data['action_type'] ?? 'improve',
                'meta_data'      => wp_json_encode( $data['meta_data'] ?? [] ),
                'created_at'     => current_time( 'mysql' ),
                'updated_at'     => current_time( 'mysql' ),
            ],
            [ '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s' ]
        );

        return $wpdb->insert_id;
    }

    /**
     * Create analysis record in database.
     *
     * @param int    $article_id    Article ID.
     * @param string $analysis_type Analysis type.
     *
     * @return int Analysis ID.
     */
    private function create_analysis_record( $article_id, $analysis_type ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'wegenius_analyses';
        $wpdb->insert(
            $table_name,
            [
                'article_id'    => $article_id,
                'analysis_type' => $analysis_type,
                'status'        => 'pending',
                'created_at'    => current_time( 'mysql' ),
                'updated_at'    => current_time( 'mysql' ),
            ],
            [ '%d', '%s', '%s', '%s', '%s' ]
        );

        return $wpdb->insert_id;
    }

    /**
     * Get or create article record for a post.
     *
     * @param \WP_Post $post WordPress post object.
     *
     * @return int Article ID.
     */
    private function get_or_create_article_record( $post ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'wegenius_articles';
        // Check if article already exists
        $existing = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT id FROM $table_name WHERE wp_post_id = %d",
                $post->ID
            )
        );
        if ( $existing ) {
            return $existing->id;
        }
        // Create new article record
        $wpdb->insert(
            $table_name,
            [
                'wp_post_id'     => $post->ID,
                'title'          => $post->post_title,
                'content'        => $post->post_content,
                'permalink'      => get_permalink( $post->ID ),
                'featured_image' => get_the_post_thumbnail_url( $post->ID ),
                'status'         => $post->post_status,
                'published_at'   => $post->post_date,
                'author_name'    => get_the_author_meta( 'display_name', $post->post_author ),
                'action_type'    => 'improve',
                'meta_data'      => wp_json_encode( [] ),
                'created_at'     => current_time( 'mysql' ),
                'updated_at'     => current_time( 'mysql' ),
            ],
            [ '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s' ]
        );

        return $wpdb->insert_id;
    }

    /**
     * Submit data to external WeGenius API.
     *
     * @param array $data Article data.
     *
     * @return array|\WP_Error API response.
     */
    private function submit_to_external_api( $data ) {
        $settings     = get_option( 'wegenius_settings', [] );
        $api_endpoint = $settings['api']['apiEndpoint'] ?? '';
        $api_key      = $settings['api']['apiKey'] ?? '';
        if ( empty( $api_endpoint ) || empty( $api_key ) ) {
            return new \WP_Error(
                'api_not_configured',
                __( 'External API not configured.', 'wegenius' ),
                [ 'status' => 400 ]
            );
        }
        // Prepare data for external API
        $api_data = [
            'wp_post_id'     => $data['wp_post_id'],
            'title'          => $data['title'],
            'content'        => $data['content'],
            'permalink'      => $data['permalink'] ?? '',
            'featured_image' => $data['featured_image'] ?? '',
            'status'         => $data['status'] ?? 'published',
            'published_at'   => $data['published_at'] ?? current_time( 'c' ),
            'author_name'    => $data['author_name'] ?? '',
            'action_type'    => $data['action_type'] ?? 'improve',
            'meta_data'      => $data['meta_data'] ?? [],
        ];
        // Make API request
        $response = wp_remote_post(
            $api_endpoint . '/articles/submit', [
            'headers' => [
                'Content-Type' => 'application/json',
                'X-API-Key'    => $api_key,
            ],
            'body'    => wp_json_encode( $api_data ),
            'timeout' => 30,
        ]
        );
        if ( is_wp_error( $response ) ) {
            return $response;
        }
        $body        = wp_remote_retrieve_body( $response );
        $status_code = wp_remote_retrieve_response_code( $response );
        if ( $status_code !== 200 ) {
            return new \WP_Error(
                'api_request_failed',
                sprintf( __( 'API request failed with status %d', 'wegenius' ), $status_code ),
                [ 'status' => $status_code ]
            );
        }

        return json_decode( $body, true );
    }

    /**
     * Get analysis progress.
     *
     * @param object $analysis Analysis object.
     *
     * @return array Progress data.
     */
    private function get_analysis_progress( $analysis ) {
        // This would be implemented based on the actual analysis progress
        // For now, return a simple progress indicator
        $progress_map = [
            'pending'    => 0,
            'processing' => 50,
            'completed'  => 100,
            'failed'     => 0,
        ];

        return [
            'percentage' => $progress_map[ $analysis->status ] ?? 0,
            'status'     => $analysis->status,
        ];
    }

    /**
     * Schedule analysis job.
     *
     * @param int   $analysis_id    Analysis ID.
     * @param int   $post_id        Post ID.
     * @param array $analysis_types Analysis types.
     *
     * @return void
     */
    private function schedule_analysis( $analysis_id, $post_id, $analysis_types ) {
        // Check if Action Scheduler is available.
        if ( ! function_exists( 'as_schedule_single_action' ) ) {
            // Update status to failed with error message.
            global $wpdb;
            $table_name = $wpdb->prefix . 'wegenius_analyses';
            $wpdb->update(
                $table_name,
                [
                    'status'  => 'failed',
                    'results' => wp_json_encode(
                        [
                            'error'      => 'Action Scheduler is required but not available. Please install Action Scheduler plugin or WooCommerce.',
                            'error_code' => 'action_scheduler_required',
                        ]
                    ),
                ],
                [ 'id' => $analysis_id ],
                [ '%s', '%s' ],
                [ '%d' ]
            );
            update_post_meta( $post_id, '_wegenius_analysis_status', 'failed' );
            error_log(
                'WeGenius: Action Scheduler is required but not available. Analysis failed for post ' . $post_id
            );

            return;
        }
        // Initialize the job handler if not already done.
        if ( ! isset( $this->job_handler ) ) {
            $this->job_handler = new \WeGenius\Analysis\AnalysisJobHandler();
        }
        // Schedule the analysis job.
        $action_id = $this->job_handler->schedule_analysis( $analysis_id, $post_id, $analysis_types );
        if ( $action_id ) {
            // Update post meta to track the job.
            update_post_meta( $post_id, '_wegenius_analysis_job_id', $action_id );
            update_post_meta( $post_id, '_wegenius_analysis_status', 'scheduled' );
        } else {
            // Mark as failed if scheduling failed.
            global $wpdb;
            $table_name = $wpdb->prefix . 'wegenius_analyses';
            $wpdb->update(
                $table_name,
                [
                    'status'  => 'failed',
                    'results' => wp_json_encode(
                        [
                            'error'      => 'Failed to schedule analysis job. Action Scheduler may not be properly configured.',
                            'error_code' => 'scheduling_failed',
                        ]
                    ),
                ],
                [ 'id' => $analysis_id ],
                [ '%s', '%s' ],
                [ '%d' ]
            );
            update_post_meta( $post_id, '_wegenius_analysis_status', 'failed' );
            error_log( 'WeGenius: Failed to schedule analysis job for post ' . $post_id );
        }
    }

    /**
     * Sanitize settings data.
     *
     * @param array $settings Raw settings data.
     *
     * @return array Sanitized settings.
     */
    private function sanitize_settings( $settings ) {
        $sanitized = [];
        // Sanitize API settings
        if ( isset( $settings['api'] ) ) {
            $sanitized['api'] = [
                'apiEndpoint'   => sanitize_url( $settings['api']['apiEndpoint'] ?? '' ),
                'apiKey'        => sanitize_text_field( $settings['api']['apiKey'] ?? '' ),
                'timeout'       => absint( $settings['api']['timeout'] ?? 30 ),
                'rateLimit'     => absint( $settings['api']['rateLimit'] ?? 10 ),
                'retryAttempts' => absint( $settings['api']['retryAttempts'] ?? 3 ),
            ];
        }
        // Sanitize analysis settings
        if ( isset( $settings['analysis'] ) ) {
            $sanitized['analysis'] = [
                'defaultAnalysisTypes' => array_map(
                    'sanitize_text_field', $settings['analysis']['defaultAnalysisTypes'] ?? []
                ),
                'autoAnalyze'          => (bool) ( $settings['analysis']['autoAnalyze'] ?? false ),
                'reanalysisFrequency'  => sanitize_text_field(
                    $settings['analysis']['reanalysisFrequency'] ?? 'never'
                ),
                'minContentLength'     => absint( $settings['analysis']['minContentLength'] ?? 100 ),
                'contentTypes'         => array_map(
                    'sanitize_text_field', $settings['analysis']['contentTypes'] ?? []
                ),
                'categories'           => array_map( 'absint', $settings['analysis']['categories'] ?? [] ),
            ];
        }
        // Sanitize content generation settings
        if ( isset( $settings['contentGeneration'] ) ) {
            $sanitized['contentGeneration'] = [
                'writingTones'           => [
                    'primary'   => sanitize_text_field(
                        $settings['contentGeneration']['writingTones']['primary'] ?? 'professional'
                    ),
                    'secondary' => sanitize_text_field(
                        $settings['contentGeneration']['writingTones']['secondary'] ?? 'authoritative'
                    ),
                ],
                'targetWordCount'        => absint( $settings['contentGeneration']['targetWordCount'] ?? 1000 ),
                'targetAudience'         => sanitize_text_field(
                    $settings['contentGeneration']['targetAudience'] ?? 'Parents'
                ),
                'includeFeaturedImage'   => (bool) ( $settings['contentGeneration']['includeFeaturedImage'] ?? false ),
                'location'               => sanitize_text_field(
                    $settings['contentGeneration']['location'] ?? 'Texas, USA'
                ),
                'includeTableOfContents' => (bool) ( $settings['contentGeneration']['includeTableOfContents'] ?? false ),
                'generateShortVideo'     => (bool) ( $settings['contentGeneration']['generateShortVideo'] ?? false ),
                'videoStyle'             => sanitize_text_field(
                    $settings['contentGeneration']['videoStyle'] ?? 'professional'
                ),
                'videoLength'            => absint( $settings['contentGeneration']['videoLength'] ?? 60 ),
                'includeVoiceover'       => (bool) ( $settings['contentGeneration']['includeVoiceover'] ?? false ),
                'voiceGender'            => sanitize_text_field(
                    $settings['contentGeneration']['voiceGender'] ?? 'male'
                ),
                'addBackgroundMusic'     => (bool) ( $settings['contentGeneration']['addBackgroundMusic'] ?? false ),
                'musicMood'              => sanitize_text_field(
                    $settings['contentGeneration']['musicMood'] ?? 'calm'
                ),
            ];
        }

        return $sanitized;
    }

    /**
     * Test API endpoint connection.
     *
     * @param string $api_endpoint API endpoint URL.
     * @param string $api_key      API key.
     *
     * @return array Test result.
     */
    private function test_api_endpoint( $api_endpoint, $api_key ) {
        // Placeholder implementation
        // In a real implementation, this would make an actual API call
        return [
            'success' => true,
            'message' => __( 'API connection test successful.', 'wegenius' ),
        ];
    }

    /**
     * Get analysis statistics.
     *
     * @param array $filters Filter parameters.
     *
     * @return array Statistics data.
     */
    private function get_analysis_statistics( $filters ) {
        global $wpdb;
        $analyses_table = $wpdb->prefix . 'wegenius_analyses';
        
        // Get counts by status
        $analyzed = $wpdb->get_var(
            "SELECT COUNT(*) FROM $analyses_table WHERE status = 'completed'"
        );
        
        $generated = $wpdb->get_var(
            "SELECT COUNT(*) FROM $analyses_table WHERE status = 'completed' AND analysis_type IN ('improve', 'content_gap', 'new_article')"
        );
        
        $suggestions = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->prefix}wegenius_suggestions WHERE status = 'approved'"
        );
        
        return [
            'analyzed' => (int) $analyzed,
            'generated' => (int) $generated,
            'suggestions' => (int) $suggestions,
        ];
    }

    /**
     * Get analysis types data.
     *
     * @param array $filters Filter parameters.
     *
     * @return array Analysis types data.
     */
    private function get_analysis_types_data( $filters ) {
        // Placeholder implementation
        return [
            'improve' => 0,
            'gaps'    => 0,
            'ideas'   => 0,
            'trends'  => 0,
        ];
    }

    /**
     * Get this week data.
     *
     * @param array $filters Filter parameters.
     *
     * @return array This week data.
     */
    private function get_this_week_data( $filters ) {
        global $wpdb;
        $analyses_table = $wpdb->prefix . 'wegenius_analyses';
        
        // Get articles generated this week
        $week_start = date( 'Y-m-d', strtotime( 'monday this week' ) );
        $week_end = date( 'Y-m-d', strtotime( 'sunday this week' ) );
        
        $articles_generated = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $analyses_table WHERE status = 'completed' AND analysis_type IN ('improve', 'content_gap', 'new_article') AND created_at BETWEEN %s AND %s",
                $week_start,
                $week_end
            )
        );
        
        return [
            'articlesGenerated' => (int) $articles_generated,
        ];
    }

    /**
     * Get recent analyses data.
     *
     * @param array $filters Filter parameters.
     *
     * @return array Recent analyses data.
     */
    private function get_recent_analyses( $filters ) {
        global $wpdb;
        $analyses_table = $wpdb->prefix . 'wegenius_analyses';
        $articles_table = $wpdb->prefix . 'wegenius_articles';
        
        $analyses = $wpdb->get_results(
            "SELECT a.*, ar.title, ar.wp_post_id 
             FROM $analyses_table a 
             LEFT JOIN $articles_table ar ON a.article_id = ar.id 
             ORDER BY a.created_at DESC 
             LIMIT 10"
        );
        
        $result = [];
        foreach ( $analyses as $analysis ) {
            $result[] = [
                'id' => $analysis->id,
                'title' => $analysis->title ?: __( 'Untitled', 'wegenius' ),
                'lastAnalyzed' => $analysis->created_at,
                'type' => ucfirst( str_replace( '_', ' ', $analysis->analysis_type ) ),
                'status' => ucfirst( $analysis->status ),
            ];
        }
        
        return $result;
    }

    /**
     * Get idea inbox data.
     *
     * @param array $filters Filter parameters.
     *
     * @return array Idea inbox data.
     */
    private function get_idea_inbox( $filters ) {
        global $wpdb;
        $suggestions_table = $wpdb->prefix . 'wegenius_suggestions';
        
        $suggestions = $wpdb->get_results(
            "SELECT * FROM $suggestions_table 
             WHERE status = 'pending' 
             ORDER BY created_at DESC 
             LIMIT 10"
        );
        
        $result = [];
        foreach ( $suggestions as $suggestion ) {
            $result[] = [
                'id' => $suggestion->id,
                'title' => $suggestion->title ?: __( 'Content Suggestion', 'wegenius' ),
                'description' => wp_trim_words( $suggestion->suggestion, 20 ),
                'type' => ucfirst( str_replace( '_', ' ', $suggestion->type ) ),
            ];
        }
        
        return $result;
    }

    /**
     * Get analysis status for a specific post.
     *
     * @param \WP_REST_Request $request The request object.
     *
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_analysis_status_for_post( $request ) {
        $post_id = $request->get_param( 'post_id' );
        // Validate post exists
        $post = get_post( $post_id );
        if ( ! $post ) {
            return new \WP_Error(
                'post_not_found',
                __( 'Post not found.', 'wegenius' ),
                [ 'status' => 404 ]
            );
        }
        // Get analysis status from post meta
        $status        = get_post_meta( $post_id, '_wegenius_analysis_status', true );
        $last_analyzed = get_post_meta( $post_id, '_wegenius_last_analyzed', true );
        $job_id        = get_post_meta( $post_id, '_wegenius_analysis_job_id', true );
        // Get latest analysis from database
        global $wpdb;
        $articles_table = $wpdb->prefix . 'wegenius_articles';
        $analyses_table = $wpdb->prefix . 'wegenius_analyses';
        // Get article record
        $article = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $articles_table WHERE wp_post_id = %d ORDER BY created_at DESC LIMIT 1",
                $post_id
            )
        );
        $latest_analysis = null;
        if ( $article ) {
            $latest_analysis = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT * FROM $analyses_table WHERE article_id = %d ORDER BY created_at DESC LIMIT 1",
                    $article->id
                )
            );
        }
        // Prepare response
        $response = [
            'post_id'       => $post_id,
            'status'        => $status ?: 'none',
            'last_analyzed' => $last_analyzed ? date( 'c', $last_analyzed ) : null,
            'job_id'        => $job_id,
            'analysis'      => null,
        ];
        // Add analysis details if available
        if ( $latest_analysis ) {
            $response['analysis'] = [
                'id'            => $latest_analysis->id,
                'status'        => $latest_analysis->status,
                'analysis_type' => $latest_analysis->analysis_type,
                'created_at'    => $latest_analysis->created_at,
                'updated_at'    => $latest_analysis->updated_at,
                'results'       => $latest_analysis->results ? json_decode( $latest_analysis->results, true ) : null,
                'scores'        => $latest_analysis->scores ? json_decode( $latest_analysis->scores, true ) : null,
                'insights'      => $latest_analysis->insights ? json_decode( $latest_analysis->insights, true ) : null,
            ];
        }
        // Check if Action Scheduler job is still running
        if ( $job_id && function_exists( 'as_get_scheduled_action' ) ) {
            $scheduled_action = as_get_scheduled_action( $job_id );
            if ( $scheduled_action ) {
                $response['job_status']        = 'scheduled';
                $response['job_scheduled_for'] = date(
                    'c', $scheduled_action->get_schedule()->get_date()->getTimestamp()
                );
            } else {
                $response['job_status'] = 'completed';
            }
        }

        return rest_ensure_response( $response );
    }

    /**
     * Scan article for analysis (editor integration).
     *
     * @param \WP_REST_Request $request The request object.
     *
     * @return \WP_REST_Response|\WP_Error
     */
    public function scan_article( $request ) {
        $data = $request->get_json_params();
        // Validate required fields
        $required_fields = [ 'wp_post_id', 'title', 'content' ];
        foreach ( $required_fields as $field ) {
            if ( empty( $data[ $field ] ) ) {
                return new \WP_Error(
                    'missing_required_field',
                    sprintf( __( 'Missing required field: %s', 'wegenius' ), $field ),
                    [ 'status' => 400 ]
                );
            }
        }
        // Get or create article record
        $post = get_post( $data['wp_post_id'] );
        if ( ! $post ) {
            return new \WP_Error(
                'post_not_found',
                __( 'Post not found.', 'wegenius' ),
                [ 'status' => 404 ]
            );
        }
        $article_id = $this->get_or_create_article_record( $post );
        // Create analysis record
        $analysis_id = $this->create_analysis_record( $article_id, $data['action_type'] ?? 'improve' );
        // Schedule analysis job
        $this->schedule_analysis( $analysis_id, $data['wp_post_id'], [ $data['action_type'] ?? 'improve' ] );

        return rest_ensure_response(
            [
                'success'     => true,
                'message'     => __( 'Article submitted for analysis successfully.', 'wegenius' ),
                'article_id'  => $article_id,
                'analysis_id' => $analysis_id,
                'action_type' => $data['action_type'] ?? 'improve',
            ]
        );
    }
}
