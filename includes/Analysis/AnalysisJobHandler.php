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
	public function process_analysis( int $analysis_id, int $post_id, array $analysis_types ): void {
		// Update status to processing.
		$this->update_analysis_status( $analysis_id, 'processing' );

		try {
			// Get post data.
			$post = get_post( $post_id );
			if ( ! $post ) {
				throw new \Exception( 'Post not found.' );
			}

			// Prepare analysis data.
			$analysis_data = $this->prepare_analysis_data( $post, $analysis_types );

			// Process each analysis type.
			$results = [];
			foreach ( $analysis_types as $type ) {
				$result = $this->process_analysis_type( $analysis_id, $type, $analysis_data );
				$results[ $type ] = $result;
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
		$meta_data = [
			'categories' => wp_get_post_categories( $post->ID, [ 'fields' => 'names' ] ),
			'tags' => wp_get_post_tags( $post->ID, [ 'fields' => 'names' ] ),
			'excerpt' => $post->post_excerpt,
			'featured_image' => get_the_post_thumbnail_url( $post->ID ),
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
		// For now, simulate analysis processing.
		// In a real implementation, this would call external AI APIs.
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
}
