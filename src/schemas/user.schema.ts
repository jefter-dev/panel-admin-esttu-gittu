// src/schemas/user.schema.ts
import { z } from "zod";

// Schema para validar o payload de criação de um novo usuário.
export const userCreateSchema = z.object({
  nome: z
    .string({ error: "O nome é obrigatório." })
    .min(2, "O nome deve ter pelo menos 2 caracteres."),
  sobrenome: z
    .string({ error: "O sobrenome é obrigatório." })
    .min(2, "O sobrenome deve ter pelo menos 2 caracteres."),
  email: z.email("Formato de e-mail inválido."),
  celular: z
    .string({ error: "O celular é obrigatório." })
    .regex(/^\d{10,11}$/, "O celular deve conter 10 ou 11 dígitos numéricos."),
  cpf: z
    .string({ error: "O CPF é obrigatório." })
    .regex(/^\d{11}$/, "O CPF deve conter 11 dígitos numéricos."),
  rg: z.string({ error: "O RG é obrigatório." }),
  dataNascimento: z
    .string({ error: "A data de nascimento é obrigatória." })
    .regex(
      /^\d{2}\/\d{2}\/\d{4}$/,
      "Formato de data inválido. Use dd/mm/aaaa."
    ),
  endereco: z.string({ error: "O endereço é obrigatório." }),
  numero: z.string({ error: "O número do endereço é obrigatório." }),
  complemento: z.string().optional(),
  cep: z
    .string({ error: "O CEP é obrigatório." })
    .regex(/^\d{8}$/, "O CEP deve conter 8 dígitos numéricos."),
  cidade: z.string({ error: "A cidade é obrigatória." }),
  estado: z
    .string({ error: "O estado é obrigatório." })
    .length(2, "O estado deve ser a sigla de 2 letras."),
  curso: z.string({ error: "O curso é obrigatório." }),
  escolaridade: z.string({ error: "A escolaridade é obrigatória." }),
  instituicao: z.string({
    error: "A instituição de ensino é obrigatória.",
  }),
  anoParaRenovacao: z.string({
    error: "O ano para renovação é obrigatório.",
  }),
  documentMatricula: z.url("Deve ser uma URL válida."),
  documentoComFoto: z.url("Deve ser uma URL válida."),
  fotoIdentificacao: z.url("Deve ser uma URL válida."),
  senha: z
    .string({ error: "A senha é obrigatória." })
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
