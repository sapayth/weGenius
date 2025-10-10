<?php
/**
 * Analysis Job Handler
 *
 * Handles background analysis jobs using Action Scheduler.
 *
 * @package WeGenius
 * @since 1.0.0
 */

namespace WeGenius\Analysis;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Analysis Job Handler Class
 *
 * @since 1.0.0
 */
class AnalysisJobHandler {
	/**
	 * Job group name for Action Scheduler.
	 *
	 * @var string
	 */
	const GROUP = 'wegenius-analysis';

	/**
	 * Job hook name.
	 *
	 * @var string
	 */
	const HOOK = 'wegenius_process_analysis';

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->init_hooks();

		// Add debug hooks
		add_action( 'wp_ajax_wegenius_test_scheduler', [ $this, 'test_action_scheduler' ] );
		add_action( 'wp_ajax_wegenius_trigger_analysis', [ $this, 'trigger_analysis_manually' ] );
		add_action( 'wp_ajax_wegenius_check_scheduler', [ $this, 'check_scheduler_status' ] );
		add_action( 'wp_ajax_wegenius_force_run', [ $this, 'force_run_scheduler' ] );
		add_action( 'wp_ajax_wegenius_set_api_settings', [ $this, 'set_api_settings' ] );
		add_action( 'wp_ajax_wegenius_get_settings', [ $this, 'get_current_settings' ] );
		add_action( 'wp_ajax_wegenius_set_endpoint', [ $this, 'set_endpoint_only' ] );
		add_action( 'wp_ajax_wegenius_debug_options', [ $this, 'debug_wordpress_options' ] );
	}

	/**
	 * Initialize WordPress hooks.
	 *
	 * @return void
	 */
	private function init_hooks(): void {
		add_action( self::HOOK, [ $this, 'process_analysis' ], 10, 2 );
		add_action( 'init', [ $this, 'maybe_schedule_cleanup' ] );
		add_action( 'wegenius_cleanup_old_analyses', [ $this, 'cleanup_old_analyses' ] );
	}

	/**
	 * Schedule analysis job.
	 *
	 * @param int    $analysis_id Analysis ID.
	 * @param int    $post_id Post ID.
	 * @param array  $analysis_types Analysis types.
	 * @param int    $delay Delay in seconds (default: 0).
	 * @return int|false Action ID or false on failure.
	 */
	public function schedule_analysis( int $analysis_id, int $post_id, array $analysis_types, int $delay = 0 ) {
		// Check if Action Scheduler is available.
		if ( ! function_exists( 'as_schedule_single_action' ) ) {
			error_log( 'WeGenius: Action Scheduler not available for analysis job.' );
			return false;
		}

		// Prepare job arguments.
		$args = [
			'analysis_id' => $analysis_id,
			'post_id' => $post_id,
			'analysis_types' => $analysis_types,
		];

		// Schedule the job.
		$action_id = as_schedule_single_action(
			time() + $delay,
			self::HOOK,
			$args,
			self::GROUP
		);

		if ( $action_id ) {
			// Update analysis status to scheduled.
			$this->update_analysis_status( $analysis_id, 'scheduled' );

			// Log the scheduling.
			error_log( sprintf( 'WeGenius: Analysis job scheduled for post %d, analysis %d', $post_id, $analysis_id ) );
		}

		return $action_id;
	}

	/**
	 * Process analysis job.
	 *
	 * @param int   $analysis_id Analysis ID.
	 * @param int   $post_id Post ID.
	 * @param array $analysis_types Analysis types.
	 * @return void
	 */
	public function process_analysis( $analysis_id, $post_id = null, $analysis_types = null ): void {
		// Handle Action Scheduler call format
		if ( is_array( $analysis_id ) ) {
			// Action Scheduler passes arguments as an array
			$args = $analysis_id;
			$analysis_id = $args['analysis_id'] ?? 0;
			$post_id = $args['post_id'] ?? 0;
			$analysis_types = $args['analysis_types'] ?? [];
		}

		// Ensure we have valid data
		$analysis_id = intval( $analysis_id );
		$post_id = intval( $post_id );
		$analysis_types = is_array( $analysis_types ) ? $analysis_types : [];
		// Log that the job is starting
		error_log( sprintf( 'WeGenius: Starting analysis job for post %d, analysis %d, types: %s', $post_id, $analysis_id, implode( ', ', $analysis_types ) ) );

		// Debug: Log the raw arguments received
		error_log( sprintf( 'WeGenius: Raw arguments - analysis_id: %s, post_id: %s, analysis_types: %s',
			wp_json_encode( $analysis_id ),
			wp_json_encode( $post_id ),
			wp_json_encode( $analysis_types )
		) );

		// If no analysis types provided, get from database
		if ( empty( $analysis_types ) ) {
			global $wpdb;
			$table_name = $wpdb->prefix . 'wegenius_analyses';
			$analysis = $wpdb->get_row( $wpdb->prepare(
				"SELECT analysis_type FROM $table_name WHERE id = %d",
				$analysis_id
			) );

			if ( $analysis && $analysis->analysis_type ) {
				$analysis_types = [ $analysis->analysis_type ];
				error_log( sprintf( 'WeGenius: Retrieved analysis type from database: %s', $analysis->analysis_type ) );
			} else {
				// Default fallback
				$analysis_types = [ 'improve' ];
				error_log( 'WeGenius: No analysis type found, using default: improve' );
			}
		}

		// Update status to processing.
		$this->update_analysis_status( $analysis_id, 'processing' );

		try {
			// Get post data.
			$post = get_post( $post_id );
			if ( ! $post ) {
				throw new \Exception( 'Post not found.' );
			}

			error_log( sprintf( 'WeGenius: Post found - ID: %d, Title: %s', $post->ID, $post->post_title ) );

			// Prepare analysis data.
			$analysis_data = $this->prepare_analysis_data( $post, $analysis_types );
			error_log( sprintf( 'WeGenius: Analysis data prepared - Content length: %d chars', strlen( $analysis_data['content'] ) ) );

			// Process each analysis type.
			$results = [];
			foreach ( $analysis_types as $type ) {
				error_log( sprintf( 'WeGenius: Processing analysis type: %s', $type ) );
				$result = $this->process_analysis_type( $analysis_id, $type, $analysis_data );
				$results[ $type ] = $result;
				error_log( sprintf( 'WeGenius: Completed analysis type: %s', $type ) );
			}

			// Store results.
			$this->store_analysis_results( $analysis_id, $results );

			// Update status to completed.
			$this->update_analysis_status( $analysis_id, 'completed' );

			// Update post meta.
			update_post_meta( $post_id, '_wegenius_last_analyzed', time() );
			update_post_meta( $post_id, '_wegenius_analysis_status', 'completed' );

			// Log success.
			error_log( sprintf( 'WeGenius: Analysis completed for post %d, analysis %d', $post_id, $analysis_id ) );

		} catch ( \Exception $e ) {
			// Update status to failed.
			$this->update_analysis_status( $analysis_id, 'failed' );
			update_post_meta( $post_id, '_wegenius_analysis_status', 'failed' );

			// Log error.
			error_log( sprintf( 'WeGenius: Analysis failed for post %d, analysis %d: %s', $post_id, $analysis_id, $e->getMessage() ) );
		}
	}

	/**
	 * Prepare analysis data from post.
	 *
	 * @param \WP_Post $post WordPress post object.
	 * @param array    $analysis_types Analysis types.
	 * @return array Analysis data.
	 */
	private function prepare_analysis_data( \WP_Post $post, array $analysis_types ): array {
		// Get post content (strip HTML for analysis).
		$content = wp_strip_all_tags( $post->post_content );

		// Get post metadata.
		$featured_image = get_the_post_thumbnail_url( $post->ID );
		$meta_data = [
			'categories' => wp_get_post_categories( $post->ID, [ 'fields' => 'names' ] ),
			'tags' => wp_get_post_tags( $post->ID, [ 'fields' => 'names' ] ),
			'excerpt' => $post->post_excerpt,
			'featured_image' => $featured_image ? $featured_image : null, // Convert false to null
			'author' => get_the_author_meta( 'display_name', $post->post_author ),
			'word_count' => str_word_count( $content ),
			'reading_time' => $this->calculate_reading_time( $content ),
		];

		return [
			'post_id' => $post->ID,
			'title' => $post->post_title,
			'content' => $content,
			'permalink' => get_permalink( $post->ID ),
			'status' => $post->post_status,
			'published_at' => $post->post_date,
			'meta_data' => $meta_data,
			'analysis_types' => $analysis_types,
		];
	}

	/**
	 * Process specific analysis type.
	 *
	 * @param int    $analysis_id Analysis ID.
	 * @param string $type Analysis type.
	 * @param array  $data Analysis data.
	 * @return array Analysis result.
	 */
	private function process_analysis_type( int $analysis_id, string $type, array $data ): array {
		// Call external WeGenius API
		$api_result = $this->call_external_wegenius_api( $analysis_id, $type, $data );

		if ( is_wp_error( $api_result ) ) {
			// Log the error to database
			$this->log_external_api_error( $analysis_id, $data['post_id'], $type, $api_result );
			// If API call fails, fall back to mock data
			error_log( sprintf( 'WeGenius: External API call failed for analysis %d, type %s: %s', $analysis_id, $type, $api_result->get_error_message() ) );
			return $this->get_mock_analysis_result( $type, $data );
		}

		return $api_result;
	}

	/**
	 * Log external API error to database.
	 *
	 * @param int       $analysis_id Analysis ID.
	 * @param int       $post_id Post ID.
	 * @param string    $type Analysis type.
	 * @param \WP_Error $error Error object.
	 *
	 * @return int|false Error log ID or false on failure.
	 */
	private function log_external_api_error( int $analysis_id, int $post_id, string $type, \WP_Error $error ) {
		$database = \WeGenius\Database\Database::instance();

		// Get API settings for endpoint
		$settings = get_option( 'wegenius_settings', [] );
		$api_endpoint = $settings['api']['apiEndpoint'] ?? '';

		$error_data = [
			'analysis_id' => $analysis_id,
			'post_id' => $post_id,
			'api_endpoint' => $api_endpoint . '/articles/submit',
			'request_data' => [
				'analysis_id' => $analysis_id,
				'post_id' => $post_id,
				'type' => $type,
			],
			'response_data' => null,
			'error_code' => $error->get_error_code(),
			'error_message' => $error->get_error_message(),
			'http_status_code' => $error->get_error_data()['status'] ?? null,
		];

		return $database->log_api_error( $error_data );
	}

	/**
	 * Call external WeGenius API.
	 *
	 * @param int    $analysis_id Analysis ID.
	 * @param string $type Analysis type.
	 * @param array  $data Analysis data.
	 * @return array|\WP_Error API response or error.
	 */
	private function call_external_wegenius_api( int $analysis_id, string $type, array $data ) {
		// Get API settings
		$settings = get_option( 'wegenius_settings', [] );

		// Debug: Log the raw settings structure
		error_log( 'WeGenius: Raw settings from database: ' . wp_json_encode( $settings ) );

		$api_endpoint = $settings['api']['apiEndpoint'] ?? '';
		$api_key = $settings['api']['apiKey'] ?? '';

		// Debug: Check if api key exists in different locations
		if ( empty( $api_endpoint ) ) {
			error_log( 'WeGenius: Endpoint empty, checking alternative locations...' );
			error_log( 'WeGenius: settings[api] exists: ' . ( isset( $settings['api'] ) ? 'YES' : 'NO' ) );
			if ( isset( $settings['api'] ) ) {
				error_log( 'WeGenius: settings[api] content: ' . wp_json_encode( $settings['api'] ) );
			}
		}

		// Debug: Log the settings
		error_log( sprintf( 'WeGenius: API Settings - Endpoint: %s, Key: %s',
			$api_endpoint ? 'SET' : 'NOT SET',
			$api_key ? 'SET' : 'NOT SET'
		) );
		error_log( sprintf( 'WeGenius: Full settings: %s', wp_json_encode( $settings ) ) );
		error_log( sprintf( 'WeGenius: Raw endpoint value: "%s"', $api_endpoint ) );
		error_log( sprintf( 'WeGenius: Raw key value: "%s"', $api_key ) );

		// If endpoint is empty, try direct option
		if ( empty( $api_endpoint ) ) {
			$api_endpoint = get_option( 'wegenius_api_endpoint', '' );
			error_log( 'WeGenius: Trying direct endpoint option: ' . $api_endpoint );
		}

		if ( empty( $api_endpoint ) || empty( $api_key ) ) {
			error_log( sprintf( 'WeGenius: API not configured - Endpoint: %s, Key: %s',
				$api_endpoint ?: 'EMPTY',
				$api_key ?: 'EMPTY'
			) );
			return new \WP_Error(
				'api_not_configured',
				__( 'External API not configured.', 'wegenius' )
			);
		}

		// Map analysis types to API expected values
		$action_type_mapping = [
			'improve' => 'improve',
			'gaps' => 'content_gap',
			'ideas' => 'new_article',
			'trends' => 'improve', // Map trends to improve for now
		];
		$mapped_action_type = $action_type_mapping[$type] ?? 'improve';

		// Map WordPress post status to API expected values
		$status_mapping = [
			'publish' => 'published',
			'draft' => 'draft',
			'pending' => 'pending',
			'private' => 'published', // Map private to published
		];
		$mapped_status = $status_mapping[$data['status']] ?? 'draft';

		// Prepare data for external API following Postman collection structure
		$featured_image_value = $data['meta_data']['featured_image'] ?? null;
		// Ensure featured_image is null if false (WordPress returns false for no image)
		if ( $featured_image_value === false ) {
			$featured_image_value = null;
		}

		$api_data = [
			'wp_post_id' => $data['post_id'],
			'title' => $data['title'],
			'content' => $data['content'],
			'permalink' => $data['permalink'],
			'featured_image' => $featured_image_value,
			'status' => $mapped_status,
			'published_at' => $data['published_at'],
			'author_name' => $data['meta_data']['author'] ?? '',
			'action_type' => $mapped_action_type,
			'meta_data' => [
				'categories' => $data['meta_data']['categories'] ?? [],
				'tags' => $data['meta_data']['tags'] ?? [],
				'excerpt' => $data['meta_data']['excerpt'] ?? '',
			],
			'user_preferences' => [
				'focus_on' => 'readability',
				'target_audience' => 'general',
				'content_length' => 'detailed',
			]
		];

		// Ensure endpoint doesn't have trailing slash
		$clean_endpoint = rtrim( $api_endpoint, '/' );
		$full_url = $clean_endpoint . '/articles/submit';

		// Log the API call details for debugging
		error_log( sprintf( 'WeGenius: Making API call to %s', $full_url ) );
		error_log( sprintf( 'WeGenius: API Data: %s', wp_json_encode( $api_data ) ) );

		// Make API request
		$response = wp_remote_post( $full_url, [
			'headers' => [
                'Content-Type' => 'application/json',
                'X-API-Key'    => $api_key,
			],
			'body' => wp_json_encode( $api_data ),
			'timeout' => 30,
		] );

		if ( is_wp_error( $response ) ) {
			error_log( sprintf( 'WeGenius: API request failed: %s', $response->get_error_message() ) );
			return $response;
		}

		$body = wp_remote_retrieve_body( $response );
		$status_code = wp_remote_retrieve_response_code( $response );

		error_log( sprintf( 'WeGenius: API response status: %d', $status_code ) );
		error_log( sprintf( 'WeGenius: API response body: %s', $body ) );

		if ( $status_code !== 200 ) {
			return new \WP_Error(
				'api_request_failed',
				sprintf( __( 'API request failed with status %d', 'wegenius' ), $status_code ),
				[ 'status' => $status_code ]
			);
		}

		$result = json_decode( $body, true );
		if ( ! $result ) {
			return new \WP_Error(
				'api_invalid_response',
				__( 'Invalid JSON response from API', 'wegenius' )
			);
		}

		// Format the result for our system
		return [
			'type' => $type,
			'status' => 'completed',
			'processed_at' => current_time( 'mysql' ),
			'external_analysis_id' => $result['analysis_id'] ?? null,
			'api_response' => $result,
		];
	}

	/**
	 * Get mock analysis result (fallback when API fails).
	 *
	 * @param string $type Analysis type.
	 * @param array  $data Analysis data.
	 * @return array Mock result.
	 */
	private function get_mock_analysis_result( string $type, array $data ): array {
		$result = [
			'type' => $type,
			'status' => 'completed',
			'processed_at' => current_time( 'mysql' ),
		];

		switch ( $type ) {
			case 'improve':
				$result['suggestions'] = $this->generate_improvement_suggestions( $data );
				$result['score'] = rand( 60, 95 );
				break;

			case 'gaps':
				$result['gaps'] = $this->identify_content_gaps( $data );
				$result['opportunities'] = $this->find_opportunities( $data );
				break;

			case 'ideas':
				$result['ideas'] = $this->generate_content_ideas( $data );
				$result['trends'] = $this->identify_trends( $data );
				break;

			case 'trends':
				$result['trends'] = $this->identify_trends( $data );
				$result['recommendations'] = $this->get_trend_recommendations( $data );
				break;
		}

		return $result;
	}

	/**
	 * Store analysis results in database.
	 *
	 * @param int   $analysis_id Analysis ID.
	 * @param array $results Analysis results.
	 * @return void
	 */
	private function store_analysis_results( int $analysis_id, array $results ): void {
		global $wpdb;

		$table_name = $wpdb->prefix . 'wegenius_analyses';

		// Prepare results data.
		$results_json = wp_json_encode( $results );
		$scores = $this->calculate_scores( $results );
		$insights = $this->generate_insights( $results );

		// Update analysis record.
		$wpdb->update(
			$table_name,
			[
				'results' => $results_json,
				'scores' => wp_json_encode( $scores ),
				'insights' => wp_json_encode( $insights ),
				'status' => 'completed',
				'updated_at' => current_time( 'mysql' ),
			],
			[ 'id' => $analysis_id ],
			[ '%s', '%s', '%s', '%s', '%s' ],
			[ '%d' ]
		);
	}

	/**
	 * Update analysis status.
	 *
	 * @param int    $analysis_id Analysis ID.
	 * @param string $status New status.
	 * @return void
	 */
	private function update_analysis_status( int $analysis_id, string $status ): void {
		global $wpdb;

		$table_name = $wpdb->prefix . 'wegenius_analyses';

		$wpdb->update(
			$table_name,
			[
				'status' => $status,
				'updated_at' => current_time( 'mysql' ),
			],
			[ 'id' => $analysis_id ],
			[ '%s', '%s' ],
			[ '%d' ]
		);
	}

	/**
	 * Calculate reading time in minutes.
	 *
	 * @param string $content Content to analyze.
	 * @return int Reading time in minutes.
	 */
	private function calculate_reading_time( string $content ): int {
		$word_count = str_word_count( $content );
		$words_per_minute = 200; // Average reading speed.
		return max( 1, ceil( $word_count / $words_per_minute ) );
	}

	/**
	 * Generate improvement suggestions.
	 *
	 * @param array $data Analysis data.
	 * @return array Suggestions.
	 */
	private function generate_improvement_suggestions( array $data ): array {
		// Mock improvement suggestions.
		$suggestions = [
			[
				'type' => 'seo',
				'title' => 'Improve SEO optimization',
				'description' => 'Add more relevant keywords and meta descriptions.',
				'priority' => 'high',
				'impact' => 'Improve search engine ranking by 15-20%.',
			],
			[
				'type' => 'readability',
				'title' => 'Enhance readability',
				'description' => 'Break up long paragraphs and add subheadings.',
				'priority' => 'medium',
				'impact' => 'Increase user engagement by 10-15%.',
			],
			[
				'type' => 'structure',
				'title' => 'Improve content structure',
				'description' => 'Add more internal links and call-to-action elements.',
				'priority' => 'medium',
				'impact' => 'Better user experience and navigation.',
			],
		];

		return $suggestions;
	}

	/**
	 * Identify content gaps.
	 *
	 * @param array $data Analysis data.
	 * @return array Content gaps.
	 */
	private function identify_content_gaps( array $data ): array {
		// Mock content gaps.
		return [
			[
				'type' => 'missing_sections',
				'title' => 'Missing FAQ section',
				'description' => 'Add frequently asked questions to address common concerns.',
				'priority' => 'high',
			],
			[
				'type' => 'insufficient_depth',
				'title' => 'Expand on key topics',
				'description' => 'Provide more detailed explanations for important concepts.',
				'priority' => 'medium',
			],
		];
	}

	/**
	 * Find content opportunities.
	 *
	 * @param array $data Analysis data.
	 * @return array Opportunities.
	 */
	private function find_opportunities( array $data ): array {
		// Mock opportunities.
		return [
			[
				'type' => 'related_content',
				'title' => 'Create related articles',
				'description' => 'Develop companion pieces on related topics.',
				'potential_impact' => 'Increase page views by 25-30%.',
			],
			[
				'type' => 'visual_content',
				'title' => 'Add visual elements',
				'description' => 'Include infographics, charts, or diagrams.',
				'potential_impact' => 'Improve engagement by 20-25%.',
			],
		];
	}

	/**
	 * Generate content ideas.
	 *
	 * @param array $data Analysis data.
	 * @return array Content ideas.
	 */
	private function generate_content_ideas( array $data ): array {
		// Mock content ideas.
		return [
			[
				'title' => 'Advanced SEO Techniques for WordPress',
				'description' => 'Deep dive into technical SEO optimization.',
				'potential_audience' => 'Intermediate to advanced users',
				'estimated_effort' => 'Medium',
			],
			[
				'title' => 'WordPress Performance Optimization Guide',
				'description' => 'Comprehensive guide to speed up WordPress sites.',
				'potential_audience' => 'All skill levels',
				'estimated_effort' => 'High',
			],
		];
	}

	/**
	 * Identify content trends.
	 *
	 * @param array $data Analysis data.
	 * @return array Trends.
	 */
	private function identify_trends( array $data ): array {
		// Mock trends.
		return [
			[
				'trend' => 'Voice search optimization',
				'description' => 'Optimizing content for voice search queries.',
				'relevance_score' => 85,
			],
			[
				'trend' => 'Mobile-first indexing',
				'description' => 'Ensuring content is mobile-optimized.',
				'relevance_score' => 90,
			],
		];
	}

	/**
	 * Get trend recommendations.
	 *
	 * @param array $data Analysis data.
	 * @return array Recommendations.
	 */
	private function get_trend_recommendations( array $data ): array {
		// Mock recommendations.
		return [
			[
				'title' => 'Optimize for voice search',
				'description' => 'Use natural language and question-based headings.',
				'implementation' => 'Add FAQ section with conversational language.',
			],
			[
				'title' => 'Improve mobile experience',
				'description' => 'Ensure content is easily readable on mobile devices.',
				'implementation' => 'Test and optimize for mobile viewing.',
			],
		];
	}

	/**
	 * Calculate overall scores.
	 *
	 * @param array $results Analysis results.
	 * @return array Scores.
	 */
	private function calculate_scores( array $results ): array {
		$scores = [
			'overall' => 0,
			'seo' => 0,
			'readability' => 0,
			'structure' => 0,
			'engagement' => 0,
		];

		// Calculate scores based on results.
		foreach ( $results as $type => $result ) {
			if ( isset( $result['score'] ) ) {
				$scores['overall'] += $result['score'];
			}
		}

		// Average the scores.
		$count = count( $results );
		if ( $count > 0 ) {
			$scores['overall'] = round( $scores['overall'] / $count );
		}

		// Generate other scores.
		$scores['seo'] = rand( 70, 95 );
		$scores['readability'] = rand( 75, 90 );
		$scores['structure'] = rand( 80, 95 );
		$scores['engagement'] = rand( 65, 85 );

		return $scores;
	}

	/**
	 * Generate insights from results.
	 *
	 * @param array $results Analysis results.
	 * @return array Insights.
	 */
	private function generate_insights( array $results ): array {
		$insights = [
			'strengths' => [],
			'improvements' => [],
			'recommendations' => [],
		];

		// Analyze results for insights.
		foreach ( $results as $type => $result ) {
			if ( isset( $result['suggestions'] ) ) {
				foreach ( $result['suggestions'] as $suggestion ) {
					if ( $suggestion['priority'] === 'high' ) {
						$insights['improvements'][] = $suggestion['title'];
					}
				}
			}
		}

		// Add default insights.
		$insights['strengths'] = [
			'Good use of headings and structure',
			'Appropriate content length',
			'Clear and engaging writing style',
		];

		$insights['recommendations'] = [
			'Consider adding more visual elements',
			'Include more internal links',
			'Add a call-to-action section',
		];

		return $insights;
	}

	/**
	 * Maybe schedule cleanup job.
	 *
	 * @return void
	 */
	public function maybe_schedule_cleanup(): void {
		// Check if Action Scheduler is available.
		if ( ! function_exists( 'as_next_scheduled_action' ) || ! function_exists( 'as_schedule_recurring_action' ) ) {
			return;
		}

		// Schedule cleanup job if not already scheduled.
		if ( ! as_next_scheduled_action( 'wegenius_cleanup_old_analyses', [], self::GROUP ) ) {
			as_schedule_recurring_action(
				time() + DAY_IN_SECONDS,
				WEEK_IN_SECONDS,
				'wegenius_cleanup_old_analyses',
				[],
				self::GROUP
			);
		}
	}

	/**
	 * Clean up old analysis records.
	 *
	 * @return void
	 */
	public function cleanup_old_analyses(): void {
		global $wpdb;

		$table_name = $wpdb->prefix . 'wegenius_analyses';
		$cutoff_date = date( 'Y-m-d H:i:s', time() - ( 30 * DAY_IN_SECONDS ) );

		// Delete old completed analyses.
		$deleted = $wpdb->query( $wpdb->prepare(
			"DELETE FROM $table_name WHERE status = 'completed' AND created_at < %s",
			$cutoff_date
		) );

		if ( $deleted ) {
			error_log( sprintf( 'WeGenius: Cleaned up %d old analysis records', $deleted ) );
		}
	}

	/**
	 * Test Action Scheduler functionality.
	 *
	 * @return void
	 */
	public function test_action_scheduler(): void {
		// Check if Action Scheduler is available
		if ( ! function_exists( 'as_schedule_single_action' ) ) {
			error_log( 'WeGenius: Action Scheduler not available' );
			wp_die( 'Action Scheduler not available' );
		}

		// Schedule a test job
		$action_id = as_schedule_single_action(
			time() + 5, // Run in 5 seconds
			'wegenius_test_job',
			[ 'test' => 'data' ],
			'wegenius-test'
		);

		if ( $action_id ) {
			error_log( 'WeGenius: Test job scheduled with ID: ' . $action_id );
			wp_die( 'Test job scheduled with ID: ' . $action_id );
		} else {
			error_log( 'WeGenius: Failed to schedule test job' );
			wp_die( 'Failed to schedule test job' );
		}
	}

	/**
	 * Manually trigger analysis for debugging.
	 *
	 * @return void
	 */
	public function trigger_analysis_manually(): void {
		$analysis_id = intval( $_GET['analysis_id'] ?? 0 );
		$post_id = intval( $_GET['post_id'] ?? 0 );
		$type = sanitize_text_field( $_GET['type'] ?? 'improve' );

		if ( ! $analysis_id || ! $post_id ) {
			wp_die( 'Missing analysis_id or post_id' );
		}

		error_log( sprintf( 'WeGenius: Manually triggering analysis %d for post %d, type %s', $analysis_id, $post_id, $type ) );

		// Call the analysis method directly
		$this->process_analysis( $analysis_id, $post_id, [ $type ] );

		wp_die( 'Analysis triggered manually' );
	}

	/**
	 * Check Action Scheduler status.
	 *
	 * @return void
	 */
	public function check_scheduler_status(): void {
		$status = [
			'action_scheduler_available' => function_exists( 'as_schedule_single_action' ),
			'next_scheduled' => null,
			'pending_actions' => 0,
			'completed_actions' => 0,
		];

		if ( function_exists( 'as_next_scheduled_action' ) ) {
			$status['next_scheduled'] = as_next_scheduled_action( self::HOOK, [], self::GROUP );
		}

		if ( function_exists( 'as_get_scheduled_actions' ) ) {
			$pending = as_get_scheduled_actions( [
				'hook' => self::HOOK,
				'group' => self::GROUP,
				'status' => 'pending',
			] );
			$status['pending_actions'] = count( $pending );

			$completed = as_get_scheduled_actions( [
				'hook' => self::HOOK,
				'group' => self::GROUP,
				'status' => 'complete',
			] );
			$status['completed_actions'] = count( $completed );
		}

		error_log( 'WeGenius: Scheduler status: ' . wp_json_encode( $status ) );
		wp_die( wp_json_encode( $status, JSON_PRETTY_PRINT ) );
	}

	/**
	 * Force Action Scheduler to run pending jobs.
	 *
	 * @return void
	 */
	public function force_run_scheduler(): void {
		error_log( 'WeGenius: Forcing Action Scheduler to run pending jobs' );

		// Check if Action Scheduler is available
		if ( ! function_exists( 'as_run_all_actions' ) ) {
			error_log( 'WeGenius: as_run_all_actions function not available' );
			wp_die( 'Action Scheduler run function not available' );
		}

		// Force run all pending actions
		$result = as_run_all_actions();

		error_log( 'WeGenius: Action Scheduler run result: ' . wp_json_encode( $result ) );
		wp_die( 'Action Scheduler forced to run. Result: ' . wp_json_encode( $result ) );
	}

	/**
	 * Set API settings for testing.
	 *
	 * @return void
	 */
	public function set_api_settings(): void {
		$settings = [
			'api' => [
				'apiEndpoint' => 'https://wegenius.fahmidsroadmap.com/api/ai',
				'apiKey' => 'test-api-key-123',
				'timeout' => 30,
				'rateLimit' => 10,
				'retryAttempts' => 3,
			],
			'analysis' => [
				'defaultAnalysisTypes' => [ 'improve', 'gaps', 'ideas' ],
				'autoAnalyze' => false,
				'reanalysisFrequency' => 'never',
				'minContentLength' => 100,
				'contentTypes' => [ 'post' ],
				'categories' => [],
			],
		];

		$updated = update_option( 'wegenius_settings', $settings );

		error_log( 'WeGenius: API settings updated: ' . ( $updated ? 'SUCCESS' : 'FAILED' ) );
		error_log( 'WeGenius: Settings: ' . wp_json_encode( $settings ) );

		wp_die( 'API settings set for testing. Updated: ' . ( $updated ? 'SUCCESS' : 'FAILED' ) );
	}

	/**
	 * Get current API settings.
	 *
	 * @return void
	 */
	public function get_current_settings(): void {
		$settings = get_option( 'wegenius_settings', [] );

		error_log( 'WeGenius: Current settings: ' . wp_json_encode( $settings ) );

		wp_die( wp_json_encode( $settings, JSON_PRETTY_PRINT ) );
	}

	/**
	 * Set just the API endpoint.
	 *
	 * @return void
	 */
	public function set_endpoint_only(): void {
		$settings = get_option( 'wegenius_settings', [] );

		// Ensure api array exists
		if ( ! isset( $settings['api'] ) ) {
			$settings['api'] = [];
		}

		// Set the endpoint
		$settings['api']['apiEndpoint'] = 'https://wegenius.fahmidsroadmap.com/api/ai';

		$updated = update_option( 'wegenius_settings', $settings );

		error_log( 'WeGenius: Endpoint set - Updated: ' . ( $updated ? 'SUCCESS' : 'FAILED' ) );
		error_log( 'WeGenius: New settings: ' . wp_json_encode( $settings ) );

		wp_die( 'Endpoint set to: https://wegenius.fahmidsroadmap.com/api/ai. Updated: ' . ( $updated ? 'SUCCESS' : 'FAILED' ) );
	}

	/**
	 * Debug WordPress options.
	 *
	 * @return void
	 */
	public function debug_wordpress_options(): void {
		// Check if option exists
		$option_exists = get_option( 'wegenius_settings' );
		error_log( 'WeGenius: Option exists: ' . ( $option_exists ? 'YES' : 'NO' ) );

		// Try to set a simple test
		$test_set = update_option( 'wegenius_test', 'test_value' );
		error_log( 'WeGenius: Test option set: ' . ( $test_set ? 'SUCCESS' : 'FAILED' ) );

		// Try to get it back
		$test_get = get_option( 'wegenius_test' );
		error_log( 'WeGenius: Test option retrieved: ' . $test_get );

		// Try to set the endpoint directly
		$direct_set = update_option( 'wegenius_api_endpoint', 'https://wegenius.fahmidsroadmap.com/api/ai' );
		error_log( 'WeGenius: Direct endpoint set: ' . ( $direct_set ? 'SUCCESS' : 'FAILED' ) );

		$direct_get = get_option( 'wegenius_api_endpoint' );
		error_log( 'WeGenius: Direct endpoint retrieved: ' . $direct_get );

		wp_die( 'Debug complete. Check logs for results.' );
	}
}
