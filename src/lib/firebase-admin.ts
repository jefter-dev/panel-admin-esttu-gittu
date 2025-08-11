import { ConfigurationError } from "@/errors/custom.errors";
import { APP } from "@/types/app";
import admin from "firebase-admin";

export const APP_DATABASE_ADMIN = "admin";
export const DATABASE_COLLECTION_ADMINS = "admins";

function getCredentialsForApp(app: APP) {
  const getEnvVar = (key: string): string => {
    const value = process.env[key];
    // 2. Lance o erro específico em vez de um Error genérico
    if (!value)
      throw new ConfigurationError(
        `Variável de ambiente obrigatória ausente: ${key}`
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
      `Falha ao baixar imagem do Firebase Storage para o app ${app}:`,
      error
    );
    throw new Error("Não foi possível processar a imagem.");
  }
}
