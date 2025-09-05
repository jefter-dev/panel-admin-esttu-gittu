/**
 * @file middleware.pages.ts
 *
 * @summary Middleware for page routes. Validates authentication via cookies
 * and redirects users to login or dashboard based on their session state.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TokenService } from "@/service/auth/token.service";
import { DASHBOARD_PAGE, LOGIN_PAGE } from "@/lib/navigation";

/** Token service instance, reused for better performance */
const tokenService = new TokenService();

/**
 * Page middleware function.
 *
 * @param request - Next.js request object
 * @returns A NextResponse that allows navigation or redirects to login/dashboard
 */
export async function pagesMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Redirect helpers ---
  const redirectToLogin = () => {
    const response = NextResponse.redirect(new URL(LOGIN_PAGE, request.url));
    response.cookies.delete("auth_tokens");
    return response;
  };

  const redirectToDashboard = () =>
    NextResponse.redirect(new URL(DASHBOARD_PAGE, request.url));

  // --- Main logic ---
  const cookieToken = request.cookies.get("auth_tokens")?.value;

  // 1. User is not authenticated
  if (!cookieToken) {
    if (pathname === LOGIN_PAGE) return NextResponse.next();
    return redirectToLogin();
  }

  // 2. Token validation
  let sessionPayload = null;
  try {
    const parsed = JSON.parse(cookieToken);
    const accessToken = parsed?.access_token;

    if (accessToken) {
      sessionPayload = await tokenService.verifyToken(accessToken);
    }
  } catch (err) {
    console.error("Middleware: Error processing auth cookie:", err);
    return redirectToLogin();
  }

  const isUserAuthenticated = !!sessionPayload;
  const isAtLoginPage = pathname === LOGIN_PAGE;

  // 3. Decide based on authentication and page
  if (isAtLoginPage) {
    return isUserAuthenticated ? redirectToDashboard() : NextResponse.next();
  }

  if (!isUserAuthenticated) return redirectToLogin();

  return NextResponse.next();
}
