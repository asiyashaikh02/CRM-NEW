
import { ENV } from '../config/env';
import { auth } from '../config/firebase';
// @ts-ignore - Suppressing missing export error due to environment-specific module resolution
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

export const authService = {
  login: async (email: string, pass: string) => {
    if (ENV.USE_FIREBASE) {
      return signInWithEmailAndPassword(auth, email, pass);
    }
    // Phase 1: Logic handled in AuthContext for immediate re-render
    return Promise.resolve();
  },
  
  logout: async () => {
    if (ENV.USE_FIREBASE) {
      return signOut(auth);
    }
    return Promise.resolve();
  }
};
