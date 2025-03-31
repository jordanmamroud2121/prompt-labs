# AI Agent Guidelines

## CRITICAL RULES - These apply to ALL tasks

- **[CRITICAL]** NEVER `git commit` unless explicitly instructed - always ask for permission first
- **[CRITICAL]** NEVER `git push` to any remote repository unless explicitly instructed - always ask for permission first
- **[CRITICAL]** NEVER create, switch, merge, or delete Git branches unless explicitly instructed - always ask for permission first
- **[CRITICAL]** NEVER overwrite or modify the `.env` file unless explicitly instructed - always ask for permission first
- **[CRITICAL]** NEVER modify critical configuration files (like `package.json`, `tsconfig.json`, `next.config.js`, CI/CD files `*.yml`, etc.) unless explicitly instructed - always ask for permission first
- **[CRITICAL]** NEVER touch code unrelated to the current task - stay focused only on requested changes
- **[CRITICAL]** NEVER use JSON file storage under any circumstances - use proper database storage instead
- **[CRITICAL]** NEVER hardcode secrets (API keys, passwords, tokens) directly in the code - use environment variables instead
- **[CRITICAL]** DO NOT WRITE CODE or make any other changes if the prompt includes the keyword "NOACTION" - only respond to with explanations
- **[CRITICAL]** When in doubt about any rule or guideline, ask clarifying questions rather than making assumptions
- **[CRITICAL]** NEVER log, store, or expose sensitive user data (PII, financial information, credentials) - always handle user data with strict privacy controls
- **[CRITICAL]** NEVER make direct changes to production environments without going through proper staging/testing - always follow the deployment process
- **[CRITICAL]** NEVER add new dependencies or third-party services without explicit approval - all external code must be reviewed
- **[CRITICAL]** NEVER disable TypeScript type checking with `// @ts-ignore` or similar comments - fix type issues properly
- **[CRITICAL]** NEVER suppress or ignore errors without proper handling and logging - all errors must be properly addressed
- **[CRITICAL]** NEVER comment out large blocks of code as a way to "disable" it - remove it entirely or use feature flags
- **[CRITICAL]** ALWAYS use proper transaction handling for database operations that should be atomic - prevent data corruption
- **[CRITICAL]** NEVER attempt to "fix" critical issues outside the scope of the current task - report them instead
- **[CRITICAL]** NEVER use external APIs or services without proper error handling and fallbacks - systems must be resilient

## Technical Stack - These define the technologies you must use

- **[STACK-FRONTEND]** All frontend code must be written using React JS, TypeScript, ShadCN & Tailwind CSS - do not introduce other frontend frameworks
- **[STACK-BACKEND]** All backend code must be written using Node JS and Next JS - do not use other backend frameworks
- **[STACK-DATABASE]** All data storage must use SQL databases managed through Supabase - never use JSON files or other database systems
- **[STACK-ENVIRONMENT]** Always be aware that separate databases exist for dev, test, and prod - write environment-aware code
- **[STACK-TOOLING]** Follow the project's established ESLint and Prettier configurations - do not override or ignore these

## Core Coding Principles - These apply to all code you write

- **[PRINCIPLE-SIMPLICITY]** Always prefer simple solutions over complex ones - avoid over-engineering
- **[PRINCIPLE-READABILITY]** Prioritize code readability and maintainability over clever solutions
- **[PRINCIPLE-DRY]** Avoid code duplication - look for existing functions or components before creating new ones
- **[PRINCIPLE-ENVIRONMENT]** Write environment-aware code that works correctly in dev, test, and prod environments
- **[PRINCIPLE-FUNCTIONAL]** Use immutable data structures and pure functions for React state management
- **[PRINCIPLE-SCOPE]** Only make changes explicitly requested or clearly related to the current task - do not refactor unrelated code
- **[PRINCIPLE-PATTERNS]** Fix issues using existing patterns before introducing new ones - don't add new technologies unnecessarily
- **[PRINCIPLE-SIZE]** Keep files under 200-300 lines of code - refactor into smaller files when exceeding this limit
- **[PRINCIPLE-MOCKING]** Never create mock data for dev or prod - mocking is only appropriate for tests
- **[PRINCIPLE-ONE-TIME-SCRIPTS]** Avoid writing scripts in files whenever possible, especially if the script is likely only to be run once
- **[PRINCIPLE-CONFIG]** Handle configuration values through dedicated configuration files or environment variables - never use hardcoded magic strings or numbers

