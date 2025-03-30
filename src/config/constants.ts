export const APP_NAME = 'Next Project';
export const APP_DESCRIPTION = 'A Next.js project with TypeScript, Tailwind CSS, and ShadCN UI';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';

export const AUTH_REDIRECT_KEY = 'redirectTo';

export const ENVIRONMENT = {
  DEV: process.env.NODE_ENV === 'development',
  PROD: process.env.NODE_ENV === 'production',
  TEST: process.env.NODE_ENV === 'test',
};

export const FEATURE_FLAGS = {
  SKIP_AUTH: process.env.NEXT_PUBLIC_SKIP_AUTH === 'true',
}; 