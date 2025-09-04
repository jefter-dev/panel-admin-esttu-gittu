import { v4 as uuidv4 } from "uuid";
import type { Firestore, Query } from "firebase-admin/firestore";
import { FirestoreBaseService } from "@/service/firebase/firestore-base.service";
import { DataPersistenceError } from "@/errors/custom.errors";
import { User, UserCreatePayload, UserUpdatePayload } from "@/types/user.type";
import { formatCPF, isCPF, isEmail } from "@/lib/utils";
import { FilterType, FilterValue } from "@/types/filters-user.type";

export class UserRepository extends FirestoreBaseService {
  private collection: FirebaseFirestore.CollectionReference;

  constructor(private db: Firestore) {
    super();
    this.collection = db.collection("users");
  }

  /**
   * @summary Creates a new user in Firestore.
   * @param payload {UserCreatePayload} The data to create the user.
   * @returns {Promise<User>} Returns the created user with generated UUID and document ID.
   * @throws {DataPersistenceError} If saving the user fails.
   */
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
      console.error("[UserRepository.create] Error creating user:", error);
      throw new DataPersistenceError("Failed to create user in the database.");
    }
  }

  /**
   * @summary Updates an existing user by UUID.
   * @param id {string} The UUID of the user to update.
   * @param payload {UserUpdatePayload} The updated data.
   * @returns {Promise<void>}
   * @throws {DataPersistenceError} If the update operation fails.
   */
  async update(id: string, payload: UserUpdatePayload): Promise<void> {
    try {
      const docRef = await this.findDocRefByUuid(id);
      if (!docRef) {
        throw new Error(`User not found with UUID ${id}.`);
      }
      await docRef.update(payload);
    } catch (error) {
      console.error(
        `[UserRepository.update] Error updating user with id ${id}:`,
        error
      );
      throw new DataPersistenceError("Failed to update user in the database.");
    }
  }

  /**
   * @summary Updates a user by Firestore document ID.
   * @param idDocument {string} Firestore document ID.
   * @param payload {UserUpdatePayload} The updated data.
   * @returns {Promise<void>}
   * @throws {DataPersistenceError} If the update operation fails.
   */
  async updateByDocumentId(
    idDocument: string,
    payload: UserUpdatePayload
  ): Promise<void> {
    try {
      const docRef = this.collection.doc(idDocument);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new Error(`User not found with idDocument ${idDocument}.`);
      }
      await docRef.update(payload);
    } catch (error) {
      console.error(
        `[UserRepository.updateByDocumentId] Error updating user with idDocument ${idDocument}:`,
        error
      );
      throw new DataPersistenceError("Failed to update user in the database.");
    }
  }

  /**
   * @summary Finds a user by UUID.
   * @param id {string} The UUID of the user.
   * @returns {Promise<User | null>} Returns the user or null if not found.
   * @throws {DataPersistenceError} If the query fails.
   */
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
        `[UserRepository.findById] Error fetching user with id ${id}:`,
        error
      );
      throw new DataPersistenceError("Failed to fetch user by ID.");
    }
  }

  /**
   * @summary Finds a user by Firestore document ID.
   * @param idDocument {string} Firestore document ID.
   * @returns {Promise<User | null>} Returns the user or null if not found.
   * @throws {DataPersistenceError} If the query fails.
   */
  async findByDocumentId(idDocument: string): Promise<User | null> {
    try {
      const docSnap = await this.collection.doc(idDocument).get();
      if (!docSnap.exists) return null;
      return this.mapDocTo<User>(docSnap);
    } catch (error) {
      console.error(
        `[UserRepository.findByDocumentId] Error fetching user with idDocument ${idDocument}:`,
        error
      );
      throw new DataPersistenceError("Failed to fetch user by idDocument.");
    }
  }

  /**
   * @summary Finds a user by CPF.
   * @param cpf {string} CPF string (formatted or unformatted).
   * @returns {Promise<User | null>} Returns the user or null if not found.
   * @throws {DataPersistenceError} If the query fails.
   */
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
        `[UserRepository.getByCPF] Error fetching user with CPF ${cpf}:`,
        error
      );
      throw new DataPersistenceError("Failed to fetch user by CPF.");
    }
  }

  /**
   * @summary Finds a user by email.
   * @param email {string} Email address.
   * @returns {Promise<User | null>} Returns the user or null if not found.
   * @throws {DataPersistenceError} If the query fails.
   */
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
        `[UserRepository.getByEmail] Error fetching user with email ${email}:`,
        error
      );
      throw new DataPersistenceError("Failed to fetch user by email.");
    }
  }

  /**
   * @summary Searches users with optional filters, text search, and pagination.
   * @param options {Object} Options object for search.
   * @param options.limit {number} Maximum number of results.
   * @param options.startAfter {string} Document ID to start after for pagination.
   * @param options.pagamentoEfetuado {boolean} Filter by payment status.
   * @param options.search {string} Text search (email, CPF, name, surname).
   * @param options.filterType {FilterType} Field name to filter.
   * @param options.filterValue {FilterValue} Value for the filter field.
   * @returns {Promise<User[]>} Returns an array of users matching criteria.
   * @throws {DataPersistenceError} If the query fails.
   */
  async find(options: {
    limit?: number;
    startAfter?: string;
    pagamentoEfetuado?: boolean;
    search?: string;
    filterType?: FilterType;
    filterValue?: FilterValue;
  }): Promise<User[]> {
    const {
      limit = 20,
      startAfter,
      pagamentoEfetuado,
      search,
      filterType,
      filterValue,
    } = options;

    try {
      if (filterType && filterValue && filterValue.trim() !== "") {
        let query: Query = this.collection.where(
          filterType,
          "==",
          filterValue.trim()
        );
        if (typeof pagamentoEfetuado === "boolean")
          query = query.where("pagamentoEfetuado", "==", pagamentoEfetuado);
        if (startAfter) {
          const lastDoc = await this.collection.doc(startAfter).get();
          if (lastDoc.exists) query = query.startAfter(lastDoc);
        }
        const snapshot = await query.limit(limit).get();
        return snapshot.docs.map((doc) => this.mapDocTo<User>(doc));
      }

      const searchTerm = search?.trim();
      if (searchTerm) {
        if (isEmail(searchTerm)) {
          const user = await this.getByEmail(searchTerm);
          return user ? [user] : [];
        }
        if (isCPF(searchTerm)) {
          const formattedCpf = formatCPF(searchTerm);
          const user = await this.getByCPF(formattedCpf);
          return user ? [user] : [];
        }

        const endTerm = searchTerm + "\uf8ff";
        let baseQuery: Query = this.collection;
        if (typeof pagamentoEfetuado === "boolean")
          baseQuery = baseQuery.where(
            "pagamentoEfetuado",
            "==",
            pagamentoEfetuado
          );

        let queryNome = baseQuery
          .orderBy("nome")
          .startAt(searchTerm)
          .endAt(endTerm);
        let querySobrenome = baseQuery
          .orderBy("sobrenome")
          .startAt(searchTerm)
          .endAt(endTerm);

        if (startAfter) {
          const lastDoc = await this.collection.doc(startAfter).get();
          if (lastDoc.exists) {
            queryNome = queryNome.startAfter(lastDoc);
            querySobrenome = querySobrenome.startAfter(lastDoc);
          }
        }

        const [snapshotNome, snapshotSobrenome] = await Promise.all([
          queryNome.limit(limit).get(),
          querySobrenome.limit(limit).get(),
        ]);

        const usersMap = new Map<string, User>();
        snapshotNome.docs.forEach((doc) =>
          usersMap.set(this.mapDocTo<User>(doc).id, this.mapDocTo<User>(doc))
        );
        snapshotSobrenome.docs.forEach((doc) =>
          usersMap.set(this.mapDocTo<User>(doc).id, this.mapDocTo<User>(doc))
        );

        return Array.from(usersMap.values())
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .slice(0, limit);
      }

      let query: Query = this.collection.orderBy("nome");
      if (typeof pagamentoEfetuado === "boolean")
        query = query.where("pagamentoEfetuado", "==", pagamentoEfetuado);
      if (startAfter) {
        const lastDoc = await this.collection.doc(startAfter).get();
        if (lastDoc.exists) query = query.startAfter(lastDoc);
      }

      const snapshot = await query.limit(limit).get();
      return snapshot.docs.map((doc) => this.mapDocTo<User>(doc));
    } catch (error) {
      console.error("[UserRepository.find] Error fetching users:", error);
      throw new DataPersistenceError("Failed to list users.");
    }
  }

  /**
   * @summary Counts users with confirmed payment (pagamentoEfetuado = true).
   * @returns {Promise<number>} Returns the total count.
   * @throws {DataPersistenceError} If the count operation fails.
   */
  async countPaymentsConfirmed(): Promise<number> {
    try {
      const snapshot = await this.collection
        .where("pagamentoEfetuado", "==", true)
        .count()
        .get();
      return snapshot.data().count;
    } catch (error) {
      console.error(
        "[UserRepository.countPaymentsConfirmed] Error counting users with confirmed payment:",
        error
      );
      throw new DataPersistenceError(
        "Failed to count users with confirmed payment."
      );
    }
  }

  /**
   * @summary Counts total users in the collection.
   * @returns {Promise<number>} Returns the total number of users.
   * @throws {DataPersistenceError} If the count operation fails.
   */
  async countTotalUsers(): Promise<number> {
    try {
      const snapshot = await this.collection.count().get();
      return snapshot.data().count;
    } catch (error) {
      console.error(
        "[UserRepository.countTotalUsers] Error counting users:",
        error
      );
      throw new DataPersistenceError("Failed to count users.");
    }
  }

  /**
   * @summary Finds Firestore document reference by UUID.
   * @param id {string} UUID of the user.
   * @returns {Promise<FirebaseFirestore.DocumentReference | null>} Returns the document reference or null.
   */
  private async findDocRefByUuid(
    id: string
  ): Promise<FirebaseFirestore.DocumentReference | null> {
    const snapshot = await this.collection.where("id", "==", id).limit(1).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].ref;
  }
}
