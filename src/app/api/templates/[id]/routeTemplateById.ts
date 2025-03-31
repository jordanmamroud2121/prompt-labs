import { NextRequest, NextResponse } from "next/server";
import { schemas, validateBody } from "@/lib/api/validators";
import {
  withErrorHandling,
  throwIfNotAuthenticated,
  throwIfNotFound,
  throwIfNotAuthorized,
} from "@/lib/api/errorHandling";
import {
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  getPromptsByTemplateId,
} from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";
import { AuthenticationError } from "@/lib/api/customErrors";

/**
 * GET /api/templates/[id] - Get template by ID
 *
 * @param request - The incoming request object
 * @param params - Route parameters containing the template ID
 * @returns A JSON response with the template data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    // Get template by ID
    const template = await getTemplateById(params.id);

    // Throw not found error if template doesn't exist
    throwIfNotFound(template, "Template not found");

    // Check if template is public or belongs to user
    throwIfNotAuthorized(
      template.is_public || template.user_id === userId,
      "You don't have permission to access this template",
    );

    // Check if should include prompts
    const includePrompts =
      request.nextUrl.searchParams.get("includePrompts") === "true";

    if (includePrompts && template.user_id === userId) {
      const prompts = await getPromptsByTemplateId(userId, params.id);
      return NextResponse.json({
        ...template,
        prompts,
      });
    }

    return NextResponse.json(template);
  });
}

/**
 * PUT /api/templates/[id] - Update template
 *
 * @param request - The incoming request object with update data
 * @param params - Route parameters containing the template ID
 * @returns A JSON response with the updated template
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    // Get existing template
    const existingTemplate = await getTemplateById(params.id);

    // Throw not found error if template doesn't exist
    throwIfNotFound(existingTemplate, "Template not found");

    // Throw authorization error if template doesn't belong to user
    throwIfNotAuthorized(
      existingTemplate.user_id === userId,
      "You don't have permission to update this template",
    );

    // Validate request body
    const [validatedData, validationError] = await validateBody(
      request,
      schemas.template.partial(),
    );

    if (validationError) {
      return validationError;
    }

    // Update template
    const updatedTemplate = await updateTemplate(params.id, validatedData!);

    return NextResponse.json(updatedTemplate);
  });
}

/**
 * DELETE /api/templates/[id] - Delete template
 *
 * @param request - The incoming request object
 * @param params - Route parameters containing the template ID
 * @returns A JSON response confirming deletion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    // Get existing template
    const existingTemplate = await getTemplateById(params.id);

    // Throw not found error if template doesn't exist
    throwIfNotFound(existingTemplate, "Template not found");

    // Throw authorization error if template doesn't belong to user
    throwIfNotAuthorized(
      existingTemplate.user_id === userId,
      "You don't have permission to delete this template",
    );

    // Delete template
    await deleteTemplate(params.id);

    return NextResponse.json(
      { message: "Template deleted successfully" },
      { status: 200 },
    );
  });
}
