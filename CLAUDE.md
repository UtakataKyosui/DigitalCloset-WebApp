# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (Rust/Loco.rs)

#### Server & Development

- `cargo loco start` - Start the development server (runs on http://localhost:5150)
- `cargo loco start --environment production` - Start with specific environment
- `cargo loco watch` - Watch and restart the app on file changes
- `cargo loco doctor` - Validate and diagnose configurations
- `cargo loco version` - Display the app version

#### Database Operations

- `cargo loco db migrate` - Run database migrations
- `cargo loco db reset` - Reset the database (development only)
- `cargo loco db seed` - Seed database with initial data
- `cargo loco db seed --reset` - Clear all data before seeding
- `cargo loco db seed --dump` - Dump all database tables to files
- `cargo loco db seed --dump-tables <TABLES>` - Dump specific tables

#### Code Generation

- `cargo loco generate controller <name> --api` - Generate API controller
- `cargo loco generate controller <name> --html` - Generate HTML controller
- `cargo loco generate controller <name> --htmx` - Generate HTMX controller
- `cargo loco generate model <name>` - Generate a new model
- `cargo loco generate model <name> title:string content:text` - Generate model with fields
- `cargo loco generate migration <name>` - Generate a new migration
- `cargo loco generate migration AddUserRefToPosts user:references` - Generate reference migration
- `cargo loco generate scaffold <name> --api` - Generate full CRUD scaffold (API)
- `cargo loco generate scaffold <name> --html` - Generate full CRUD scaffold (HTML)
- `cargo loco generate scaffold <name> --htmx` - Generate full CRUD scaffold (HTMX)
- `cargo loco generate task <name>` - Generate a custom task
- `cargo loco generate worker <name>` - Generate a background worker
- `cargo loco generate deployment` - Generate deployment configurations (Docker, Shuttle, Nginx)

#### Application Information

- `cargo loco routes` - Describe all application endpoints
- `cargo loco middleware` - Describe all application middleware
- `cargo loco middleware --config` - Show middleware configuration

#### Tasks & Jobs

- `cargo loco task <task_name>` - Run a custom task
- `cargo loco task <task_name> var1:val1 var2:val2` - Run task with variables
- `cargo loco jobs` - Managing jobs queue
- `cargo loco scheduler` - Run the scheduler

#### Testing & Quality

- `cargo test` - Run all tests
- `cargo test models` - Run model tests only
- `cargo test requests` - Run request/controller tests only
- `cargo test <test_name>` - Run specific test
- `cargo check` - Check compilation without building
- `cargo clippy` - Run linter

### Frontend (Next.js)

- `npm run dev` - Start frontend development server (runs on http://localhost:3000)
- `npm run build` - Build frontend for production
- `npm run start` - Start production frontend server
- `npm run lint` - Run ESLint

### Loco CLI Usage Patterns

#### Field Types for Models/Scaffolds

**Basic Types:**

- `string` - Nullable string field (`string_null`)
- `string!` - Non-null string field (`string`)
- `string^` - Unique string field (`string_uniq`)
- `text` - Nullable text field (`text_null`)
- `text!` - Non-null text field (`text`)
- `text^` - Unique text field (`text_uniq`)

**Integer Types:**

- `int` - Nullable integer (`integer_null`)
- `int!` - Non-null integer (`integer`)
- `int^` - Unique integer (`integer_uniq`)
- `small_int` - Nullable small integer (`small_integer_null`)
- `small_int!` - Non-null small integer (`small_integer`)
- `small_int^` - Unique small integer (`small_integer_uniq`)
- `big_int` - Nullable big integer (`big_integer_null`)
- `big_int!` - Non-null big integer (`big_integer`)
- `big_int^` - Unique big integer (`big_integer_uniq`)

**Unsigned Integer Types:**

- `small_unsigned` - Nullable small unsigned (`small_unsigned_null`)
- `small_unsigned!` - Non-null small unsigned (`small_unsigned`)
- `small_unsigned^` - Unique small unsigned (`small_unsigned_uniq`)
- `big_unsigned` - Nullable big unsigned (`big_unsigned_null`)
- `big_unsigned!` - Non-null big unsigned (`big_unsigned`)
- `big_unsigned^` - Unique big unsigned (`big_unsigned_uniq`)

**Floating Point Types:**

- `float` - Nullable float (`float_null`)
- `float!` - Non-null float (`float`)
- `float^` - Unique float (`float_uniq`)
- `double` - Nullable double (`double_null`)
- `double!` - Non-null double (`double`)
- `double^` - Unique double (`double_uniq`)

**Decimal Types:**

- `decimal` - Nullable decimal (`decimal_null`)
- `decimal!` - Non-null decimal (`decimal`)
- `decimal_len` - Nullable decimal with length (`decimal_len_null`)
- `decimal_len!` - Non-null decimal with length (`decimal_len`)

**Boolean Type:**

- `bool` - Nullable boolean (`boolean_null`)
- `bool!` - Non-null boolean (`boolean`)
- `bool^` - Unique boolean (`boolean_uniq`)

**UUID Types:**

- `uuid` - Nullable UUID (`uuid_null`)
- `uuid!` - Non-null UUID (`uuid`)
- `uuid^` - Unique UUID (`uuid_uniq`)

**Timestamp Types:**

- `ts` - Nullable timestamp (`timestamp_null`)
- `ts!` - Non-null timestamp (`timestamp`)
- `ts^` - Unique timestamp (`timestamp_uniq`)
- `tstz` - Nullable timestamp with timezone (`timestamptz_null`) - **Recommended**
- `tstz!` - Non-null timestamp with timezone (`timestamptz`)
- `tstz^` - Unique timestamp with timezone (`timestamptz_uniq`)

**Date/Time Types:**

- `date` - Nullable date (`date_null`)
- `date!` - Non-null date (`date`)
- `date^` - Unique date (`date_uniq`)
- `time` - Nullable time (`time_null`)
- `time!` - Non-null time (`time`)
- `time^` - Unique time (`time_uniq`)

**Binary Types:**

- `binary` - Nullable binary data (`binary_null`)
- `binary!` - Non-null binary data (`binary`)
- `binary^` - Unique binary data (`binary_uniq`)

**JSON Types:**

- `json` - Nullable JSON field (`json_null`)
- `json!` - Non-null JSON field (`json`)
- `json^` - Unique JSON field (`json_uniq`)
- `jsonb` - Nullable JSONB field (PostgreSQL) (`jsonb_null`)
- `jsonb!` - Non-null JSONB field (`jsonb`)
- `jsonb^` - Unique JSONB field (`jsonb_uniq`)

**Reference Types:**

- `references` - Foreign key reference (e.g., `user:references`)
- `references:<table>` - Custom table reference (e.g., `departing_train:references:trains`)

**Field Modifiers:**

- `!` - Non-null constraint
- `^` - Unique constraint
- No modifier - Nullable field (default)

#### Environment Management

- **Timestamps with Timezone (`tstz`)**: From Loco v1.0+, `tstz` is preferred over `ts` for better cross-database compatibility
- **Default Fields**: All models automatically get `created_at (ts!)` and `updated_at (ts!)` fields
- **UUID vs ID**: Use UUID fields for public-facing identifiers (PIDs) instead of integer IDs
- **JSON vs JSONB**: Use `jsonb` for PostgreSQL for better performance and indexing support
- **Field Naming**: Follow snake_case convention for database field names
- Use `-e, --environment <ENVIRONMENT>` flag with any command
- Default environments: `development`, `test`, `production`
- Custom environments supported via config files
- Environment detection: CLI flag > LOCO_ENV > default (development)

#### Migration Naming Patterns

- `CreateJoinTable___And___` - For join tables between two models
- `AddColumnNameToTableName` - For adding columns
- `RemoveColumnNameFromTableName` - For removing columns
- Custom descriptive names for complex migrations

## Architecture Overview

### Framework & Stack

- **Backend Framework**: Loco.rs (Rails-like Rust web framework)
- **Frontend Framework**: Next.js 15 with React 19 and TypeScript
- **UI Components**: Radix UI primitives with Tailwind CSS v4
- **Database**: PostgreSQL with SeaORM
- **Authentication**: JWT-based with user sessions
- **View Engine**: Tera templates with i18n support (Fluent)
- **Background Jobs**: Async workers with queue system

### Full-Stack Architecture

This is a full-stack Digital Closet application with:

- **Backend API**: Rust/Loco.rs serving REST endpoints on http://localhost:5150
- **Frontend SPA**: Next.js React application on http://localhost:3000
- Both services run independently and communicate via HTTP API calls

### Core Domain Models

This is a Digital Closet application with three main entities:

1. **Users** - Authentication and user management (from Loco SaaS starter)
2. **Clothes** - Individual clothing items with attributes (name, brand, category, size, color, material, price, stock)
3. **Coordinates** - Outfit combinations that group multiple clothes items (with season, occasion, style metadata)
4. **ClothesCoordinates** - Junction table linking clothes to coordinates with position/notes

### Key Relationships

- Users have many Coordinates (one-to-many)
- Coordinates have many Clothes through ClothesCoordinates (many-to-many)
- Each ClothesCoordinates relation can store position and notes for outfit layout

### Project Structure

**Backend (myapp/):**

- `src/models/` - Domain models with business logic
- `src/controllers/` - HTTP request handlers (auth, clothes, coordinates)
- `src/views/` - Response formatting and templates
- `migration/` - Database schema migrations
- `tests/` - Comprehensive test suite with snapshots
- `config/` - Environment-specific configuration

**Frontend (frontend/):**

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - React components (includes shadcn/ui components)
- `src/hooks/` - Custom React hooks for data fetching
- `src/lib/` - Utility functions and API client

### Database Configuration

- Development DB: `postgres://loco:loco@localhost:5432/myapp_development`
- Auto-migration enabled in development
- Uses UUID for public IDs (PIDs) on clothes and coordinates

### Built-in Endpoints

- `/_ping` - Health check endpoint for load balancers
- `/_health` - Full health check (DB, Redis connections)
- `/api/auth/register` - User registration (SaaS starter)
- `/api/auth/login` - User login (SaaS starter)
- `/api/auth/current` - Get current authenticated user
- `/api/auth/forgot` - Forgot password flow
- `/api/auth/reset` - Reset password
- `/api/auth/verify` - Verify email address
- `DownloadWorker` registered for async file processing
- Workers run in BackgroundAsync mode in development

### Loco-Specific Development Patterns

#### Extractors Order (Important!)

- Parameters first (e.g., `Path(id): Path<i32>`)
- State second (e.g., `State(ctx): State<AppContext>`)
- Body last (e.g., `Json(params): Json<Params>`)
- Use `#[debug_handler]` macro for better error messages

#### Response Formats

```rust
// Simple responses
format::text("Hello")
format::json(data)
format::empty()

// Complex responses with builder pattern
format::render()
    .view(&item)
    .etag("some-etag")?
    .json(data)
```

#### Authentication Patterns

```rust
// JWT authentication
async fn protected_route(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> { ... }

// API key authentication
async fn api_route(
    auth: middleware::auth::ApiToken<users::Model>,
    State(ctx): State<AppContext>,
) -> Result<Response> { ... }
```

#### Model Validation

- Implement `Validatable` trait for model validation
- Use validator crate with `#[validate(...)]` attributes
- Custom validation functions supported

#### Task Implementation

```rust
use loco_rs::task::{Task, TaskInfo, Vars};

#[async_trait]
impl Task for MyTask {
    fn task(&self) -> TaskInfo {
        TaskInfo {
            name: "my_task".to_string(),
            detail: "Description of the task".to_string(),
        }
    }

    async fn run(&self, app_context: &AppContext, vars: &Vars) -> Result<()> {
        // Task implementation
        Ok(())
    }
}
```

#### Worker Implementation

```rust
use loco_rs::worker::{Worker, AppWorker};

impl Worker<MyArgs> for MyWorker {
    async fn perform(&self, args: MyArgs) -> worker::Result<()> {
        // Background job implementation
        Ok(())
    }
}
```

- Models use ActiveModel pattern from SeaORM
- Validation implemented via `Validatable` trait
- All public-facing IDs use UUIDs (PIDs) instead of internal integer IDs
- Transaction support for complex operations (coordinate creation with clothes)
- Comprehensive error handling with `ModelResult<T>`

## Development Rules & Best Practices

### General Code Quality

- Use TypeScript with strict type safety for frontend
- Follow Rust best practices with proper error handling (`Result<T, E>`)
- Maintain consistent coding style with rustfmt and Prettier
- Implement comprehensive error handling throughout the stack
- Follow security best practices for web applications

### Backend Development (Loco.rs)

#### Project Structure Guidelines

- Follow Loco's standard folder structure
- Properly separate controllers, models, and views
- Manage configuration files per environment
- Use descriptive names for migration files
- Keep business logic in models, not controllers

#### API Design

- Design RESTful API endpoints following REST conventions
- Return appropriate HTTP status codes
- Consider API versioning for future compatibility
- Implement proper rate limiting
- Configure CORS settings appropriately
- Use UUID PIDs for all public-facing resource identifiers

#### Database & SeaORM

- Always version control migrations
- Set up proper database indexes for performance
- Avoid N+1 query problems with eager loading
- Use transactions appropriately for multi-step operations
- Handle database errors gracefully
- Use the ActiveModel pattern consistently

#### Authentication & Security

- Implement JWT-based authentication properly
- Hash passwords securely
- Implement role-based access control where needed
- Validate and sanitize all input data
- Use the `Validatable` trait for model validation
- Implement proper session management

#### Testing

- Write comprehensive unit tests for models
- Implement integration tests for controllers
- Use insta for snapshot testing with rstest framework
- Maintain high test coverage
- Test error scenarios and edge cases
- Use test database for integration tests

### Frontend Development (Next.js)

#### App Router Best Practices

- Use the `app/` directory structure correctly
- Properly distinguish Server Components from Client Components
- Use `use client` directive sparingly
- Implement proper dynamic routing with `[slug]` patterns
- Leverage streaming and Suspense for better UX

#### Performance Optimization

- Use `next/image` component for optimized images
- Implement code splitting with dynamic imports
- Utilize Server Actions for form handling
- Implement proper caching strategies
- Set up Error Boundaries for graceful error handling

#### Data Fetching

- Prefer Server Components for data fetching when possible
- Use SWR or TanStack Query for client-side data fetching
- Implement proper loading and error states
- Cache API responses appropriately
- Handle network errors gracefully

#### Styling & UI

- Use Tailwind CSS v4 with consistent utility classes
- Leverage Radix UI primitives for accessible components
- Implement responsive design patterns
- Consider dark mode support
- Ensure accessibility (a11y) compliance
- Use shadcn/ui components consistently

#### API Integration

- Create type-safe API client functions
- Use environment variables for API base URLs
- Implement proper error handling for API calls
- Use custom hooks for data fetching logic
- Handle authentication tokens securely

### Full-Stack Integration

#### API Communication

- Use Loco API endpoints instead of Next.js API routes
- Implement type-safe API communication
- Handle authentication flow between frontend and backend
- Manage JWT tokens securely (HttpOnly cookies recommended)
- Implement proper error propagation from backend to frontend

#### Development Environment

- Use Docker Compose for local development setup
- Enable hot reloading for both frontend and backend
- Separate development and production configurations
- Set up proper logging levels per environment
- Use environment variables for configuration

### Security Guidelines

#### General Security

- Store sensitive data in environment variables
- Enforce HTTPS in production
- Set appropriate security headers
- Sanitize all user inputs
- Protect against common vulnerabilities (XSS, CSRF, SQL injection)

#### Authentication Security

- Use secure JWT token storage
- Implement proper token refresh mechanisms
- Set up authentication middleware
- Protect sensitive routes appropriately
- Implement proper logout functionality

### Testing Strategy

#### Backend Testing

- Write unit tests for all models
- Implement integration tests for controllers
- Test database migrations
- Test authentication and authorization flows
- Use snapshot testing for API responses

#### Frontend Testing

- Use Jest + React Testing Library for component tests
- Implement E2E tests with Playwright or Cypress
- Test user interactions and form submissions
- Test API integration scenarios
- Maintain good test coverage

### Deployment & Production

#### Containerization

- Use Docker containers for deployment
- Implement health check endpoints
- Set up proper logging and monitoring
- Configure environment-specific settings
- Plan for zero-downtime deployments

#### CI/CD Pipeline

- Set up automated testing in CI
- Run linting and formatting checks
- Build and test Docker images
- Implement automated security scanning
- Set up staging environment testing

#### Monitoring & Observability

- Implement application metrics collection
- Set up error tracking (e.g., Sentry)
- Configure log aggregation
- Set up alerting for critical issues
- Monitor performance metrics

### Code Organization

#### File Naming Conventions

- Use snake_case for Rust files and functions
- Use kebab-case for Next.js pages and components
- Use PascalCase for React components
- Use SCREAMING_SNAKE_CASE for constants
- Be descriptive with file and variable names

#### Import Organization

- Group imports logically (std, external crates, local modules)
- Use absolute imports in Next.js with `@/` prefix
- Keep imports organized and remove unused ones
- Follow consistent import ordering

#### Documentation

- Document complex business logic
- Write clear commit messages following Conventional Commits
- Maintain README files for setup instructions
- Document API endpoints and their contracts
- Comment non-obvious code patterns

This Digital Closet application should maintain high code quality, security, and user experience standards throughout development.
