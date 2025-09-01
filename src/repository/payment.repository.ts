import { Timestamp, type Firestore } from "firebase-admin/firestore";
import { FirestoreBaseService } from "@/service/firebase/firestore-base.service";
import { DataPersistenceError } from "@/errors/custom.errors";
import { Payment, PaymentCreatePayload } from "@/types/payment";
import { APP } from "@/types/app";
import { getStartAndEndOfMonthUTC } from "@/lib/utils";

export class PaymentRepository extends FirestoreBaseService {
  private collection: FirebaseFirestore.CollectionReference;

  constructor(private db: Firestore) {
    super();
    this.collection = db.collection("payments");
  }

  /**
   * Cria um novo registro de pagamento no Firestore.
   * @param payload Os dados do pagamento a serem criados.
   * @returns O objeto Payment completo, incluindo o novo UUID.
   * @throws {DataPersistenceError} Se a operação de escrita falhar.
   */
  async create(payload: PaymentCreatePayload): Promise<Payment> {
    try {
      const dataToSave: Payment = {
        ...payload,
        // createdAt agora como Timestamp
        createdAt: Timestamp.now(),
        // paymentDate deve ser convertido para Timestamp se vier como string
        paymentDate:
          typeof payload.paymentDate === "string"
            ? Timestamp.fromDate(new Date(payload.paymentDate))
            : payload.paymentDate,
      };

      await this.collection.doc(payload.id).set(dataToSave);

      return dataToSave;
    } catch (error) {
      console.error(
        "[PaymentRepository.create] Erro ao criar pagamento:",
        error
      );
      throw new DataPersistenceError(
        "Falha ao salvar o registro de pagamento."
      );
    }
  }

  async find(
    app: APP,
    options: {
      limit?: number;
      startAfter?: string;
      search?: string;
      dateFrom: string;
      dateTo: string;
    }
  ): Promise<Payment[]> {
    const { limit = 20, startAfter, search, dateFrom, dateTo } = options;

    const fromDate = new Date(dateFrom);
    fromDate.setUTCHours(0, 0, 0, 0);
    const from = Timestamp.fromDate(fromDate);

    const toDate = new Date(dateTo);
    toDate.setUTCHours(23, 59, 59, 999);
    const to = Timestamp.fromDate(toDate);

    let snapshots: FirebaseFirestore.QueryDocumentSnapshot[] = [];

    if (search && search.trim() !== "") {
      let queryByName = this.collection
        .orderBy("paymentDate", "asc")
        .where("app", "==", app)
        .where("customerName", ">=", search)
        .where("customerName", "<=", search + "\uf8ff")
        .where("paymentDate", ">=", from)
        .where("paymentDate", "<=", to);

      let queryByCpf = this.collection
        .orderBy("paymentDate", "asc")
        .where("app", "==", app)
        .where("customerCpf", ">=", search)
        .where("customerCpf", "<=", search + "\uf8ff")
        .where("paymentDate", ">=", from)
        .where("paymentDate", "<=", to);

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
        .orderBy("paymentDate", "asc")
        .where("paymentDate", ">=", from)
        .where("paymentDate", "<=", to);

      if (startAfter) {
        const lastDocSnapshot = await this.collection.doc(startAfter).get();
        if (lastDocSnapshot.exists) query = query.startAfter(lastDocSnapshot);
      }

      const snapshot = await query.limit(limit).get();
      snapshots = snapshot.docs;
    }

    // Remove duplicados
    const uniqueDocsMap = new Map(snapshots.map((doc) => [doc.id, doc]));

    return Array.from(uniqueDocsMap.values())
      .map((doc) => this.mapDocTo<Payment>(doc))
      .slice(0, limit);
  }

  /**
   * Lista todos os pagamentos de um usuário específico.
   * @param userId O UUID do usuário.
   * @returns Uma lista de objetos Payment.
   * @throws {DataPersistenceError} Se a consulta falhar.
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
        `[PaymentRepository.findByUserId] Erro ao buscar pagamentos para o usuário ${userId}:`,
        error
      );
      throw new DataPersistenceError("Falha ao listar os pagamentos.");
    }
  }

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
        "[PaymentRepository.getTotalAmountByDateRange] Erro:",
        error
      );
      throw new DataPersistenceError(
        "Falha ao calcular o total de pagamentos no intervalo."
      );
    }
  }

  async getPaymentsCurrentMonth(
    app: APP
  ): Promise<{ date: string; total: number }[]> {
    try {
      // Começo e fim do mês em UTC
      const { start, end } = getStartAndEndOfMonthUTC();
      const fromTimestamp = Timestamp.fromDate(start);
      const toTimestamp = Timestamp.fromDate(end);

      console.log("startTimestamp: ", fromTimestamp.toDate());
      console.log("endTimestamp: ", toTimestamp.toDate());

      const query = this.collection
        .where("app", "==", app)
        .where("paymentDate", ">=", fromTimestamp)
        .where("paymentDate", "<=", toTimestamp)
        .orderBy("paymentDate", "asc");

      // Busca os dados
      const snapshot = await query.get();

      if (snapshot.empty) return [];

      // Agrupa por dia
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
            "[PaymentRepository.getPaymentsCurrentMonth] paymentDate inesperado:",
            payment.paymentDate
          );
          return; // ignora se for inválido
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

      // Transforma em array ordenado
      return Array.from(paymentsByDay.entries())
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error(
        "[PaymentRepository.getPaymentsCurrentMonth] Erro ao buscar pagamentos do mês corrente:",
        error
      );
      throw new DataPersistenceError(
        "Falha ao buscar pagamentos do mês corrente."
      );
    }
  }

  /**
   * Retorna a quantidade de pagamentos e o valor total (amount) realizados no dia atual.
   * @param app O identificador da aplicação (multi-tenant).
   * @returns Um objeto com { count, totalAmount }.
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
        "[PaymentRepository.getPaymentsSummaryToday] Erro ao calcular pagamentos do dia:",
        error
      );
      throw new DataPersistenceError("Falha ao calcular pagamentos do dia.");
    }
  }

  /**
   * Retorna a quantidade de pagamentos e o valor total (amount) realizados no mês corrente.
   * @param app O identificador da aplicação (multi-tenant).
   * @returns Um objeto com { count, totalAmount }.
   */
  async getPaymentsSummaryCurrentMonth(
    app: APP
  ): Promise<{ count: number; totalAmount: number }> {
    try {
      // Começo e fim do mês em UTC
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
        "[PaymentRepository.getPaymentsSummaryCurrentMonth] Erro ao calcular pagamentos do mês:",
        error
      );
      throw new DataPersistenceError("Falha ao calcular pagamentos do mês.");
    }
  }
}
