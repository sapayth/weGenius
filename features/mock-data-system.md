# Mock Data System

A comprehensive mock data system for the WeGenius WordPress plugin, providing realistic test data for development and testing purposes.

## Overview

The mock data system provides:
- **Realistic test data** based on the WeGenius API structure
- **REST endpoints** for easy frontend testing
- **React hooks** for seamless integration
- **JavaScript utilities** for manual API calls
- **Demo components** for showcasing functionality

## Architecture

### Backend Components

#### 1. MockDataProvider (`includes/MockData/MockDataProvider.php`)
- Static class providing mock data generation methods
- Covers all API endpoints from the Postman collection
- Generates realistic, varied data for testing

#### 2. MockDataController (`includes/REST/MockDataController.php`)
- REST API controller for mock endpoints
- Mirrors the structure of the main API controller
- Provides `/wp-json/wegenius/v1/mock/*` endpoints

### Frontend Components

#### 1. Mock Data API (`src/js/utils/mockData.js`)
- JavaScript client for mock API calls
- Singleton pattern for easy access
- Promise-based methods for all endpoints

#### 2. React Hooks (`src/js/hooks/useMockData.js`)
- Custom hooks for React components
- Loading states, error handling, and data management
- Specialized hooks for different data types

#### 3. Demo Component (`src/js/components/MockDataDemo.jsx`)
- Interactive demonstration of mock data functionality
- Real-time data fetching and display
- Manual API call examples

## Available Endpoints

### Article Management
- `POST /wp-json/wegenius/v1/mock/articles/submit` - Submit article for analysis
- `GET /wp-json/wegenius/v1/mock/articles/analyses` - Get all analyses
- `GET /wp-json/wegenius/v1/mock/articles/analyses/{id}/status` - Get analysis status
- `GET /wp-json/wegenius/v1/mock/articles/analyses/{id}/results` - Get analysis results
- `GET /wp-json/wegenius/v1/mock/articles/{post_id}/history` - Get article history

### Suggestions
- `GET /wp-json/wegenius/v1/mock/suggestions/analysis/{id}` - Get suggestions for analysis
- `GET /wp-json/wegenius/v1/mock/suggestions/{id}` - Get suggestion details
- `POST /wp-json/wegenius/v1/mock/suggestions/approve` - Approve suggestions
- `POST /wp-json/wegenius/v1/mock/suggestions/reject` - Reject suggestions
- `POST /wp-json/wegenius/v1/mock/suggestions/implement` - Mark as implemented

### Content Versions
- `GET /wp-json/wegenius/v1/mock/posts/{post_id}/versions` - Get all versions
- `GET /wp-json/wegenius/v1/mock/posts/{post_id}/versions/{id}` - Get specific version
- `POST /wp-json/wegenius/v1/mock/posts/{post_id}/versions/compare` - Compare versions

### Content Analysis
- `POST /wp-json/wegenius/v1/mock/posts/{post_id}/analyze` - Analyze post
- `GET /wp-json/wegenius/v1/mock/posts/{post_id}/analyses` - Get post analyses
- `GET /wp-json/wegenius/v1/mock/analyses/{id}` - Get single analysis
- `POST /wp-json/wegenius/v1/mock/posts/{post_id}/apply-suggestion` - Apply suggestion

### Dashboard & Utility
- `POST /wp-json/wegenius/v1/mock/dashboard/overview` - Get dashboard overview
- `GET /wp-json/wegenius/v1/mock/health` - Health check
- `GET /wp-json/wegenius/v1/mock/docs` - API documentation

## Usage Examples

### JavaScript API Client

```javascript
import { mockDataAPI } from './utils/mockData';

// Submit article for analysis
const articleData = {
  wp_post_id: 123,
  title: 'Sample Article',
  content: '<p>Article content...</p>',
  action_type: 'improve'
};

const response = await mockDataAPI.submitArticle(articleData);
console.log(response);

// Get analyses with parameters
const analyses = await mockDataAPI.getAnalyses({ 
  status: 'completed', 
  limit: 10 
});

// Get dashboard overview
const dashboard = await mockDataAPI.getDashboardOverview();
```

### React Hooks

```jsx
import { useMockAnalyses, useMockDashboardOverview } from './hooks/useMockData';

function MyComponent() {
  const { data: analyses, loading, error } = useMockAnalyses({ limit: 5 });
  const { data: dashboard } = useMockDashboardOverview();

  if (loading) return <Spinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Analyses ({analyses?.length})</h2>
      {analyses?.map(analysis => (
        <div key={analysis.id}>
          Analysis #{analysis.id} - {analysis.status}
        </div>
      ))}
    </div>
  );
}
```