## Naming Conventions - Follow these naming patterns for all code

- **[NAMING-VARIABLES]** Use descriptive camelCase for all variables and functions (e.g., `getUserData`, `isLoading`, `fetchResults`)
- **[NAMING-BOOLEAN]** Prefix all boolean variables with `is`, `has`, or `should` (e.g., `isActive`, `hasPermission`)
- **[NAMING-COMPONENTS]** Use PascalCase for all React components (e.g., `UserProfile`, `NavigationBar`)
- **[NAMING-TYPES]** Use PascalCase for all interfaces and types (e.g., `UserData`, `ApiResponse`)
- **[NAMING-CONSTANTS]** Use UPPER_SNAKE_CASE for all constants (e.g., `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`)
- **[NAMING-COMPONENT-FILES]** Name React component files using PascalCase matching the component name (e.g., `UserCard.tsx`)
- **[NAMING-UTILITY-FILES]** Name utility/helper files using camelCase (e.g., `formatDate.ts`, `apiHelpers.ts`)
- **[NAMING-TEST-FILES]** Name test files to match the file being tested with `.test` or `.spec` suffix (e.g., `UserCard.test.tsx`)
- **[NAMING-CSS-CLASSES]** Use kebab-case for all CSS/Tailwind classes (e.g., `user-avatar`, `nav-container`)
- **[NAMING-URL-PATHS]** Use kebab-case for all URL paths (e.g., `/user-settings`, `/reset-password`)
- **[NAMING-API-ENDPOINTS]** Use kebab-case with appropriate HTTP verbs for API endpoints (e.g., `GET /api/user-profiles`)
- **[NAMING-GIT-BRANCHES]** Use kebab-case with descriptive prefix for Git branches (e.g., `feature/user-auth`, `bugfix/login-error`)
- **[NAMING-DB-TABLES]** Use plural snake_case for all database tables (e.g., `user_profiles`, `auth_tokens`)
- **[NAMING-DB-COLUMNS]** Use snake_case for all database columns (e.g., `first_name`, `created_at`)

## File Naming Conventions - Follow these rules for all files across the project

- **[FILE-NAMING-COMPONENTS]** Use PascalCase for all React component files (e.g., `UserCard.tsx`, `NavigationBar.tsx`)
- **[FILE-NAMING-UTILITIES]** Use camelCase for utility/helper files (e.g., `formatDate.ts`, `apiHelpers.ts`)
- **[FILE-NAMING-CONSTANTS]** Use camelCase for constant files (e.g., `colorPalette.ts`, `routePaths.ts`)
- **[FILE-NAMING-TYPES]** Use PascalCase for type definition files (e.g., `UserTypes.ts`, `ApiTypes.ts`)
- **[FILE-NAMING-HOOKS]** Prefix custom hook files with "use" and use camelCase (e.g., `useAuth.ts`, `useMediaQuery.ts`)
- **[FILE-NAMING-CONTEXT]** Suffix context files with "Context" using PascalCase (e.g., `UserContext.tsx`, `ThemeContext.tsx`)
- **[FILE-NAMING-API-ROUTES]** Use kebab-case for API route files (e.g., `user-profile.ts`, `auth-token.ts`)
- **[FILE-NAMING-DESCRIPTION]** Ensure file names are descriptive and indicate the file's primary purpose
- **[FILE-NAMING-LENGTH]** Keep file names concise yet descriptive - avoid excessively long names
- **[FILE-NAMING-CONSISTENCY]** Maintain consistent naming patterns within each category of files

