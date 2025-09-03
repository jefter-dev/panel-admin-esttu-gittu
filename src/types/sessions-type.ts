import type { JWTPayload } from "jose";
import { Role } from "@/types/admin.type";
import { APP } from "@/types/app.type";

export interface SessionPayload extends JWTPayload {
  id: string;
  email: string;
  app: APP;
  role?: Role;
  name?: string;
  expiresAt?: Date;
}

export interface Tokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}
