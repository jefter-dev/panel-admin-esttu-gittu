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
  email: z.email("Formato de e-mail inválido."),

  /** User password (min 6 characters) */
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
});

// ===================================================
// Type inferred from schema
// ===================================================
export type LoginSchema = z.infer<typeof loginSchema>;
