// src/types/payment.ts

import { APP } from "./app";

// Status possíveis de um pagamento
export type PaymentStatus = "CONFIRMED" | "PENDING" | "FAILED" | "REFUNDED";

// Métodos de pagamento que você aceita (ex: do Asaas)
export type PaymentMethod = "CREDIT_CARD" | "PIX" | "BOLETO";

export interface Payment {
  /** UUID único para este registro de pagamento */
  id: string;

  /** UUID do usuário que realizou o pagamento (relação com a coleção User) */
  userId: string;

  /** ID do pagamento gerado pelo gateway (ex: Asaas), para referência e evitar duplicatas */
  gatewayPaymentId: string;

  /** Valor do pagamento em centavos para evitar problemas com ponto flutuante */
  amount: number;

  /** Método de pagamento utilizado */
  method: PaymentMethod;

  /** Status atual do pagamento */
  status: PaymentStatus;

  /** Timestamp de quando o registro foi criado */
  createdAt: string;

  /** A qual aplicação este pagamento pertence */
  app: APP;
}

// Payload para criar um novo registro de pagamento no repositório
export type PaymentCreatePayload = Omit<Payment, "id">;
