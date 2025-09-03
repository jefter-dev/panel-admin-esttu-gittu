import { z } from "zod";

export const userCreateSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório."),
  sobrenome: z.string().min(1, "O sobrenome é obrigatório."),
  email: z
    .email("Formato de e-mail inválido.")
    .min(1, "O e-mail é obrigatório."),

  // A validação para celular agora permite um campo vazio ou um formato completo
  celular: z
    .string()
    .refine((value) => !value || /^\(\d{2}\) \d{5}-\d{4}$/.test(value), {
      message: "Formato de celular inválido. Use (XX) XXXXX-XXXX.",
    }),

  // A validação para CPF agora permite um campo vazio ou um formato completo
  cpf: z
    .string()
    .refine((value) => !value || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value), {
      message: "Formato de CPF inválido. Use XXX.XXX.XXX-XX.",
    }),

  rg: z.string().optional().nullable(),
  dataNascimento: z
    .string()
    .refine((value) => !value || /^\d{2}\/\d{2}\/\d{4}$/.test(value), {
      message: "Formato de data inválido. Use dd/mm/aaaa.",
    }),
  endereco: z.string().min(1, "O endereço é obrigatório."),
  numero: z.string().min(1, "O número do endereço é obrigatório."),
  complemento: z.string().optional().nullable(),

  cep: z.string().refine((value) => !value || /^\d{5}-\d{3}$/.test(value), {
    message: "Formato de CEP inválido. Use XXXXX-XXX.",
  }),

  cidade: z.string().min(1, "A cidade é obrigatória."),
  estado: z
    .string()
    .min(1, "O estado é obrigatório.")
    .length(2, "O estado deve ser a sigla de 2 letras."),
  curso: z.string().min(1, "O curso é obrigatório."),
  escolaridade: z.string().min(1, "A escolaridade é obrigatória."),
  instituicao: z.string().min(1, "A instituição de ensino é obrigatória."),
  anoParaRenovacao: z.string().min(1, "O ano para renovação é obrigatório."),

  documentMatricula: z.url("URL inválida.").optional().nullable(),
  documentoComFoto: z.url("URL inválida.").optional().nullable(),
  fotoIdentificacao: z.url("URL inválida.").optional().nullable(),

  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),

  pagamentoEfetuado: z.boolean().default(false),
});

export const userUpdateSchema = userCreateSchema
  .partial()
  .omit({ senha: true });

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
