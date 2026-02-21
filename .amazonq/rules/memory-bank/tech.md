# Technology Stack

## Core Technologies

### Frontend Framework
- **Angular**: 19.2.9
  - Modern component-based architecture
  - TypeScript-first development
  - Reactive programming with RxJS
  - Server-Side Rendering (SSR) support
  - Progressive Web App (PWA) capabilities

### Language
- **TypeScript**: ~5.8.0
  - Static typing for JavaScript
  - Enhanced IDE support
  - Better code maintainability

### Build System
- **Nx**: 21.6.2
  - Monorepo management
  - Smart rebuilds and caching
  - Code generation and scaffolding
  - Integrated testing and linting

### Node.js Runtime
- **Minimum Version**: Node.js 18+
- **npm Version**: 9+

## UI Framework & Styling

### CSS Framework
- **Tailwind CSS**: ^3.0.2
  - Utility-first CSS framework
  - Custom preset: `tailwind.preset.js`
  - Custom prefix: `com-` for utilities
  - Plugins:
    - `@tailwindcss/aspect-ratio`: ^0.4.2
    - `@tailwindcss/typography`: ^0.5.10
    - `tailwindcss-animated`: ^1.1.2
    - `tailwind-scrollbar-hide`: ^1.1.7

### Component Library
- **Nebular (Custom Fork)**: @commudle/theme 15.0.0
  - Eva Design System integration
  - Custom themed components
  - Icons: @commudle/eva-icons 15.0.0

### Styling Tools
- **SCSS**: Component-scoped styles
- **PostCSS**: ^8.4.5
  - `postcss-import`: ^16.0.1
  - `postcss-preset-env`: ^9.4.0
  - `postcss-url`: ^10.1.3
- **Autoprefixer**: ^10.4.0

## State Management & Data Flow

### Reactive Programming
- **RxJS**: ~7.8.0
  - Observable streams
  - Operators for data transformation
  - Subject/BehaviorSubject for state

### Real-time Communication
- **ActionCable**: ^5.2.8-1
  - WebSocket connections
  - Real-time updates
- **@anycable/web**: ^0.7.3
  - AnyCable WebSocket client

## Rich Text Editors

### TinyMCE
- **@tinymce/tinymce-angular**: ^7.0.0
- **tinymce**: ^7.0.1
- Full-featured WYSIWYG editor

### Tiptap
- **@tiptap/core**: ^2.11.7
- **Extensions**:
  - bubble-menu: ^2.11.7
  - character-count: ^2.11.7
  - document: ^2.11.7
  - floating-menu: ^2.11.7
  - gapcursor: ^2.11.7
  - history: ^2.11.7
  - link: ^2.11.7
  - paragraph: ^2.11.7
  - placeholder: ^2.11.7
  - text: ^2.11.7
- **@tiptap/pm**: ^2.11.7
- **@tiptap/suggestion**: ^2.11.7

## Content & Media

### Markdown
- **ngx-markdown**: ^19.1.1
- **marked**: ^15.0.12
- Markdown parsing and rendering

### Code Highlighting
- **prismjs**: ^1.29.0
- Syntax highlighting for code blocks

### Video Integration
- **100ms Live Video**:
  - `@100mslive/hms-video-store`: 0.11.0
  - `@100mslive/hms-virtual-background`: 1.12.0
- **@angular/youtube-player**: 19.2.9

### Image Processing
- **@sanity/image-url**: ^1.0.2
- Image URL generation and transformation

### QR Code
- **lean-qr**: ^2.3.4
- QR code generation

### Barcode Scanning
- **@zxing/browser**: 0.1.5
- **@zxing/library**: 0.21.3
- **@zxing/ngx-scanner**: 19.0.0

## UI Components & Utilities

### Icons
- **FontAwesome**:
  - `@fortawesome/angular-fontawesome`: ^1.0.0
  - `@fortawesome/free-solid-svg-icons`: ^6.7.2
  - `@fortawesome/free-regular-svg-icons`: ^6.7.2
  - `@fortawesome/free-brands-svg-icons`: ^6.7.2
- **eva-icons**: ^1.1.3

### Animations
- **lottie-web**: ^5.12.2
- **canvas-confetti**: ^1.9.2

### UI Utilities
- **@ngneat/helipopper**: ^8.0.3 (Tooltips/Popovers)
- **@ngneat/overview**: ^5.1.1
- **@ctrl/ngx-emoji-mart**: ^9.2.0 (Emoji picker)

### Form Components
- **angular2-multiselect-dropdown**: ^5.0.4
- **ng2-completer**: ^9.0.1
- **ng-recaptcha-2**: ^15.0.3

### Data Tables
- **angular2-smart-table**: ^3.1.1

## Maps & Location
- **@angular/google-maps**: 19.2.9
- Google Maps integration

