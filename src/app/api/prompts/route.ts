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
 * GET /api/prompts - Get all prompts or search/filter
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    // Get user ID from session
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get("q");
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : undefined;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : undefined;
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;
    const favorite = searchParams.get("favorite")
      ? searchParams.get("favorite") === "true"
      : undefined;
    const templateId = searchParams.get("templateId") || undefined;

    // Build query options
    const queryOptions = {
      limit,
      offset,
      startDate,
      endDate,
      favorite,
      templateId,
    };

    let prompts;
    if (searchQuery && searchQuery.trim()) {
      // Search prompts with filtering
      prompts = await searchPrompts(userId, searchQuery, queryOptions);
    } else {
      // Get all prompts with filtering
      prompts = await getUserPrompts(userId, queryOptions);
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
