import { NextResponse } from "next/server";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  isAppError,
} from "./customErrors";

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
  details?: Record<string, unknown>,
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      error: {
        message,
        ...(code && { code }),
        ...(details && { details }),
      },
    },
    { status },
  );
}

/**
 * Handle common API errors with proper typing
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  console.error("API Error:", error);

  // Handle AppError types first (our custom errors)
  if (isAppError(error)) {
    return createErrorResponse(
      error.message,
      error.statusCode,
      error.code,
      error.details,
    );
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    // Database-related errors
    if (error.message.includes("database") || error.message.includes("query")) {
      return createErrorResponse(
        "Database operation failed",
        500,
        "DATABASE_ERROR",
        { originalMessage: error.message },
      );
    }

    // Authentication errors
    if (
      error.message.includes("auth") ||
      error.message.includes("unauthorized")
    ) {
      return createErrorResponse(error.message, 401, "AUTH_ERROR");
    }

    // Validation errors
    if (
      error.message.includes("validation") ||
      error.message.includes("invalid")
    ) {
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
  handler: () => Promise<T>,
): Promise<T | NextResponse<ErrorResponse>> {
  try {
    return await handler();
  } catch (error) {
    return handleApiError(error);
  }
}

// Helper functions to throw specific errors

/**
 * Throw authentication error when user is not authenticated
 */
export function throwIfNotAuthenticated(userId?: string | null): void {
  if (!userId) {
    throw new AuthenticationError();
  }
}

/**
 * Throw not found error when resource doesn't exist
 */
export function throwIfNotFound<T>(
  resource: T | null,
  message?: string,
): asserts resource is T {
  if (!resource) {
    throw new NotFoundError(message);
  }
}

/**
 * Throw authorization error when user doesn't have permission
 */
export function throwIfNotAuthorized(
  condition: boolean,
  message?: string,
): void {
  if (!condition) {
    throw new AuthorizationError(message);
  }
}
