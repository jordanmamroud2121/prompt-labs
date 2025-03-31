import { NextRequest, NextResponse } from "next/server";
import { schemas, validateBody } from "@/lib/api/validators";
import {
  withErrorHandling,
  createErrorResponse,
} from "@/lib/api/errorHandling";
import {
  getUserVariables,
  createVariable,
  upsertVariable,
} from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";

/**
 * GET /api/variables - Get all variables for the current user
 */
export async function GET() {
  return withErrorHandling(async () => {
    // Get user ID from session
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Get variables for user
    const variables = await getUserVariables(userId);

    return NextResponse.json(variables);
  });
}

/**
 * POST /api/variables - Create a new variable
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // Get user ID from session
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;

    if (!userId) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Check for upsert parameter
    const searchParams = request.nextUrl.searchParams;
    const isUpsert = searchParams.get("upsert") === "true";

    // Validate request body
    const [validatedData, validationError] = await validateBody(
      request,
      schemas.variable,
    );

    if (validationError) {
      return validationError;
    }

    let result;
    if (isUpsert) {
      // Upsert variable (create or update based on name)
      result = await upsertVariable(
        userId,
        validatedData!.name,
        validatedData!.value,
        validatedData!.description,
      );
    } else {
      // Create new variable
      result = await createVariable({
        user_id: userId,
        name: validatedData!.name,
        value: validatedData!.value,
        description: validatedData!.description,
      });
    }

    return NextResponse.json(result, {
      status: isUpsert ? 200 : 201,
    });
  });
}
