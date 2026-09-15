import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.length > 0
);

const app =
  getApps().length > 0
    ? getApp()
    : hasFirebaseConfig
      ? initializeApp(firebaseConfig)
      : null;

export function ensureFirebaseConfigured() {
  if (!app || !hasFirebaseConfig) {
    throw new Error(
      "Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* environment variables in Vercel and redeploy."
    );
  }
}

export const auth = app ? getAuth(app) : (undefined as unknown as ReturnType<typeof getAuth>);
export const db = app ? getFirestore(app) : (undefined as unknown as ReturnType<typeof getFirestore>);
export const storage = app ? getStorage(app) : (undefined as unknown as ReturnType<typeof getStorage>);

export default app;