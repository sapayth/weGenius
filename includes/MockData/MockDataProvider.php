<?php
/**
 * Mock Data Provider
 *
 * Provides mock data for testing and development based on the WeGenius API structure.
 *
 * @package WeGenius
 * @since 1.0.0
 */

namespace WeGenius\MockData;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Mock Data Provider Class
 *
 * @since 1.0.0
 */
class MockDataProvider {
	/**
	 * Get mock article submission response.
	 *
	 * @return array
	 */
	public static function get_article_submission_response(): array {
		return [
			'success' => true,
			'message' => 'Article submitted for analysis successfully.',
			'article_id' => 123,
			'analysis_id' => 456,
			'external_analysis_id' => 'ext_789',
			'status' => 'pending',
			'created_at' => current_time( 'c' ),
		];
	}

	/**
	 * Get mock analyses list.
	 *
	 * @param int $limit Number of results to return.
	 * @return array
	 */
	public static function get_analyses_list( int $limit = 10 ): array {
		$analyses = [];
		$statuses = [ 'pending', 'processing', 'completed', 'failed' ];
		$analysis_types = [ 'improve', 'gaps', 'ideas', 'trends' ];

		for ( $i = 1; $i <= $limit; $i++ ) {
			$analyses[] = [
				'id' => $i,
				'article_id' => 100 + $i,
				'analysis_type' => $analysis_types[ array_rand( $analysis_types ) ],
				'status' => $statuses[ array_rand( $statuses ) ],
				'progress' => rand( 0, 100 ),
				'token_usage' => rand( 100, 5000 ),
				'created_at' => date( 'c', strtotime( "-{$i} hours" ) ),
				'updated_at' => date( 'c', strtotime( "-{$i} hours" ) ),
			];
		}

		return $analyses;
	}

	/**
	 * Get mock analysis status.
	 *
	 * @param int $analysis_id Analysis ID.
	 * @return array
	 */
	public static function get_analysis_status( int $analysis_id ): array {
		$statuses = [
			'pending' => [ 'percentage' => 0, 'message' => 'Analysis queued' ],
			'processing' => [ 'percentage' => 65, 'message' => 'Analyzing content...' ],
			'completed' => [ 'percentage' => 100, 'message' => 'Analysis complete' ],
			'failed' => [ 'percentage' => 0, 'message' => 'Analysis failed' ],
		];

		$status = array_rand( $statuses );
		$progress = $statuses[ $status ];

		return [
			'id' => $analysis_id,
			'status' => $status,
			'progress' => $progress,
			'created_at' => date( 'c', strtotime( '-2 hours' ) ),
			'updated_at' => date( 'c', strtotime( '-1 hour' ) ),
		];
	}

	/**
	 * Get mock analysis results.
	 *
	 * @param int $analysis_id Analysis ID.
	 * @return array
	 */
	public static function get_analysis_results( int $analysis_id ): array {
		return [
			'id' => $analysis_id,
			'status' => 'completed',
			'results' => [
				'seo_score' => rand( 60, 95 ),
				'readability_score' => rand( 70, 90 ),
				'content_quality' => rand( 75, 95 ),
				'keyword_density' => rand( 1, 5 ),
				'word_count' => rand( 500, 2000 ),
				'reading_time' => rand( 3, 10 ),
			],
			'scores' => [
				'overall' => rand( 70, 95 ),
				'seo' => rand( 65, 90 ),
				'readability' => rand( 70, 95 ),
				'structure' => rand( 75, 90 ),
				'engagement' => rand( 60, 85 ),
			],
			'insights' => [
				'strengths' => [
					'Good use of headings and subheadings',
					'Appropriate keyword density',
					'Well-structured content flow',
				],
				'improvements' => [
					'Add more internal links',
					'Include more relevant images',
					'Optimize meta description',
				],
				'recommendations' => [
					'Consider adding a FAQ section',
					'Include more call-to-action elements',
					'Expand on key topics with more detail',
				],
			],
			'token_usage' => rand( 1000, 5000 ),
			'created_at' => date( 'c', strtotime( '-3 hours' ) ),
			'updated_at' => date( 'c', strtotime( '-1 hour' ) ),
		];
	}

