<?php
/**
 * Posts Page Integration Class
 *
 * Handles integration with WordPress Posts list table.
 * Adds analysis columns and functionality to the posts page.
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
		// Add custom columns to posts list table.
		add_filter( 'manage_post_posts_columns', [ $this, 'add_columns' ] );
		add_action( 'manage_post_posts_custom_column', [ $this, 'render_column_content' ], 10, 2 );

		// Make columns sortable (optional for future).
		add_filter( 'manage_edit-post_sortable_columns', [ $this, 'add_sortable_columns' ] );

		// Add inline styles for column layout.
		add_action( 'admin_head-edit.php', [ $this, 'add_column_styles' ] );
	}

	/**
	 * Add custom columns to posts list table.
	 *
	 * @param array $columns Existing columns.
	 * @return array Modified columns.
	 */
	public function add_columns( array $columns ): array {
		// Find the position after 'tags' column.
		$new_columns = [];
		foreach ( $columns as $key => $title ) {
			$new_columns[ $key ] = $title;

			// Add our columns after 'tags'.
			if ( 'tags' === $key ) {
				$new_columns['wegenius_analysis'] = __( 'AI Analysis', 'wegenius' );
				$new_columns['wegenius_actions']  = __( 'Actions', 'wegenius' );
			}
		}

		// If 'tags' column doesn't exist, add at the end.
		if ( ! isset( $columns['tags'] ) ) {
			$new_columns['wegenius_analysis'] = __( 'AI Analysis', 'wegenius' );
			$new_columns['wegenius_actions']  = __( 'Actions', 'wegenius' );
		}

		return $new_columns;
	}

	/**
	 * Render content for custom columns.
	 *
	 * @param string $column_name Column name.
	 * @param int    $post_id     Post ID.
	 * @return void
	 */
	public function render_column_content( string $column_name, int $post_id ): void {
		switch ( $column_name ) {
			case 'wegenius_analysis':
				$this->render_analysis_column( $post_id );
				break;

			case 'wegenius_actions':
				$this->render_actions_column( $post_id );
				break;
		}
	}

	/**
	 * Render analysis selection column.
	 *
	 * @param int $post_id Post ID.
	 * @return void
	 */
	private function render_analysis_column( int $post_id ): void {
		?>
		<div class="wegenius-analysis-options" data-post-id="<?php echo esc_attr( $post_id ); ?>">
			<label class="wegenius-radio-label">
				<input 
					type="radio" 
					name="wegenius_analysis_type_<?php echo esc_attr( $post_id ); ?>" 
					value="improve" 
					checked
				/>
				<span>🔧 <?php esc_html_e( 'Improve', 'wegenius' ); ?></span>
			</label>
			<label class="wegenius-radio-label">
				<input 
					type="radio" 
					name="wegenius_analysis_type_<?php echo esc_attr( $post_id ); ?>" 
					value="gaps"
				/>
				<span>🔍 <?php esc_html_e( 'Gaps', 'wegenius' ); ?></span>
			</label>
			<label class="wegenius-radio-label">
				<input 
					type="radio" 
					name="wegenius_analysis_type_<?php echo esc_attr( $post_id ); ?>" 
					value="ideas"
				/>
				<span>💡 <?php esc_html_e( 'Ideas', 'wegenius' ); ?></span>
			</label>
		</div>
		<?php
	}

	/**
	 * Render actions column.
	 *
	 * @param int $post_id Post ID.
	 * @return void
	 */
	private function render_actions_column( int $post_id ): void {
		// Get analysis status for this post.
		$status      = $this->get_analysis_status( $post_id );
		$is_analyzing = 'analyzing' === $status;
		$last_analyzed = get_post_meta( $post_id, '_wegenius_last_analyzed', true );

		?>
		<div class="wegenius-actions" data-post-id="<?php echo esc_attr( $post_id ); ?>">
			<?php if ( $is_analyzing ) : ?>
				<div class="wegenius-analyzing">
					<span class="wegenius-status-text">
						<?php esc_html_e( 'Analyzing...', 'wegenius' ); ?>
					</span>
					<button 
						type="button" 
						class="button wegenius-rescan-btn" 
						data-post-id="<?php echo esc_attr( $post_id ); ?>"
					>
						<?php esc_html_e( 'Re-scan', 'wegenius' ); ?>
					</button>
				</div>
			<?php else : ?>
				<button 
					type="button" 
					class="button button-primary wegenius-scan-btn" 
					data-post-id="<?php echo esc_attr( $post_id ); ?>"
				>
					<?php esc_html_e( 'Scan', 'wegenius' ); ?>
				</button>
			<?php endif; ?>

			<?php if ( $last_analyzed ) : ?>
				<div class="wegenius-last-analyzed">
					<?php
					printf(
						/* translators: %s: Time since last analysis */
						esc_html__( 'Last analyzed: %s', 'wegenius' ),
						esc_html( human_time_diff( $last_analyzed, time() ) . ' ago' )
					);
					?>
				</div>
			<?php else : ?>
				<div class="wegenius-never-analyzed">
					<?php esc_html_e( 'Never analyzed', 'wegenius' ); ?>
				</div>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Get analysis status for a post.
	 *
	 * @param int $post_id Post ID.
	 * @return string Status: 'analyzing', 'completed', or 'none'.
	 */
	private function get_analysis_status( int $post_id ): string {
		$status = get_post_meta( $post_id, '_wegenius_analysis_status', true );
		return $status ? $status : 'none';
	}

	/**
	 * Add sortable columns.
	 *
	 * @param array $columns Sortable columns.
	 * @return array Modified sortable columns.
	 */
	public function add_sortable_columns( array $columns ): array {
		// Future: Make analysis columns sortable.
		// $columns['wegenius_analysis'] = 'wegenius_analysis';
		return $columns;
	}

	/**
	 * Add inline styles for custom columns.
	 *
	 * @return void
	 */
	public function add_column_styles(): void {
		?>
		<style>
			.column-wegenius_analysis {
				width: 140px;
			}
			
			.column-wegenius_actions {
				width: 70px;
			}
			
			.column-title {
				width: auto !important;
				min-width: 200px;
			}
			
			/* Ensure title column gets priority space */
			.wp-list-table .column-title {
				width: auto !important;
				min-width: 250px;
			}
			
			/* Make other columns more compact */
			.column-author,
			.column-categories,
			.column-tags,
			.column-comments,
			.column-date {
				width: auto;
				min-width: 80px;
			}

			.wegenius-analysis-options {
				display: flex;
				flex-direction: column;
				gap: 4px;
			}

			.wegenius-checkbox-label {
				display: flex;
				align-items: center;
				gap: 6px;
				cursor: pointer;
				font-size: 13px;
			}

			.wegenius-checkbox-label input[type="checkbox"] {
				margin: 0;
			}

			.wegenius-actions {
				display: flex;
				flex-direction: column;
				gap: 4px;
			}

			.wegenius-analyzing {
				display: flex;
				flex-direction: column;
				gap: 4px;
			}

			.wegenius-status-text {
				font-size: 10px;
				color: #0073aa;
				font-weight: 500;
				line-height: 1.2;
			}

			.wegenius-last-analyzed,
			.wegenius-never-analyzed {
				font-size: 9px;
				color: #646970;
				font-style: italic;
				line-height: 1.2;
			}

			.wegenius-scan-btn,
			.wegenius-rescan-btn {
				width: 100%;
				padding: 4px 8px;
				font-size: 11px;
				line-height: 1.2;
				min-height: auto;
			}
		</style>
		<?php
	}
}

