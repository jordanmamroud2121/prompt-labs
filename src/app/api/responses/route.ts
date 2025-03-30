import { NextRequest, NextResponse } from "next/server";
import { schemas, validateBody } from "@/lib/api/validators";
import { withErrorHandling, createErrorResponse } from "@/lib/api/errorHandling";
import { 
  createResponse,
  getPromptById,
  createResponses
} from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";

/**
 * POST /api/responses - Create a new response
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // Get user ID from session
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    
    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Check if it's a batch operation
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      
      // Check if it's an array (batch operation)
      if (Array.isArray(body)) {
        return await handleBatchResponses(body, userId);
      } else {
        // Single response
        return await handleSingleResponse(body, userId);
      }
    }
    
    return createErrorResponse("Invalid content type", 400);
  });
}

/**
 * Handle creating a single response
 */
async function handleSingleResponse(body: any, userId: string) {
  // Validate request body
  const schema = schemas.response;
  const result = schema.safeParse(body);
  
  if (!result.success) {
    return createErrorResponse(
      "Validation error",
      400,
      "VALIDATION_ERROR",
      result.error.format()
    );
  }
  
  const validatedData = result.data;
  
  // Verify prompt belongs to user
  const prompt = await getPromptById(validatedData.prompt_id);
  if (!prompt || prompt.user_id !== userId) {
    return createErrorResponse("Prompt not found or access denied", 404);
  }
  
  // Create new response
  const newResponse = await createResponse({
    prompt_id: validatedData.prompt_id,
    service_name: validatedData.service_name,
    response_text: validatedData.response_text,
    execution_time: validatedData.execution_time,
    tokens_used: validatedData.tokens_used,
    error: validatedData.error,
  });
  
  return NextResponse.json(newResponse, { status: 201 });
}

/**
 * Handle creating multiple responses in batch
 */
async function handleBatchResponses(items: any[], userId: string) {
  // Validate all items
  const schema = schemas.response;
  const validatedItems = [];
  const errors = [];
  
  for (let i = 0; i < items.length; i++) {
    const result = schema.safeParse(items[i]);
    if (!result.success) {
      errors.push({
        index: i,
        errors: result.error.format(),
      });
    } else {
      validatedItems.push(result.data);
    }
  }
  
  if (errors.length > 0) {
    return createErrorResponse(
      "Validation errors in batch",
      400,
      "BATCH_VALIDATION_ERROR",
      errors
    );
  }
  
  // Verify all prompts belong to user
  const promptIds = [...new Set(validatedItems.map(item => item.prompt_id))];
  for (const promptId of promptIds) {
    const prompt = await getPromptById(promptId);
    if (!prompt || prompt.user_id !== userId) {
      return createErrorResponse(
        `Prompt with ID ${promptId} not found or access denied`,
        404
      );
    }
  }
  
  // Create all responses
  const newResponses = await createResponses(validatedItems);
  return NextResponse.json(newResponses, { status: 201 });
} 