// middleware.api.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TokenService } from "@/service/auth/token.service";
import { publicPaths } from "@/lib/navigation-api";

export async function apiMiddleware(request: NextRequest) {
  console.log("apiMiddleware");

  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  const tokenService = new TokenService();
  const session = await tokenService.verifyToken(token || "");

  if (!session) {
    return NextResponse.json(
      { error: "Não autorizado: Token inválido ou ausente." },
      { status: 401 }
    );
  }

  return NextResponse.next();
}
