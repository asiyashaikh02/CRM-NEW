
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, AuthStatus } from '../types';
import { MOCK_DB } from '../data/mockDb';

interface AuthContextType {
  currentUser: User | null;
  status: AuthStatus;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  sync: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('LOADING');

  const sync = useCallback(() => {
    const session = localStorage.getItem('solaroft_session_v1');
    if (session) {
      const parsed = JSON.parse(session);
      const dbUser = MOCK_DB.users.find(u => u.uid === parsed.uid);
      if (dbUser) {
        setCurrentUser({ ...dbUser });
        setStatus('AUTHENTICATED');
      } else {
        localStorage.removeItem('solaroft_session_v1');
        setStatus('UNAUTHENTICATED');
      }
    } else {
      setStatus('UNAUTHENTICATED');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(sync, 500);
    return () => clearTimeout(timer);
  }, [sync]);

  /**
   * Role-based login with hardcoded check. 
   * Designed to be easily replaced by Firebase signInWithEmailAndPassword.
   */
  const login = async (email: string, pass: string): Promise<boolean> => {
    setStatus('LOADING');
    return new Promise((resolve) => {
      // Simulation delay for "Enterprise Feel"
      setTimeout(() => {
        const user = MOCK_DB.users.find(u => u.email === email && u.password === pass);
        if (user) {
          setCurrentUser({ ...user });
          localStorage.setItem('solaroft_session_v1', JSON.stringify({ uid: user.uid }));
          setStatus('AUTHENTICATED');
          resolve(true);
        } else {
          setStatus('UNAUTHENTICATED');
          resolve(false);
        }
      }, 600);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    setStatus('UNAUTHENTICATED');
    localStorage.removeItem('solaroft_session_v1');
  };

  return (
    <AuthContext.Provider value={{ currentUser, status, login, logout, sync }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
