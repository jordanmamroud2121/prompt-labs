import { NextRequest, NextResponse } from "next/server";
import { schemas, validateBody } from "@/lib/api/validators";
import {
  withErrorHandling,
  throwIfNotAuthenticated,
} from "@/lib/api/errorHandling";
import {
  getTemplates,
  getUserTemplates,
  getPublicTemplates,
  createTemplate,
} from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";
import { AuthenticationError } from "@/lib/api/customErrors";

/**
 * GET /api/templates - Get all templates (including public ones)
 *
 * @param request - The incoming request object
 * @returns A JSON response with the templates
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    // Get user ID from session
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;

    // Throw authentication error if not authenticated
    throwIfNotAuthenticated(userId);

    // Type guard - we know userId is defined because throwIfNotAuthenticated would throw otherwise
    if (!userId) {
      throw new AuthenticationError(
        "User ID is undefined after authentication check",
      );
    }

    // Check for query parameters
    const searchParams = request.nextUrl.searchParams;
    const onlyMine = searchParams.get("onlyMine") === "true";
    const onlyPublic = searchParams.get("onlyPublic") === "true";

    let templates;
    if (onlyMine) {
      templates = await getUserTemplates(userId);
    } else if (onlyPublic) {
      templates = await getPublicTemplates();
    } else {
      templates = await getTemplates(userId);
    }

    return NextResponse.json(templates);
  });
}

/**
 * POST /api/templates - Create a new template
 *
 * @param request - The incoming request object with template data
 * @returns A JSON response with the created template
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // Get user ID from session
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;

    // Throw authentication error if not authenticated
    throwIfNotAuthenticated(userId);

    // Type guard - we know userId is defined because throwIfNotAuthenticated would throw otherwise
    if (!userId) {
      throw new AuthenticationError(
        "User ID is undefined after authentication check",
      );
    }

    // Validate request body
    const [validatedData, validationError] = await validateBody(
      request,
      schemas.template,
    );

    if (validationError) {
      return validationError;
    }

    // Create new template
    const newTemplate = await createTemplate({
      user_id: userId,
      name: validatedData!.name,
      template_text: validatedData!.template_text,
      description: validatedData!.description,
      is_public: validatedData!.is_public ?? false,
    });

    return NextResponse.json(newTemplate, { status: 201 });
  });
}
