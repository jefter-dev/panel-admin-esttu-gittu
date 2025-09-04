import { NextResponse } from "next/server";
import z, { ZodError } from "zod";
import {
  AuthenticationError,
  DataPersistenceError,
  DuplicateRecordError,
  RecordNotFoundError,
  ValidationError,
  InvalidCredentialsError,
  ConfigurationError,
  WebhookError,
} from "@/errors/custom.errors";

/**
 * @summary Handles errors thrown in API routes and maps them to proper HTTP responses.
 * @param error {unknown} The error object thrown during route processing.
 * @returns {NextResponse} Returns a NextResponse with appropriate status code and error message.
 */
export const handleRouteError = (error: unknown): NextResponse => {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: 400 }
    );
  }

  if (error instanceof ConfigurationError) {
    return NextResponse.json(
      { error: error.message || "Server configuration error." },
      { status: 500 }
    );
  }

  if (error instanceof InvalidCredentialsError) {
    return NextResponse.json(
      { error: error.message || "Invalid email or password." },
      { status: 401 } // Unauthorized
    );
  }

  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      { error: error.message || "Not authenticated." },
      { status: 401 }
    );
  }

  if (error instanceof RecordNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (error instanceof DuplicateRecordError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  if (error instanceof DataPersistenceError) {
    console.error("[API_ERROR] Persistence failure:", error.cause || error);
    return NextResponse.json(
      { error: "Server failed to process the request." },
      { status: 500 }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid data.", details: z.treeifyError(error) },
      { status: 400 }
    );
  }

  if (error instanceof WebhookError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  console.error("[API_ERROR] Unexpected error:", error);
  return NextResponse.json(
    { error: "Unexpected internal server error." },
    { status: 500 }
  );
};
