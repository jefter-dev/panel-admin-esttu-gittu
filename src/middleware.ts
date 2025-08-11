import type { NextRequest } from "next/server";
import { apiMiddleware } from "./middleware.api";
import { pagesMiddleware } from "./middleware.pages";

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico|cypress|.*\\..*).*)",
};

export async function middleware(request: NextRequest) {
  console.log("middleware: ", request.nextUrl.pathname);
  if (request.nextUrl.pathname.startsWith("/api")) {
    return apiMiddleware(request);
  }

  return pagesMiddleware(request);
}
