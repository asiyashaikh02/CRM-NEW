
// Added missing modular imports for app initialization.
import { initializeApp, getApps, getApp } from "firebase/app";
// @ts-ignore - Suppressing missing export error due to environment-specific module resolution
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { ENV } from "./env";

let app: any;
let auth: any;
let db: any;

if (ENV.USE_FIREBASE && ENV.FIREBASE_CONFIG.apiKey) {
  // Ensure initializeApp and app management functions are used correctly.
  app = getApps().length > 0 ? getApp() : initializeApp(ENV.FIREBASE_CONFIG as any);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Minimal stubs to prevent crashing when USE_FIREBASE is false
  auth = { currentUser: null };
  db = {};
}

export { auth, db };
