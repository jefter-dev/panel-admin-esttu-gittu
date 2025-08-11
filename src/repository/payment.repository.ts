// src/repository/payment.repository.ts

import { v4 as uuidv4 } from "uuid";
import type { Firestore } from "firebase-admin/firestore";
import { FirestoreBaseService } from "@/service/firebase/firestore-base.service";
import { DataPersistenceError } from "@/errors/custom.errors";
import { Payment, PaymentCreatePayload } from "@/types/payment";

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
      const newId = uuidv4();
      const dataToSave: Payment = { id: newId, ...payload };

      // Usamos o ID do gateway como ID do documento para garantir unicidade no nível do Firestore
      // e facilitar buscas futuras.
      await this.collection.doc(payload.gatewayPaymentId).set(dataToSave);

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
}
