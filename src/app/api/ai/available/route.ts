import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/errorHandling";

// Map of provider names to their environment variable names
const PROVIDER_ENV_MAPPING = {
  'openai': 'OPENAI_API_KEY',
  'gemini': 'GOOGLE_API_KEY',
  'anthropic': 'ANTHROPIC_API_KEY',
  'perplexity': 'PERPLEXITY_API_KEY',
  'deepseek': 'DEEPSEEK_API_KEY',
};

/**
 * GET /api/ai/available - Get information about which AI providers have API keys available on the server
 */
export const GET = async () => {
  return withErrorHandling(async () => {
    // Check which providers have valid environment variables
    const availableProviders = Object.entries(PROVIDER_ENV_MAPPING)
      .filter(([_, envVar]) => !!process.env[envVar])
      .map(([provider]) => provider);

    return NextResponse.json({
      providers: availableProviders
    });
  });
}; 