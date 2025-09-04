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
  id: z.uuid({ message: "Payment ID must be a valid UUID." }),

  /** Application identifier */
  app: z.enum(APP_VALUES, { message: "Application is required." }),

  /** Gateway payment ID (Asaas, Pagar.me, Stripe, etc.) */
  gatewayPaymentId: z.string({ message: "Gateway ID is required." }),

  /** Gateway event ID for webhook auditing */
  gatewayEventId: z.string().optional(),

  /** User ID (UUID) who owns the payment */
  userId: z.string({ message: "User ID is required." }),

  /** Amount in BRL */
  amount: z
    .number({ message: "Amount is required." })
    .positive({ message: "Amount must be positive." }),

  /** Payment method */
  method: z.enum(paymentMethods, { message: "Payment method is required." }),

  /** Payment status */
  status: z.enum(paymentStatuses, { message: "Payment status is required." }),

  /** Payment date in ISO 8601 format */
  paymentDate: z
    .string()
    .pipe(z.coerce.date())
    .refine((date) => !isNaN(date.getTime()), {
      message: "Payment date must be in ISO 8601 format.",
    }),

  /** Description (e.g., "Student ID Card Physical") */
  description: z.string().optional(),

  /** Raw payload from gateway for auditing */
  metadata: z.record(z.string(), z.any()).optional(),

  /** Customer name */
  customerName: z.string({ message: "Customer name is required." }),

  /** Customer CPF */
  customerCpf: z.string({ message: "Customer CPF is required." }),
});

// ===================================================
// Type inferred from schema
// ===================================================
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
