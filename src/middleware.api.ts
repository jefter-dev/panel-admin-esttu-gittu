/**
 * @file middleware.api.ts
 *
 * @summary Middleware for API routes. Validates JWT tokens and
 * allows access to public endpoints without authentication.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TokenService } from "@/service/auth/token.service";
import { publicPaths } from "@/lib/navigation-api";

/**
 * API middleware function.
 *
 * @param request - Next.js request object
 * @returns A NextResponse that allows the request or returns 401 if unauthorized
 */
export async function apiMiddleware(request: NextRequest) {
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  const tokenService = new TokenService();
  const session = await tokenService.verifyToken(token || "");

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing token." },
      { status: 401 }
    );
  }

  return NextResponse.next();
}
