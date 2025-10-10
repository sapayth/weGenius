<?php
/**
 * Mock Data REST Controller
 *
 * Provides mock data endpoints for testing and development.
 *
 * @package WeGenius
 * @since 1.0.0
 */

namespace WeGenius\REST;

use WeGenius\MockData\MockDataProvider;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Mock Data REST Controller Class
 *
 * @since 1.0.0
 */
class MockDataController {
	/**
	 * Namespace for the REST API.
	 *
	 * @var string
	 */
	const NAMESPACE = 'wegenius/v1';

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	/**
	 * Register REST API routes for mock data.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		// Mock Article Management endpoints
		register_rest_route(
			self::NAMESPACE,
			'/mock/articles/submit',
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'mock_submit_article' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/mock/articles/analyses',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'mock_get_analyses' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/mock/articles/analyses/(?P<analysis_id>\d+)/status',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'mock_get_analysis_status' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/mock/articles/analyses/(?P<analysis_id>\d+)/results',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'mock_get_analysis_results' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/mock/articles/(?P<post_id>\d+)/history',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'mock_get_article_history' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		// Mock Suggestions endpoints
		register_rest_route(
			self::NAMESPACE,
			'/mock/suggestions/analysis/(?P<analysis_id>\d+)',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'mock_get_suggestions' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/mock/suggestions/(?P<suggestion_id>\d+)',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'mock_get_suggestion_details' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/mock/suggestions/approve',
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'mock_approve_suggestions' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/mock/suggestions/reject',
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'mock_reject_suggestions' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/mock/suggestions/implement',
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'mock_implement_suggestions' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		// Mock Content Versions endpoints
		register_rest_route(
			self::NAMESPACE,
			'/mock/posts/(?P<post_id>\d+)/versions',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'mock_get_versions' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/mock/posts/(?P<post_id>\d+)/versions/(?P<version_id>\d+)',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'mock_get_version' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/mock/posts/(?P<post_id>\d+)/versions/compare',
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'mock_compare_versions' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		// Mock Content Analysis endpoints
		register_rest_route(
			self::NAMESPACE,
			'/mock/posts/(?P<post_id>\d+)/analyze',
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'mock_analyze_post' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/mock/posts/(?P<post_id>\d+)/analyses',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'mock_get_post_analyses' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/mock/analyses/(?P<analysis_id>\d+)',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'mock_get_analysis' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		// Mock Apply Suggestions endpoint
		register_rest_route(
			self::NAMESPACE,
			'/mock/posts/(?P<post_id>\d+)/apply-suggestion',
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'mock_apply_suggestion' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		// Mock Dashboard endpoints
		register_rest_route(
			self::NAMESPACE,
			'/mock/dashboard/overview',
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'mock_get_dashboard_overview' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		// Mock Utility endpoints
		register_rest_route(
			self::NAMESPACE,
			'/mock/health',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'mock_health_check' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/mock/docs',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'mock_get_documentation' ],
				'permission_callback' => [ $this, 'check_permissions' ],
			]
		);
	}

	/**
	 * Check if user has permission to access the API.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return bool
	 */
	public function check_permissions( $request ): bool {
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
	 * Mock submit article response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_submit_article( $request ) {
		$response = MockDataProvider::get_article_submission_response();
		return rest_ensure_response( $response );
	}

	/**
	 * Mock get analyses response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_get_analyses( $request ) {
		$limit = $request->get_param( 'limit' ) ?: 10;
		$response = MockDataProvider::get_analyses_list( $limit );
		return rest_ensure_response( $response );
	}

	/**
	 * Mock get analysis status response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_get_analysis_status( $request ) {
		$analysis_id = $request->get_param( 'analysis_id' );
		$response = MockDataProvider::get_analysis_status( $analysis_id );
		return rest_ensure_response( $response );
	}

	/**
	 * Mock get analysis results response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_get_analysis_results( $request ) {
		$analysis_id = $request->get_param( 'analysis_id' );
		$response = MockDataProvider::get_analysis_results( $analysis_id );
		return rest_ensure_response( $response );
	}

	/**
	 * Mock get article history response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_get_article_history( $request ) {
		$post_id = $request->get_param( 'post_id' );
		$response = MockDataProvider::get_article_history( $post_id );
		return rest_ensure_response( $response );
	}

	/**
	 * Mock get suggestions response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_get_suggestions( $request ) {
		$analysis_id = $request->get_param( 'analysis_id' );
		$response = MockDataProvider::get_suggestions_for_analysis( $analysis_id );
		return rest_ensure_response( $response );
	}

	/**
	 * Mock get suggestion details response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_get_suggestion_details( $request ) {
		$suggestion_id = $request->get_param( 'suggestion_id' );
		$response = MockDataProvider::get_suggestion_details( $suggestion_id );
		return rest_ensure_response( $response );
	}

	/**
	 * Mock approve suggestions response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_approve_suggestions( $request ) {
		$data = $request->get_json_params();
		$suggestion_ids = $data['suggestion_ids'] ?? [];

		return rest_ensure_response( [
			'success' => true,
			'message' => sprintf( __( 'Approved %d suggestions successfully.', 'wegenius' ), count( $suggestion_ids ) ),
			'approved_count' => count( $suggestion_ids ),
		] );
	}

	/**
	 * Mock reject suggestions response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_reject_suggestions( $request ) {
		$data = $request->get_json_params();
		$suggestion_ids = $data['suggestion_ids'] ?? [];
		$reason = $data['reason'] ?? '';

		return rest_ensure_response( [
			'success' => true,
			'message' => sprintf( __( 'Rejected %d suggestions successfully.', 'wegenius' ), count( $suggestion_ids ) ),
			'rejected_count' => count( $suggestion_ids ),
			'reason' => $reason,
		] );
	}

	/**
	 * Mock implement suggestions response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_implement_suggestions( $request ) {
		$data = $request->get_json_params();
		$suggestion_ids = $data['suggestion_ids'] ?? [];

		return rest_ensure_response( [
			'success' => true,
			'message' => sprintf( __( 'Marked %d suggestions as implemented.', 'wegenius' ), count( $suggestion_ids ) ),
			'implemented_count' => count( $suggestion_ids ),
		] );
	}

	/**
	 * Mock get versions response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_get_versions( $request ) {
		$post_id = $request->get_param( 'post_id' );
		$response = MockDataProvider::get_content_versions( $post_id );
		return rest_ensure_response( $response );
	}

	/**
	 * Mock get version response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_get_version( $request ) {
		$post_id = $request->get_param( 'post_id' );
		$version_id = $request->get_param( 'version_id' );
		$versions = MockDataProvider::get_content_versions( $post_id );
		
		// Find the specific version
		$version = array_filter( $versions, function( $v ) use ( $version_id ) {
			return $v['id'] == $version_id;
		} );

		if ( empty( $version ) ) {
			return new \WP_Error(
				'version_not_found',
				__( 'Version not found.', 'wegenius' ),
				[ 'status' => 404 ]
			);
		}

		return rest_ensure_response( array_values( $version )[0] );
	}

	/**
	 * Mock compare versions response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_compare_versions( $request ) {
		$data = $request->get_json_params();
		$version1 = $data['version1'] ?? 1;
		$version2 = $data['version2'] ?? 2;
		
		$response = MockDataProvider::get_version_comparison( $version1, $version2 );
		return rest_ensure_response( $response );
	}

	/**
	 * Mock analyze post response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_analyze_post( $request ) {
		$post_id = $request->get_param( 'post_id' );
		$data = $request->get_json_params();
		$analysis_type = $data['analysis_type'] ?? 'content_optimization';

		return rest_ensure_response( [
			'success' => true,
			'message' => __( 'Analysis started successfully.', 'wegenius' ),
			'analysis_id' => rand( 100, 999 ),
			'analysis_type' => $analysis_type,
			'status' => 'pending',
		] );
	}

	/**
	 * Mock get post analyses response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_get_post_analyses( $request ) {
		$post_id = $request->get_param( 'post_id' );
		$analyses = MockDataProvider::get_analyses_list( 5 );
		
		// Filter analyses for this post
		foreach ( $analyses as &$analysis ) {
			$analysis['article_id'] = 123; // Mock article ID for this post
		}

		return rest_ensure_response( $analyses );
	}

	/**
	 * Mock get analysis response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_get_analysis( $request ) {
		$analysis_id = $request->get_param( 'analysis_id' );
		$response = MockDataProvider::get_analysis_results( $analysis_id );
		return rest_ensure_response( $response );
	}

	/**
	 * Mock apply suggestion response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_apply_suggestion( $request ) {
		$post_id = $request->get_param( 'post_id' );
		$data = $request->get_json_params();
		$suggestion_id = $data['suggestion_id'] ?? 1;

		return rest_ensure_response( [
			'success' => true,
			'message' => __( 'Suggestion applied successfully.', 'wegenius' ),
			'version_id' => rand( 1, 10 ),
			'suggestion_id' => $suggestion_id,
			'changes_applied' => [
				'Improved SEO score by 8 points',
				'Enhanced readability',
				'Added relevant keywords',
			],
		] );
	}

	/**
	 * Mock get dashboard overview response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_get_dashboard_overview( $request ) {
		$response = MockDataProvider::get_dashboard_overview();
		return rest_ensure_response( $response );
	}

	/**
	 * Mock health check response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_health_check( $request ) {
		$response = MockDataProvider::get_health_check();
		return rest_ensure_response( $response );
	}

	/**
	 * Mock get documentation response.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function mock_get_documentation( $request ) {
		$response = MockDataProvider::get_api_documentation();
		return rest_ensure_response( $response );
	}
}
