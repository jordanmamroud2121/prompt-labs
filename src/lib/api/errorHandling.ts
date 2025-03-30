import { NextResponse } from "next/server";

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  code?: string,
  details?: Record<string, unknown>
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      error: {
        message,
        ...(code && { code }),
        ...(details && { details }),
      },
    },
    { status }
  );
}

/**
 * Extended Error interface with additional properties we might encounter
 */
interface ExtendedError extends Error {
  code?: string;
  statusCode?: number;
  status?: number;
}

/**
 * Handle common API errors
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  console.error("API Error:", error);

  // Handle known error types
  if (error instanceof Error) {
    const extendedError = error as ExtendedError;
    
    // Database-related errors often have specific codes
    if (
      extendedError.code &&
      typeof extendedError.code === "string" &&
      extendedError.code.startsWith("PGRST")
    ) {
      return createErrorResponse(
        "Database operation failed",
        400,
        extendedError.code,
        { originalMessage: extendedError.message }
      );
    }

    // Authentication errors
    if (error.message.includes("auth")) {
      return createErrorResponse(error.message, 401);
    }

    // Validation errors
    if (error.message.includes("validation")) {
      return createErrorResponse(error.message, 400, "VALIDATION_ERROR");
    }

    // General error with message
    return createErrorResponse(error.message);
  }

  // Unknown error
  return createErrorResponse("An unexpected error occurred");
}

/**
 * Try-catch wrapper for API route handlers
 */
export async function withErrorHandling<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse<ErrorResponse>> {
  try {
    return await handler();
  } catch (error) {
    return handleApiError(error);
  }
} 