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
  nome: z.string().min(1, "O nome é obrigatório."),

  /** Last name */
  sobrenome: z.string().min(1, "O sobrenome é obrigatório."),

  /** Email address */
  email: z
    .email("Formato de e-mail inválido.")
    .min(1, "O e-mail é obrigatório."),

  /** Phone number in format (XX) XXXXX-XXXX or empty */
  celular: z
    .string()
    .refine((value) => !value || /^\(\d{2}\) \d{5}-\d{4}$/.test(value), {
      message: "Formato de celular inválido. Use (XX) XXXXX-XXXX.",
    }),

  /** CPF in format XXX.XXX.XXX-XX or empty */
  cpf: z
    .string()
    .refine((value) => !value || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value), {
      message: "Formato de CPF inválido. Use XXX.XXX.XXX-XX.",
    }),

  /** RG number */
  rg: z.string().optional().nullable(),

  /** Birth date in dd/mm/yyyy format */
  dataNascimento: z
    .string()
    .refine((value) => !value || /^\d{2}\/\d{2}\/\d{4}$/.test(value), {
      message: "Formato de data inválido. Use dd/mm/yyyy.",
    }),

  /** Address street */
  endereco: z.string().min(1, "O endereço é obrigatório."),

  /** Address number */
  numero: z.string().min(1, "O número do endereço é obrigatório."),

  /** Address complement */
  complemento: z.string().optional().nullable(),

  /** CEP in format XXXXX-XXX */
  cep: z.string().refine((value) => !value || /^\d{5}-\d{3}$/.test(value), {
    message: "Formato de CEP inválido. Use XXXXX-XXX.",
  }),

  /** City */
  cidade: z.string().min(1, "A cidade é obrigatória."),

  /** State (UF) abbreviation */
  estado: z
    .string()
    .min(1, "O estado é obrigatório.")
    .length(2, "O estado deve ter 2 letras."),

  /** Course */
  curso: z.string().min(1, "O curso é obrigatório."),

  /** Education level */
  escolaridade: z.string().min(1, "A escolaridade é obrigatória."),

  /** Institution */
  instituicao: z.string().min(1, "A instituição é obrigatória."),

  /** Year for renewal */
  anoParaRenovacao: z.string().min(1, "O ano para renovação é obrigatório."),

  /** Enrollment document URL */
  documentMatricula: z.url("URL inválida.").optional().nullable(),

  /** ID document with photo URL */
  documentoComFoto: z.url("URL inválida.").optional().nullable(),

  /** Identification photo URL */
  fotoIdentificacao: z.url("URL inválida.").optional().nullable(),

  /** Password (hashed or plain on creation) */
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),

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
