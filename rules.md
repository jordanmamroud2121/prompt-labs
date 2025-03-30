################# Coding pattern preferences

- Always prefer simple solutions
- Prioritize code readability and maintainability over overly complex or 'clever' solutions that might be difficult for others (or your future self) to understand.
- Avoid duplication of code whenever possible, which means checking for other areas of the codebase that might already have similar code and functionality
- Write code that takes into account the different environments: dev, test, and prod
- Where practical (especially in React state management and functional patterns), prefer immutable data structures and pure functions.
- You are careful to only make changes that are requested or you are confident are well understood and related to the change being requested
- When fixing an issue or bug, do not introduce a new pattern or technology without first exhausting all options for the existing implementation. And if you finally do this, make sure to remove the old implementation afterwards so we don't have duplicate logic.
- Keep the codebase very clean and organized
- Avoid writing scripts in files if possible, especially if the script is likely only to be run once
- Avoid having files over 200-300 lines of code. Refactor at that point.
- Mocking data is only needed for tests, never mock data for dev or prod
- Never add stubbing or fake data patterns to code that affects the dev or prod environments
- Never overwrite my .env file without first asking and confirming
- Never hardcode secrets (API keys, passwords, tokens) directly in the code. Use environment variables (via .env and Supabase secrets) exclusively.
- Follow standard JavaScript/TypeScript naming conventions: camelCase for variables and functions, PascalCase for classes, types, interfaces, and React components, UPPER_SNAKE_CASE for constants."
- File Naming: "Use consistent file naming conventions (e.g., kebab-case for general files, PascalCase for React components).
- Handle configuration values (beyond secrets in .env) through dedicated configuration files or environment variables, not hardcoded magic strings or numbers.

############# Technical stack

- Front end tech stack: React JS, Typescript, ShadCN& Tailwind CSS
- Backend tech stack: Node JS, Next JS, SQL databases managed through Supabase
- Separate databases for dev, test, and prod
- Never use JSON file storage
- Adhere strictly to the project's established ESLint and Prettier configurations. If none exist, use standard community configurations for the respective technologies.

############# Coding workflow preferences

- Focus on the areas of code relevant to the task
- Do not touch code that is unrelated to the task
- Write thorough tests for all major functionality
- Avoid making major changes to the patterns and architecture of how a feature works, after it has shown to work well, unless explicitly instructed
- Always think about what other methods and areas of code might be affected by code changes
- If a request is ambiguous or could have multiple interpretations, ask clarifying questions before proceeding." This prevents misunderstandings and wasted effort.
- When adding new dependencies, prefer well-maintained and reputable libraries. Check for potential license conflicts or security vulnerabilities.
- When proposing significant changes or refactors, briefly explain the reasoning and benefits.

############# Error Handling Approach

- Implement consistent error handling patterns using try/catch blocks for async operations
- Use React error boundaries for component-level error capture and fallback UIs
- Create custom error types for different categories of errors (API errors, validation errors, etc.)
- Include informative error messages that help with debugging but don't expose sensitive information
- Log errors appropriately: development errors should be verbose, production errors should be sanitized
- Implement graceful degradation when services or features fail
- For user-facing errors, provide clear, actionable feedback rather than technical details
- Establish a hierarchy for error severity and handle each level appropriately

############# Documentation Standards

- Document all functions, components, and complex logic with JSDoc comments
- Include parameter descriptions, return types, and examples where helpful
- Add clear simple inline comments for code sections that make it easy and clear to understand
- Document data models and database schemas with clear explanations of relationships
- Update documentation when code changes, treating documentation as part of the code
- Include setup instructions and environment requirements in project-level documentation
- Use TypeScript types as self-documentation where possible, with descriptive type names

########### Code Review Criteria

- Verify adherence to established coding standards and patterns
- Check for potential security vulnerabilities, especially in data handling and API calls
- Validate that the code addresses the requirements completely
- Assess test coverage for new functionality and critical paths
- Look for potential performance issues, especially in frequently executed code
- Confirm proper error handling implementation
- Evaluate readability and maintainability of the solution
- Verify that naming is clear, consistent, and descriptive
- Check for redundant code, or over-engineering
- Ensure accessibility requirements are met for UI components
- Verify proper handling of edge cases and error conditions
- Evaluate whether the solution introduces technical debt
- Check that documentation is updated to reflect changes

######### Naming Conventions

Variables and Functions: Use descriptive camelCase (e.g., getUserData, isLoading, fetchResults)
React Components: Use PascalCase (e.g., UserProfile, NavigationBar, FormInput)
Constants: Use UPPER_SNAKE_CASE (e.g., MAX_RETRY_ATTEMPTS, API_BASE_URL)
Interface/Type Names: Use PascalCase with descriptive names (e.g., UserData, ApiResponse)
File Names:

React components: PascalCase matching the component name (e.g., UserCard.tsx)
Utilities/helpers: camelCase (e.g., formatDate.ts, apiHelpers.ts)
Test files: Match the file name with .test or .spec suffix (e.g., UserCard.test.tsx)

CSS/Tailwind Classes: Use kebab-case for custom classes (e.g., user-avatar, nav-container)
Database:

Tables: plural snake_case (e.g., user_profiles, auth_tokens)
Columns: snake_case (e.g., first_name, created_at)

URL Paths: Use kebab-case (e.g., /user-settings, /reset-password)
API Endpoints: Use kebab-case resource names with appropriate HTTP verbs (e.g., GET /api/user-profiles, POST /api/authentication)
Branches: Use kebab-case with prefix (e.g., feature/user-auth, bugfix/login-error)
Boolean Variables: Use prefixes like is, has, or should (e.g., isActive, hasPermission)