	/**
	 * Get mock article history.
	 *
	 * @param int $post_id Post ID.
	 * @return array
	 */
	public static function get_article_history( int $post_id ): array {
		return [
			'article' => [
				'id' => 123,
				'wp_post_id' => $post_id,
				'title' => 'Complete Guide to WordPress SEO Optimization',
				'content' => '<p>In this comprehensive guide, we\'ll explore the best practices for WordPress SEO...</p>',
				'permalink' => 'https://example.com/wordpress-seo-guide',
				'featured_image' => 'https://example.com/images/seo-guide.jpg',
				'status' => 'published',
				'published_at' => date( 'c', strtotime( '-1 week' ) ),
				'author_name' => 'John Doe',
				'action_type' => 'improve',
				'created_at' => date( 'c', strtotime( '-1 week' ) ),
				'updated_at' => date( 'c', strtotime( '-1 day' ) ),
			],
			'analyses' => [
				[
					'id' => 1,
					'article_id' => 123,
					'analysis_type' => 'improve',
					'status' => 'completed',
					'created_at' => date( 'c', strtotime( '-3 days' ) ),
					'updated_at' => date( 'c', strtotime( '-3 days' ) ),
				],
				[
					'id' => 2,
					'article_id' => 123,
					'analysis_type' => 'gaps',
					'status' => 'completed',
					'created_at' => date( 'c', strtotime( '-2 days' ) ),
					'updated_at' => date( 'c', strtotime( '-2 days' ) ),
				],
			],
			'versions' => [
				[
					'id' => 1,
					'article_id' => 123,
					'version_number' => 1,
					'content' => '<p>Original content...</p>',
					'changes_summary' => 'Initial version',
					'created_at' => date( 'c', strtotime( '-1 week' ) ),
				],
				[
					'id' => 2,
					'article_id' => 123,
					'version_number' => 2,
					'content' => '<p>Updated content with SEO improvements...</p>',
					'changes_summary' => 'Applied SEO suggestions',
					'created_at' => date( 'c', strtotime( '-3 days' ) ),
				],
			],
		];
	}

	/**
	 * Get mock suggestions for analysis.
	 *
	 * @param int $analysis_id Analysis ID.
	 * @return array
	 */
	public static function get_suggestions_for_analysis( int $analysis_id ): array {
		$suggestions = [];
		$suggestion_types = [ 'seo', 'readability', 'structure', 'content_improvement' ];
		$statuses = [ 'pending', 'approved', 'rejected', 'applied' ];

		for ( $i = 1; $i <= 5; $i++ ) {
			$suggestions[] = [
				'id' => $i,
				'analysis_id' => $analysis_id,
				'type' => $suggestion_types[ array_rand( $suggestion_types ) ],
				'status' => $statuses[ array_rand( $statuses ) ],
				'title' => "Suggestion {$i}: " . ucfirst( $suggestion_types[ array_rand( $suggestion_types ) ] ) . " Improvement",
				'description' => "This is a detailed suggestion for improving the content's " . $suggestion_types[ array_rand( $suggestion_types ) ] . ".",
				'priority' => rand( 1, 5 ),
				'impact_score' => rand( 60, 95 ),
				'effort_required' => rand( 1, 5 ),
				'created_at' => date( 'c', strtotime( "-{$i} hours" ) ),
				'updated_at' => date( 'c', strtotime( "-{$i} hours" ) ),
			];
		}

		return $suggestions;
	}

	/**
	 * Get mock suggestion details.
	 *
	 * @param int $suggestion_id Suggestion ID.
	 * @return array
	 */
	public static function get_suggestion_details( int $suggestion_id ): array {
		$types = [ 'seo', 'readability', 'structure', 'content_improvement' ];
		$type = $types[ array_rand( $types ) ];

		return [
			'id' => $suggestion_id,
			'analysis_id' => 456,
			'type' => $type,
			'status' => 'pending',
			'title' => "Improve {$type} for better performance",
			'description' => "This suggestion focuses on enhancing the {$type} aspects of your content to improve overall performance and user engagement.",
			'detailed_explanation' => "Based on our AI analysis, we've identified several areas where your content can be improved in terms of {$type}. This includes optimizing keyword usage, improving content structure, and enhancing readability.",
			'priority' => rand( 1, 5 ),
			'impact_score' => rand( 60, 95 ),
			'effort_required' => rand( 1, 5 ),
			'implementation_steps' => [
				'Review the current content structure',
				'Identify specific areas for improvement',
				'Apply the suggested changes',
				'Test and validate the improvements',
			],
			'expected_benefits' => [
				'Improved search engine ranking',
				'Better user engagement',
				'Increased content quality',
				'Enhanced readability',
			],
			'created_at' => date( 'c', strtotime( '-2 hours' ) ),
			'updated_at' => date( 'c', strtotime( '-1 hour' ) ),
		];
	}

	/**
	 * Get mock content versions.
	 *
	 * @param int $post_id Post ID.
	 * @return array
	 */
	public static function get_content_versions( int $post_id ): array {
		$versions = [];
		$version_descriptions = [
			'Initial version',
			'Applied SEO suggestions',
			'Improved readability',
			'Added more engaging content',
			'Optimized for keywords',
		];

		for ( $i = 1; $i <= 3; $i++ ) {
			$versions[] = [
				'id' => $i,
				'article_id' => 123,
				'version_number' => $i,
				'content' => "<p>Version {$i} content with improvements...</p><p>This version includes various enhancements based on AI suggestions.</p>",
				'changes_summary' => $version_descriptions[ $i - 1 ],
				'word_count' => rand( 800, 1500 ),
				'seo_score' => rand( 70, 95 ),
				'readability_score' => rand( 75, 90 ),
				'created_at' => date( 'c', strtotime( "-{$i} days" ) ),
				'updated_at' => date( 'c', strtotime( "-{$i} days" ) ),
			];
		}

		return $versions;
	}

