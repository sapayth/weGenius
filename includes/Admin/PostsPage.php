<?php
/**
 * Posts Page Integration Class
 *
 * Handles integration with WordPress Posts list table.
 * Currently serves as a placeholder for future posts page functionality.
 *
 * @package WeGenius
 * @since 1.0.0
 */

namespace WeGenius\Admin;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Posts Page Class
 *
 * @since 1.0.0
 */
class PostsPage {
	/**
	 * Class instance.
	 *
	 * @var PostsPage
	 */
	private static $instance = null;

	/**
	 * Get class instance.
	 *
	 * @return PostsPage
	 */
	public static function instance(): PostsPage {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		$this->init_hooks();
	}

	/**
	 * Initialize WordPress hooks.
	 *
	 * @return void
	 */
	private function init_hooks(): void {
		// Add custom column to posts list table
		add_filter( 'manage_posts_columns', [ $this, 'add_insight_column' ] );
		add_action( 'manage_posts_custom_column', [ $this, 'display_insight_column' ], 10, 2 );
		
		// Add column styling
		add_action( 'admin_head', [ $this, 'add_column_styles' ] );
	}

	/**
	 * Add weGenius Insight column to posts list table.
	 *
	 * @param array $columns Existing columns.
	 * @return array Modified columns.
	 */
	public function add_insight_column( $columns ) {
		// Insert the column before the date column
		$new_columns = [];
		foreach ( $columns as $key => $value ) {
			if ( 'date' === $key ) {
				$new_columns['wegenius_insight'] = __( 'weGenius Insight', 'wegenius' );
			}
			$new_columns[ $key ] = $value;
		}
		return $new_columns;
	}

	/**
	 * Display content for the weGenius Insight column.
	 *
	 * @param string $column_name Column name.
	 * @param int    $post_id     Post ID.
	 */
	public function display_insight_column( $column_name, $post_id ) {
		if ( 'wegenius_insight' !== $column_name ) {
			return;
		}

		// Get analysis data for this post
		$insights = $this->get_post_insights( $post_id );
		
		if ( empty( $insights ) ) {
			echo '<span class="wegenius-no-insights">' . __( 'No analysis', 'wegenius' ) . '</span>';
			return;
		}

		// Display insight badges
		$this->render_insight_badges( $insights );
	}

	/**
	 * Get analysis insights for a specific post.
	 *
	 * @param int $post_id Post ID.
	 * @return array Analysis insights.
	 */
	private function get_post_insights( $post_id ) {
		global $wpdb;
		
		$analyses_table = $wpdb->prefix . 'wegenius_analyses';
		$articles_table = $wpdb->prefix . 'wegenius_articles';
		
		// Check if tables exist
		if ( ! $this->table_exists( $analyses_table ) ) {
			return [];
		}

		// Get latest analysis for this post
		$analysis = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT a.*, ar.title, ar.wp_post_id 
				 FROM $analyses_table a 
				 LEFT JOIN $articles_table ar ON a.article_id = ar.id 
				 WHERE ar.wp_post_id = %d 
				 ORDER BY a.created_at DESC 
				 LIMIT 1",
				$post_id
			)
		);

		if ( ! $analysis || empty( $analysis->results ) ) {
			return [];
		}

		$results = json_decode( $analysis->results, true );
		$insights = [];

		// Extract insight types from results
		if ( isset( $results['gaps'] ) && ! empty( $results['gaps'] ) ) {
			$insights['gaps'] = count( $results['gaps'] );
		}
		if ( isset( $results['ideas'] ) && ! empty( $results['ideas'] ) ) {
			$insights['ideas'] = count( $results['ideas'] );
		}
		if ( isset( $results['improve'] ) && ! empty( $results['improve'] ) ) {
			$insights['improve'] = count( $results['improve'] );
		}

		return $insights;
	}

	/**
	 * Render insight badges for display.
	 *
	 * @param array $insights Insight data.
	 */
	private function render_insight_badges( $insights ) {
		$badge_styles = [
			'gaps' => 'bg-blue-100 text-blue-800',
			'ideas' => 'bg-purple-100 text-purple-800', 
			'improve' => 'bg-orange-100 text-orange-800',
		];

		$badge_labels = [
			'gaps' => __( 'Gaps', 'wegenius' ),
			'ideas' => __( 'Ideas', 'wegenius' ),
			'improve' => __( 'Improve', 'wegenius' ),
		];

		echo '<div class="wegenius-insight-badges">';
		foreach ( $insights as $type => $count ) {
			$style = $badge_styles[ $type ] ?? 'bg-gray-100 text-gray-800';
			$label = $badge_labels[ $type ] ?? ucfirst( $type );
			printf(
				'<span class="wegenius-badge %s">%s (%d)</span>',
				esc_attr( $style ),
				esc_html( $label ),
				esc_html( $count )
			);
		}
		echo '</div>';
	}

	/**
	 * Add CSS styles for the insight column.
	 */
	public function add_column_styles() {
		$screen = get_current_screen();
		if ( 'edit-post' !== $screen->id ) {
			return;
		}
		?>
		<style>
		.wegenius-insight-badges {
			display: flex;
			flex-wrap: wrap;
			gap: 4px;
		}
		.wegenius-badge {
			display: inline-flex;
			align-items: center;
			padding: 2px 8px;
			border-radius: 12px;
			font-size: 11px;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}
		.wegenius-no-insights {
			color: #6b7280;
			font-style: italic;
			font-size: 12px;
		}
		.column-wegenius_insight {
			width: 120px;
		}
		</style>
		<?php
	}

	/**
	 * Check if a database table exists.
	 *
	 * @param string $table_name Table name.
	 * @return bool True if table exists.
	 */
	private function table_exists( $table_name ) {
		global $wpdb;
		return $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table_name ) ) === $table_name;
	}
}

