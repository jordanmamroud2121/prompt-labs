import { NextRequest, NextResponse } from "next/server";
import { schemas, validateBody } from "@/lib/api/validators";
import { withErrorHandling, createErrorResponse } from "@/lib/api/errorHandling";
import {
  getApiKeyById,
  updateApiKey,
  deleteApiKey,
} from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";

/**
 * GET /api/apikeys/[id] - Get API key by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    // Get user ID from session
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Get API key by ID
    const apiKey = await getApiKeyById(params.id);

    // Check if API key exists and belongs to user
    if (!apiKey || apiKey.user_id !== userId) {
      return createErrorResponse("API key not found", 404);
    }

    // Return sanitized response (omit full API key)
    return NextResponse.json({
      id: apiKey.id,
      service_name: apiKey.service_name,
      is_active: apiKey.is_active,
      created_at: apiKey.created_at,
      last_used_at: apiKey.last_used_at,
      api_key: `${apiKey.api_key.substring(0, 3)}...${apiKey.api_key.substring(
        apiKey.api_key.length - 3
      )}`,
    });
  });
}

/**
 * PUT /api/apikeys/[id] - Update API key
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    // Get user ID from session
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Get existing API key
    const existingKey = await getApiKeyById(params.id);

    // Check if API key exists and belongs to user
    if (!existingKey || existingKey.user_id !== userId) {
      return createErrorResponse("API key not found", 404);
    }

    // Validate request body
    const [validatedData, validationError] = await validateBody(
      request,
      schemas.apiKey.partial()
    );

    if (validationError) {
      return validationError;
    }

    // Update API key
    const updatedKey = await updateApiKey(params.id, validatedData!);

    // Return sanitized response
    return NextResponse.json({
      id: updatedKey.id,
      service_name: updatedKey.service_name,
      is_active: updatedKey.is_active,
      created_at: updatedKey.created_at,
      last_used_at: updatedKey.last_used_at,
    });
  });
}

/**
 * DELETE /api/apikeys/[id] - Delete API key
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    // Get user ID from session
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Get existing API key
    const existingKey = await getApiKeyById(params.id);

    // Check if API key exists and belongs to user
    if (!existingKey || existingKey.user_id !== userId) {
      return createErrorResponse("API key not found", 404);
    }

    // Delete API key
    await deleteApiKey(params.id);

    return NextResponse.json(
      { message: "API key deleted successfully" },
      { status: 200 }
    );
  });
} 