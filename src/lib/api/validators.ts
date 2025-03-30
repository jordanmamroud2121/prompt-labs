import { NextRequest } from "next/server";
import { z } from "zod";
import { createErrorResponse } from "./errorHandling";

/**
 * Parse and validate request body against a Zod schema
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: z.ZodType<T>
): Promise<[T | null, Response | null]> {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate against schema
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const errorResponse = createErrorResponse(
        "Validation error",
        400,
        "VALIDATION_ERROR",
        result.error.format()
      );
      return [null, errorResponse];
    }
    
    return [result.data, null];
  } catch {
    const errorResponse = createErrorResponse(
      "Invalid request body",
      400,
      "INVALID_JSON"
    );
    return [null, errorResponse];
  }
}

/**
 * Get user ID from session, with validation
 * (assumes Supabase auth is being used)
 */
export function getUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  
  try {
    // In a real implementation, you would verify the token
    // and extract the user ID. This is a simplified version.
    const token = authHeader.split(" ")[1];
    
    // For development purposes only. In production,
    // you would decode and verify the JWT token.
    if (token) {
      return "user-id-placeholder";
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting user ID:", error);
    return null;
  }
}

/**
 * Common validation schemas
 */
export const schemas = {
  // API Key schemas
  apiKey: z.object({
    service_name: z.string().min(1, "Service name is required"),
    api_key: z.string().min(1, "API key is required"),
    is_active: z.boolean().optional().default(true),
  }),
  
  // Prompt schemas
  prompt: z.object({
    prompt_text: z.string().min(1, "Prompt text is required"),
    attachments: z.array(z.string()).optional(),
    title: z.string().optional(),
    is_favorite: z.boolean().optional().default(false),
    template_id: z.string().uuid().optional(),
  }),
  
  // Template schemas
  template: z.object({
    name: z.string().min(1, "Template name is required"),
    template_text: z.string().min(1, "Template content is required"),
    description: z.string().optional(),
    is_public: z.boolean().optional().default(false),
  }),
  
  // Variable schemas
  variable: z.object({
    name: z.string().min(1, "Variable name is required"),
    value: z.string().min(1, "Variable value is required"),
    description: z.string().optional(),
  }),
  
  // Response schemas (for manually creating responses)
  response: z.object({
    prompt_id: z.string().uuid(),
    service_name: z.string().min(1, "Service name is required"),
    response_text: z.string().min(1, "Response text is required"),
    execution_time: z.number().optional(),
    tokens_used: z.number().optional(),
    error: z.string().optional(),
  }),
}; 