import { NextRequest, NextResponse } from "next/server";
import { schemas, validateBody, getUserId } from "@/lib/api/validators";
import { withErrorHandling, createErrorResponse } from "@/lib/api/errorHandling";
import { 
  getUserApiKeys, 
  createApiKey, 
} from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";

/**
 * GET /api/apikeys - Get all API keys for the current user
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    // Get user ID from session
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    
    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Get API keys for user
    const apiKeys = await getUserApiKeys(userId);
    
    // Remove actual API keys from response for security
    // Only return partial key information
    const sanitizedKeys = apiKeys.map(key => ({
      id: key.id,
      service_name: key.service_name,
      is_active: key.is_active,
      created_at: key.created_at,
      last_used_at: key.last_used_at,
      api_key: `${key.api_key.substring(0, 3)}...${key.api_key.substring(key.api_key.length - 3)}`,
    }));

    return NextResponse.json(sanitizedKeys);
  });
}

/**
 * POST /api/apikeys - Create a new API key
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // Get user ID from session
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    
    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Validate request body
    const [validatedData, validationError] = await validateBody(
      request,
      schemas.apiKey
    );

    if (validationError) {
      return validationError;
    }

    // Create new API key
    const newApiKey = await createApiKey({
      user_id: userId,
      service_name: validatedData!.service_name,
      api_key: validatedData!.api_key,
      is_active: validatedData!.is_active ?? true,
    });

    // Return sanitized response (omit full API key)
    return NextResponse.json({
      id: newApiKey.id,
      service_name: newApiKey.service_name,
      is_active: newApiKey.is_active,
      created_at: newApiKey.created_at,
    }, { status: 201 });
  });
} 