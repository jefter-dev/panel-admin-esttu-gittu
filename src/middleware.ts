/**
 * @file middleware.ts
 *
 * @summary Global middleware for Next.js 13 (App Router).
 * Routes requests to either `apiMiddleware` or `pagesMiddleware` depending on the URL.
 */

import type { NextRequest } from "next/server";
import { apiMiddleware } from "@/middleware.api";
import { pagesMiddleware } from "@/middleware.pages";

/**
 * Middleware configuration.
 * Excludes API routes, static assets, and certain files from being processed.
 */
export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico|cypress|.*\\..*).*)",
};

/**
 * Global middleware function.
 *
 * @param request - Next.js request object
 * @returns A NextResponse from either API or page middleware
 */
export async function middleware(request: NextRequest) {
  console.log("middleware: ", request.nextUrl.pathname);

  if (request.nextUrl.pathname.startsWith("/api")) {
    return apiMiddleware(request);
  }

  return pagesMiddleware(request);
}
