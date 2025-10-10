<?php
/**
 * Database Management
 *
 * @package WeGenius
 * @since 1.0.0
 */

namespace WeGenius\Database;

/**
 * Database Class
 *
 * @since 1.0.0
 */
class Database {
	/**
	 * Database instance.
	 *
	 * @var Database
	 */
	private static $instance = null;

	/**
	 * Get database instance.
	 *
	 * @return Database
	 */
	public static function instance(): Database {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		// Constructor is private for singleton pattern
	}

	/**
	 * Create database tables.
	 *
	 * @return void
	 */
	public function create_tables(): void {
		global $wpdb;

		$charset_collate = $wpdb->get_charset_collate();

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		// Articles table (matching external API structure)
		$articles_table = $wpdb->prefix . 'wegenius_articles';
		$articles_sql = "CREATE TABLE $articles_table (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			wp_post_id bigint(20) NOT NULL,
			external_article_id varchar(255),
			title text NOT NULL,
			content longtext NOT NULL,
			permalink varchar(500),
			featured_image varchar(500),
			status varchar(50) NOT NULL DEFAULT 'published',
			published_at datetime,
			author_name varchar(255),
			action_type varchar(50),
			meta_data longtext,
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY (id),
			UNIQUE KEY wp_post_id (wp_post_id),
			KEY external_article_id (external_article_id),
			KEY status (status),
			KEY created_at (created_at)
		) $charset_collate;";

		dbDelta( $articles_sql );

		// Analyses table (updated to match API format)
		$analyses_table = $wpdb->prefix . 'wegenius_analyses';
		$analyses_sql = "CREATE TABLE $analyses_table (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			article_id bigint(20) NOT NULL,
			external_analysis_id varchar(255),
			analysis_type varchar(50) NOT NULL,
			status varchar(20) NOT NULL DEFAULT 'pending',
			results longtext,
			scores longtext,
			insights longtext,
			token_usage int(11) DEFAULT 0,
			error_message text,
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY (id),
			KEY article_id (article_id),
			KEY external_analysis_id (external_analysis_id),
			KEY status (status),
			KEY analysis_type (analysis_type),
			KEY created_at (created_at)
		) $charset_collate;";

		dbDelta( $analyses_sql );

		// Suggestions table
		$suggestions_table = $wpdb->prefix . 'wegenius_suggestions';
		$suggestions_sql = "CREATE TABLE $suggestions_table (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			analysis_id bigint(20) NOT NULL,
			external_suggestion_id varchar(255),
			suggestion_type varchar(50) NOT NULL,
			title varchar(500) NOT NULL,
			description longtext,
			content longtext,
			priority varchar(20) DEFAULT 'medium',
			status varchar(20) DEFAULT 'pending',
			applied_at datetime,
			rejected_at datetime,
			rejection_reason text,
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY (id),
			KEY analysis_id (analysis_id),
			KEY external_suggestion_id (external_suggestion_id),
			KEY suggestion_type (suggestion_type),
			KEY status (status),
			KEY created_at (created_at)
		) $charset_collate;";

		dbDelta( $suggestions_sql );

		// Content Versions table
		$versions_table = $wpdb->prefix . 'wegenius_versions';
		$versions_sql = "CREATE TABLE $versions_table (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			article_id bigint(20) NOT NULL,
			version_number int(11) NOT NULL,
			title text NOT NULL,
			content longtext NOT NULL,
			changes_summary text,
			suggestions_applied longtext,
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY (id),
			KEY article_id (article_id),
			KEY version_number (version_number),
			KEY created_at (created_at)
		) $charset_collate;";

		dbDelta( $versions_sql );

		// Settings table (for storing plugin settings)
		$settings_table = $wpdb->prefix . 'wegenius_settings';
		$settings_sql = "CREATE TABLE $settings_table (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			setting_name varchar(255) NOT NULL,
			setting_value longtext,
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY (id),
			UNIQUE KEY setting_name (setting_name)
		) $charset_collate;";

		dbDelta( $settings_sql );
	}

	/**
	 * Drop database tables.
	 *
	 * @return void
	 */
	public function drop_tables(): void {
		global $wpdb;

		$tables = [
			$wpdb->prefix . 'wegenius_articles',
			$wpdb->prefix . 'wegenius_analyses',
			$wpdb->prefix . 'wegenius_suggestions',
			$wpdb->prefix . 'wegenius_versions',
			$wpdb->prefix . 'wegenius_settings',
		];

		foreach ( $tables as $table ) {
			$wpdb->query( "DROP TABLE IF EXISTS $table" );
		}
	}
}