## File Naming Clarity Rules - Follow these to ensure every file has a purpose-revealing name

- **[FILE-NAMING-CLARITY]** Never use generic file names like `route.ts`, `api.ts`, or `utils.ts` - every file must have a descriptive purpose in its name
- **[FILE-NAMING-ROUTES]** Name API route files after their functionality: `routeUserAuthentication.ts`, `routeProductCreation.ts` instead of just `route.ts`
- **[FILE-NAMING-ENDPOINTS]** Use the pattern `route{Resource}{Action}.ts` for API endpoints (e.g., `routeUserProfile.ts`, `routeOrderSubmit.ts`)
- **[FILE-NAMING-PAGES]** Name page files after their content: `pageUserDashboard.tsx`, `pageProductListing.tsx` instead of just `page.tsx`
- **[FILE-NAMING-LAYOUTS]** Name layout files after their scope: `layoutAdminPanel.tsx`, `layoutCheckoutFlow.tsx` instead of just `layout.tsx`
- **[FILE-NAMING-NO-DUPLICATES]** Never have two files with identical names anywhere in the project, regardless of their location
- **[FILE-NAMING-SEARCHABILITY]** Optimize file names to be easily searchable in code editors and source control

## Folder Structure - Follow these rules when creating or modifying folders

- **[FOLDER-NECESSITY]** Create new folders only when there's a clear organizational benefit or routing requirement - avoid unnecessary folder nesting
- **[FOLDER-PAGES]** For simple page components, use Next.js route groups instead of creating dedicated folders
- **[FOLDER-FEATURES]** Group related functionality in feature folders (e.g., `/src/features/templates/`) rather than creating folders for each route
- **[FOLDER-ROUTES]** Create dedicated route folders only when a route has multiple components or complex logic - simple routes don't need dedicated folders
- **[FOLDER-NESTING]** Avoid deep directory nesting for simple routes - keep the folder structure as flat as possible

## Component Structure - Follow these rules for React components and Next.js pages

- **[COMPONENT-EXPORT]** Use named page components instead of default exports in Next.js App Router - this improves code clarity
- **[COMPONENT-ORGANIZATION]** Create separate folders for route-specific components with descriptive names - don't mix components from different routes
- **[COMPONENT-FILENAME]** Use descriptive file names indicating component purpose (e.g., `DashboardLayout.tsx` instead of just `Layout.tsx`)
- **[COMPONENT-SINGLE-EXPORT]** Export only one page or layout per file - don't export multiple major components from the same file
- **[COMPONENT-ROUTE-NAMING]** Use consistent naming patterns for route components (e.g., `DashboardPage.tsx`, `SettingsPage.tsx`)

## React Hook Usage - Follow these rules for all components using React hooks

- **[HOOK-TOP-LEVEL]** Always call React hooks at the top level of components - never inside conditions, loops, or nested functions
- **[HOOK-CONDITIONAL]** Place all conditional logic after hooks are called, not before - never wrap hook calls in conditional statements
- **[HOOK-CUSTOM]** Create custom hooks for complex conditional logic that needs to use hooks - don't duplicate hook logic
- **[HOOK-SEPARATION]** Use separate components for conditions affecting multiple hooks - don't create complex hook dependencies

## TypeScript Best Practices - Follow these rules for all TypeScript code

- **[TYPESCRIPT-ANY]** Never use the `any` type unless absolutely necessary - use proper type definitions or `unknown` with type guards
- **[TYPESCRIPT-INTERFACES]** Create explicit interfaces for all API request/response data - don't rely on implicit types
- **[TYPESCRIPT-ASSERTIONS]** Use type assertions (`as Type`) only when necessary and with careful validation - don't bypass the type system
- **[TYPESCRIPT-REUSABLE]** Define reusable type interfaces in dedicated type files to promote consistency across the codebase
- **[TYPESCRIPT-RECORD]** Use `Record<string, unknown>` instead of `object` or `any` for dictionary-like structures - be specific about types

