/**
 * @file schemas/user.ts
 *
 * @summary Zod schemas and types for user validation.
 * Includes schemas for user creation and update.
 */

import { z } from "zod";

// ===================================================
// Schema for USER CREATION (POST)
// All required fields must be provided.
// ===================================================
export const userCreateSchema = z.object({
  /** First name */
  nome: z.string().min(1, "Nome is required."),

  /** Last name */
  sobrenome: z.string().min(1, "Sobrenome is required."),

  /** Email address */
  email: z.email("Invalid email format.").min(1, "Email is required."),

  /** Phone number in format (XX) XXXXX-XXXX or empty */
  celular: z
    .string()
    .refine((value) => !value || /^\(\d{2}\) \d{5}-\d{4}$/.test(value), {
      message: "Invalid phone format. Use (XX) XXXXX-XXXX.",
    }),

  /** CPF in format XXX.XXX.XXX-XX or empty */
  cpf: z
    .string()
    .refine((value) => !value || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value), {
      message: "Invalid CPF format. Use XXX.XXX.XXX-XX.",
    }),

  /** RG number */
  rg: z.string().optional().nullable(),

  /** Birth date in dd/mm/yyyy format */
  dataNascimento: z
    .string()
    .refine((value) => !value || /^\d{2}\/\d{2}\/\d{4}$/.test(value), {
      message: "Invalid date format. Use dd/mm/yyyy.",
    }),

  /** Address street */
  endereco: z.string().min(1, "Address is required."),

  /** Address number */
  numero: z.string().min(1, "Address number is required."),

  /** Address complement */
  complemento: z.string().optional().nullable(),

  /** CEP in format XXXXX-XXX */
  cep: z.string().refine((value) => !value || /^\d{5}-\d{3}$/.test(value), {
    message: "Invalid CEP format. Use XXXXX-XXX.",
  }),

  /** City */
  cidade: z.string().min(1, "City is required."),

  /** State (UF) abbreviation */
  estado: z
    .string()
    .min(1, "State is required.")
    .length(2, "State must be a 2-letter code."),

  /** Course */
  curso: z.string().min(1, "Course is required."),

  /** Education level */
  escolaridade: z.string().min(1, "Education level is required."),

  /** Institution */
  instituicao: z.string().min(1, "Institution is required."),

  /** Year for renewal */
  anoParaRenovacao: z.string().min(1, "Renewal year is required."),

  /** Enrollment document URL */
  documentMatricula: z.url("Invalid URL.").optional().nullable(),

  /** ID document with photo URL */
  documentoComFoto: z.url("Invalid URL.").optional().nullable(),

  /** Identification photo URL */
  fotoIdentificacao: z.url("Invalid URL.").optional().nullable(),

  /** Password (hashed or plain on creation) */
  senha: z.string().min(6, "Password must be at least 6 characters."),

  /** Payment status (optional, defaults to false) */
  pagamentoEfetuado: z.boolean().default(false),
});

// ===================================================
// Schema for USER UPDATE (PATCH)
// All fields optional, password cannot be updated via this schema.
// ===================================================
export const userUpdateSchema = userCreateSchema
  .partial()
  .omit({ senha: true });

// ===================================================
// Types inferred from schemas
// ===================================================
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
