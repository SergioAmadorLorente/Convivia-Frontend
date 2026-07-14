// hooks/useAuthListener.ts
import { useEffect, useState } from "react";
import { auth } from "../configs/firebaseConfig";
import { User, onAuthStateChanged } from "firebase/auth";

/** Full version: returns both user and a loading flag.
 *  loading is true until Firebase fires the first auth state event. */
export function useAuthListenerFull() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (loggedUser) => {
      setUser(loggedUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);
  return { user, authLoading };
}

/** Backwards-compatible wrapper used by most screens. */
export function useAuthListener() {
  const { user } = useAuthListenerFull();
  return user;
}
