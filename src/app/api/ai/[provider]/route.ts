import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, createErrorResponse } from "@/lib/api/errorHandling";

// Define types for provider configuration
interface BaseProviderConfig {
  baseUrl: string;
  envVar: string;
}

interface StandardProviderConfig extends BaseProviderConfig {
  headers: (apiKey: string) => Record<string, string>;
  urlTransform?: (baseUrl: string, apiKey: string, body: any) => string;
  bodyTransform?: (body: any) => any;
}

// Map provider names to their API endpoints and environment variable names
const PROVIDER_CONFIG: Record<string, StandardProviderConfig> = {
  openai: {
    baseUrl: "https://api.openai.com/v1/chat/completions",
    envVar: "OPENAI_API_KEY",
    headers: (apiKey: string) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    })
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    envVar: "GOOGLE_API_KEY",
    // Gemini adds the API key as a query param in the URL
    headers: (apiKey: string) => ({
      "Content-Type": "application/json"
    }),
    urlTransform: (baseUrl: string, apiKey: string, body: any) => {
      const model = body.model || "gemini-1.5-pro";
      return `${baseUrl}/${model}:generateContent?key=${apiKey}`;
    },
    bodyTransform: (body: any) => {
      // Transform the request body to Gemini's format
      return {
        contents: [
          { 
            role: "user", 
            parts: [{ text: body.prompt || (body.messages?.[0]?.content || "") }]
          }
        ],
        generationConfig: {
          temperature: body.temperature,
          topP: body.top_p,
          maxOutputTokens: body.max_tokens
        }
      };
    }
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com/v1/messages",
    envVar: "ANTHROPIC_API_KEY",
    headers: (apiKey: string) => ({
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01"
    }),
    bodyTransform: (body: any) => {
      // Transform the request body to Anthropic's format
      return {
        model: body.model || "claude-3-opus-20240229",
        messages: [
          { 
            role: "user", 
            content: body.prompt || (body.messages?.[0]?.content || "")
          }
        ],
        max_tokens: body.max_tokens || 4000,
        temperature: body.temperature,
        top_p: body.top_p,
        stream: body.stream || false
      };
    }
  },
  // Add other providers as needed
  perplexity: {
    baseUrl: "https://api.perplexity.ai/chat/completions",
    envVar: "PERPLEXITY_API_KEY",
    headers: (apiKey: string) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    })
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com/v1/chat/completions",
    envVar: "DEEPSEEK_API_KEY",
    headers: (apiKey: string) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    })
  }
};

/**
 * POST /api/ai/[provider] - Proxy requests to AI service providers while keeping API keys secure
 */
export const POST = async (
  request: NextRequest,
  context: { params: { provider: string } }
) => {
  return withErrorHandling(async () => {
    const provider = context.params.provider.toLowerCase();
    const config = PROVIDER_CONFIG[provider];

    if (!config) {
      return createErrorResponse(`Unsupported AI provider: ${provider}`, 400);
    }

    // Get API key from environment variables
    const apiKey = process.env[config.envVar];
    if (!apiKey) {
      return createErrorResponse(`API key for ${provider} not found`, 500);
    }

    try {
      // Get request body
      const body = await request.json();
      
      // Determine the target URL
      let url = config.baseUrl;
      if (config.urlTransform) {
        url = config.urlTransform(url, apiKey, body);
      }
      
      // Transform the request body if needed
      const transformedBody = config.bodyTransform ? config.bodyTransform(body) : body;
      
      // Set up headers
      const headers = config.headers(apiKey);
      
      // Handle streaming if requested
      if (transformedBody.stream) {
        // For streaming responses, we need to proxy the stream
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(transformedBody)
        });
        
        // Return the streaming response
        return new Response(response.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
          }
        });
      }
      
      // For non-streaming responses
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(transformedBody)
      });
      
      // Check for errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Error from ${provider} API:`, errorData);
        return createErrorResponse(
          `Error from ${provider} API: ${response.status} ${response.statusText}`,
          response.status
        );
      }
      
      // Return the response
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error(`Error in ${provider} API route:`, error);
      return createErrorResponse(
        `Error processing request to ${provider} API: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  });
}; 