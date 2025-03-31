/**
 * Base application error class
 */
export class AppError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = "APP_ERROR",
    statusCode: number = 500,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Ensure prototype chain works correctly
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Error for validation failures
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error for authentication failures
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = "Authentication required",
    details?: Record<string, unknown>,
  ) {
    super(message, "AUTH_ERROR", 401, details);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Error for authorization failures
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = "You don't have permission to access this resource",
    details?: Record<string, unknown>,
  ) {
    super(message, "FORBIDDEN", 403, details);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Error for resource not found
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    details?: Record<string, unknown>,
  ) {
    super(message, "NOT_FOUND", 404, details);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error for database operations
 */
export class DatabaseError extends AppError {
  constructor(
    message: string = "Database operation failed",
    details?: Record<string, unknown>,
  ) {
    super(message, "DATABASE_ERROR", 500, details);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Error for external service failures
 */
export class ExternalServiceError extends AppError {
  constructor(
    message: string = "External service error",
    details?: Record<string, unknown>,
  ) {
    super(message, "EXTERNAL_SERVICE_ERROR", 502, details);
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
