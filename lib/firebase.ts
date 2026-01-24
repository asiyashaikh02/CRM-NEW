
import { initializeApp, getApps, getApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
// @ts-ignore - Suppressing missing export error due to environment-specific module resolution
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

// Configuration for Firebase Client SDK
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "placeholder-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton pattern with sanity check
let app: FirebaseApp;
let auth: any;
let db: Firestore;

try {
  // Check if Firebase app is already initialized
  if (getApps().length > 0) {
    app = getApp();
  } else {
    // Basic validation to avoid cryptic Firebase errors during setup phase
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "") {
      console.warn("Firebase API Key is missing. Please check your environment variables.");
    }
    app = initializeApp(firebaseConfig);
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Fallback to allow UI to render even if config is broken
  app = {} as any;
  auth = {} as any;
  db = {} as any;
}

export { app, auth, db };
