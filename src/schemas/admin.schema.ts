// src/schemas/admin.ts
import { Role } from "@/types/admin";
import z from "zod";

// ===================================================
// Schema para CRIAÇÃO (POST)
// Todos os campos são obrigatórios.
// ===================================================
export const adminCreateSchema = z.object({
  name: z
    .string({ error: "O nome é obrigatório." })
    .min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.email("Formato de e-mail inválido."),
  password: z
    .string({ error: "A senha é obrigatória." })
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
  role: z.enum(Role, { error: "A função (role) é obrigatória." }),
});

// ===================================================
// Schema para ATUALIZAÇÃO (PATCH)
// Todos os campos são opcionais, mas se forem enviados, devem ser válidos.
// Garante que o objeto não esteja vazio.
// ===================================================
export const adminUpdateSchema = z
  .object({
    name: z
      .string()
      .min(3, "O nome deve ter pelo menos 3 caracteres.")
      .optional(),
    email: z.email("Formato de e-mail inválido.").optional(),
    // A senha é opcional. Se não for enviada, não será alterada.
    password: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres.")
      .optional(),
    // O papel também é opcional.
    role: z.enum(Role).optional(),
  })
  // O refine garante que o cliente não envie um corpo de requisição vazio: {}
  .refine((data) => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser fornecido para atualização.",
    // `path` ajuda a indicar que o erro é sobre o objeto como um todo.
    path: ["body"],
  });

// Você também pode ter um tipo inferido para cada um
export type AdminCreateInput = z.infer<typeof adminCreateSchema>;
export type AdminUpdateInput = z.infer<typeof adminUpdateSchema>;
