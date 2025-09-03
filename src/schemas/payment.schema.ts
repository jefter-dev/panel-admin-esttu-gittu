import { APP_VALUES } from "@/types/app.type";
import { z } from "zod";

// Métodos de pagamento permitidos
export const paymentMethods = ["CREDIT_CARD", "PIX", "BOLETO"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

// Status de pagamento permitidos
export const paymentStatuses = [
  "PENDING", // Aguardando Pagamento
  "PAID", // Pago
  "CANCELLED", // Cancelado
  "REFUNDED", // Estornado
  "BANK_PROCESSING", // Enviado para o banco
  "FAILED", // Falhou
  "AWAITING_CHECKOUT_RISK_ANALYSIS_REQUEST", // Em análise
] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

// Schema de criação de pagamento
export const paymentCreateSchema = z.object({
  // ID interno do pagamento (UUID do seu sistema)
  id: z.uuid({ message: "O ID do pagamento deve ser um UUID válido." }),

  // Identificação de qual app o usuário é
  app: z.enum(APP_VALUES, {
    message: "A aplicação é obrigatória.",
  }),

  // ID único do pagamento no gateway (Asaas, Pagar.me, Stripe, etc.)
  gatewayPaymentId: z.string({
    message: "O ID do gateway é obrigatório.",
  }),

  // ID do evento no gateway (útil para auditoria de webhooks)
  gatewayEventId: z.string().optional(),

  // UUID do usuário dono do pagamento
  userId: z.string({ message: "O ID do usuário é obrigatório." }),

  // Valor em reais
  amount: z
    .number({ message: "O valor é obrigatório." })
    .positive({ message: "O valor deve ser positivo." }),

  // Método de pagamento
  method: z.enum(paymentMethods, {
    message: "O método de pagamento é obrigatório.",
  }),

  // Status do pagamento
  status: z.enum(paymentStatuses, {
    message: "O status do pagamento é obrigatório.",
  }),

  // Data do pagamento (ISO 8601 vinda do gateway)
  paymentDate: z
    .string()
    .pipe(z.coerce.date())
    .refine((date) => !isNaN(date.getTime()), {
      message: "A data do pagamento deve estar no formato ISO 8601.",
    }),

  // Descrição (ex: "Carteirinha Estudantil Física")
  description: z.string().optional(),

  // Payload bruto do gateway para auditoria
  metadata: z.record(z.string(), z.any()).optional(),

  customerName: z.string({ message: "O nome do cliente é obrigatório." }),
  customerCpf: z.string({ message: "O CPF do cliente é obrigatório." }),
});

// Types derivados do schema
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
