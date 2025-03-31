/**
 * Database model interfaces for PromptLab
 */

export interface User {
  id: string;
  email: string;
  created_at: string;
  metadata?: {
    name?: string;
  };
}

export interface ApiKey {
  id: string;
  user_id: string;
  service_name: string;
  api_key: string;
  created_at: string;
  is_active: boolean;
  last_used_at?: string;
}

export interface Prompt {
  id: string;
  user_id: string;
  prompt_text: string;
  attachments?: string[]; // Array of file URLs
  created_at: string;
  updated_at?: string;
  title?: string;
  is_favorite: boolean;
  template_id?: string;
}

export interface Response {
  id: string;
  prompt_id: string;
  service_name: string;
  response_text: string;
  created_at: string;
  execution_time?: number; // in milliseconds
  tokens_used?: number;
  error?: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  template_text: string;
  created_at: string;
  updated_at?: string;
  description?: string;
  is_public: boolean;
}

export interface Variable {
  id: string;
  user_id: string;
  name: string;
  value: string;
  created_at: string;
  updated_at?: string;
  description?: string;
}

// Database table names as constants
export const TABLES = {
  USERS: "users",
  API_KEYS: "api_keys",
  PROMPTS: "prompts",
  RESPONSES: "responses",
  TEMPLATES: "templates",
  VARIABLES: "variables",
} as const;

// Service name constants
export const SERVICES = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GEMINI: "gemini",
  DEEPSEEK: "deepseek",
  PERPLEXITY: "perplexity",
} as const;

export type ServiceName = (typeof SERVICES)[keyof typeof SERVICES];
