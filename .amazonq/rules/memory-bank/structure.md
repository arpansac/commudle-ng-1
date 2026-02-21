# Project Structure

## Overview

Commudle is built as an Nx monorepo workspace with a modular architecture. The project follows Angular best practices with clear separation of concerns between applications, libraries, and shared modules.

## Root Directory Structure

```
commudle-ng/
├── apps/                    # Applications and shared modules
├── libs/                    # Reusable libraries
├── tools/                   # Build tools and scripts
├── deploy/                  # Deployment configurations
├── prod-server/            # Production server artifacts
├── .amazonq/               # Amazon Q AI assistant rules
├── .github/                # GitHub workflows and templates
├── .husky/                 # Git hooks
└── Configuration files     # Root-level configs
```

## Apps Directory (`apps/`)

### Main Application
- **commudle-admin/**: Primary Angular application
  - Main entry point for the platform
  - Contains all feature modules and components
  - Configured for SSR (Server-Side Rendering)
  - PWA-enabled with service worker

### Supporting Applications
- **commudle-admin-e2e/**: End-to-end tests using Cypress
- **lib-error-handler/**: Error handling library
- **prerender/**: SSR prerendering service

### Shared Modules (`apps/shared-*`)

#### Components (`apps/shared-components/`)
Reusable UI components organized by feature:
- **alert/**: Alert notifications
- **badge/**: Badge displays
- **banner-image/**: Image banners
- **bottom-sheet/**: Bottom sheet modals
- **build-card/**: Community build cards
- **campaign-*/**: Campaign-related components
- **community-badge/**: Community badges
- **cookie-consent/**: GDPR cookie consent
- **data-form-fill/**: Form filling components
- **discussion-personal-chat/**: Chat interface
- **edit-data-form/**: Form editing
- **entity-updates/**: Entity update displays
- **faq-*/**: FAQ components
- **form-responses/**: Form response management
- **hackathon-cards/**: Hackathon displays
- **interested-members/**: Member lists
- **loading-spinner/**: Loading indicators
- **messages/**: Messaging components
- **new-data-form/**: Form creation
- **newsletter-card/**: Newsletter displays
- **pagination/**: Pagination controls
- **payment-detail/**: Payment information
- **poll-*/**: Polling components
- **qna/**: Q&A interface
- **share-button/**: Social sharing
- **sidebar/**: Navigation sidebar
- **tag/**: Tag displays
- **user-*/**: User-related components
- **video-stream/**: Video streaming
- **wallet-details/**: Wallet information
- **work-in-progress/**: WIP indicators

#### Directives (`apps/shared-directives/`)
- **activity-feed.directive**: Activity feed behavior
- **breakpoints.directive**: Responsive breakpoint handling
- **click-outside.directive**: Outside click detection
- **highlight-links.directive**: Link highlighting
- **lazy-load-images.directive**: Image lazy loading
- **longpress.directive**: Long press gesture
- **textarea-autoresize.directive**: Auto-resizing textareas

#### Models (`apps/shared-models/`)
TypeScript interfaces and types for:
- **enums/**: Enumeration types
- **stats/**: Statistics models
- Core entities: Users, Communities, Events, Hackathons
- Form models: DataForm, Questions, Responses
- Content models: Posts, Discussions, Newsletters
- Event models: Registrations, Locations, Tracks
- Hackathon models: Teams, Submissions, Rounds
- User models: Profiles, Badges, Roles

#### Pipes (`apps/shared-pipes/`)
Data transformation pipes:
- **capitalize-and-remove-underscore.pipe**: Text formatting
- **complete-url.pipe**: URL completion
- **enum-format.pipe**: Enum formatting
- **group-by.pipe**: Array grouping
- **order-by.pipe**: Array ordering
- **safe-html.pipe**: HTML sanitization
- **safe-url.pipe**: URL sanitization
- **search-by.pipe**: Search filtering
- **sort-by.pipe**: Array sorting
- **text-to-links.pipe**: Link conversion
- **truncate-text.pipe**: Text truncation

#### Services (`apps/shared-services/`)
Core business logic services:
- **notifications/**: Notification management
- **websockets/**: WebSocket connections
- **action-cable-connection.socket**: ActionCable integration
- **api-routes.service**: API endpoint management
- **lib-authwatch.service**: Authentication monitoring
- **lib-toastlog.service**: Toast notifications
- **login-auth.service**: Login authentication
- **seo.service**: SEO optimization
- **users.service**: User management
- **feed.service**: Activity feed
- **polls.service**: Polling functionality
- **push-notifications.service**: Push notification handling

#### Modules (`apps/shared-modules/`)
Feature modules:
- **hms-video/**: 100ms video integration
- **infinite-scroll/**: Infinite scrolling
- **mention/**: User mention functionality
- **mini-user-profile/**: Compact user profiles
- **page-ads/**: Advertisement management

#### Other Shared
- **shared-helper-modules/**: Helper utilities
- **shared-interceptors/**: HTTP interceptors
- **shared-resolvers/**: Route resolvers

## Libs Directory (`libs/`)

Publishable and reusable libraries:

### Core Libraries
- **auth/**: Authentication library
  - Login/logout functionality
  - Token management
  - Auth guards

- **editor/**: Rich text editor library
  - TinyMCE integration
  - Tiptap integration
  - Custom editor components

- **in-viewport/**: Viewport detection library
  - Intersection observer utilities
  - Visibility tracking

- **infinite-scroll/**: Infinite scroll library
  - Scroll detection
  - Dynamic content loading

- **ngx-datatable/**: Data table library
  - Sortable tables
  - Filterable columns
  - Pagination support

### Shared Library (`libs/shared/`)
Common utilities organized by type:
- **channels/**: Communication channels
- **components/**: Shared components
- **environments/**: Environment configurations
- **models/**: Shared data models
- **services/**: Shared services
- **validators/**: Form validators

## Architectural Patterns

### Monorepo Architecture
- **Nx Workspace**: Centralized build and dependency management
- **Code Sharing**: Shared libraries across applications
- **Consistent Tooling**: Unified linting, testing, and building

### Module Organization
- **Feature Modules**: Organized by business domain
- **Shared Modules**: Reusable across features
- **Core Module**: Singleton services and app-wide components
- **Lazy Loading**: Route-based code splitting

### Component Architecture
- **Smart/Container Components**: Handle business logic and state
- **Presentational Components**: Pure UI components
- **Component Composition**: Small, focused components
- **Standalone Components**: Modern Angular standalone pattern

### Service Layer
- **API Services**: HTTP communication with backend
- **State Services**: Application state management
- **Utility Services**: Helper functions and utilities
- **Guard Services**: Route protection

### Data Flow
- **RxJS Observables**: Reactive data streams
- **Subject/BehaviorSubject**: State management
- **Async Pipe**: Template subscriptions
- **Unsubscribe Pattern**: Memory leak prevention

### Styling Architecture
- **Tailwind CSS**: Utility-first CSS framework
- **SCSS**: Component-scoped styles
- **Nebular Theme**: UI component library (@commudle/theme)
- **Custom Prefix**: `com-` prefix for Tailwind utilities
- **Nested Hierarchy**: Parent-child class nesting

### Routing Strategy
- **Lazy Loading**: Feature modules loaded on demand
- **Route Guards**: Authentication and authorization
- **Resolvers**: Pre-fetch data before route activation
- **Child Routes**: Nested routing structure

### Build & Deployment
- **SSR (Server-Side Rendering)**: Angular Universal
- **PWA**: Progressive Web App capabilities
- **Production Build**: Optimized bundle with compression
- **Elastic Beanstalk**: AWS deployment target

## Key Configuration Files

### Root Level
- **nx.json**: Nx workspace configuration
- **package.json**: Dependencies and scripts
- **tsconfig.base.json**: Base TypeScript configuration
- **tailwind.preset.js**: Tailwind CSS preset
- **jest.config.ts**: Jest testing configuration
- **eslint.config.mjs**: ESLint configuration
- **.prettierrc**: Code formatting rules
- **commitlint.config.js**: Commit message linting

### Application Level
- **project.json**: Nx project configuration
- **tsconfig.app.json**: App TypeScript config
- **tsconfig.server.json**: SSR TypeScript config
- **tailwind.config.js**: App-specific Tailwind config
- **ngsw-config.json**: Service worker configuration

## Development Workflow

### Code Generation
```bash
# Component
npx nx g @nx/angular:component <component-name>

# Service
npx nx g @nx/angular:service <service-name>

# Interface
npx nx g @nx/angular:interface <interface-name>
```

### Development Server
```bash
npx nx run commudle-admin:serve
# Runs on http://localhost:4200/
```

### Production Build
```bash
npx nx run commudle-admin:release
# Generates prod-server.zip
```

### Testing
```bash
npx nx test <project-name>
```

## Import Patterns

### Barrel Exports
- **@commudle/shared-services**: Service barrel exports
- **@commudle/shared-models**: Model barrel exports
- **@commudle/theme**: Nebular components (custom fork)

### Path Aliases
Configured in `tsconfig.base.json` for clean imports across the monorepo.

## Deployment Structure

### Production Artifacts
- **prod-server.zip**: Deployment package
  - **browser/**: Static client assets
  - **server/**: SSR Node.js server
  - **tinymce/**: TinyMCE assets

### Deployment Target
- **AWS Elastic Beanstalk**: Production environment
- **Node.js Platform**: Express server for SSR
- **Environment Variables**: Configuration management
