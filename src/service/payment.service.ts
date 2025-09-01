import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { APP } from "@/types/app";
import { Payment, PaymentCreatePayload } from "@/types/payment";
import { PaymentCreateInput } from "@/schemas/payment.schema";
import { PaymentRepository } from "@/repository/payment.repository";
import { Timestamp } from "firebase-admin/firestore";

export class PaymentService {
  private paymentRepository: PaymentRepository;
  private app: APP;

  constructor(app: APP) {
    const db = getFirebaseAdmin(app);
    this.app = app;
    this.paymentRepository = new PaymentRepository(db);
  }

  /**
   * Orquestra o registro de um novo pagamento vindo de uma requisição externa.
   * @param payload Os dados do pagamento validados, contendo o userId.
   * @returns O registro de pagamento criado.
   * @throws {RecordNotFoundError} Se o usuário especificado no payload não for encontrado.
   */
  async createPayment(payload: PaymentCreateInput): Promise<Payment> {
    const payloadForRepo: PaymentCreatePayload = {
      ...payload,
      paymentDate: Timestamp.fromDate(new Date(payload.paymentDate)), // <- conversão aqui
    };

    return await this.paymentRepository.create(payloadForRepo);
  }

  // O método getPaymentsForUser permanece o mesmo, pois ele já recebia o userId
  async getPaymentsForUser(userId: string): Promise<Payment[]> {
    return this.paymentRepository.findByUserId(userId);
  }

  async list(options: {
    limit?: number;
    startAfter?: string;
    search?: string;
    dateFrom: string;
    dateTo: string;
  }): Promise<Payment[]> {
    return this.paymentRepository.find(this.app, options);
  }

  /**
   * Retorna os pagamentos do mês corrente, agrupados por dia.
   * Útil para gráficos.
   */
  async getPaymentsCurrentMonth(
    app: APP
  ): Promise<{ date: string; total: number }[]> {
    return this.paymentRepository.getPaymentsCurrentMonth(app);
  }

  async getTotalAmountByDateRange(
    app: APP,
    dateFrom: string,
    dateTo: string
  ): Promise<number> {
    return this.paymentRepository.getTotalAmountByDateRange(
      app,
      dateFrom,
      dateTo
    );
  }

  /**
   * Retorna o valor total de pagamentos do dia atual.
   */
  async getPaymentsSummaryToday(
    app: APP
  ): Promise<{ count: number; totalAmount: number }> {
    return this.paymentRepository.getPaymentsSummaryToday(app);
  }

  /**
   * Retorna a quantidade e o valor total de pagamentos do mês corrente.
   */
  async getPaymentsSummaryCurrentMonth(
    app: APP
  ): Promise<{ count: number; totalAmount: number }> {
    return this.paymentRepository.getPaymentsSummaryCurrentMonth(app);
  }
}
