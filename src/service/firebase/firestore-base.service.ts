import { Timestamp } from "firebase-admin/firestore";

/**
 * Base service class for Firestore operations.
 *
 * Provides utility methods for cleaning Firestore data and mapping documents.
 */
export abstract class FirestoreBaseService {
  /**
   * Recursively converts Firestore-specific data types (e.g., Timestamp) to plain JavaScript types.
   *
   * @param data The data to clean.
   * @returns The cleaned data with Firestore types converted (e.g., Timestamp to ISO string).
   */
  protected cleanFirestoreData(data: unknown): unknown {
    if (data instanceof Timestamp) {
      return data.toDate().toISOString();
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.cleanFirestoreData(item));
    }

    if (data && typeof data === "object") {
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          this.cleanFirestoreData(value),
        ])
      );
    }

    return data;
  }

  /**
   * Maps a Firestore DocumentSnapshot to a typed object including the document ID.
   *
   * @template T The expected type of the document data.
   * @param doc The Firestore DocumentSnapshot.
   * @returns The document data as type T, extended with the `idDocument` property.
   */
  protected mapDocTo<T>(
    doc: FirebaseFirestore.DocumentSnapshot
  ): T & { idDocument: string } {
    const cleanData = this.cleanFirestoreData(doc.data());
    return { idDocument: doc.id, ...(cleanData as T) };
  }
}