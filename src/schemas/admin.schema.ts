/**
 * @file schemas/admin.ts
 *
 * @summary Zod schemas for Admin entity validation.
 * Includes validation for creation (POST) and update (PATCH).
 */

import { Role } from "@/types/admin.type";
import { APP_VALUES } from "@/types/app.type";
import z from "zod";

// ===================================================
// Schema for Admin CREATION (POST)
// All fields are required.
// ===================================================
export const adminCreateSchema = z.object({
  /** Admin full name (min 3 chars) */
  name: z
    .string({ error: "Name is required." })
    .min(3, "Name must be at least 3 characters."),

  /** Admin email */
  email: z.email("Invalid email format."),

  /** Admin password (min 6 chars) */
  password: z
    .string({ error: "Password is required." })
    .min(6, "Password must be at least 6 characters."),

  /** Admin role */
  role: z.enum(Role, { error: "Role is required." }),

  /** Target application */
  app: z.enum(APP_VALUES),
});

// ===================================================
// Schema for Admin UPDATE (PATCH)
// All fields are optional but must be valid if provided.
// Object cannot be empty.
// ===================================================
export const adminUpdateSchema = z
  .object({
    /** Optional name update */
    name: z
      .string()
      .min(3, "O nome deve ter no mínimo 3 caracteres.")
      .optional(),

    /** Optional email update */
    email: z.email("Formato de e-mail inválido.").optional(),

    /** Optional password update (min 6 chars if provided) */
    password: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 6, {
        message: "A senha deve ter no mínimo 6 caracteres.",
      }),

    /** Optional role update */
    role: z.enum(Role).optional(),

    /** Optional app update */
    app: z.enum(APP_VALUES).optional(),
  })
  // Ensure object is not empty
  .refine((data) => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser informado para atualização.",
    path: ["body"],
  });

// ===================================================
// Types inferred from schemas
// ===================================================
export type AdminCreateInput = z.infer<typeof adminCreateSchema>;
export type AdminUpdateInput = z.infer<typeof adminUpdateSchema>;
