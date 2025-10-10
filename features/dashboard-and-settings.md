# Dashboard and Settings Pages - Feature Specification

## Overview

This document outlines the detailed features and implementation plan for the weGenius dashboard and settings pages, inspired by the Yoast SEO dashboard design but tailored for AI-powered content analysis.

## Page Structure

### 1. Dashboard Page (Main Overview)

#### Visual Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ weGenius Dashboard                                              │
├─────────────────────────────────────────────────────────────────┤
│ Content Filter: [Posts ▼] Categories: [All ▼] Date: [Last 30 days ▼] │
│                                                                 │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐     │
│ │ Analyzed        │ │ Pending         │ │ Failed          │     │
│ │ 24 posts        │ │ 8 posts         │ │ 2 posts         │     │
│ │ [View Details]  │ │ [View Details]  │ │ [View Details]  │     │
│ │ 📊 85%          │ │ ⏳ Processing   │ │ ❌ 2 errors     │     │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘     │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Analysis Types Overview                                      │ │
│ │                                                             │ │
│ │ 🔧 Improve    │ 🔍 Gaps      │ 💡 Ideas        │ 📈 Trends  │ │
│ │ 15 results    │ 12 results  │ 18 results      │ 8 insights │ │
│ │ [View All]    │ [View All]  │ [View All]      │ [View All] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Recent Activity                                             │ │
│ │ • Post "How to Optimize Content" analyzed 2 mins ago       │ │
│ │ • 3 new improvement suggestions for "SEO Guide"            │ │
│ │ • Analysis completed for "Content Strategy"                 │ │
│ │ • Failed analysis for "Old Post" - API timeout             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### Features
- **Content Filtering**: Dropdown filters for post type, categories, date range
- **Status Overview Cards**: Visual cards showing analyzed, pending, failed counts
- **Analysis Types Grid**: Quick access to each analysis type with result counts
- **Recent Activity Feed**: Real-time updates on analysis progress
- **Progress Indicators**: Donut charts and progress bars for visual feedback

### 2. Settings Page

