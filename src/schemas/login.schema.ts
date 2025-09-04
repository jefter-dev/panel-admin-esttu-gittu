/**
 * @file schemas/login.ts
 *
 * @summary Zod schema for user login validation.
 * Validates email and password fields.
 */

import { z } from "zod";

// ===================================================
// Schema for LOGIN
// Validates email and password inputs.
// ===================================================
export const loginSchema = z.object({
  /** User email (must be a valid email format) */
  email: z.email("Invalid email format."),

  /** User password (min 6 characters) */
  password: z.string().min(6, "Password must be at least 6 characters."),
});

// ===================================================
// Type inferred from schema
// ===================================================
export type LoginSchema = z.infer<typeof loginSchema>;
