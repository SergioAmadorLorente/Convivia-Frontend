// contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../configs/firebaseConfig';
import { obtenerUsuarioPorId, UsuarioPayload } from '../api/usuario';

interface UserContextType {
  firebaseUser: User | null;
  userData: UsuarioPayload | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UsuarioPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Función para cargar los datos completos del usuario desde la base de datos
  const loadUserData = async (uid: string) => {
    try {
      const data = await obtenerUsuarioPorId(uid);
      setUserData(data);
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      setUserData(null);
    }
  };

  // Función pública para refrescar los datos del usuario
  const refreshUserData = async () => {
    if (firebaseUser?.uid) {
      await loadUserData(firebaseUser.uid);
    }
  };

  // Listener de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setFirebaseUser(user);
      
      if (user?.uid) {
        // Usuario autenticado: cargar datos completos
        await loadUserData(user.uid);
      } else {
        // Usuario no autenticado: limpiar datos
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ firebaseUser, userData, loading, refreshUserData }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe usarse dentro de un UserProvider');
  }
  return context;
};
