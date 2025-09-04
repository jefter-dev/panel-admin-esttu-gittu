import { ConfigurationError } from "@/errors/custom.errors";
import { APP } from "@/types/app.type";
import admin from "firebase-admin";

export const APP_DATABASE_ADMIN = "admin";
export const DATABASE_COLLECTION_ADMINS = "admins";

/**
 * @summary Retrieves Firebase credentials for a specific app from environment variables.
 * @param app {APP} The application identifier.
 * @returns {{ projectId: string; privateKey: string; clientEmail: string }} The Firebase credentials object.
 * @throws {ConfigurationError} If any required environment variable is missing.
 */
function getCredentialsForApp(app: APP) {
  const getEnvVar = (key: string): string => {
    const value = process.env[key];
    if (!value)
      throw new ConfigurationError(
        `Missing required environment variable: ${key}`
      );
    return value.replace(/\\n/g, "\n");
  };

  const appUpper = app.toUpperCase();

  return {
    projectId: getEnvVar(`FIREBASE_PROJECT_ID_${appUpper}`),
    privateKey: getEnvVar(`FIREBASE_PRIVATE_KEY_${appUpper}`),
    clientEmail: getEnvVar(`FIREBASE_CLIENT_EMAIL_${appUpper}`),
  };
}

/**
 * @summary Returns a Firestore instance for the given app, initializing Firebase Admin if needed.
 * @param app {APP} The application identifier.
 * @returns {admin.firestore.Firestore} The Firestore instance for the app.
 */
export function getFirebaseAdmin(app: APP): admin.firestore.Firestore {
  try {
    return admin.app(app).firestore();
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "app/no-app"
    ) {
      const credential = getCredentialsForApp(app);
      admin.initializeApp(
        {
          credential: admin.credential.cert(credential),
        },
        app
      );
      return admin.app(app).firestore();
    }
    throw error;
  }
}

/**
 * @summary Downloads a file from Firebase Storage for a specific app.
 * @param app {APP} The application identifier.
 * @param filePath {string} The path of the file in Firebase Storage.
 * @returns {Promise<Buffer>} Returns a Buffer containing the file data.
 * @throws {Error} If the download fails.
 */
export async function downloadImageFromFirebase(
  app: APP,
  filePath: string
): Promise<Buffer> {
  try {
    const firebaseApp = admin.app(app);
    const bucket = firebaseApp.storage().bucket();
    const file = bucket.file(filePath);
    const [buffer] = await file.download();
    return buffer;
  } catch (error) {
    console.error(
      `Failed to download image from Firebase Storage for app ${app}:`,
      error
    );
    throw new Error("Unable to process the image.");
  }
}
