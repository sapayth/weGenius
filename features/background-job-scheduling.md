# Background Job Scheduling System

A comprehensive background job scheduling system for the WeGenius WordPress plugin using Action Scheduler for reliable, scalable analysis processing.

## Overview

The background job scheduling system handles AI content analysis asynchronously, ensuring a smooth user experience while processing potentially long-running analysis tasks in the background.

## Architecture

### Core Components

#### 1. AnalysisJobHandler (`/includes/Analysis/AnalysisJobHandler.php`)
- **Purpose**: Manages background analysis jobs using Action Scheduler
- **Key Features**:
  - Job scheduling and execution
  - Status tracking and updates
  - Error handling and retry logic
  - Automatic cleanup of old records

#### 2. API Controller Integration (`/includes/REST/ApiController.php`)
- **Purpose**: REST API endpoints for job management
- **Endpoints**:
  - `POST /wp-json/wegenius/v1/analysis/start` - Start analysis
  - `POST /wp-json/wegenius/v1/analysis/restart` - Restart analysis
  - `GET /wp-json/wegenius/v1/analysis/status/{post_id}` - Get status

#### 3. Frontend Status Polling (`/src/js/posts-page.js`)
- **Purpose**: Real-time status updates in the WordPress admin
- **Features**:
  - Automatic polling every 5 seconds
  - UI updates based on job status
  - User notifications for completion/failure

## Job Lifecycle

### 1. Job Creation
```php
// When user clicks "Scan" button
$action_id = $job_handler->schedule_analysis($analysis_id, $post_id, $analysis_types);
```

### 2. Job Execution
```php
// Action Scheduler executes the job
public function process_analysis($analysis_id, $post_id, $analysis_types) {
    // Update status to 'processing'
    // Prepare analysis data
    // Process each analysis type
    // Store results
    // Update status to 'completed' or 'failed'
}
```

### 3. Status Updates
- **Scheduled**: Job queued for execution
- **Processing**: Analysis in progress
- **Completed**: Analysis finished successfully
- **Failed**: Analysis encountered an error

## Implementation Details

### Job Scheduling

```php
/**
 * Schedule analysis job
 */
public function schedule_analysis(int $analysis_id, int $post_id, array $analysis_types, int $delay = 0): int|false {
    $args = [
        'analysis_id' => $analysis_id,
        'post_id' => $post_id,
        'analysis_types' => $analysis_types,
    ];

    return as_schedule_single_action(
        time() + $delay,
        self::HOOK,
        $args,
        self::GROUP
    );
}
```

### Job Processing

```php
/**
 * Process analysis job
 */
public function process_analysis(int $analysis_id, int $post_id, array $analysis_types): void {
    // Update status to processing
    $this->update_analysis_status($analysis_id, 'processing');

    try {
        // Get post data
        $post = get_post($post_id);
        $analysis_data = $this->prepare_analysis_data($post, $analysis_types);

        // Process each analysis type
        $results = [];
        foreach ($analysis_types as $type) {
            $result = $this->process_analysis_type($analysis_id, $type, $analysis_data);
            $results[$type] = $result;
        }

        // Store results and update status
        $this->store_analysis_results($analysis_id, $results);
        $this->update_analysis_status($analysis_id, 'completed');

    } catch (Exception $e) {
        $this->update_analysis_status($analysis_id, 'failed');
        error_log('Analysis failed: ' . $e->getMessage());
    }
}
```

### Status Polling

```javascript
/**
 * Start status polling for posts being analyzed
 */
const startStatusPolling = () => {
    const analyzingPosts = document.querySelectorAll('.wegenius-analyzing');
    
    if (analyzingPosts.length === 0) return;

    const pollInterval = setInterval(() => {
        analyzingPosts.forEach(async (container) => {
            const postId = container.dataset.postId;
            const response = await fetch(`/wp-json/wegenius/v1/analysis/status/${postId}`);
            const status = await response.json();
            updatePostStatus(postId, status);
        });
    }, 5000);
};
```

## Analysis Types

### 1. Improve Analysis
- **Purpose**: Suggest content improvements
- **Output**: SEO suggestions, readability improvements, structure enhancements
- **Mock Implementation**: Generates realistic improvement suggestions

### 2. Gaps Analysis
- **Purpose**: Identify content gaps and opportunities
- **Output**: Missing sections, insufficient depth, related content ideas
- **Mock Implementation**: Analyzes content structure and suggests additions

### 3. Ideas Analysis
- **Purpose**: Generate new content ideas
- **Output**: Related article suggestions, trending topics, content opportunities
- **Mock Implementation**: Creates content ideas based on current content

### 4. Trends Analysis
- **Purpose**: Identify content trends and recommendations
- **Output**: Trending topics, optimization opportunities, future content strategy
- **Mock Implementation**: Analyzes content for trend alignment

## Error Handling

### Job Failure Recovery
```php
try {
    // Process analysis
    $this->process_analysis_type($analysis_id, $type, $analysis_data);
} catch (Exception $e) {
    // Log error and update status
    error_log('Analysis failed: ' . $e->getMessage());
    $this->update_analysis_status($analysis_id, 'failed');
}
```

### Retry Logic
- **Automatic Retry**: Action Scheduler handles retries automatically
- **Max Retries**: Configurable retry limits
- **Exponential Backoff**: Delays between retries increase progressively

### Graceful Degradation
- **Fallback Mode**: If Action Scheduler unavailable, process synchronously
- **User Feedback**: Clear error messages and status updates
- **Recovery Options**: Manual retry buttons for failed analyses