	/**
	 * Get mock version comparison.
	 *
	 * @param int $version1_id Version 1 ID.
	 * @param int $version2_id Version 2 ID.
	 * @return array
	 */
	public static function get_version_comparison( int $version1_id, int $version2_id ): array {
		return [
			'version1' => [
				'id' => $version1_id,
				'version_number' => 1,
				'word_count' => 1200,
				'seo_score' => 75,
				'readability_score' => 80,
				'created_at' => date( 'c', strtotime( '-3 days' ) ),
			],
			'version2' => [
				'id' => $version2_id,
				'version_number' => 2,
				'word_count' => 1350,
				'seo_score' => 85,
				'readability_score' => 88,
				'created_at' => date( 'c', strtotime( '-1 day' ) ),
			],
			'comparison' => [
				'word_count_change' => 150,
				'seo_score_change' => 10,
				'readability_score_change' => 8,
				'improvements' => [
					'Added more detailed explanations',
					'Improved keyword density',
					'Enhanced content structure',
					'Better readability flow',
				],
				'changes_summary' => 'Version 2 shows significant improvements in SEO score and readability, with 150 additional words providing more comprehensive coverage.',
			],
		];
	}

	/**
	 * Get mock dashboard overview data.
	 *
	 * @return array
	 */
	public static function get_dashboard_overview(): array {
		return [
			'overview' => [
				'analyzed' => 45,
				'pending' => 8,
				'failed' => 2,
				'neverAnalyzed' => 12,
				'total_posts' => 67,
				'analysis_success_rate' => 95.7,
			],
			'analysisTypes' => [
				'improve' => 25,
				'gaps' => 18,
				'ideas' => 15,
				'trends' => 12,
			],
			'recentActivity' => [
				[
					'id' => 1,
					'type' => 'analysis_completed',
					'title' => 'Analysis completed for "WordPress SEO Guide"',
					'description' => 'SEO and readability analysis finished with 85% overall score',
					'timestamp' => date( 'c', strtotime( '-2 hours' ) ),
					'status' => 'success',
				],
				[
					'id' => 2,
					'type' => 'suggestion_applied',
					'title' => 'Suggestion applied to "Content Marketing Tips"',
					'description' => 'Applied 3 SEO suggestions, improved score by 12 points',
					'timestamp' => date( 'c', strtotime( '-4 hours' ) ),
					'status' => 'success',
				],
				[
					'id' => 3,
					'type' => 'analysis_started',
					'title' => 'Analysis started for "Email Marketing Best Practices"',
					'description' => 'Content analysis initiated with improve and gaps analysis types',
					'timestamp' => date( 'c', strtotime( '-6 hours' ) ),
					'status' => 'processing',
				],
			],
		];
	}

	/**
	 * Get mock API health check response.
	 *
	 * @return array
	 */
	public static function get_health_check(): array {
		return [
			'status' => 'healthy',
			'timestamp' => current_time( 'c' ),
			'version' => '1.0.0',
			'services' => [
				'database' => 'connected',
				'cache' => 'active',
				'ai_service' => 'operational',
				'queue' => 'processing',
			],
			'uptime' => '99.9%',
			'response_time' => rand( 50, 200 ) . 'ms',
		];
	}

	/**
	 * Get mock API documentation.
	 *
	 * @return array
	 */
	public static function get_api_documentation(): array {
		return [
			'title' => 'WeGenius WordPress API Documentation',
			'version' => '1.0.0',
			'description' => 'Complete API documentation for WeGenius AI Content Analysis WordPress plugin',
			'endpoints' => [
				[
					'method' => 'POST',
					'path' => '/articles/submit',
					'description' => 'Submit article for analysis',
					'parameters' => [
						'wp_post_id' => 'WordPress post ID',
						'title' => 'Article title',
						'content' => 'Article content',
						'action_type' => 'Analysis type (improve, gaps, ideas)',
					],
				],
				[
					'method' => 'GET',
					'path' => '/articles/analyses',
					'description' => 'Get all analyses',
					'parameters' => [
						'status' => 'Filter by status',
						'limit' => 'Number of results',
					],
				],
				[
					'method' => 'GET',
					'path' => '/suggestions/analysis/{id}',
					'description' => 'Get suggestions for analysis',
					'parameters' => [
						'type' => 'Suggestion type filter',
						'status' => 'Suggestion status filter',
					],
				],
			],
			'authentication' => [
				'type' => 'API Key',
				'header' => 'X-API-KEY',
				'description' => 'Include your API key in the X-API-KEY header',
			],
			'rate_limits' => [
				'requests_per_minute' => 100,
				'requests_per_hour' => 1000,
				'burst_limit' => 50,
			],
		];
	}
}