## JSX/HTML Syntax Rules - Follow these rules for all JSX and HTML code

- **[JSX-ENTITIES]** Always use proper HTML entities in JSX text content (e.g., `&apos;` for apostrophes, `&quot;` for quotes) - avoid raw special characters
- **[JSX-SPECIAL-CHARS]** When using special characters in text, prefer the HTML entity escape form - this prevents rendering issues
- **[JSX-LINTING]** Use linting tools with jsx-a11y plugin to catch unescaped entities early - configure ESLint appropriately

## Error Handling - Follow these rules for all code that could produce errors

- **[ERROR-ASYNC]** Always wrap async operations in try/catch blocks - never leave async operations unhandled
- **[ERROR-BOUNDARIES]** Use React error boundaries for component-level error capture - implement fallback UIs for component failures
- **[ERROR-TYPES]** Create custom error types for different categories of errors - don't use generic Error objects for everything
- **[ERROR-MESSAGES]** Include informative error messages that help debugging but don't expose sensitive information
- **[ERROR-LOGGING]** Log errors appropriately based on environment - verbose in development, sanitized in production
- **[ERROR-DEGRADATION]** Implement graceful degradation when services or features fail - applications should never completely crash
- **[ERROR-USER-FEEDBACK]** Provide clear, actionable feedback for user-facing errors - don't show technical details to users
- **[ERROR-SEVERITY]** Establish and follow a hierarchy for error severity - handle each level appropriately

## API Error Handling - Follow these rules for all API interactions

- **[API-ERROR-INTERFACES]** Create consistent error response interfaces and stick to them - don't use different structures in different parts of the codebase
- **[API-ERROR-TYPING]** Ensure error details use properly typed structures rather than generic objects - avoid using `any` for errors
- **[API-ERROR-UNIONS]** Use discriminated union types for different categories of errors - this helps with type narrowing
- **[API-INPUT-VALIDATION]** Validate all user input with strong typing before processing - never trust client-side data

## Documentation - Treat documentation as essential part of all code you write

- **[DOC-JSDOC]** Document all functions, components, and complex logic with JSDoc comments - this is not optional
- **[DOC-PARAMS]** Always include parameter descriptions, return types, and examples where helpful in documentation
- **[DOC-INLINE]** Add clear, simple inline comments for code sections that need explanation - don't over-comment obvious code
- **[DOC-DATA-MODELS]** Document all data models and database schemas with clear explanations of relationships
- **[DOC-UPDATES]** Update documentation whenever code changes - documentation must stay in sync with code
- **[DOC-SETUP]** Include setup instructions and environment requirements in project-level documentation
- **[DOC-TYPES]** Use descriptive TypeScript types as self-documentation where possible - type names should be informative

## Variable Usage - Follow these rules for all variable declarations and usage

- **[VARIABLE-UNUSED]** Remove unused variables, imports, and parameters to keep code clean and intentional - don't leave dead code
- **[VARIABLE-TEMP-UNUSED]** If a variable must be kept unused temporarily during development, use a descriptive comment explaining why or prefix it with an underscore (`_unusedVar`)
- **[VARIABLE-INTERFACE-PARAMS]** For required interface implementations where parameters aren't needed, explicitly mark them as unused with an underscore (`_event`) or use the ESLint ignore comment for that specific line
- **[VARIABLE-DISABLE-COMMENTS]** Remove all disable comments before merging to production - these should only be temporary
- **[VARIABLE-UNDERSCORE]** When an unused variable with an underscore prefix later becomes used in the code, ALWAYS remove the underscore prefix as part of the same commit

## GitHub Guidelines - Follow these rules for all Git operations

