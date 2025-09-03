import { Timestamp } from "firebase-admin/firestore";
import { APP } from "@/types/app.type";

// Status possíveis de um pagamento (alinhado com o schema)
export type PaymentStatus =
  | "PENDING" // Aguardando Pagamento
  | "PAID" // Pago
  | "CANCELLED" // Cancelado
  | "REFUNDED" // Estornado
  | "BANK_PROCESSING" // Enviado para o banco
  | "FAILED" // Falhou
  | "AWAITING_CHECKOUT_RISK_ANALYSIS_REQUEST"; // Em análise

// Métodos de pagamento que você aceita (mesmo do schema)
export type PaymentMethod = "CREDIT_CARD" | "PIX" | "BOLETO";

export interface Payment {
  /** UUID único para este registro de pagamento */
  id: string;

  /** UUID do usuário que realizou o pagamento (relação com a coleção User) */
  userId: string;

  /** Nome do cliente vindo do pagamento */
  customerName: string;

  /** CPF do cliente vindo do pagamento */
  customerCpf: string;

  /** ID do pagamento gerado pelo gateway (ex: Asaas), para referência e evitar duplicatas */
  gatewayPaymentId: string;

  /** ID do evento do gateway (útil para auditoria de webhooks) */
  gatewayEventId?: string;

  /** Valor do pagamento em reais (mantido igual ao schema) */
  amount: number;

  /** Método de pagamento utilizado */
  method: PaymentMethod;

  /** Status atual do pagamento */
  status: PaymentStatus;

  /** Data/hora em que o pagamento foi confirmado no gateway (ISO 8601) */
  paymentDate: Timestamp | string;

  /** Timestamp de quando o registro foi criado no sistema (ISO 8601) */
  createdAt?: Timestamp;

  /** Descrição (ex: "Carteirinha Estudantil Física") */
  description?: string;

  /** Payload bruto do gateway (útil para auditoria e debugging) */
  metadata?: Record<string, unknown>;

  /** A qual aplicação este pagamento pertence */
  app: APP;
}

export type PaymentCreatePayload = Payment; // inclui o id

export interface PaymentsStats {
  count: number;
  totalAmount: number;
}