#### Tab Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ weGenius Settings                                              │
├─────────────────────────────────────────────────────────────────┤
│ [API Config] [Analysis Options] [Performance] [Permissions]     │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ API Configuration                                           │ │
│ │                                                             │ │
│ │ API Endpoint: [https://api.wegenius.com/v1/analyze    ]     │ │
│ │ API Key:      [**************************************] [Test] │ │
│ │ Timeout:      [30 seconds ▼]                               │ │
│ │ Rate Limit:   [10 requests/minute ▼]                       │ │
│ │                                                             │ │
│ │ [Save Changes]                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### API Configuration Tab
- **API Endpoint URL**: External service endpoint
- **API Key/Authentication**: Secure credential storage
- **Connection Test**: Validate API connectivity
- **Timeout Settings**: Request timeout configuration
- **Rate Limiting**: Requests per minute/hour limits
- **Retry Logic**: Failed request retry settings

#### Analysis Options Tab
- **Default Analysis Types**: Which types to select by default
- **Auto-Analysis**: Trigger analysis on post publish/update
- **Re-analysis Frequency**: Never, weekly, monthly, custom
- **Minimum Content Length**: Skip analysis for short content
- **Content Types**: Which post types to analyze
- **Categories**: Include/exclude specific categories

#### Performance Tab
- **Caching**: Cache analysis results (1 hour, 1 day, 1 week, never)
- **Batch Processing**: Number of concurrent analyses
- **Background Processing**: Priority level (low, normal, high)
- **Database Optimization**: Cleanup old analysis data
- **Memory Limits**: Maximum memory usage for analysis

#### Permissions Tab
- **Who Can Analyze**: Administrator, Editor, Author, Contributor
- **Who Can View Results**: Role-based access control
- **Who Can Configure**: Settings access permissions
- **Bulk Operations**: Who can run bulk analysis
- **Export Data**: Who can export analysis results

### 3. Analysis History Page

#### Table Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Analysis History                                               │
├─────────────────────────────────────────────────────────────────┤
│ [Search...] Type: [All ▼] Status: [All ▼] Date: [Last 30 days ▼] │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Post Title        │ Type    │ Status    │ Date       │ Actions│ │
│ │ "How to..."      │ 🔧💡🔍 │ Complete  │ 2 hrs ago  │ [View] │ │
│ │ "Guide to..."    │ 🔧     │ Analyzing │ 5 mins ago │ [Stop] │ │
│ │ "Best ways.."    │ 🔍💡   │ Failed    │ 1 day ago  │ [Retry]│ │
│ │ "Content tips"   │ 💡     │ Complete  │ 3 hrs ago  │ [View] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [← Previous] [1] [2] [3] [4] [5] [Next →]                     │
└─────────────────────────────────────────────────────────────────┘
```

#### Features
- **Advanced Filtering**: Search, type, status, date range filters
- **Bulk Actions**: Select multiple analyses for bulk operations
- **Status Management**: View, stop, retry, delete analyses
- **Export Options**: CSV, JSON export of analysis data
- **Pagination**: Handle large datasets efficiently
- **Real-time Updates**: Live status updates via AJAX

### 4. Reports Page

#### Tabbed Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ Analysis Reports                                                │
├─────────────────────────────────────────────────────────────────┤
│ [Improvements] [Content Gaps] [Ideas] [Trends] [Export]         │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Top Improvement Opportunities                               │ │
│ │                                                             │ │
│ │ 1. "SEO Guide" - Add more headings (Priority: High)        │ │
│ │ 2. "Content Tips" - Increase word count (Priority: Medium)  │ │
│ │ 3. "How to Guide" - Add internal links (Priority: Medium)   │ │
│ │                                                             │ │
│ │ [View All Improvements] [Export Report]                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### Improvements Tab
- **Top Issues**: Most common problems across content
- **Priority Scoring**: High, medium, low priority issues
- **Quick Fixes**: One-click improvement suggestions
- **Progress Tracking**: Before/after comparison
- **Category Breakdown**: Issues by content category

#### Content Gaps Tab
- **Missing Topics**: Identified content opportunities
- **Category Analysis**: Gaps by content category
- **Keyword Opportunities**: Suggested topics with search volume
- **Competitor Analysis**: Gaps compared to competitors
- **Content Calendar**: Suggested publishing schedule

#### Ideas Tab
- **Article Suggestions**: AI-generated topic ideas
- **Content Clusters**: Related topic groupings
- **Trending Topics**: Current popular subjects
- **Seasonal Content**: Time-relevant suggestions
- **Evergreen Ideas**: Timeless content suggestions

#### Trends Tab
- **Performance Metrics**: Analysis success rates
- **Content Quality Trends**: Improvement over time
- **Popular Analysis Types**: Most used features
- **User Engagement**: How often results are viewed
- **System Performance**: Analysis speed and reliability

## Technical Implementation

### 1. Database Schema

#### Analysis Table
```sql
CREATE TABLE wp_wegenius_analyses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT UNSIGNED NOT NULL,
    analysis_type ENUM('improve', 'gaps', 'ideas', 'trends') NOT NULL,
    status ENUM('pending', 'analyzing', 'completed', 'failed') NOT NULL,
    request_data LONGTEXT,
    result_data LONGTEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_post_id (post_id),
    INDEX idx_status (status),
    INDEX idx_analysis_type (analysis_type),
    INDEX idx_created_at (created_at)
);
```

#### Settings Table
```sql
CREATE TABLE wp_wegenius_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value LONGTEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. React Components Structure

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── DashboardOverview.jsx
│   │   ├── StatusCards.jsx
│   │   ├── AnalysisTypesGrid.jsx
│   │   ├── RecentActivity.jsx
│   │   └── ContentFilters.jsx
│   ├── Settings/
│   │   ├── SettingsTabs.jsx
│   │   ├── ApiConfiguration.jsx
│   │   ├── AnalysisOptions.jsx
│   │   ├── PerformanceSettings.jsx
│   │   └── PermissionsSettings.jsx
│   ├── History/
│   │   ├── AnalysisHistory.jsx
│   │   ├── HistoryTable.jsx
│   │   ├── HistoryFilters.jsx
│   │   └── BulkActions.jsx
│   └── Reports/
│       ├── ReportsTabs.jsx
│       ├── ImprovementsReport.jsx
│       ├── GapsReport.jsx
│       ├── IdeasReport.jsx
│       └── TrendsReport.jsx
```

### 3. REST API Endpoints

#### Dashboard Endpoints
- `GET /wp-json/wegenius/v1/dashboard/overview` - Dashboard statistics
- `GET /wp-json/wegenius/v1/dashboard/activity` - Recent activity feed
- `GET /wp-json/wegenius/v1/dashboard/analyses` - Analysis counts by type

#### Settings Endpoints
- `GET /wp-json/wegenius/v1/settings` - Get all settings
- `POST /wp-json/wegenius/v1/settings` - Update settings
- `POST /wp-json/wegenius/v1/settings/test-api` - Test API connection

#### History Endpoints
- `GET /wp-json/wegenius/v1/history` - Get analysis history
- `POST /wp-json/wegenius/v1/history/bulk-action` - Bulk operations
- `DELETE /wp-json/wegenius/v1/history/{id}` - Delete analysis

#### Reports Endpoints
- `GET /wp-json/wegenius/v1/reports/improvements` - Improvements report
- `GET /wp-json/wegenius/v1/reports/gaps` - Content gaps report
- `GET /wp-json/wegenius/v1/reports/ideas` - Ideas report
- `GET /wp-json/wegenius/v1/reports/trends` - Trends report

### 4. WordPress Hooks Integration

#### Dashboard Hooks
```php
// Add dashboard widgets
add_action('wp_dashboard_setup', [$this, 'add_dashboard_widgets']);

