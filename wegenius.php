<?php
/**
 * Plugin Name: weGenius
 * Plugin URI: https://wegenius.com
 * Description: AI-powered content analysis and optimization plugin for WordPress. Analyze content for SEO improvements, identify content gaps, and discover new article ideas.
 * Version: 1.0.0
 * Requires at least: 6.1
 * Requires PHP: 7.4
 * Author: weGenius Team
 * Author URI: https://wegenius.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: wegenius
 * Domain Path: /languages
 *
 * @package WeGenius
 */

namespace WeGenius;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants.
define( 'WEGENIUS_VERSION', '1.0.0' );
define( 'WEGENIUS_PLUGIN_FILE', __FILE__ );
define( 'WEGENIUS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WEGENIUS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WEGENIUS_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * PSR-4 Autoloader
 *
 * @param string $class The fully-qualified class name.
 * @return void
 */
spl_autoload_register(
	function ( $class ) {
		// Project-specific namespace prefix.
		$prefix = 'WeGenius\\';

		// Base directory for the namespace prefix.
		$base_dir = WEGENIUS_PLUGIN_DIR . 'includes/';

		// Does the class use the namespace prefix?
		$len = strlen( $prefix );
		if ( strncmp( $prefix, $class, $len ) !== 0 ) {
			return;
		}

		// Get the relative class name.
		$relative_class = substr( $class, $len );

		// Replace namespace separators with directory separators and append .php.
		$file = $base_dir . str_replace( '\\', '/', $relative_class ) . '.php';

		// If the file exists, require it.
		if ( file_exists( $file ) ) {
			require $file;
		}
	}
);

/**
 * Load Composer autoloader if available
 */
if ( file_exists( WEGENIUS_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
	require_once WEGENIUS_PLUGIN_DIR . 'vendor/autoload.php';
}

/**
 * Load Action Scheduler early - must be loaded before plugins_loaded hook
 */
if ( ! function_exists( 'as_schedule_single_action' ) ) {
	$action_scheduler_path = WEGENIUS_PLUGIN_DIR . 'vendor/woocommerce/action-scheduler/action-scheduler.php';
	if ( file_exists( $action_scheduler_path ) ) {
		require_once $action_scheduler_path;
	}
}

/**
 * Main Plugin Class
 *
 * @since 1.0.0
 */
final class WeGenius {
	/**
	 * Plugin instance.
	 *
	 * @var WeGenius
	 */
	private static $instance = null;

	/**
	 * Get plugin instance.
	 *
	 * @return WeGenius
	 */
	public static function instance(): WeGenius {
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
		add_action( 'plugins_loaded', [ $this, 'init' ] );
		add_action( 'init', [ $this, 'load_textdomain' ] );

		// Activation and deactivation hooks.
		register_activation_hook( WEGENIUS_PLUGIN_FILE, [ $this, 'activate' ] );
		register_deactivation_hook( WEGENIUS_PLUGIN_FILE, [ $this, 'deactivate' ] );
	}

	/**
	 * Initialize plugin.
	 *
	 * @return void
	 */
	public function init(): void {
		// Initialize admin functionality.
		if ( is_admin() ) {
			Admin\Admin::instance();
		}

		// Initialize REST API.
		new REST\ApiController();

		// Initialize Mock Data Controller (for development/testing).
		new REST\MockDataController();

		// Initialize Analysis Job Handler (only if Action Scheduler is available).
		if ( function_exists( 'as_schedule_single_action' ) ) {
			new Analysis\AnalysisJobHandler();
		} else {
			// Show admin notice if Action Scheduler is not available.
			add_action( 'admin_notices', [ $this, 'action_scheduler_required_notice' ] );
		}

		/**
		 * Fires after weGenius has been initialized.
		 *
		 * @since 1.0.0
		 */
		do_action( 'wegenius_init' );
	}

	/**
	 * Load plugin textdomain.
	 *
	 * @return void
	 */
	public function load_textdomain(): void {
		load_plugin_textdomain(
			'wegenius',
			false,
			dirname( WEGENIUS_PLUGIN_BASENAME ) . '/languages'
		);
	}

	/**
	 * Plugin activation.
	 *
	 * @return void
	 */
	public function activate(): void {
		// Check minimum WordPress version.
		if ( version_compare( get_bloginfo( 'version' ), '6.1', '<' ) ) {
			wp_die(
				esc_html__( 'weGenius requires WordPress 6.1 or higher.', 'wegenius' ),
				esc_html__( 'Plugin Activation Error', 'wegenius' ),
				[ 'back_link' => true ]
			);
		}

		// Check minimum PHP version.
		if ( version_compare( PHP_VERSION, '7.4', '<' ) ) {
			wp_die(
				esc_html__( 'weGenius requires PHP 7.4 or higher.', 'wegenius' ),
				esc_html__( 'Plugin Activation Error', 'wegenius' ),
				[ 'back_link' => true ]
			);
		}

		// Create database tables if needed.
		if ( class_exists( 'WeGenius\Database\Database' ) ) {
			Database\Database::instance()->create_tables();
		}

		// Flush rewrite rules.
		flush_rewrite_rules();

		/**
		 * Fires after plugin activation.
		 *
		 * @since 1.0.0
		 */
		do_action( 'wegenius_activated' );
	}

	/**
	 * Plugin deactivation.
	 *
	 * @return void
	 */
	public function deactivate(): void {
		// Flush rewrite rules.
		flush_rewrite_rules();

		/**
		 * Fires after plugin deactivation.
		 *
		 * @since 1.0.0
		 */
		do_action( 'wegenius_deactivated' );
	}

	/**
	 * Show admin notice when Action Scheduler is required but not available.
	 *
	 * @return void
	 */
	public function action_scheduler_required_notice(): void {
		?>
		<div class="notice notice-error">
			<p>
				<strong><?php esc_html_e( 'weGenius Plugin Error:', 'wegenius' ); ?></strong>
				<?php esc_html_e( 'Action Scheduler is required for background analysis processing but is not available. Please ensure Composer dependencies are installed by running "composer install".', 'wegenius' ); ?>
			</p>
		</div>
		<?php
	}
}

/**
 * Initialize the plugin.
 *
 * @return WeGenius
 */
function wegenius(): WeGenius {
	return WeGenius::instance();
}

// Kickstart the plugin.
wegenius();