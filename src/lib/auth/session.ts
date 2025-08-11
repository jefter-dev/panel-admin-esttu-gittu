import { NextRequest } from "next/server";
import { AuthService } from "@/service/auth/auth.service";
import { APP, APP_VALUES } from "@/types/app";

export async function getSessionFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) return null;

  const session = await AuthService.verifyToken(token);
  return session;
}

export function isValidAppName(value: unknown): value is APP {
  return typeof value === "string" && APP_VALUES.includes(value as APP);
}