## Performance Optimization

### Database Optimization
```sql
-- Efficient queries for status checking
SELECT * FROM wp_wegenius_analyses 
WHERE article_id = %d 
ORDER BY created_at DESC 
LIMIT 1;
```

### Memory Management
- **Batch Processing**: Process large datasets in chunks
- **Memory Cleanup**: Clear temporary data after processing
- **Resource Limits**: Monitor and limit resource usage

### Caching Strategy
- **Result Caching**: Store analysis results to avoid re-processing
- **Status Caching**: Cache status information for faster polling
- **Cleanup Jobs**: Automatic cleanup of old analysis records

## Monitoring and Logging

### Job Monitoring
```php
// Check job status
$scheduled_action = as_get_scheduled_action($job_id);
if ($scheduled_action) {
    $response['job_status'] = 'scheduled';
    $response['job_scheduled_for'] = $scheduled_action->get_schedule()->get_date();
}
```

### Logging
```php
// Comprehensive logging
error_log(sprintf('WeGenius: Analysis job scheduled for post %d, analysis %d', $post_id, $analysis_id));
error_log(sprintf('WeGenius: Analysis completed for post %d, analysis %d', $post_id, $analysis_id));
error_log(sprintf('WeGenius: Analysis failed for post %d, analysis %d: %s', $post_id, $analysis_id, $e->getMessage()));
```

### Status Tracking
- **Real-time Updates**: Live status updates in WordPress admin
- **Progress Indicators**: Visual progress feedback for users
- **Completion Notifications**: Success/failure notifications

## Configuration

### Action Scheduler Settings
```php
// Job group configuration
const GROUP = 'wegenius-analysis';
const HOOK = 'wegenius_process_analysis';

// Cleanup scheduling
as_schedule_recurring_action(
    time() + DAY_IN_SECONDS,
    WEEK_IN_SECONDS,
    'wegenius_cleanup_old_analyses',
    [],
    self::GROUP
);
```

### Polling Configuration
```javascript
// Frontend polling settings
const POLL_INTERVAL = 5000; // 5 seconds
const MAX_POLL_ATTEMPTS = 60; // 5 minutes max
```

## Security Considerations

### Permission Checks
```php
// Verify user permissions
if (!current_user_can('manage_options')) {
    return new WP_Error('insufficient_permissions', 'Access denied');
}
```

### Data Sanitization
```php
// Sanitize all inputs
$post_id = absint($request->get_param('post_id'));
$analysis_types = array_map('sanitize_text_field', $analysis_types);
```

### Nonce Verification
```php
// Verify nonce for all requests
$nonce = $request->get_header('X-WP-Nonce');
if (!$nonce || !wp_verify_nonce($nonce, 'wp_rest')) {
    return false;
}
```

## Testing and Debugging

### Mock Data Integration
- **Development Mode**: Use mock data for testing
- **Realistic Scenarios**: Test with various content types
- **Error Simulation**: Test failure scenarios

### Debug Tools
```php
// Enable debug logging
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('WeGenius Debug: ' . $message);
}
```

### Status Monitoring
- **Action Scheduler Admin**: Monitor job queue
- **Database Queries**: Check analysis records
- **Frontend Console**: Monitor polling requests

## Future Enhancements

### Advanced Features
- [ ] **Priority Queues**: High-priority analysis jobs
- [ ] **Batch Processing**: Multiple posts in single job
- [ ] **Progress Tracking**: Detailed progress indicators
- [ ] **Webhook Integration**: External system notifications

### Performance Improvements
- [ ] **Job Chunking**: Split large analyses into smaller jobs
- [ ] **Parallel Processing**: Multiple analysis types simultaneously
- [ ] **Resource Optimization**: Memory and CPU usage optimization
- [ ] **Caching Layer**: Redis/Memcached integration

### Monitoring and Analytics
- [ ] **Job Metrics**: Processing time, success rates
- [ ] **Performance Dashboard**: Real-time job monitoring
- [ ] **Alert System**: Failure notifications
- [ ] **Analytics Integration**: Usage statistics and trends

## Troubleshooting

### Common Issues

#### 1. Jobs Not Executing
- **Check Action Scheduler**: Verify Action Scheduler is running
- **Database Issues**: Check for database connection problems
- **Memory Limits**: Ensure sufficient PHP memory
- **Plugin Conflicts**: Check for conflicting plugins

#### 2. Status Not Updating
- **Polling Issues**: Check JavaScript console for errors
- **API Endpoints**: Verify REST API endpoints are accessible
- **Nonce Problems**: Ensure nonce verification is working
- **Caching Issues**: Clear any caching plugins

#### 3. Performance Problems
- **Database Optimization**: Check query performance
- **Memory Usage**: Monitor PHP memory consumption
- **Job Queue**: Check for job queue backlog
- **Server Resources**: Monitor server CPU and memory

### Debug Commands
```bash
# Check Action Scheduler status
wp action-scheduler status

# View scheduled jobs
wp action-scheduler list

# Run specific job
wp action-scheduler run --hook=wegenius_process_analysis
```

## Conclusion

The background job scheduling system provides a robust, scalable solution for AI content analysis that:

- **Enhances User Experience**: Non-blocking analysis processing
- **Ensures Reliability**: Action Scheduler handles job queuing and retries
- **Provides Real-time Updates**: Status polling keeps users informed
- **Maintains Performance**: Efficient resource usage and cleanup
- **Supports Scalability**: Handles multiple concurrent analyses

This system forms the foundation for reliable, production-ready AI content analysis within the WordPress ecosystem.