// Add admin menu items
add_action('admin_menu', [$this, 'add_admin_menu']);

// Enqueue dashboard scripts
add_action('admin_enqueue_scripts', [$this, 'enqueue_dashboard_scripts']);
```

#### Settings Hooks
```php
// Register settings
add_action('admin_init', [$this, 'register_settings']);

// Settings validation
add_filter('pre_update_option_wegenius_settings', [$this, 'validate_settings']);

// Settings sanitization
add_filter('sanitize_option_wegenius_settings', [$this, 'sanitize_settings']);
```

### 5. Performance Considerations

#### Caching Strategy
- **Dashboard Data**: Cache for 5 minutes, refresh on analysis completion
- **Settings**: Cache in memory, update on change
- **Reports**: Cache for 1 hour, regenerate on demand
- **History**: Paginate results, cache current page

#### Database Optimization
- **Indexes**: Proper indexing on frequently queried columns
- **Cleanup**: Remove old analysis data after 90 days
- **Batch Operations**: Process large datasets in chunks
- **Query Optimization**: Use efficient queries with proper joins

#### Frontend Performance
- **Lazy Loading**: Load components on demand
- **Code Splitting**: Split JavaScript bundles by page
- **Image Optimization**: Optimize charts and visualizations
- **CDN Integration**: Serve static assets from CDN

## User Experience Design

### 1. Progressive Disclosure
- **Level 1**: Dashboard overview with key metrics
- **Level 2**: Detailed views for each analysis type
- **Level 3**: Individual post analysis results
- **Level 4**: Deep-dive reports and insights

### 2. Visual Hierarchy
- **Primary Actions**: Scan, analyze, view results
- **Secondary Actions**: Settings, export, bulk operations
- **Information**: Status, progress, timestamps
- **Navigation**: Clear menu structure and breadcrumbs

### 3. Responsive Design
- **Desktop**: Full feature set with sidebars
- **Tablet**: Condensed layout with collapsible sections
- **Mobile**: Stacked layout with touch-friendly controls

### 4. Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Color Contrast**: WCAG AA compliance
- **Focus Management**: Clear focus indicators

## Implementation Phases

### Phase 1: Core Dashboard (Weeks 1-2)
- Basic dashboard layout
- Status overview cards
- Simple filtering
- Recent activity feed

### Phase 2: Settings Integration (Weeks 3-4)
- Settings page structure
- API configuration
- Basic analysis options
- Permission controls

### Phase 3: History & Reports (Weeks 5-6)
- Analysis history table
- Basic reporting
- Export functionality
- Bulk operations

### Phase 4: Advanced Features (Weeks 7-8)
- Advanced filtering
- Trend analysis
- Performance optimization
- Mobile responsiveness

## Success Metrics

### User Engagement
- Dashboard page views per session
- Settings configuration completion rate
- Report usage frequency
- Feature adoption rate

### Performance Metrics
- Page load times
- API response times
- Database query efficiency
- Memory usage optimization

### Business Impact
- Analysis completion rate
- Content improvement adoption
- User satisfaction scores
- Feature request frequency

## Future Enhancements

### Advanced Analytics
- Machine learning insights
- Predictive content suggestions
- Competitive analysis
- Market trend integration

### Collaboration Features
- Team member permissions
- Shared analysis results
- Comment system
- Workflow management

### Integration Capabilities
- Third-party API connections
- WordPress plugin integrations
- External tool exports
- Custom webhook support

This comprehensive feature specification provides a roadmap for building a powerful, user-friendly dashboard and settings system that rivals the best WordPress plugins while maintaining the unique AI-powered content analysis focus of weGenius.
