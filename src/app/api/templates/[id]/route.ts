import { NextRequest, NextResponse } from "next/server";
import { schemas, validateBody } from "@/lib/api/validators";
import { withErrorHandling, createErrorResponse } from "@/lib/api/errorHandling";
import {
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  getPromptsByTemplateId,
} from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";

/**
 * GET /api/templates/[id] - Get template by ID
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

    // Get template by ID
    const template = await getTemplateById(params.id);

    // Check if template exists and is accessible to user
    if (!template) {
      return createErrorResponse("Template not found", 404);
    }

    // Check if template is public or belongs to user
    if (!template.is_public && template.user_id !== userId) {
      return createErrorResponse("Access denied", 403);
    }

    // Check if should include prompts
    const includePrompts = request.nextUrl.searchParams.get("includePrompts") === "true";
    
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

    // Get existing template
    const existingTemplate = await getTemplateById(params.id);

    // Check if template exists and belongs to user
    if (!existingTemplate) {
      return createErrorResponse("Template not found", 404);
    }
    
    if (existingTemplate.user_id !== userId) {
      return createErrorResponse("Access denied", 403);
    }

    // Validate request body
    const [validatedData, validationError] = await validateBody(
      request,
      schemas.template.partial()
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

    // Get existing template
    const existingTemplate = await getTemplateById(params.id);

    // Check if template exists and belongs to user
    if (!existingTemplate) {
      return createErrorResponse("Template not found", 404);
    }
    
    if (existingTemplate.user_id !== userId) {
      return createErrorResponse("Access denied", 403);
    }

    // Delete template
    await deleteTemplate(params.id);

    return NextResponse.json(
      { message: "Template deleted successfully" },
      { status: 200 }
    );
  });
} 