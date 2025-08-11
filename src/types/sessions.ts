import type { JWTPayload } from "jose";
import { Role } from "@/types/admin";
import { APP } from "@/types/app";

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
