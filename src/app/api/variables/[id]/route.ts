import { NextRequest, NextResponse } from "next/server";
import { schemas, validateBody } from "@/lib/api/validators";
import { withErrorHandling, createErrorResponse } from "@/lib/api/errorHandling";
import {
  getVariableById,
  updateVariable,
  deleteVariable,
} from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";

/**
 * GET /api/variables/[id] - Get variable by ID
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

    // Get variable by ID
    const variable = await getVariableById(params.id);

    // Check if variable exists and belongs to user
    if (!variable || variable.user_id !== userId) {
      return createErrorResponse("Variable not found", 404);
    }

    return NextResponse.json(variable);
  });
}

/**
 * PUT /api/variables/[id] - Update variable
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

    // Get existing variable
    const existingVariable = await getVariableById(params.id);

    // Check if variable exists and belongs to user
    if (!existingVariable || existingVariable.user_id !== userId) {
      return createErrorResponse("Variable not found", 404);
    }

    // Validate request body
    const [validatedData, validationError] = await validateBody(
      request,
      schemas.variable.partial()
    );

    if (validationError) {
      return validationError;
    }

    // Update variable
    const updatedVariable = await updateVariable(params.id, validatedData!);

    return NextResponse.json(updatedVariable);
  });
}

/**
 * DELETE /api/variables/[id] - Delete variable
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

    // Get existing variable
    const existingVariable = await getVariableById(params.id);

    // Check if variable exists and belongs to user
    if (!existingVariable || existingVariable.user_id !== userId) {
      return createErrorResponse("Variable not found", 404);
    }

    // Delete variable
    await deleteVariable(params.id);

    return NextResponse.json(
      { message: "Variable deleted successfully" },
      { status: 200 }
    );
  });
} 