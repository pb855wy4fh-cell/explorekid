import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
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

// Initialize lazily and never throw at module load: prerender/SSR imports this
// file during the build, where a top-level throw would fail the whole build.
// The NEXT_PUBLIC_FIREBASE_* values are mapped from FIREBASE_* in next.config.ts,
// so hasFirebaseConfig is true in real (client/server) runtime.
const app =
  getApps().length > 0
    ? getApp()
    : hasFirebaseConfig
      ? initializeApp(firebaseConfig)
      : null;

// Call this at the top of any handler that uses Firebase to fail loudly with a
// clear message if configuration is genuinely missing at runtime.
export function ensureFirebaseConfigured() {
  if (!app || !hasFirebaseConfig) {
    throw new Error(
      "Firebase is not configured. Ensure the FIREBASE_* environment variables are set in Vercel (they are exposed to the client as NEXT_PUBLIC_FIREBASE_* via next.config.ts) and redeploy."
    );
  }
}

export const auth = app ? getAuth(app) : (undefined as unknown as ReturnType<typeof getAuth>);
export const db = app ? getFirestore(app) : (undefined as unknown as ReturnType<typeof getFirestore>);
export const storage = app ? getStorage(app) : (undefined as unknown as ReturnType<typeof getStorage>);

export default app;
