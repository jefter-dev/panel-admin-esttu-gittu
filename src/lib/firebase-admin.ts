import admin from "firebase-admin";

const initializedApps = new Map<string, FirebaseFirestore.Firestore>();

export function getFirebaseAdmin(app: "esttu" | "gittu"): FirebaseFirestore.Firestore {
  if (initializedApps.has(app)) {
    return initializedApps.get(app)!;
  }

  try {
    if (!admin.apps.length) {
      const getEnvVar = (key: string): string => {
        const value = process.env[key];
        if (!value) throw new Error(`Missing env var: ${key}`);
        return value.replace(/\\n/g, "\n");
      };

      const upper = app.toUpperCase(); // ESTTU ou GITTU

      const credential = {
        projectId: getEnvVar(`FIREBASE_PROJECT_ID_${upper}`),
        privateKey: getEnvVar(`FIREBASE_PRIVATE_KEY_${upper}`),
        clientEmail: getEnvVar(`FIREBASE_CLIENT_EMAIL_${upper}`),
      };

      admin.initializeApp(
        {
          credential: admin.credential.cert(credential),
        },
        app // Nome único para cada app
      );
    }

    const db = admin.app(app).firestore();
    initializedApps.set(app, db);
    return db;
  } catch (err) {
    console.error(`⚠️ Firebase Admin not initialized for ${app}:`, err);
    return {} as FirebaseFirestore.Firestore; // fallback
  }
}
