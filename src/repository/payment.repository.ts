import { Timestamp, type Firestore } from "firebase-admin/firestore";
import { FirestoreBaseService } from "@/service/firebase/firestore-base.service";
import { DataPersistenceError } from "@/errors/custom.errors";
import { Payment, PaymentCreatePayload } from "@/types/payment.type";
import { APP } from "@/types/app.type";
import { getStartAndEndOfMonthUTC } from "@/lib/utils";
import { toZonedTime } from "date-fns-tz";

export class PaymentRepository extends FirestoreBaseService {
  private collection: FirebaseFirestore.CollectionReference;

  constructor(private db: Firestore) {
    super();
    this.collection = db.collection("payments");
  }

  /**
   * @summary Creates a new payment record in Firestore.
   * @param payload {PaymentCreatePayload} Payment data to be created.
   * @returns {Promise<Payment>} Returns the complete Payment object including timestamps.
   * @throws {DataPersistenceError} If the write operation fails.
   */
  async create(payload: PaymentCreatePayload): Promise<Payment> {
    try {
      let paymentDateTimestamp: Timestamp;
      if (typeof payload.paymentDate === "string") {
        const [datePart, timePart] = payload.paymentDate.split(" ");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hours, minutes, seconds] = timePart.split(":").map(Number);

        const paymentDateUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
        paymentDateTimestamp = Timestamp.fromDate(paymentDateUtc);
      } else if (payload.paymentDate instanceof Timestamp) {
        paymentDateTimestamp = payload.paymentDate;
      } else {
        throw new Error("Invalid paymentDate format");
      }

      const dataToSave: Payment = {
        ...payload,
        createdAt: Timestamp.now(),
        paymentDate: paymentDateTimestamp,
      };

      await this.collection.doc(payload.id).set(dataToSave);

      return dataToSave;
    } catch (error) {
      console.error("[PaymentRepository.create] Error creating payment:", error);
      throw new DataPersistenceError("Failed to save the payment record.");
    }
  }

  /**
   * @summary Finds payments with optional filtering, search, and pagination.
   * @param options {{
   *   limit?: number;
   *   startAfter?: string;
   *   search?: string;
   *   dateFrom: string;
   *   dateTo: string;
   *   app: APP;
   * }} Filtering and pagination options.
   * @returns {Promise<Payment[]>} Returns a list of Payment objects.
   */
  async find(options: {
    limit?: number;
    startAfter?: string;
    search?: string;
    dateFrom: string;
    dateTo: string;
    app: APP;
  }): Promise<Payment[]> {
    const { limit = 20, startAfter, search, dateFrom, dateTo, app } = options;

    const fromDate = new Date(dateFrom);
    fromDate.setUTCHours(0, 0, 0, 0);
    const from = Timestamp.fromDate(fromDate);

    const toDate = new Date(dateTo);
    toDate.setUTCHours(23, 59, 59, 999);
    const to = Timestamp.fromDate(toDate);

    let snapshots: FirebaseFirestore.QueryDocumentSnapshot[] = [];

    if (search && search.trim() !== "") {
      let queryByName = this.collection
        .where("app", "==", app)
        .where("paymentDate", ">=", from)
        .where("paymentDate", "<=", to)
        .orderBy("customerName")
        .startAt(search)
        .endAt(search + "\uf8ff");

      let queryByCpf = this.collection
        .where("app", "==", app)
        .where("paymentDate", ">=", from)
        .where("paymentDate", "<=", to)
        .orderBy("customerCpf")
        .startAt(search)
        .endAt(search + "\uf8ff");

      if (startAfter) {
        const lastDocSnapshot = await this.collection.doc(startAfter).get();
        if (lastDocSnapshot.exists) {
          queryByName = queryByName.startAfter(lastDocSnapshot);
          queryByCpf = queryByCpf.startAfter(lastDocSnapshot);
        }
      }

      const [snapshotByName, snapshotByCpf] = await Promise.all([
        queryByName.limit(limit).get(),
        queryByCpf.limit(limit).get(),
      ]);

      snapshots = [...snapshotByName.docs, ...snapshotByCpf.docs];
    } else {
      let query = this.collection
        .where("app", "==", app)
        .where("paymentDate", ">=", from)
        .where("paymentDate", "<=", to)
        .orderBy("paymentDate", "desc");

      if (startAfter) {
        const lastDocSnapshot = await this.collection.doc(startAfter).get();
        if (lastDocSnapshot.exists) {
          query = query.startAfter(lastDocSnapshot);
        }
      }

      const snapshot = await query.limit(limit).get();
      snapshots = snapshot.docs;
    }

    const uniqueDocsMap = new Map(snapshots.map((doc) => [doc.id, doc]));

    return Array.from(uniqueDocsMap.values())
      .map((doc) => ({
        ...this.mapDocTo<Payment>(doc),
        idDocument: doc.id,
      }))
      .slice(0, limit);
  }

  /**
   * @summary Lists all payments for a specific user.
   * @param userId {string} User UUID.
   * @returns {Promise<Payment[]>} Returns a list of Payment objects.
   * @throws {DataPersistenceError} If the query fails.
   */
  async findByUserId(userId: string): Promise<Payment[]> {
    try {
      const snapshot = await this.collection
        .where("userId", "==", userId)
        .get();
      if (snapshot.empty) return [];
      return snapshot.docs.map((doc) => this.mapDocTo<Payment>(doc));
    } catch (error) {
      console.error(
        `[PaymentRepository.findByUserId] Error fetching payments for user ${userId}:`,
        error
      );
      throw new DataPersistenceError("Failed to list payments.");
    }
  }

  /**
   * @summary Calculates the total payment amount within a date range.
   * @param app {APP} App identifier.
   * @param dateFrom {string} Start date (ISO string).
   * @param dateTo {string} End date (ISO string).
   * @returns {Promise<number>} Returns the total payment amount.
   * @throws {DataPersistenceError} If calculation fails.
   */
  async getTotalAmountByDateRange(
    app: APP,
    dateFrom: string,
    dateTo: string
  ): Promise<number> {
    try {
      const fromDate = new Date(dateFrom);
      fromDate.setUTCHours(0, 0, 0, 0);
      const toDate = new Date(dateTo);
      toDate.setUTCHours(23, 59, 59, 999);

      const startTimestamp = Timestamp.fromDate(fromDate);
      const endTimestamp = Timestamp.fromDate(toDate);

      const snapshot = await this.collection
        .where("app", "==", app)
        .where("paymentDate", ">=", startTimestamp)
        .where("paymentDate", "<=", endTimestamp)
        .get();

      if (snapshot.empty) return 0;

      return snapshot.docs.reduce((total, doc) => {
        const payment = this.mapDocTo<Payment>(doc);
        return total + (payment.amount || 0);
      }, 0);
    } catch (error) {
      console.error(
        "[PaymentRepository.getTotalAmountByDateRange] Error:",
        error
      );
      throw new DataPersistenceError(
        "Failed to calculate total payments in date range."
      );
    }
  }

  /**
   * @summary Counts total payments in the collection.
   * @returns {Promise<number>} Returns the total number of payments.
   * @throws {DataPersistenceError} If the count operation fails.
   */
  async countTotalPayments(): Promise<number> {
    try {
      const snapshot = await this.collection.count().get();
      return snapshot.data().count || 0;
    } catch (error) {
      console.error(
        "[PaymentRepository.countTotalPayments] Error counting payments:",
        error
      );
      throw new DataPersistenceError("Failed to count payments.");
    }
  }

  /**
   * @summary Returns daily payment counts for the current month.
   * @param app {APP} App identifier.
   * @returns {Promise<{ date: string; total: number }[]>} Returns array with date and total payments.
   * @throws {DataPersistenceError} If fetching fails.
   */
  async getPaymentsCurrentMonth(
    app: APP
  ): Promise<{ date: string; total: number }[]> {
    try {
      const { start, end } = getStartAndEndOfMonthUTC();
      const fromTimestamp = Timestamp.fromDate(start);
      const toTimestamp = Timestamp.fromDate(end);

      const query = this.collection
        .where("app", "==", app)
        .where("paymentDate", ">=", fromTimestamp)
        .where("paymentDate", "<=", toTimestamp)
        .orderBy("paymentDate", "desc");

      const snapshot = await query.get();

      if (snapshot.empty) return [];

      const paymentsByDay = new Map<string, number>();
      snapshot.docs.forEach((doc) => {
        const payment = this.mapDocTo<Payment>(doc);

        let dateObj: Date;
        if (payment.paymentDate instanceof Timestamp) {
          dateObj = payment.paymentDate.toDate();
        } else if (typeof payment.paymentDate === "string") {
          dateObj = new Date(payment.paymentDate);
        } else {
          console.warn(
            "[PaymentRepository.getPaymentsCurrentMonth] Unexpected paymentDate:",
            payment.paymentDate
          );
          return;
        }

        const dayKey = `${dateObj.getUTCFullYear()}-${(
          dateObj.getUTCMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${dateObj
            .getUTCDate()
            .toString()
            .padStart(2, "0")}`;

        paymentsByDay.set(dayKey, (paymentsByDay.get(dayKey) || 0) + 1);
      });

      return Array.from(paymentsByDay.entries())
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error(
        "[PaymentRepository.getPaymentsCurrentMonth] Error fetching current month payments:",
        error
      );
      throw new DataPersistenceError("Failed to fetch current month payments.");
    }
  }

  /**
   * @summary Returns daily payment counts within a date range.
   * @param app {APP} App identifier.
   * @param dateFrom {string} Start date (ISO string).
   * @param dateTo {string} End date (ISO string).
   * @returns {Promise<{ date: string; total: number }[]>} Returns array with date and total payments.
   * @throws {DataPersistenceError} If fetching fails.
   */
  async getPaymentsByDateRange(
    app: APP,
    dateFrom: string,
    dateTo: string
  ): Promise<{ date: string; total: number }[]> {
    try {
      const fromDate = new Date(dateFrom);
      fromDate.setUTCHours(0, 0, 0, 0);

      const toDate = new Date(dateTo);
      toDate.setUTCHours(23, 59, 59, 999);

      const fromTimestamp = Timestamp.fromDate(fromDate);
      const toTimestamp = Timestamp.fromDate(toDate);

      const query = this.collection
        .where("app", "==", app)
        .where("paymentDate", ">=", fromTimestamp)
        .where("paymentDate", "<=", toTimestamp)
        .orderBy("paymentDate", "desc");

      const snapshot = await query.get();
      if (snapshot.empty) return [];

      const paymentsByDay = new Map<string, number>();
      snapshot.docs.forEach((doc) => {
        const payment = this.mapDocTo<Payment>(doc);

        let dateObj: Date;
        if (payment.paymentDate instanceof Timestamp) {
          dateObj = payment.paymentDate.toDate();
        } else if (typeof payment.paymentDate === "string") {
          dateObj = new Date(payment.paymentDate);
        } else {
          console.warn(
            "[PaymentRepository.getPaymentsByDateRange] Invalid paymentDate:",
            payment.paymentDate
          );
          return;
        }

        const dayKey = `${dateObj.getUTCFullYear()}-${(
          dateObj.getUTCMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${dateObj
            .getUTCDate()
            .toString()
            .padStart(2, "0")}`;

        paymentsByDay.set(dayKey, (paymentsByDay.get(dayKey) || 0) + 1);
      });

      return Array.from(paymentsByDay.entries())
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error("[PaymentRepository.getPaymentsByDateRange] Error:", error);
      throw new DataPersistenceError("Failed to fetch payments in date range.");
    }
  }

  /**
   * @summary Returns today's payment summary (count and total amount).
   * @param app {APP} App identifier.
   * @returns {Promise<{ count: number; totalAmount: number }>} Returns count and total amount.
   * @throws {DataPersistenceError} If calculation fails.
   */
  async getPaymentsSummaryToday(
    app: APP
  ): Promise<{ count: number; totalAmount: number }> {
    try {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const fromTimestamp = Timestamp.fromDate(startOfDay);
      const toTimestamp = Timestamp.fromDate(endOfDay);

      const snapshot = await this.collection
        .where("app", "==", app)
        .where("paymentDate", ">=", fromTimestamp)
        .where("paymentDate", "<=", toTimestamp)
        .get();

      if (snapshot.empty) return { count: 0, totalAmount: 0 };

      const { count, totalAmount } = snapshot.docs.reduce(
        (acc, doc) => {
          const payment = this.mapDocTo<Payment>(doc);
          acc.count += 1;
          acc.totalAmount += payment.amount || 0;
          return acc;
        },
        { count: 0, totalAmount: 0 }
      );

      return { count, totalAmount };
    } catch (error) {
      console.error(
        "[PaymentRepository.getPaymentsSummaryToday] Error calculating today's payments:",
        error
      );
      throw new DataPersistenceError("Failed to calculate today's payments.");
    }
  }

  /**
   * @summary Returns today's payments.
   * @param app {APP} App identifier.
   * @returns {Promise<Payment[]>} Returns an array of Payment objects.
   * @throws {DataPersistenceError} If fetching fails.
   */
  async getPaymentsToday(app: APP): Promise<Payment[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const fromTimestamp = Timestamp.fromDate(startOfDay);
      const toTimestamp = Timestamp.fromDate(endOfDay);

      const snapshot = await this.collection
        .where("app", "==", app)
        .where("paymentDate", ">=", fromTimestamp)
        .where("paymentDate", "<=", toTimestamp)
        .orderBy("paymentDate", "desc")
        .get();

      if (snapshot.empty) return [];

      return snapshot.docs.map((doc) => this.mapDocTo<Payment>(doc));
    } catch (error) {
      console.error(
        "[PaymentRepository.getPaymentsToday] Error fetching today's payments:",
        error
      );
      throw new DataPersistenceError("Failed to fetch today's payments.");
    }
  }

  /**
   * @summary Returns current month's payment summary (count and total amount).
   * @param app {APP} App identifier.
   * @returns {Promise<{ count: number; totalAmount: number }>} Returns count and total amount.
   * @throws {DataPersistenceError} If calculation fails.
   */
  async getPaymentsSummaryCurrentMonth(
    app: APP
  ): Promise<{ count: number; totalAmount: number }> {
    try {
      const { start, end } = getStartAndEndOfMonthUTC();
      const fromTimestamp = Timestamp.fromDate(start);
      const toTimestamp = Timestamp.fromDate(end);

      const snapshot = await this.collection
        .where("app", "==", app)
        .where("paymentDate", ">=", fromTimestamp)
        .where("paymentDate", "<=", toTimestamp)
        .get();

      if (snapshot.empty) return { count: 0, totalAmount: 0 };

      const { count, totalAmount } = snapshot.docs.reduce(
        (acc, doc) => {
          const payment = this.mapDocTo<Payment>(doc);
          acc.count += 1;
          acc.totalAmount += payment.amount || 0;
          return acc;
        },
        { count: 0, totalAmount: 0 }
      );

      return { count, totalAmount };
    } catch (error) {
      console.error(
        "[PaymentRepository.getPaymentsSummaryCurrentMonth] Error calculating current month's payments:",
        error
      );
      throw new DataPersistenceError(
        "Failed to calculate current month's payments."
      );
    }
  }
}
