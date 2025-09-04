import { NextRequest } from "next/server";
import { AuthService } from "@/service/auth/auth.service";
import { APP, APP_VALUES } from "@/types/app.type";

/**
 * @summary Extracts and verifies a session from the incoming request.
 * @param request {NextRequest} The HTTP request object.
 * @returns {Promise<import("@/types/auth.type").Session | null>} Returns the session if token is valid, or null if missing/invalid.
 */
export async function getSessionFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) return null;

  const session = await AuthService.verifyToken(token);
  return session;
}

/**
 * @summary Validates if a given value is a valid application name.
 * @param value {unknown} The value to validate.
 * @returns {boolean} Returns true if the value is a valid APP, false otherwise.
 */
export function isValidAppName(value: unknown): value is APP {
  return typeof value === "string" && APP_VALUES.includes(value as APP);
}
