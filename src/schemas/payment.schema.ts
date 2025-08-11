// src/schemas/payment.schema.ts
import { z } from "zod";

// Métodos de pagamento permitidos
const paymentMethods = ["CREDIT_CARD", "PIX", "BOLETO"] as const;

// O frontend/webhook precisa enviar todos os dados necessários
export const paymentCreateSchema = z.object({
  // ID único do pagamento no gateway (Asaas, etc.)
  gatewayPaymentId: z.string({
    error: "O ID do gateway é obrigatório.",
  }),

  // O UUID do usuário ao qual este pagamento pertence
  userId: z.uuid("O ID do usuário deve ser um UUID válido."),

  // Valor em centavos
  amount: z
    .number({ error: "O valor é obrigatório." })
    .int("O valor deve ser um número inteiro (centavos).")
    .positive("O valor deve ser positivo."),

  // Método de pagamento
  method: z.enum(paymentMethods, {
    error: "O método de pagamento é obrigatório.",
  }),

  // Data em que o pagamento foi efetivado, em formato ISO 8601 (ex: "2023-10-27T10:00:00Z")
  // .datetime() valida o formato ISO 8601, que é o mais recomendado para APIs
  paymentDate: z.iso.datetime({
    message: "A data do pagamento deve estar no formato ISO 8601.",
  }),
});

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
