import { User } from "@/types/user-esttu";
import { FirestoreBaseService } from "@/services/firebase/firestore-base.service";
import type { Firestore, Query } from "firebase-admin/firestore";

/**
 * Repository class for accessing and managing User documents in Firestore.
 */
export class UserService extends FirestoreBaseService {
  private collection: FirebaseFirestore.CollectionReference;

  constructor(private db: Firestore) {
    super();
    this.collection = db.collection("users");
  }

  async getByCPF(cpf: string): Promise<User | null> {
    try {
      const snapshot = await this.collection.where("cpf", "==", cpf).get();
      if (snapshot.empty) return null;
      return this.mapDocTo<User>(snapshot.docs[0]);
    } catch (error) {
      console.error("Error [getByCPF]:", error);
      return null;
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      const snapshot = await this.collection.where("email", "==", email).get();
      if (snapshot.empty) return null;
      return this.mapDocTo<User>(snapshot.docs[0]);
    } catch (error) {
      console.error("Error [getByEmail]:", error);
      return null;
    }
  }

  async getByIdDocument(id: string): Promise<User | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) return null;
      return this.mapDocTo<User>(doc);
    } catch (error) {
      console.error("Error [getByIdDocument]:", error);
      return null;
    }
  }

  async getByCid(cid: string): Promise<User | null> {
    try {
      const snapshot = await this.collection.where("cid", "==", cid).get();
      if (snapshot.empty) return null;
      return this.mapDocTo<User>(snapshot.docs[0]);
    } catch (error) {
      console.error("Error [getByCid]:", error);
      return null;
    }
  }

  async getAll(): Promise<User[]> {
    try {
      const snapshot = await this.collection.get();
      if (snapshot.empty) return [];
      return snapshot.docs.map((doc) => this.mapDocTo<User>(doc));
    } catch (error) {
      console.error("Error [getAll]:", error);
      return [];
    }
  }

  async getPaginatedByName(limit = 20, startAfterName?: string): Promise<User[]> {
    try {
      let query = this.collection.orderBy("nome").limit(limit);
      if (startAfterName) query = query.startAfter(startAfterName);
      const snapshot = await query.get();
      if (snapshot.empty) return [];
      return snapshot.docs.map((doc) => this.mapDocTo<User>(doc));
    } catch (error) {
      console.error("Error [getPaginatedByName]:", error);
      return [];
    }
  }

  async getPaginatedFilteredUsers(options: {
    limit?: number;
    startAfterName?: string;
    pagamentoEfetuado?: boolean;
  }): Promise<User[]> {
    const { limit = 20, startAfterName, pagamentoEfetuado } = options;

    try {
      let query = this.collection.orderBy("nome").limit(limit);
      if (typeof pagamentoEfetuado === "boolean") {
        query = query.where("pagamentoEfetuado", "==", pagamentoEfetuado);
      }
      if (startAfterName) {
        query = query.startAfter(startAfterName);
      }
      const snapshot = await query.get();
      if (snapshot.empty) return [];
      return snapshot.docs.map((doc) => this.mapDocTo<User>(doc));
    } catch (error) {
      console.error("Error [getPaginatedFilteredUsers]:", error);
      return [];
    }
  }

  async getPaginatedFilteredUsersSimple(options: {
    limit?: number;
    startAfterName?: string;
    pagamentoEfetuado?: boolean;
    nome?: string;
  }): Promise<User[]> {
    const { limit = 21, startAfterName, pagamentoEfetuado, nome } = options;

    try {
      let query: Query = this.collection;

      if (typeof pagamentoEfetuado === 'boolean') {
        query = query.where('pagamentoEfetuado', '==', pagamentoEfetuado);
      }

      query = query.orderBy('nome');

      if (nome && nome.trim() !== '') {
        query = query.where('nome', '>=', nome).where('nome', '<=', nome + '\uf8ff');
      }

      if (startAfterName) {
        query = query.startAfter(startAfterName);
      }

      const snapshot = await query.limit(limit).get();
      if (snapshot.empty) return [];

      return snapshot.docs.map(doc => this.mapDocTo<User>(doc));
    } catch (error) {
      console.error("Error [getPaginatedFilteredUsersSimple]:", error);
      return [];
    }
  }
}
