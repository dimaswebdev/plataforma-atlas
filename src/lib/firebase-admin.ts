import "server-only";

import { applicationDefault, cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const FIREBASE_ADMIN_APP_NAME = "atlas-admin";
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

export type FirebaseAdminUserSession = {
  uid: string;
  email?: string;
  emailVerified: boolean;
  token: string;
};

export function hasFirebaseAdminConfig() {
  return Boolean(
    projectId
    && (
      (clientEmail && privateKey)
      || process.env.GOOGLE_APPLICATION_CREDENTIALS
      || process.env.FIREBASE_USE_APPLICATION_DEFAULT === "true"
    )
  );
}

function getFirebaseAdminApp(): App | null {
  if (!hasFirebaseAdminConfig()) {
    return null;
  }

  const resolvedProjectId = projectId;
  if (!resolvedProjectId) {
    return null;
  }

  const existingApp = getApps().find((app) => app.name === FIREBASE_ADMIN_APP_NAME);
  if (existingApp) return existingApp;

  return initializeApp({
    credential: clientEmail && privateKey
      ? cert({
          projectId: resolvedProjectId,
          clientEmail,
          privateKey,
        })
      : applicationDefault(),
    projectId: resolvedProjectId,
  }, FIREBASE_ADMIN_APP_NAME);
}

export function getFirebaseAdminDb() {
  const app = getFirebaseAdminApp();
  if (!app) return null;

  return getFirestore(app);
}

export function getFirebaseAdminAuth() {
  const app = getFirebaseAdminApp();
  if (!app) return null;

  return getAuth(app);
}

export async function verifyFirebaseAdminIdToken(token: string): Promise<FirebaseAdminUserSession | null> {
  const adminAuth = getFirebaseAdminAuth();
  if (!adminAuth) return null;

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    return {
      uid: decodedToken.uid,
      email: typeof decodedToken.email === "string" ? decodedToken.email : undefined,
      emailVerified: Boolean(decodedToken.email_verified),
      token,
    };
  } catch {
    return null;
  }
}
