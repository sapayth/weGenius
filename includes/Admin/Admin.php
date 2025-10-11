<?php
/**
 * Admin Class
 *
 * Handles all admin-related functionality for the plugin.
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
 * Admin Class
 *
 * @since 1.0.0
 */
class Admin {
	/**
	 * Class instance.
	 *
	 * @var Admin
	 */
	private static $instance = null;

	/**
	 * Get class instance.
	 *
	 * @return Admin
	 */
	public static function instance(): Admin {
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
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
		add_action( 'admin_menu', [ $this, 'add_admin_menu' ] );

		// Initialize Posts Page integration.
		PostsPage::instance();
	}

	/**
	 * Enqueue admin scripts and styles.
	 *
	 * @param string $hook The current admin page hook.
	 * @return void
	 */
	public function enqueue_scripts( string $hook ): void {
		// Enqueue on posts list page.
		if ( 'edit.php' === $hook ) {
			$this->enqueue_posts_page_assets();
		}

		// Enqueue on plugin dashboard page.
		if ( 'toplevel_page_wegenius' === $hook ) {
			$this->enqueue_dashboard_assets();
		}

		// Enqueue on plugin settings page.
		if ( 'wegenius_page_wegenius-settings' === $hook ) {
			$this->enqueue_settings_assets();
		}

		// Enqueue editor scripts for post editor
		$screen = get_current_screen();
		if ( $screen && 'post' === $screen->base ) {
			$this->enqueue_editor_assets();
		}
	}

	/**
	 * Enqueue assets for posts page.
	 *
	 * @return void
	 */
	private function enqueue_posts_page_assets(): void {
		$script_path = WEGENIUS_PLUGIN_DIR . 'assets/js/posts-page.js';
		$style_path  = WEGENIUS_PLUGIN_DIR . 'assets/css/posts-page.css';

		// Enqueue JavaScript if file exists.
		if ( file_exists( $script_path ) ) {
			wp_enqueue_script(
				'wegenius-posts-page',
				WEGENIUS_PLUGIN_URL . 'assets/js/posts-page.js',
				[ 'wp-element', 'wp-components', 'wp-api-fetch', 'wp-i18n' ],
				WEGENIUS_VERSION,
				true
			);

			// Get settings for API configuration
			$settings = get_option( 'wegenius_settings', [] );

			// Localize script with admin data.
			wp_localize_script(
				'wegenius-posts-page',
				'wegeniusAdmin',
				[
					'nonce'   => wp_create_nonce( 'wp_rest' ),
					'ajaxUrl' => admin_url( 'admin-ajax.php' ),
					'restUrl' => rest_url( 'wegenius/v1' ),
					'apiKey'  => $settings['api']['apiKey'] ?? '',
					'apiBaseUrl' => $settings['api']['apiEndpoint'] ?? 'https://wegenius.fahmidsroadmap.com/api/ai',
				]
			);
		}

		// Enqueue CSS if file exists.
		if ( file_exists( $style_path ) ) {
			wp_enqueue_style(
				'wegenius-posts-page',
				WEGENIUS_PLUGIN_URL . 'assets/css/posts-page.css',
				[],
				WEGENIUS_VERSION
			);
		}
	}

	/**
	 * Enqueue assets for dashboard page.
	 *
	 * @return void
	 */
	private function enqueue_dashboard_assets(): void {
		$script_path = WEGENIUS_PLUGIN_DIR . 'assets/js/dashboard.js';
		$style_path  = WEGENIUS_PLUGIN_DIR . 'assets/css/dashboard.css';

		// Enqueue JavaScript if file exists.
		if ( file_exists( $script_path ) ) {
			wp_enqueue_script(
				'wegenius-dashboard',
				WEGENIUS_PLUGIN_URL . 'assets/js/dashboard.js',
				[ 'wp-element', 'wp-components', 'wp-api-fetch', 'wp-i18n' ],
				WEGENIUS_VERSION,
				true
			);

			// Get settings for API configuration
			$settings = get_option( 'wegenius_settings', [] );

			// Localize script with admin data.
			wp_localize_script(
				'wegenius-dashboard',
				'wegeniusAdmin',
				[
					'nonce'   => wp_create_nonce( 'wp_rest' ),
					'ajaxUrl' => admin_url( 'admin-ajax.php' ),
					'restUrl' => rest_url( 'wegenius/v1' ),
					'apiKey'  => $settings['api']['apiKey'] ?? '',
					'apiBaseUrl' => $settings['api']['apiEndpoint'] ?? 'https://wegenius.fahmidsroadmap.com/api/ai',
				]
			);
		}

		// Enqueue CSS if file exists.
		if ( file_exists( $style_path ) ) {
			wp_enqueue_style(
				'wegenius-dashboard',
				WEGENIUS_PLUGIN_URL . 'assets/css/dashboard.css',
				[],
				WEGENIUS_VERSION
			);
		}
	}

