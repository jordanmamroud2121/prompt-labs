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
  console.log("API: GET /api/prompts request received");
  console.log(
    "API: Request headers:",
    Object.fromEntries(request.headers.entries()),
  );
  console.log("API: Request URL:", request.url);

  // Create headers with CORS
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    console.log("API: Handling CORS preflight request");
    return new NextResponse(null, { headers, status: 204 });
  }

  return withErrorHandling(async () => {
    try {
      // Check if Supabase is accessible
      try {
        // Try to query a table we know exists - use the prompts table since we know it should exist
        const { error: healthCheckError } = await supabase
          .from("prompts")
          .select("count(*)", { count: "exact", head: true });

        if (healthCheckError) {
          console.error("API: Supabase health check failed:", healthCheckError);
          return createErrorResponse(
            `Database connection error: ${healthCheckError.message}`,
            503,
          );
        }
        console.log("API: Supabase health check passed");
      } catch (healthError) {
        console.error("API: Supabase health check exception:", healthError);
        return createErrorResponse("Database connection error", 503);
      }

      // Get user ID from session
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("API: Session error:", sessionError);
        return createErrorResponse(
          `Session error: ${sessionError.message}`,
          401,
        );
      }

      const userId = data.session?.user?.id;

      if (!userId) {
        console.error("API: No user ID found in session");
        return createErrorResponse(
          "Unauthorized: No user found in session",
          401,
        );
      }

      console.log("API: Authenticated user:", userId);

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

      console.log("API: Query options:", JSON.stringify(queryOptions));
      console.log("API: Search query:", searchQuery || "none");

      let prompts;
      try {
        if (searchQuery && searchQuery.trim()) {
          // Search prompts with filtering
          console.log("API: Performing search with query:", searchQuery);
          prompts = await searchPrompts(userId, searchQuery, queryOptions);
        } else {
          // Get all prompts with filtering
          console.log("API: Retrieving all prompts with filters");
          prompts = await getUserPrompts(userId, queryOptions);
        }

        if (!prompts || prompts.length === 0) {
          console.log(`API: No prompts found for user ${userId}`);
        } else {
          console.log(`API: Successfully retrieved ${prompts.length} prompts`);
        }
        return NextResponse.json(prompts);
      } catch (error) {
        // Special handling for permission errors
        const queryError = error as Error;
        if (
          queryError.message &&
          (queryError.message.includes("permission denied") ||
            queryError.message.includes("policy") ||
            queryError.message.includes("RLS"))
        ) {
          console.error("API: Permission denied error:", queryError.message);
          return createErrorResponse(
            "You don't have permission to access these prompts. This is likely due to a Row Level Security (RLS) policy.",
            403,
          );
        }

        throw error; // Re-throw for general error handling
      }
    } catch (error) {
      console.error("API: Unhandled error in GET /api/prompts:", error);
      return createErrorResponse(
        `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
        500,
      );
    }
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
