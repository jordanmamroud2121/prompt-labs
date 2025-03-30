# Next Project

A Next.js project with TypeScript, Tailwind CSS, and ShadCN UI.

## Features

- **Next.js App Router**: Modern routing system with nested layouts
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **ShadCN UI**: Beautifully designed components
- **Supabase**: Authentication and database
- **Auth Bypass**: Development mode authentication bypass
- **ESLint & Prettier**: Code quality and formatting
- **Husky & lint-staged**: Git hooks for quality control

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd next-project
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy the `.env.local.example` file to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

4. Start the development server:

```bash
npm run dev
```

### Development Mode

In development mode, you can bypass authentication by setting:

```
NEXT_PUBLIC_SKIP_AUTH=true
```

This will use a mock user and display a "DEV MODE" indicator in the bottom right corner.

## Project Structure

```
- app/ (Next.js App Router)
  - (auth)/
    - login/page.tsx
    - signup/page.tsx
  - api/v1/
  - layout.tsx
  - page.tsx
- features/
  - auth/
    - components/
    - hooks/
    - services/
    - types.ts
- components/
  - ui/ (for ShadCN)
  - layouts/
  - common/
- lib/
  - supabase/
    - client.ts
    - models/
    - queries/
  - api/
  - utils/
- hooks/
- config/
  - constants.ts
  - navigation.ts
  - feature-flags.ts
- styles/
- public/
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run format`: Run Prettier

## Deployment

This project can be deployed on any platform that supports Next.js, such as Vercel or Netlify.

## License

This project is licensed under the MIT License.
