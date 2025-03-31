import { NextRequest, NextResponse } from "next/server";
import { schemas, validateBody } from "@/lib/api/validators";
import {
  withErrorHandling,
  createErrorResponse,
} from "@/lib/api/errorHandling";
import {
  getUserPrompts,
  createPrompt,
  searchPrompts,
} from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";

/**
 * GET /api/prompts - Get all prompts or search
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    // Get user ID from session
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Check for search query parameter
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get("q");

    let prompts;
    if (searchQuery && searchQuery.trim()) {
      // Search prompts
      prompts = await searchPrompts(userId, searchQuery);
    } else {
      // Get all prompts
      prompts = await getUserPrompts(userId);
    }

    return NextResponse.json(prompts);
  });
}

/**
 * POST /api/prompts - Create a new prompt
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
      schemas.prompt,
    );

    if (validationError) {
      return validationError;
    }

    // Create new prompt
    const newPrompt = await createPrompt({
      user_id: userId,
      prompt_text: validatedData!.prompt_text,
      attachments: validatedData!.attachments,
      title: validatedData!.title,
      is_favorite: validatedData!.is_favorite ?? false,
      template_id: validatedData!.template_id,
    });

    return NextResponse.json(newPrompt, { status: 201 });
  });
}
