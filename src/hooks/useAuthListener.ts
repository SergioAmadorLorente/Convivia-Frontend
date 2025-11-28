// hooks/useAuthListener.ts
import { useEffect, useState } from 'react';
import { auth } from '../configs/firebaseConfig';
import { User, onAuthStateChanged } from 'firebase/auth';
export function useAuthListener() {
 const [user, setUser] = useState<User | null>(null);
 useEffect(() => {
   const unsubscribe = onAuthStateChanged(auth, (loggedUser) => {
     setUser(loggedUser);
   });
   return unsubscribe;
 }, []);
 return user;
}