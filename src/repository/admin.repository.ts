// src/repository/admin.repository.ts

import { v4 as uuidv4 } from "uuid";
import { FirestoreBaseService } from "@/service/firebase/firestore-base.service";
import type { Firestore } from "firebase-admin/firestore";
import { Admin, AdminCreatePayload, AdminUpdatePayload } from "@/types/admin";
import {
  DataPersistenceError,
  RecordNotFoundError,
} from "@/errors/custom.errors";
import { DATABASE_COLLECTION_ADMINS } from "@/lib/firebase-admin";

export class AdminRepository extends FirestoreBaseService {
  private collection: FirebaseFirestore.CollectionReference;

  constructor(private db: Firestore) {
    super();
    this.collection = db.collection(DATABASE_COLLECTION_ADMINS);
  }

  /**
   * Encontra um administrador pelo seu campo 'id' (UUID).
   * @param id O UUID do administrador.
   * @returns O objeto Admin ou null se não for encontrado.
   * @throws {DataPersistenceError} Se ocorrer uma falha na consulta ao banco de dados.
   */
  async findById(id: string): Promise<Admin | null> {
    try {
      const snapshot = await this.collection
        .where("id", "==", id)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      return this.mapDocTo<Admin>(snapshot.docs[0]);
    } catch (error) {
      console.error(
        `[AdminRepository.findById] Erro ao buscar admin com id ${id}:`,
        error
      );
      throw new DataPersistenceError("Falha ao buscar administrador por ID.");
    }
  }

  /**
   * Encontra um administrador pelo seu e-mail.
   * @param email O e-mail do administrador.
   * @returns O objeto Admin ou null se não for encontrado.
   * @throws {DataPersistenceError} Se ocorrer uma falha na consulta ao banco de dados.
   */
  async getByEmail(email: string): Promise<Admin | null> {
    try {
      const snapshot = await this.collection.where("email", "==", email).get();
      if (snapshot.empty) return null;
      return this.mapDocTo<Admin>(snapshot.docs[0]);
    } catch (error) {
      console.error(
        `[AdminRepository.getByEmail] Erro ao buscar admin com email ${email}:`,
        error
      );
      throw new DataPersistenceError(
        "Falha ao buscar administrador por e-mail."
      );
    }
  }

  /**
   * Cria um novo admin no Firestore, gerando e adicionando um UUID como campo 'id'.
   * @param payload Os dados do admin a serem criados (sem o 'id').
   * @returns O objeto Admin completo, incluindo o novo UUID.
   * @throws {DataPersistenceError} Se a operação de escrita no banco de dados falhar.
   */
  async create(payload: AdminCreatePayload): Promise<Admin> {
    try {
      const newId = uuidv4();
      const dataToSave: Admin = { id: newId, ...payload };
      await this.collection.add(dataToSave);
      return dataToSave;
    } catch (error) {
      console.error(
        "[AdminRepository.create] Erro ao criar novo admin:",
        error
      );
      throw new DataPersistenceError(
        "Falha ao criar administrador no banco de dados."
      );
    }
  }

  /**
   * Atualiza um documento de admin existente, identificado pelo seu campo 'id' (UUID).
   * @param id O UUID do admin a ser atualizado.
   * @param payload Os campos a serem atualizados.
   * @throws {DataPersistenceError} Se a operação de atualização no banco de dados falhar.
   * @throws {Error} Se o documento com o ID fornecido não for encontrado.
   */
  async update(id: string, payload: AdminUpdatePayload): Promise<void> {
    console.log("payload [UPDATE USER]: ", payload);

    try {
      const snapshot = await this.collection
        .where("id", "==", id)
        .limit(1)
        .get();
      if (snapshot.empty) {
        // Esta exceção é um caso extremo, pois o serviço já deve ter verificado a existência.
        throw new Error(
          `Documento para atualização não encontrado com o ID (UUID) ${id}.`
        );
      }
      const docRef = snapshot.docs[0].ref;
      await docRef.update(payload);
    } catch (error) {
      console.error(
        `[AdminRepository.update] Erro ao atualizar admin com id ${id}:`,
        error
      );
      throw new DataPersistenceError(
        "Falha ao atualizar administrador no banco de dados."
      );
    }
  }

  /**
   * Remove um administrador pelo seu ID (UUID).
   * @param id O UUID do admin a ser removido.
   * @throws {RecordNotFoundError} Se o admin não existir.
   * @throws {DataPersistenceError} Se ocorrer algum erro no Firestore.
   */
  async delete(id: string): Promise<void> {
    try {
      const snapshot = await this.collection
        .where("id", "==", id)
        .limit(1)
        .get();
      if (snapshot.empty) {
        throw new RecordNotFoundError(
          `Administrador com ID ${id} não encontrado.`
        );
      }
      const docRef = snapshot.docs[0].ref;
      await docRef.delete();
    } catch (error) {
      console.error(
        `[AdminRepository.delete] Erro ao remover admin com id ${id}:`,
        error
      );
      if (error instanceof RecordNotFoundError) throw error;
      throw new DataPersistenceError(
        "Falha ao remover administrador do banco de dados."
      );
    }
  }

  /**
   * Retorna todos os admins do Firestore.
   */
  async findAll(): Promise<Admin[]> {
    try {
      const snapshot = await this.collection.get();
      const admins: Admin[] = snapshot.docs.map((doc) =>
        this.mapDocTo<Admin>(doc)
      );
      return admins;
    } catch (error) {
      console.error(
        "[AdminRepository.findAll] Erro ao buscar todos os admins:",
        error
      );
      throw new DataPersistenceError("Falha ao listar administradores.");
    }
  }
}
