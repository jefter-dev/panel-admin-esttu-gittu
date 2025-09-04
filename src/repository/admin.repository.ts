import { v4 as uuidv4 } from "uuid";
import { FirestoreBaseService } from "@/service/firebase/firestore-base.service";
import type { Firestore } from "firebase-admin/firestore";
import {
  Admin,
  AdminCreatePayload,
  AdminUpdatePayload,
} from "@/types/admin.type";
import {
  DataPersistenceError,
  RecordNotFoundError,
} from "@/errors/custom.errors";
import { DATABASE_COLLECTION_ADMINS } from "@/lib/firebase-admin";

/**
 * @summary Repository for Firestore operations related to Admins.
 */
export class AdminRepository extends FirestoreBaseService {
  private collection: FirebaseFirestore.CollectionReference;

  constructor(private db: Firestore) {
    super();
    this.collection = db.collection(DATABASE_COLLECTION_ADMINS);
  }

  /**
   * @summary Finds an admin by their unique UUID.
   * @param id {string} The UUID of the admin.
   * @returns {Promise<Admin | null>} The admin object or null if not found.
   * @throws {DataPersistenceError} If a database query fails.
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
        `[AdminRepository.findById] Error fetching admin ${id}:`,
        error
      );
      throw new DataPersistenceError("Failed to fetch admin by ID.");
    }
  }

  /**
   * @summary Finds an admin by their email.
   * @param email {string} The email of the admin.
   * @returns {Promise<Admin | null>} The admin object or null if not found.
   * @throws {DataPersistenceError} If a database query fails.
   */
  async getByEmail(email: string): Promise<Admin | null> {
    try {
      const snapshot = await this.collection.where("email", "==", email).get();
      if (snapshot.empty) return null;
      return this.mapDocTo<Admin>(snapshot.docs[0]);
    } catch (error) {
      console.error(
        `[AdminRepository.getByEmail] Error fetching admin ${email}:`,
        error
      );
      throw new DataPersistenceError("Failed to fetch admin by email.");
    }
  }

  /**
   * @summary Creates a new admin in Firestore with a generated UUID.
   * @param payload {AdminCreatePayload} Admin data to be saved (without 'id').
   * @returns {Promise<Admin>} The newly created admin including the UUID.
   * @throws {DataPersistenceError} If the write operation fails.
   */
  async create(payload: AdminCreatePayload): Promise<Admin> {
    try {
      const newId = uuidv4();
      const dataToSave: Admin = { id: newId, ...payload };
      await this.collection.add(dataToSave);
      return dataToSave;
    } catch (error) {
      console.error("[AdminRepository.create] Error creating admin:", error);
      throw new DataPersistenceError("Failed to create admin in database.");
    }
  }

  /**
   * @summary Updates an existing admin identified by UUID.
   * @param id {string} UUID of the admin to update.
   * @param payload {AdminUpdatePayload} Fields to update.
   * @throws {DataPersistenceError} If the update operation fails.
   * @throws {Error} If the admin document is not found.
   */
  async update(id: string, payload: AdminUpdatePayload): Promise<void> {
    try {
      const snapshot = await this.collection
        .where("id", "==", id)
        .limit(1)
        .get();
      if (snapshot.empty) {
        throw new Error(`Admin document not found with ID ${id}.`);
      }
      const docRef = snapshot.docs[0].ref;
      await docRef.update(payload);
    } catch (error) {
      console.error(
        `[AdminRepository.update] Error updating admin ${id}:`,
        error
      );
      throw new DataPersistenceError("Failed to update admin in database.");
    }
  }

  /**
   * @summary Deletes an admin by UUID.
   * @param id {string} UUID of the admin to delete.
   * @throws {RecordNotFoundError} If the admin does not exist.
   * @throws {DataPersistenceError} If the deletion fails.
   */
  async delete(id: string): Promise<void> {
    try {
      const snapshot = await this.collection
        .where("id", "==", id)
        .limit(1)
        .get();
      if (snapshot.empty) {
        throw new RecordNotFoundError(`Admin with ID ${id} not found.`);
      }
      const docRef = snapshot.docs[0].ref;
      await docRef.delete();
    } catch (error) {
      console.error(
        `[AdminRepository.delete] Error deleting admin ${id}:`,
        error
      );
      if (error instanceof RecordNotFoundError) throw error;
      throw new DataPersistenceError("Failed to delete admin from database.");
    }
  }

  /**
   * @summary Returns all admins from Firestore.
   * @returns {Promise<Admin[]>} Array of all admin objects.
   * @throws {DataPersistenceError} If the query fails.
   */
  async findAll(): Promise<Admin[]> {
    try {
      const snapshot = await this.collection.get();
      return snapshot.docs.map((doc) => this.mapDocTo<Admin>(doc));
    } catch (error) {
      console.error(
        "[AdminRepository.findAll] Error fetching all admins:",
        error
      );
      throw new DataPersistenceError("Failed to list admins.");
    }
  }
}
