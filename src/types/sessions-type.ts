/**
 * @file types/sessions-type.ts
 *
 * @summary Defines types for authentication sessions and JWT payloads.
 */

import type { JWTPayload } from "jose";
import { Role } from "@/types/admin.type";
import { APP } from "@/types/app.type";

/**
 * Payload stored in JWT for a user session.
 */
export interface SessionPayload extends JWTPayload {
  /** User ID */
  id: string;

  /** User email */
  email: string;

  /** Application this session belongs to */
  app: APP;

  /** User role (optional, may be undefined for some sessions) */
  role?: Role;

  /** User full name (optional) */
  name?: string;

  /** Expiration date of the session (optional) */
  expiresAt?: Date;
}

/**
 * Tokens returned after authentication.
 */
export interface Tokens {
  /** Access token (JWT) */
  access_token: string;

  /** Refresh token (optional, used to obtain new access tokens) */
  refresh_token?: string;

  /** Expiration time in seconds */
  expires_in: number;
}
