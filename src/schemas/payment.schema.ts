/**
 * @file schemas/payment.ts
 *
 * @summary Zod schemas and types for payment validation.
 * Includes allowed payment methods, statuses, and creation payload.
 */

import { APP_VALUES } from "@/types/app.type";
import { z } from "zod";

// ===================================================
// Allowed payment methods
// ===================================================
export const paymentMethods = ["CREDIT_CARD", "PIX", "BOLETO"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

// ===================================================
// Allowed payment statuses
// ===================================================
export const paymentStatuses = [
  "PENDING", // Awaiting payment
  "PAID", // Paid
  "CANCELLED", // Cancelled
  "REFUNDED", // Refunded
  "BANK_PROCESSING", // Sent to bank
  "FAILED", // Failed
  "AWAITING_CHECKOUT_RISK_ANALYSIS_REQUEST", // Under review
] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

// ===================================================
// Schema for PAYMENT CREATION
// Validates all required fields for creating a new payment.
// ===================================================
export const paymentCreateSchema = z.object({
  /** Internal payment ID (UUID of the system) */
  id: z.uuid({ message: "O ID do pagamento deve ser um UUID válido." }),

  /** Application identifier */
  app: z.enum(APP_VALUES, { message: "A aplicação é obrigatória." }),

  /** Gateway payment ID (Asaas, Pagar.me, Stripe, etc.) */
  gatewayPaymentId: z.string({ message: "O ID do gateway é obrigatório." }),

  /** Gateway event ID for webhook auditing */
  gatewayEventId: z.string().optional(),

  /** User ID (UUID) who owns the payment */
  userId: z.string({ message: "O ID do usuário é obrigatório." }),

  /** Amount in BRL */
  amount: z
    .number({ message: "O valor é obrigatório." })
    .positive({ message: "O valor deve ser positivo." }),

  /** Payment method */
  method: z.enum(paymentMethods, {
    message: "O método de pagamento é obrigatório.",
  }),

  /** Payment status */
  status: z.enum(paymentStatuses, {
    message: "O status do pagamento é obrigatório.",
  }),

  /** Payment date in ISO 8601 format */
  paymentDate: z
    .string()
    .pipe(z.coerce.date())
    .refine((date) => !isNaN(date.getTime()), {
      message: "A data do pagamento deve estar no formato ISO 8601.",
    }),

  /** Description (e.g., "Student ID Card Physical") */
  description: z.string().optional(),

  /** Raw payload from gateway for auditing */
  metadata: z.record(z.string(), z.any()).optional(),

  /** Customer name */
  customerName: z.string({ message: "O nome do cliente é obrigatório." }),

  /** Customer CPF */
  customerCpf: z.string({ message: "O CPF do cliente é obrigatório." }),
});

// ===================================================
// Type inferred from schema
// ===================================================
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