## Payment Processing
- **@stripe/stripe-js**: ^8.0.0
- **ngx-stripe**: ^19.7.0
- Stripe payment integration

## CMS Integration
- **@sanity/client**: ^6.14.0
- **@portabletext/to-html**: ^2.0.5
- Sanity headless CMS

## Utilities

### Date & Time
- **moment**: ^2.30.1
- **moment-timezone**: ^0.5.45

### Data Manipulation
- **lodash**: ^4.17.21
- **lodash-es**: ^4.17.21

### Text Processing
- **autolinker**: ^4.0.0
- **ngx-linky**: ^4.0.0
- Automatic link detection

### Unique IDs
- **uuid**: ^9.0.1

### Charts
- **chart.js**: ^2.9.4

### Page Builder
- **grapesjs**: ^0.21.8
- **grapesjs-preset-newsletter**: ^1.0.2

## Server-Side Technologies

### Express Server
- **express**: 4.21.2
- **compression**: ^1.7.4
- **express-static-gzip**: ^2.1.7
- **cookie-parser**: ^1.4.6

### SSR & Prerendering
- **@angular/ssr**: 19.2.9
- **@angular/platform-server**: 19.2.9
- **prerender-node**: ^3.7.0

### PWA
- **@angular/service-worker**: 19.2.9
- **@angular/pwa**: 19.2.9

## Monitoring & Analytics

### Error Tracking
- **@sentry/angular**: ^9.40.0
- Real-time error monitoring

### Cookies
- **ngx-cookie-service**: ^19.1.2

## Testing

### Unit Testing
- **Jest**: ^29.4.1
- **jest-preset-angular**: 14.6.1
- **jest-environment-jsdom**: ^29.4.1
- **ts-jest**: 29.4.4

### E2E Testing
- **Cypress**: 14.5.4
- **eslint-plugin-cypress**: ^2.13.4

## Code Quality

### Linting
- **ESLint**: ^9.0.0
- **@angular-eslint/eslint-plugin**: 19.8.1
- **@angular-eslint/eslint-plugin-template**: 19.8.1
- **@typescript-eslint/eslint-plugin**: 8.45.0
- **@typescript-eslint/parser**: 8.45.0
- **eslint-config-prettier**: 10.1.8

### Formatting
- **Prettier**: ^2.6.2
- **lint-staged**: ^15.2.2

### Git Hooks
- **Husky**: ^9.0.11
- Pre-commit and commit-msg hooks

### Commit Linting
- **@commitlint/cli**: ^19.8.1
- **@commitlint/config-conventional**: ^19.8.1
- **@commitlint/config-nx-scopes**: ^19.8.1

## Documentation

### Code Documentation
- **@compodoc/compodoc**: ^1.1.26
- **@twittwer/compodoc**: ^1.13.0
- Generate code documentation

## Build & Optimization

### Webpack
- **@angular-builders/custom-webpack**: ~19.0.0
- **compression-webpack-plugin**: ^11.0.0
- Custom webpack configuration

### Package Building
- **ng-packagr**: 19.2.2
- Build Angular libraries

### Archiving
- **archiver**: ^6.0.1
- Create deployment archives

## Development Tools

### Process Management
- **pm2**: ^5.3.1
- Production process manager

### Live Reload
- **browser-sync**: ^3.0.0
- Development server with live reload

### TypeScript Tools
- **ts-node**: 10.9.1
- TypeScript execution

## Development Commands

### Start Development Server
```bash
npx nx run commudle-admin:serve
# or
npm start
```

### Build for Production
```bash
npx nx run commudle-admin:release
# or
npm run build:ssr
```

### Run Tests
```bash
npx nx test <project-name>
# or
npm test
```

### Generate Components
```bash
# Component
npx nx g @nx/angular:component <component-name>

# Service
npx nx g @nx/angular:service <service-name>

# Interface
npx nx g @nx/angular:interface <interface-name>
```

### Clear Cache
```bash
npx nx reset
```

### Lint Code
```bash
npx nx lint <project-name>
```

## Environment Requirements

### Development
- Node.js 18+
- npm 9+
- Angular CLI
- Git

### Production
- Node.js runtime
- AWS Elastic Beanstalk
- Environment variables for API endpoints
- SSL certificates

## API Integration

### Backend Communication
- RESTful API endpoints
- WebSocket connections for real-time features
- ActionCable for live updates
- Production API: commudle.com

## Browser Support

### Target Browsers
Configured in `.browserslistrc`:
- Modern browsers (last 2 versions)
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Android)

## TypeScript Configuration

### Compiler Options
- **Target**: ES2022
- **Module**: ES2022
- **Strict Mode**: Enabled
- **Path Mapping**: Configured for monorepo
- **Decorators**: Enabled for Angular

## Package Management

### Lock File
- **package-lock.json**: npm lock file
- Ensures consistent dependency versions

### Private Package
- Project is marked as private
- Not published to npm registry
