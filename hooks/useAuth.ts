
import { useState, useEffect } from "react";
// @ts-ignore - Suppressing missing export error due to environment-specific module resolution
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { User } from "../types";

/**
 * Hook to manage and provide current authentication state and user profile.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes using the modular SDK
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser: any) => {
      if (fbUser) {
        // Fetch profile data from Firestore on successful auth
        const unsubscribeSnap = onSnapshot(doc(db, "users", fbUser.uid), (snap) => {
          setUser(snap.data() as User);
          setLoading(false);
        });
        return unsubscribeSnap;
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  return { user, loading };
}
