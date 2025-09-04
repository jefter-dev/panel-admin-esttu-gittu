/**
 * @file errors/custom.errors.ts
 *
 * @summary Custom application error classes for structured error handling.
 * Includes authentication, validation, persistence, and specific errors.
 */

/**
 * Base class for all application errors.
 */
export class AppError extends Error {
  /** HTTP status code associated with this error */
  public readonly statusCode: number;

  /**
   * @param message Human-readable error message
   * @param statusCode HTTP status code
   */
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ===================================================
// Authentication / Authorization Errors
// ===================================================

/** Error for invalid credentials (login failures) */
export class InvalidCredentialsError extends AppError {
  constructor(message = "Invalid credentials.") {
    super(message, 401);
  }
}

/** Error for unauthorized access to a resource */
export class UnauthorizedAccessError extends AppError {
  constructor(message = "You are not authorized to access this resource.") {
    super(message, 401);
  }
}

/** Error for forbidden actions due to insufficient permissions */
export class ForbiddenActionError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, 403);
  }
}

/** Error for expired authentication tokens */
export class TokenExpiredError extends AppError {
  constructor(message = "Token expired. Please login again.") {
    super(message, 401);
  }
}

// ===================================================
// Validation Errors
// ===================================================

/** Error for validation failures */
export class ValidationError extends Error {
  /** Optional details about the validation failure */
  public details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

// ===================================================
// Persistence / Database Errors
// ===================================================

/** Error when attempting to create a duplicate record */
export class DuplicateRecordError extends AppError {
  constructor(message = "This record already exists.") {
    super(message, 409);
  }
}

/** Error when a requested record is not found */
export class RecordNotFoundError extends AppError {
  constructor(message = "The requested record was not found.") {
    super(message, 404);
  }
}

/** Error when persisting data to the database fails */
export class DataPersistenceError extends AppError {
  constructor(message = "Failed to persist data to the database.") {
    super(message, 500);
  }
}

// ===================================================
// Specific Domain Errors
// ===================================================

/** Error for already used email during registration */
export class EmailAlreadyUsedError extends AppError {
  constructor(message = "This email is already in use.") {
    super(message, 409);
  }
}

// ===================================================
// Other Errors
// ===================================================

/** Generic error for authentication failures */
export class AuthenticationError extends Error {
  constructor(message: string = "Invalid or unauthorized session.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/** Error for misconfiguration issues */
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

/** Error for webhook handling failures */
export class WebhookError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookError";
  }
}
