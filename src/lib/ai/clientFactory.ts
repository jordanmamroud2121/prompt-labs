import { AIClient, ServiceName } from "./types";
import { OpenAIClient } from "./openai";
import { AnthropicClient } from "./anthropic";
import { GeminiClient } from "./gemini";
import { DeepSeekClient } from "./deepseek";
import { PerplexityClient } from "./perplexity";

// Cache clients to avoid recreating them
const clientInstances: Record<ServiceName, AIClient> = {} as Record<ServiceName, AIClient>;

/**
 * Get a client for the specified service
 */
export function getAIClient(service: ServiceName, apiKey?: string): AIClient {
  console.log(`Getting client for ${service}, apiKey provided: ${!!apiKey}`);
  
  // Return cached instance if it exists and no new API key is provided
  if (clientInstances[service] && !apiKey) {
    console.log(`Using cached client for ${service}`);
    return clientInstances[service];
  }

  // Check for client-side environment variables if no API key provided
  if (!apiKey) {
    console.log(`No API key provided, checking environment variables for ${service}`);
    
    // Direct checks for each environment variable
    if (service === 'openai' && process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      console.log('Found OpenAI API key in environment variables');
    }
    else if (service === 'gemini' && process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      console.log('Found Gemini API key in environment variables');
    }
    else if (service === 'anthropic' && process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
      console.log('Found Anthropic API key in environment variables');
    }
    else if (service === 'deepseek' && process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY) {
      apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
      console.log('Found DeepSeek API key in environment variables');
    }
    else if (service === 'perplexity' && process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY) {
      apiKey = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;
      console.log('Found Perplexity API key in environment variables');
    }
  }

  // Create new instance with provided API key
  let client: AIClient;
  
  switch (service) {
    case "openai":
      client = new OpenAIClient(apiKey);
      break;
    case "anthropic":
      client = new AnthropicClient(apiKey);
      break;
    case "gemini":
      client = new GeminiClient(apiKey);
      break;
    case "deepseek":
      client = new DeepSeekClient(apiKey);
      break;
    case "perplexity":
      client = new PerplexityClient(apiKey);
      break;
    default:
      throw new Error(`Unsupported AI service: ${service}`);
  }

  // Cache the instance if an API key was provided
  if (apiKey) {
    clientInstances[service] = client;
  }

  return client;
}

/**
 * Get all available AI clients
 */
export function getAllAIClients(): Record<ServiceName, AIClient> {
  const clients: Record<ServiceName, AIClient> = {
    openai: getAIClient("openai"),
    anthropic: getAIClient("anthropic"),
    gemini: getAIClient("gemini"),
    deepseek: getAIClient("deepseek"),
    perplexity: getAIClient("perplexity"),
  };

  return clients;
}

/**
 * Initialize a client with an API key
 */
export async function initializeClient(serviceName: ServiceName, apiKey?: string): Promise<AIClient> {
  console.log(`Initializing client for ${serviceName}, API key provided: ${apiKey ? 'yes' : 'no'}`);
  
  // Check for environment variables if no API key is provided
  if (!apiKey) {
    console.log(`Checking environment variables for ${serviceName}`);
    
    // Log all environment variables for debugging
    console.log("Available environment variables:", {
      NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY ? "present" : "missing",
      NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY ? "present" : "missing",
      NEXT_PUBLIC_ANTHROPIC_API_KEY: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ? "present" : "missing",
      NEXT_PUBLIC_DEEPSEEK_API_KEY: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY ? "present" : "missing",
      NEXT_PUBLIC_PERPLEXITY_API_KEY: process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY ? "present" : "missing"
    });
    
    // Direct checks for each service instead of dynamic lookup
    if (serviceName === 'openai' && process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      console.log(`Found OpenAI API key in environment variables`);
    }
    else if (serviceName === 'gemini' && process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      console.log(`Found Gemini API key in environment variables`);
    }
    else if (serviceName === 'anthropic' && process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
      console.log(`Found Anthropic API key in environment variables`);
    }
    else if (serviceName === 'deepseek' && process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY) {
      apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
      console.log(`Found DeepSeek API key in environment variables`);
    }
    else if (serviceName === 'perplexity' && process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY) {
      apiKey = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;
      console.log(`Found Perplexity API key in environment variables`);
    }
    else {
      console.log(`No environment variable found for ${serviceName}`);
    }
  }

  // If still no API key, throw an error
  if (!apiKey) {
    console.error(`No API key found for ${serviceName}`);
    throw new Error(`${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} API key is required`);
  }

  // Create and return the client with the API key
  const client = getAIClient(serviceName, apiKey);
  clientInstances[serviceName] = client;
  
  console.log(`Successfully initialized ${serviceName} client`);
  return client;
}
