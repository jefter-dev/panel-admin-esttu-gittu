import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { APP } from "@/types/app.type";
import { Payment, PaymentCreatePayload } from "@/types/payment.type";
import { PaymentCreateInput } from "@/schemas/payment.schema";
import { PaymentRepository } from "@/repository/payment.repository";
import { Timestamp } from "firebase-admin/firestore";

export class PaymentService {
  private paymentRepository: PaymentRepository;

  constructor(app: APP) {
    const db = getFirebaseAdmin(app);
    this.paymentRepository = new PaymentRepository(db);
  }

  /**
   * @summary Orchestrates the creation of a new payment.
   * @param payload {PaymentCreateInput} Validated payment input including userId.
   * @returns {Promise<Payment>} The created payment record.
   * @throws {RecordNotFoundError} If the specified user does not exist.
   */
  async createPayment(payload: PaymentCreateInput): Promise<Payment> {
    const payloadForRepo: PaymentCreatePayload = {
      ...payload,
      paymentDate: Timestamp.fromDate(payload.paymentDate),
    };

    return await this.paymentRepository.create(payloadForRepo);
  }

  /**
   * @summary Retrieves all payments for a specific user.
   * @param userId {string} ID of the user.
   * @returns {Promise<Payment[]>} List of payments for the user.
   */
  async getPaymentsForUser(userId: string): Promise<Payment[]> {
    return this.paymentRepository.findByUserId(userId);
  }

  /**
   * @summary Lists payments with optional pagination, search, and date filters.
   * @param options {Object} Filtering and pagination options.
   * @param options.limit {number} Optional maximum number of records.
   * @param options.startAfter {string} Optional ID to start after for pagination.
   * @param options.search {string} Optional search term.
   * @param options.dateFrom {string} Start date for filtering.
   * @param options.dateTo {string} End date for filtering.
   * @param options.app {APP} App context.
   * @returns {Promise<Payment[]>} List of payments matching the criteria.
   */
  async list(options: {
    limit?: number;
    startAfter?: string;
    search?: string;
    dateFrom: string;
    dateTo: string;
    app: APP;
  }): Promise<Payment[]> {
    return this.paymentRepository.find(options);
  }

  /**
   * @summary Retrieves current month's payments grouped by day for charting.
   * @param app {APP} App context.
   * @returns {Promise<Array<{ date: string; total: number }>>} Payments aggregated by day.
   */
  async getPaymentsCurrentMonth(
    app: APP
  ): Promise<{ date: string; total: number }[]> {
    return this.paymentRepository.getPaymentsCurrentMonth(app);
  }

  /**
   * @summary Returns total payment amount within a specific date range.
   * @param app {APP} App context.
   * @param dateFrom {string} Start date.
   * @param dateTo {string} End date.
   * @returns {Promise<number>} Total amount of payments.
   */
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
   * @summary Returns total payments and count for today.
   * @param app {APP} App context.
   * @returns {Promise<{ count: number; totalAmount: number }>} Payment summary for today.
   */
  async getPaymentsSummaryToday(
    app: APP
  ): Promise<{ count: number; totalAmount: number }> {
    return this.paymentRepository.getPaymentsSummaryToday(app);
  }

  /**
   * @summary Retrieves all payments made today.
   * @param app {APP} App context.
   * @returns {Promise<Payment[]>} List of today's payments.
   */
  async getPaymentsToday(app: APP): Promise<Payment[]> {
    return this.paymentRepository.getPaymentsToday(app);
  }

  /**
   * @summary Returns total payments and count for the current month.
   * @param app {APP} App context.
   * @returns {Promise<{ count: number; totalAmount: number }>} Payment summary for the current month.
   */
  async getPaymentsSummaryCurrentMonth(
    app: APP
  ): Promise<{ count: number; totalAmount: number }> {
    return this.paymentRepository.getPaymentsSummaryCurrentMonth(app);
  }

  /**
   * @summary Retrieves payments within a specified date range, aggregated by day.
   * @param app {APP} App context.
   * @param dateFrom {string} Start date.
   * @param dateTo {string} End date.
   * @returns {Promise<Array<{ date: string; total: number }>>} Payments grouped by day.
   */
  async getPaymentsByDateRange(
    app: APP,
    dateFrom: string,
    dateTo: string
  ): Promise<{ date: string; total: number }[]> {
    return this.paymentRepository.getPaymentsByDateRange(app, dateFrom, dateTo);
  }
}
