
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, AuthStatus, UserStatus } from '../types';
import { MOCK_DB } from '../data/mockDb';

interface AuthContextType {
  currentUser: User | null;
  status: AuthStatus;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  sync: () => void;
  updateProfile: (data: Partial<User>) => void;
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

  const login = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    setStatus('LOADING');
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = MOCK_DB.users.find(u => u.email === email && u.password === pass);
        if (user) {
          // Check for head roles or approved status
          const isHead = [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.OPS_MANAGER].includes(user.role);
          if (!isHead && user.status !== UserStatus.APPROVED) {
            setStatus('UNAUTHENTICATED');
            resolve({ success: false, message: "Account pending authorization. Contact your Head." });
            return;
          }

          setCurrentUser({ ...user });
          localStorage.setItem('solaroft_session_v1', JSON.stringify({ uid: user.uid }));
          setStatus('AUTHENTICATED');
          resolve({ success: true });
        } else {
          setStatus('UNAUTHENTICATED');
          resolve({ success: false, message: "Invalid credentials. Check registry sequence." });
        }
      }, 600);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    setStatus('UNAUTHENTICATED');
    localStorage.removeItem('solaroft_session_v1');
  };

  const updateProfile = (data: Partial<User>) => {
    if (currentUser) {
      MOCK_DB.updateUser(currentUser.uid, data);
      sync();
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, status, login, logout, sync, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