	/**
	 * Enqueue assets for settings page.
	 *
	 * @return void
	 */
	private function enqueue_settings_assets(): void {
		$script_path = WEGENIUS_PLUGIN_DIR . 'assets/js/settings.js';
		$style_path  = WEGENIUS_PLUGIN_DIR . 'assets/css/settings.css';

		// Enqueue JavaScript if file exists.
		if ( file_exists( $script_path ) ) {
			wp_enqueue_script(
				'wegenius-settings',
				WEGENIUS_PLUGIN_URL . 'assets/js/settings.js',
				[ 'wp-element', 'wp-components', 'wp-api-fetch', 'wp-i18n' ],
				WEGENIUS_VERSION,
				true
			);

			// Get settings for API configuration
			$settings = get_option( 'wegenius_settings', [] );

			// Localize script with admin data.
			wp_localize_script(
				'wegenius-settings',
				'wegeniusAdmin',
				[
					'nonce'   => wp_create_nonce( 'wp_rest' ),
					'ajaxUrl' => admin_url( 'admin-ajax.php' ),
					'restUrl' => rest_url( 'wegenius/v1' ),
					'apiKey'  => $settings['api']['apiKey'] ?? '',
					'apiBaseUrl' => $settings['api']['apiEndpoint'] ?? 'https://wegenius.fahmidsroadmap.com/api/ai',
				]
			);
		}

		// Enqueue CSS if file exists.
		if ( file_exists( $style_path ) ) {
			wp_enqueue_style(
				'wegenius-settings',
				WEGENIUS_PLUGIN_URL . 'assets/css/settings.css',
				[],
				WEGENIUS_VERSION
			);
		}
	}

	/**
	 * Enqueue assets for editor.
	 *
	 * @return void
	 */
	public function enqueue_editor_assets(): void {
		$script_path = WEGENIUS_PLUGIN_DIR . 'assets/js/editor.js';
		$asset_path = WEGENIUS_PLUGIN_DIR . 'assets/js/editor.asset.php';

		// Enqueue JavaScript if file exists.
		if ( file_exists( $script_path ) ) {
			// Load dependencies from asset file if it exists
			$dependencies = [ 'wp-plugins' ];
			$version = WEGENIUS_VERSION;

			if ( file_exists( $asset_path ) ) {
				$asset_file = require $asset_path;
				$dependencies = $asset_file['dependencies'];
				$version = $asset_file['version'];
			}

			wp_enqueue_script(
				'wegenius-editor',
				WEGENIUS_PLUGIN_URL . 'assets/js/editor.js',
				$dependencies,
				$version,
				true
			);

			// Get settings for API configuration
			$settings = get_option( 'wegenius_settings', [] );

			// Localize script with admin data for API authentication
			wp_localize_script(
				'wegenius-editor',
				'wegeniusAdmin',
				[
					'nonce'   => wp_create_nonce( 'wp_rest' ),
					'ajaxUrl' => admin_url( 'admin-ajax.php' ),
					'restUrl' => rest_url( 'wegenius/v1' ),
					'apiKey'  => $settings['api']['apiKey'] ?? '',
					'apiBaseUrl' => $settings['api']['apiEndpoint'] ?? 'https://wegenius.fahmidsroadmap.com/api/ai',
				]
			);
		}
	}

	/**
	 * Add admin menu items.
	 *
	 * @return void
	 */
	public function add_admin_menu(): void {
		add_menu_page(
			__( 'weGenius', 'wegenius' ),
			__( 'weGenius', 'wegenius' ),
			'manage_options',
			'wegenius',
			[ $this, 'render_dashboard_page' ],
			'dashicons-analytics',
			30
		);

		add_submenu_page(
			'wegenius',
			__( 'Dashboard', 'wegenius' ),
			__( 'Dashboard', 'wegenius' ),
			'manage_options',
			'wegenius',
			[ $this, 'render_dashboard_page' ]
		);

		add_submenu_page(
			'wegenius',
			__( 'Settings', 'wegenius' ),
			__( 'Settings', 'wegenius' ),
			'manage_options',
			'wegenius-settings',
			[ $this, 'render_settings_page' ]
		);
	}

	/**
	 * Render dashboard page.
	 *
	 * @return void
	 */
	public function render_dashboard_page(): void {
		?>
		<div class="wrap wegenius-container">
			<div id="wegenius-dashboard-root"></div>
		</div>
		<?php
	}

	/**
	 * Render settings page.
	 *
	 * @return void
	 */
	public function render_settings_page(): void {
		?>
		<div class="wrap wegenius-container">
			<div id="wegenius-settings-root"></div>
		</div>
		<?php
	}
}
