export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

export const AI_PROVIDERS = [
  "OpenAI",
  "Anthropic",
  "Google",
  "Perplexity",
  "DeepSeek",
] as const;

export type AIProvider = (typeof AI_PROVIDERS)[number];

export const MODELS: AIModel[] = [
  // OpenAI Models
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description:
      "Most capable multimodal model with strong reasoning abilities",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description:
      "Fast, inexpensive, capable model ideal for replacing GPT-3.5 Turbo",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    description:
      "Advanced model for complex tasks with lower latency than GPT-4",
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "OpenAI",
    description: "Powerful model for complex reasoning and understanding",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    description: "Fast and cost-effective for everyday tasks",
  },

  // Anthropic Models
  {
    id: "claude-3-7-sonnet-20250219",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    description: "Most intelligent Claude model with hybrid reasoning",
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "High intelligence, capable of handling complex tasks",
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    description: "Fast model optimized for high-performance tasks",
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    description: "Powerful model for highly complex tasks",
  },
  {
    id: "claude-3-sonnet-20240229",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    description: "Balanced model for varied use cases",
  },
  {
    id: "claude-3-haiku-20240307",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    description: "Fast and compact model for quick responses",
  },

  // Google Gemini Models
  {
    id: "gemini-2.5-pro-exp-03-25",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    description: "Most powerful thinking model with maximum response accuracy",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    description: "Multimodal model with advanced capabilities",
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash-Lite",
    provider: "Google",
    description: "Optimized for cost efficiency and low latency",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    description: "Complex reasoning tasks requiring more intelligence",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    description: "Balanced performance across various tasks",
  },
  {
    id: "gemini-1.5-flash-8b",
    name: "Gemini 1.5 Flash-8B",
    provider: "Google",
    description: "High volume and lower intelligence tasks",
  },

  // Perplexity Models
  {
    id: "sonar-pro",
    name: "Sonar Pro",
    provider: "Perplexity",
    description: "Advanced search with grounding for complex queries",
  },
  {
    id: "sonar",
    name: "Sonar",
    provider: "Perplexity",
    description: "Cost-effective search model with grounding",
  },
  {
    id: "sonar-deep-research",
    name: "Sonar Deep Research",
    provider: "Perplexity",
    description: "Expert-level research model for comprehensive reports",
  },
  {
    id: "sonar-reasoning-pro",
    name: "Sonar Reasoning Pro",
    provider: "Perplexity",
    description: "Premier reasoning offering with Chain of Thought",
  },
  {
    id: "sonar-reasoning",
    name: "Sonar Reasoning",
    provider: "Perplexity",
    description: "Fast reasoning model for quick problem-solving",
  },
  {
    id: "r1-1776",
    name: "R1-1776",
    provider: "Perplexity",
    description:
      "Offline chat model focused on uncensored, factual information",
  },

  // DeepSeek Models
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat (V3)",
    provider: "DeepSeek",
    description: "Advanced conversational model from DeepSeek",
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner (R1)",
    provider: "DeepSeek",
    description: "Reasoning-focused model with step-by-step problem solving",
  },
];
