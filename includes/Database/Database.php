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

		// API Error Logs table (for storing external API failures)
		$error_logs_table = $wpdb->prefix . 'wegenius_api_error_logs';
		$error_logs_sql = "CREATE TABLE IF NOT EXISTS $error_logs_table (
			id bigint(20) NOT NULL AUTO_INCREMENT,
			analysis_id bigint(20),
			post_id bigint(20),
			api_endpoint varchar(500) NOT NULL,
			request_data longtext,
			response_data longtext,
			error_code varchar(100),
			error_message text,
			http_status_code int(11),
			request_timestamp datetime NOT NULL,
			retry_count int(11) DEFAULT 0,
			last_retry_at datetime,
			status varchar(20) DEFAULT 'failed',
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY (id),
			KEY analysis_id (analysis_id),
			KEY post_id (post_id),
			KEY error_code (error_code),
			KEY status (status),
			KEY request_timestamp (request_timestamp),
			KEY created_at (created_at)
		) $charset_collate;";

		dbDelta( $error_logs_sql );
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
			$wpdb->prefix . 'wegenius_api_error_logs',
		];

		foreach ( $tables as $table ) {
			$wpdb->query( "DROP TABLE IF EXISTS $table" );
		}
	}

	/**
	 * Log API error to database.
	 *
	 * @param array $error_data Error data to log.
	 *
	 * @return int|false Error log ID or false on failure.
	 */
	public function log_api_error( $error_data ) {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'wegenius_api_error_logs';
		
		$insert_data = [
			'analysis_id' => $error_data['analysis_id'] ?? null,
			'post_id' => $error_data['post_id'] ?? null,
			'api_endpoint' => $error_data['api_endpoint'] ?? '',
			'request_data' => isset( $error_data['request_data'] ) ? wp_json_encode( $error_data['request_data'] ) : null,
			'response_data' => isset( $error_data['response_data'] ) ? wp_json_encode( $error_data['response_data'] ) : null,
			'error_code' => $error_data['error_code'] ?? null,
			'error_message' => $error_data['error_message'] ?? null,
			'http_status_code' => $error_data['http_status_code'] ?? null,
			'request_timestamp' => $error_data['request_timestamp'] ?? current_time( 'mysql' ),
			'retry_count' => $error_data['retry_count'] ?? 0,
			'last_retry_at' => $error_data['last_retry_at'] ?? null,
			'status' => $error_data['status'] ?? 'failed',
			'created_at' => current_time( 'mysql' ),
			'updated_at' => current_time( 'mysql' ),
		];
		
		$result = $wpdb->insert(
			$table_name,
			$insert_data,
			[ '%d', '%d', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%d', '%s', '%s', '%s', '%s' ]
		);
		
		return $result ? $wpdb->insert_id : false;
	}

	/**
	 * Get API error logs.
	 *
	 * @param array $filters Filter parameters.
	 *
	 * @return array Error logs.
	 */
	public function get_api_error_logs( $filters = [] ) {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'wegenius_api_error_logs';
		$where_conditions = [];
		$where_values = [];
		
		// Apply filters
		if ( ! empty( $filters['analysis_id'] ) ) {
			$where_conditions[] = 'analysis_id = %d';
			$where_values[] = $filters['analysis_id'];
		}
		
		if ( ! empty( $filters['post_id'] ) ) {
			$where_conditions[] = 'post_id = %d';
			$where_values[] = $filters['post_id'];
		}
		
		if ( ! empty( $filters['error_code'] ) ) {
			$where_conditions[] = 'error_code = %s';
			$where_values[] = $filters['error_code'];
		}
		
		if ( ! empty( $filters['status'] ) ) {
			$where_conditions[] = 'status = %s';
			$where_values[] = $filters['status'];
		}
		
		if ( ! empty( $filters['date_from'] ) ) {
			$where_conditions[] = 'created_at >= %s';
			$where_values[] = $filters['date_from'];
		}
		
		if ( ! empty( $filters['date_to'] ) ) {
			$where_conditions[] = 'created_at <= %s';
			$where_values[] = $filters['date_to'];
		}
		
		// Build query
		$where_clause = ! empty( $where_conditions ) ? 'WHERE ' . implode( ' AND ', $where_conditions ) : '';
		$limit = ! empty( $filters['limit'] ) ? 'LIMIT ' . intval( $filters['limit'] ) : 'LIMIT 100';
		$order = ! empty( $filters['order'] ) ? 'ORDER BY ' . sanitize_sql_orderby( $filters['order'] ) : 'ORDER BY created_at DESC';
		
		$query = "SELECT * FROM $table_name $where_clause $order $limit";
		
		if ( ! empty( $where_values ) ) {
			$results = $wpdb->get_results( $wpdb->prepare( $query, $where_values ) );
		} else {
			$results = $wpdb->get_results( $query );
		}
		
		return $results;
	}

	/**
	 * Update error log retry information.
	 *
	 * @param int $error_log_id Error log ID.
	 * @param array $retry_data Retry data.
	 *
	 * @return bool Success status.
	 */
	public function update_error_log_retry( $error_log_id, $retry_data ) {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'wegenius_api_error_logs';
		
		$update_data = [
			'retry_count' => $retry_data['retry_count'] ?? 0,
			'last_retry_at' => $retry_data['last_retry_at'] ?? current_time( 'mysql' ),
			'status' => $retry_data['status'] ?? 'retrying',
			'updated_at' => current_time( 'mysql' ),
		];
		
		$result = $wpdb->update(
			$table_name,
			$update_data,
			[ 'id' => $error_log_id ],
			[ '%d', '%s', '%s', '%s' ],
			[ '%d' ]
		);
		
		return $result !== false;
	}

	/**
	 * Clean up old error logs.
	 *
	 * @param int $days_old Number of days old to clean up.
	 *
	 * @return int Number of records deleted.
	 */
	public function cleanup_old_error_logs( $days_old = 30 ) {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'wegenius_api_error_logs';
		$cutoff_date = date( 'Y-m-d H:i:s', strtotime( "-$days_old days" ) );
		
		$deleted = $wpdb->query(
			$wpdb->prepare(
				"DELETE FROM $table_name WHERE created_at < %s",
				$cutoff_date
			)
		);
		
		return $deleted;
	}

}
