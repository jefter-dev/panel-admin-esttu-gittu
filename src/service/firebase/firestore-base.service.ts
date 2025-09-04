import { Timestamp } from "firebase-admin/firestore";

/**
 * @summary Base service class for Firestore operations.
 * Provides utility methods for cleaning Firestore data and mapping documents.
 */
export abstract class FirestoreBaseService {
  /**
   * @summary Recursively converts Firestore-specific types to plain JavaScript types.
   * @param data {unknown} The data to clean.
   * @returns {unknown} Cleaned data with Firestore types converted (e.g., Timestamp to ISO string).
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
   * @summary Maps a Firestore DocumentSnapshot to a typed object including the document ID.
   * @template T The expected type of the document data.
   * @param doc {FirebaseFirestore.DocumentSnapshot} The Firestore document snapshot.
   * @returns {T & { idDocument: string }} Document data as type T with `idDocument` property.
   */
  protected mapDocTo<T>(
    doc: FirebaseFirestore.DocumentSnapshot
  ): T & { idDocument: string } {
    const cleanData = this.cleanFirestoreData(doc.data());
    return { idDocument: doc.id, ...(cleanData as T) };
  }
}
