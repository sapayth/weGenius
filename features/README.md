# weGenius WordPress Plugin

AI-powered content analysis and optimization plugin for WordPress.

## Overview

weGenius provides AI-powered content analysis tools directly within the WordPress admin dashboard, helping content creators optimize their articles for SEO, identify content gaps, and discover new article ideas.

## Features

### Core Analysis Types
- **🔧 Improve**: Analyze existing content for SEO improvements and readability
- **🔍 Gaps**: Find untapped content opportunities and missing topics
- **💡 Ideas**: Generate strategic article ideas and content clusters

### WordPress Integration
- **Posts Page Integration**: Add analysis columns to WordPress Posts table
- **WordPress Admin**: Seamless integration with familiar WordPress workflows
- **Action Scheduler**: Background processing for long-running analyses
- **REST API**: Secure communication with external analysis services

### User Experience
- **Progressive Disclosure**: Start simple, reveal details on demand
- **Contextual Integration**: Works within existing WordPress workflows
- **Actionable Results**: Clear next steps with priority levels
- **WordPress-Native Feel**: Matches WordPress admin design language

## Tech Stack

- **Backend**: PHP 7.4+ with WordPress standards
- **Frontend**: React 18 with WordPress Element
- **Styling**: Tailwind CSS v4 with custom WordPress admin styling
- **Build Tools**: Webpack 5, Babel, PostCSS
- **Dependencies**: Composer (PHP), npm (JavaScript)
- **Architecture**: PSR-4 autoloading, modern OOP patterns

## Development Setup

### Prerequisites

- Node.js 22+ (use `nvm use 22`)
- PHP 7.4+
- Composer
- WordPress 6.1+

### Installation

1. **Install PHP dependencies:**
   ```bash
   composer install
   ```

2. **Install JavaScript dependencies:**
   ```bash
   npm install
   ```

3. **Build assets:**
   ```bash
   npm run build
   ```

### Development Commands

- `npm run dev` - Development build with watch mode
- `npm run build` - Production build
- `npm run start` - Development server with hot reload
- `npm run lint` - ESLint code checking
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

### PHP Commands

- `composer phpcs` - Run PHP CodeSniffer
- `composer phpcbf` - Fix PHP coding standards

## Project Structure

```
weGenius/
├── includes/              # PHP classes (PSR-4 autoloading)
│   ├── Admin/            # Admin functionality
│   │   ├── Admin.php     # WeGenius\Admin\Admin
│   │   └── PostsPage.php # WeGenius\Admin\PostsPage
│   ├── Analysis/         # Analysis management
│   │   └── AnalysisManager.php # WeGenius\Analysis\AnalysisManager
│   ├── API/              # API communication
│   │   └── ApiClient.php # WeGenius\API\ApiClient
│   ├── Database/         # Database operations
│   │   └── Database.php  # WeGenius\Database\Database
│   ├── Abstracts/        # Base classes and interfaces
│   ├── Models/           # Data models
│   ├── REST/             # REST API endpoints
│   └── Traits/           # Reusable traits
├── assets/               # Compiled assets
│   ├── css/             # Compiled CSS
│   └── js/              # Compiled JavaScript
├── features/            # Feature documentation
│   ├── README.md        # Project overview and setup
│   └── posts-page-integration.md # Feature specification
├── composer.json        # PHP dependencies and PSR-4 autoloading
└── weGenius.php         # Main plugin file
```

## WordPress Integration

The plugin integrates with WordPress through:

- **Posts Page**: Adds analysis columns to the posts table
- **Action Scheduler**: Handles background processing
- **REST API**: Provides endpoints for frontend communication
- **WordPress Hooks**: Uses standard WordPress hooks and filters

## Styling

The plugin uses Tailwind CSS with custom WordPress admin styling:

- **Prefix**: All custom classes use `wegen-` prefix
- **WordPress Colors**: Matches WordPress admin color scheme
- **Responsive**: Mobile-friendly design
- **Accessibility**: Follows WordPress accessibility guidelines

## Development Roadmap

### Phase 1: MVP (Weeks 1-4)
- Posts page integration with 3 analysis buttons
- Basic modal structure and API integration
- WordPress user permission checks
- Simple error handling and loading states

### Phase 2: Enhanced Features (Weeks 5-8)
- Enhanced UI/UX with better animations
- Basic result caching and performance optimization
- User preferences and analysis history
- Mobile optimization and responsive design

### Phase 3: Advanced Features (Weeks 9-16)
- Analytics dashboard and reporting
- Automation and scheduled analysis
- Third-party integrations
- Team collaboration features

## Contributing

1. Follow WordPress coding standards
2. Use PSR-4 autoloading and modern OOP patterns
3. Test with WordPress 6.1+ and PHP 7.4+
4. Ensure all builds pass without errors
5. Follow the established naming conventions

## License

GPL-2.0-or-later
