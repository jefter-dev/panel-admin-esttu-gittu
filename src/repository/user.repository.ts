import { v4 as uuidv4 } from "uuid";
import type { Firestore, Query } from "firebase-admin/firestore";
import { FirestoreBaseService } from "@/service/firebase/firestore-base.service";
import { DataPersistenceError } from "@/errors/custom.errors";
import { User, UserCreatePayload, UserUpdatePayload } from "@/types/user";

export class UserRepository extends FirestoreBaseService {
  private collection: FirebaseFirestore.CollectionReference;

  constructor(private db: Firestore) {
    super();
    this.collection = db.collection("users");
  }

  async create(payload: UserCreatePayload): Promise<User> {
    try {
      const newId = uuidv4();
      const docRef = this.collection.doc();
      const dataToSave: User = {
        id: newId,
        idDocument: docRef.id,
        ...payload,
      };

      await docRef.set(dataToSave);
      return dataToSave;
    } catch (error) {
      console.error(
        "[UserRepository.create] Erro ao criar novo usuário:",
        error
      );
      throw new DataPersistenceError(
        "Falha ao criar usuário no banco de dados."
      );
    }
  }

  async update(id: string, payload: UserUpdatePayload): Promise<void> {
    try {
      const docRef = await this.findDocRefByUuid(id);
      if (!docRef) {
        throw new Error(
          `Usuário para atualização não encontrado com o UUID ${id}.`
        );
      }
      await docRef.update(payload);
    } catch (error) {
      console.error(
        `[UserRepository.update] Erro ao atualizar usuário com id ${id}:`,
        error
      );
      throw new DataPersistenceError(
        "Falha ao atualizar usuário no banco de dados."
      );
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const snapshot = await this.collection
        .where("id", "==", id)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      return this.mapDocTo<User>(snapshot.docs[0]);
    } catch (error) {
      console.error(
        `[UserRepository.findById] Erro ao buscar usuário com id ${id}:`,
        error
      );
      throw new DataPersistenceError("Falha ao buscar usuário por ID.");
    }
  }

  async getByCPF(cpf: string): Promise<User | null> {
    try {
      const snapshot = await this.collection
        .where("cpf", "==", cpf)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      return this.mapDocTo<User>(snapshot.docs[0]);
    } catch (error) {
      console.error(
        `[UserRepository.getByCPF] Erro ao buscar usuário com CPF ${cpf}:`,
        error
      );
      throw new DataPersistenceError("Falha ao buscar usuário por CPF.");
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      const snapshot = await this.collection
        .where("email", "==", email)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      return this.mapDocTo<User>(snapshot.docs[0]);
    } catch (error) {
      console.error(
        `[UserRepository.getByEmail] Erro ao buscar usuário com email ${email}:`,
        error
      );
      throw new DataPersistenceError("Falha ao buscar usuário por e-mail.");
    }
  }

  async find(options: {
    limit?: number;
    startAfterName?: string;
    pagamentoEfetuado?: boolean;
    nome?: string;
  }): Promise<User[]> {
    const { limit = 20, startAfterName, pagamentoEfetuado, nome } = options;
    try {
      let query: Query = this.collection;

      if (typeof pagamentoEfetuado === "boolean") {
        query = query.where("pagamentoEfetuado", "==", pagamentoEfetuado);
      }
      if (nome && nome.trim() !== "") {
        query = query
          .orderBy("nome")
          .startAt(nome)
          .endAt(nome + "\uf8ff");
      } else {
        query = query.orderBy("nome");
      }
      if (startAfterName) {
        query = query.startAfter(startAfterName);
      }

      const snapshot = await query.limit(limit).get();
      return snapshot.docs.map((doc) => this.mapDocTo<User>(doc));
    } catch (error) {
      console.error("[UserRepository.find] Erro ao buscar usuários:", error);
      throw new DataPersistenceError("Falha ao listar usuários.");
    }
  }

  private async findDocRefByUuid(
    id: string
  ): Promise<FirebaseFirestore.DocumentReference | null> {
    const snapshot = await this.collection.where("id", "==", id).limit(1).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].ref;
  }
}
