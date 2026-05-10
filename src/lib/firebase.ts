import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Error check for missing Firebase config during development
if (process.env.NODE_ENV === "development" && !firebaseConfig.apiKey) {
  console.error("Firebase config is missing. Please check your .env.local file.");
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// initializeFirestore must only be called once (before getFirestore).
// If the app is freshly initialized, we apply long-polling settings.
// Otherwise we fall back to the already-initialized instance.
let db: ReturnType<typeof getFirestore>;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch {
  // Already initialized — just retrieve the existing instance
  db = getFirestore(app);
}

export { app, auth, db };
