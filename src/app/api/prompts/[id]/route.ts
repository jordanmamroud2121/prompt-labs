import { NextRequest, NextResponse } from "next/server";
import { schemas, validateBody } from "@/lib/api/validators";
import { withErrorHandling, createErrorResponse } from "@/lib/api/errorHandling";
import {
  getPromptById,
  updatePrompt,
  deletePrompt,
  getResponsesForPrompt,
} from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";

/**
 * GET /api/prompts/[id] - Get prompt by ID with responses
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

    // Get prompt by ID
    const prompt = await getPromptById(params.id);

    // Check if prompt exists and belongs to user
    if (!prompt || prompt.user_id !== userId) {
      return createErrorResponse("Prompt not found", 404);
    }

    // Get responses for this prompt
    const responses = await getResponsesForPrompt(params.id);

    // Return prompt with responses
    return NextResponse.json({
      ...prompt,
      responses,
    });
  });
}

/**
 * PUT /api/prompts/[id] - Update prompt
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

    // Get existing prompt
    const existingPrompt = await getPromptById(params.id);

    // Check if prompt exists and belongs to user
    if (!existingPrompt || existingPrompt.user_id !== userId) {
      return createErrorResponse("Prompt not found", 404);
    }

    // Validate request body
    const [validatedData, validationError] = await validateBody(
      request,
      schemas.prompt.partial()
    );

    if (validationError) {
      return validationError;
    }

    // Update prompt
    const updatedPrompt = await updatePrompt(params.id, validatedData!);

    return NextResponse.json(updatedPrompt);
  });
}

/**
 * DELETE /api/prompts/[id] - Delete prompt
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

    // Get existing prompt
    const existingPrompt = await getPromptById(params.id);

    // Check if prompt exists and belongs to user
    if (!existingPrompt || existingPrompt.user_id !== userId) {
      return createErrorResponse("Prompt not found", 404);
    }

    // Delete prompt (this will cascade delete responses as well)
    await deletePrompt(params.id);

    return NextResponse.json(
      { message: "Prompt deleted successfully" },
      { status: 200 }
    );
  });
} 