- **[GIT-PERMISSION]** Always ask for explicit permission before suggesting any push to GitHub - never assume permission
- **[GIT-COMMIT-FORMAT]** Format all commit messages with a present-tense verb (e.g., "Add", "Fix", "Update")
- **[GIT-COMMIT-LENGTH]** Keep commit message first lines under 50 characters - add details in subsequent lines
- **[GIT-TESTS]** Always ensure all tests pass before requesting to push code - never push code with failing tests
- **[GIT-FORMATTING]** Make sure code is properly formatted before requesting to push - run linters and formatters
- **[GIT-ISSUE-NUMBERS]** Include issue/ticket numbers in commit messages when applicable (e.g., "Fix login error #123")
- **[GIT-SQUASH]** Suggest squashing multiple related commits before pushing when appropriate - keep history clean
- **[GIT-FORCE-PUSH]** Never force push to shared branches - this can cause problems for other developers
- **[GIT-FEATURE-BRANCHES]** For substantial changes, suggest creating appropriately named feature branches
- **[GIT-PULL]** Always recommend pulling the latest changes before starting work on a shared branch

## Workflow Approach - Follow these principles for all development tasks

- **[WORKFLOW-FOCUS]** Focus only on areas of code relevant to the current task - don't modify unrelated code
- **[WORKFLOW-TESTING]** Write thorough tests for all major functionality you create or modify - testing is not optional
- **[WORKFLOW-ARCHITECTURE]** Never make major architectural changes unless explicitly instructed - respect existing patterns
- **[WORKFLOW-SIDE-EFFECTS]** Always consider potential side effects of your changes on other methods and areas of code
- **[WORKFLOW-CLARIFICATION]** Ask clarifying questions when requests are ambiguous - don't make assumptions
- **[WORKFLOW-LIBRARIES]** When adding dependencies, prefer well-maintained and reputable libraries - check for security issues
- **[WORKFLOW-REASONING]** Always explain your reasoning when proposing significant changes - make your thought process clear

## Code Review Criteria - Use this checklist before submitting any code

- **[REVIEW-STANDARDS]** Verify all code adheres to established coding standards and patterns - consistency is critical
- **[REVIEW-SECURITY]** Check for potential security vulnerabilities, especially in data handling and API calls
- **[REVIEW-REQUIREMENTS]** Validate that the code addresses all requirements completely - nothing should be missing
- **[REVIEW-TESTS]** Assess test coverage for all new functionality and critical paths - all major code should be tested
- **[REVIEW-PERFORMANCE]** Look for potential performance issues, especially in frequently executed code
- **[REVIEW-ERROR-HANDLING]** Confirm proper error handling implementation for all potential failure points
- **[REVIEW-READABILITY]** Evaluate readability and maintainability of all solutions - code should be clear and understandable
- **[REVIEW-NAMING]** Verify that all naming is clear, consistent, and descriptive according to naming conventions
- **[REVIEW-REDUNDANCY]** Check for redundant code or over-engineering - simplicity is preferred
- **[REVIEW-ACCESSIBILITY]** Ensure all UI components meet accessibility requirements - this is not optional
- **[REVIEW-EDGE-CASES]** Verify proper handling of all edge cases and error conditions - consider exceptional scenarios
- **[REVIEW-TECH-DEBT]** Evaluate whether the solution introduces any technical debt - avoid short-term shortcuts
- **[REVIEW-DOCUMENTATION]** Check that all documentation is updated to reflect changes - documentation must stay current

---

## REMINDER: ALWAYS PRIORITIZE CRITICAL RULES

- Always remember that the critical rules at the top of this document override all other guidelines
- Never perform Git operations without explicit permission
- Never modify .env files or critical configuration files without explicit permission
- Never touch code unrelated to your current task
- Never use JSON file storage or hardcode secrets
- When in doubt about any rule or guideline, ask clarifying questions rather than making assumptions
- These guidelines work together as a system - apply them consistently across all your work
