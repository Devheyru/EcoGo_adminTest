import admin from "firebase-admin";
import { env } from "@/lib/env";

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(env.FIREBASE_ADMIN_KEY);
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error", error);
    throw new Error("Failed to initialize Firebase Admin");
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