### Advanced Hooks

```jsx
import { useMockDataWithRefresh, useMockDataWithPolling } from './hooks/useMockData';

// Hook with manual refresh
function RefreshableComponent() {
  const { data, loading, refresh } = useMockDataWithRefresh(
    () => mockDataAPI.getAnalyses(),
    []
  );

  return (
    <div>
      <Button onClick={refresh}>Refresh Data</Button>
      {/* Component content */}
    </div>
  );
}

// Hook with polling
function PollingComponent() {
  const { data, polling, startPolling, stopPolling } = useMockDataWithPolling(
    () => mockDataAPI.getAnalysisStatus(123),
    5000, // 5 second intervals
    []
  );

  return (
    <div>
      <Button onClick={startPolling}>Start Polling</Button>
      <Button onClick={stopPolling}>Stop Polling</Button>
      {/* Component content */}
    </div>
  );
}
```

## Mock Data Structure

### Analysis Data
```javascript
{
  id: 1,
  article_id: 123,
  analysis_type: 'improve',
  status: 'completed',
  progress: 100,
  token_usage: 2500,
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:35:00Z'
}
```

### Analysis Results
```javascript
{
  id: 1,
  status: 'completed',
  results: {
    seo_score: 85,
    readability_score: 90,
    content_quality: 88,
    keyword_density: 2.5,
    word_count: 1200,
    reading_time: 5
  },
  scores: {
    overall: 87,
    seo: 85,
    readability: 90,
    structure: 88,
    engagement: 82
  },
  insights: {
    strengths: ['Good use of headings', 'Appropriate keyword density'],
    improvements: ['Add more internal links', 'Include more images'],
    recommendations: ['Consider adding FAQ section', 'Expand on key topics']
  }
}
```

### Dashboard Overview
```javascript
{
  overview: {
    analyzed: 45,
    pending: 8,
    failed: 2,
    neverAnalyzed: 12,
    total_posts: 67,
    analysis_success_rate: 95.7
  },
  analysisTypes: {
    improve: 25,
    gaps: 18,
    ideas: 15,
    trends: 12
  },
  recentActivity: [
    {
      id: 1,
      type: 'analysis_completed',
      title: 'Analysis completed for "WordPress SEO Guide"',
      description: 'SEO and readability analysis finished with 85% overall score',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'success'
    }
  ]
}
```

## Development Workflow

### 1. Frontend Development
- Use mock data endpoints for UI development
- Test different data states (loading, error, success)
- Develop components without backend dependencies

### 2. API Testing
- Test API integration patterns
- Validate request/response structures
- Test error handling scenarios

### 3. Component Testing
- Use React hooks for state management testing
- Test loading and error states
- Validate data flow and user interactions

## Configuration

### Environment Variables
```javascript
// In your WordPress admin
window.wegeniusAdmin = {
  nonce: 'your-nonce-here',
  ajaxUrl: '/wp-admin/admin-ajax.php',
  restUrl: '/wp-json/wegenius/v1'
};
```

### Customization
The mock data can be customized by modifying the `MockDataProvider` class:

```php
// Customize analysis types
$analysis_types = ['improve', 'gaps', 'ideas', 'trends', 'custom'];

// Customize status values
$statuses = ['pending', 'processing', 'completed', 'failed', 'custom'];

// Customize score ranges
$seo_score = rand(60, 95); // Instead of fixed values
```

## Best Practices

### 1. Data Consistency
- Use consistent IDs across related data
- Maintain realistic relationships between entities
- Generate varied but logical data

### 2. Error Simulation
- Include error scenarios in mock data
- Test different HTTP status codes
- Simulate network failures

### 3. Performance
- Use appropriate data sizes for testing
- Implement pagination for large datasets
- Consider memory usage for long-running tests

### 4. Documentation
- Keep mock data structure documented
- Update when API changes
- Provide clear usage examples

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure WordPress REST API is properly configured
2. **Authentication**: Check nonce and user permissions
3. **Data Not Loading**: Verify endpoint URLs and network requests
4. **Hook Dependencies**: Ensure proper dependency arrays in useEffect

### Debug Tools

```javascript
// Enable debug logging
localStorage.setItem('wegenius-debug', 'true');

// Check available endpoints
fetch('/wp-json/wegenius/v1/mock/health')
  .then(response => response.json())
  .then(data => console.log('Mock API Health:', data));
```

## Future Enhancements

- [ ] Real-time data updates with WebSockets
- [ ] Data persistence across page reloads
- [ ] Advanced filtering and search capabilities
- [ ] Bulk operations simulation
- [ ] Performance metrics and monitoring
- [ ] Integration with testing frameworks
