
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, AuthStatus, ProfileStatus } from '../types';
import { MOCK_DB } from '../data/mockDb';

export type AuthLoadingStatus = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

interface AuthContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  role: UserRole | null;
  authStatus: AuthStatus | null;
  profileStatus: ProfileStatus | null;
  status: AuthLoadingStatus;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateProfileStatus: (status: ProfileStatus) => void;
  syncUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthLoadingStatus>('LOADING');

  const syncUser = useCallback(() => {
    const saved = localStorage.getItem('synckraft_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Find the latest state in our mock database
        const dbUser = MOCK_DB.users.find(u => u.uid === parsed.uid);
        if (dbUser) {
          // Deep compare/update only if different to prevent unnecessary re-renders
          if (JSON.stringify(dbUser) !== JSON.stringify(currentUser)) {
            setCurrentUser({ ...dbUser });
            localStorage.setItem('synckraft_session', JSON.stringify(dbUser));
          }
          setStatus('AUTHENTICATED');
        } else {
          localStorage.removeItem('synckraft_session');
          setStatus('UNAUTHENTICATED');
          setCurrentUser(null);
        }
      } catch (e) {
        localStorage.removeItem('synckraft_session');
        setStatus('UNAUTHENTICATED');
        setCurrentUser(null);
      }
    } else {
      setStatus('UNAUTHENTICATED');
      setCurrentUser(null);
    }
  }, [currentUser]);

  // Initial Sync
  useEffect(() => {
    const timer = setTimeout(syncUser, 500);
    return () => clearTimeout(timer);
  }, []);

  // REAL-TIME SYNC SIMULATION
  // In a real Firebase app, this would be an onSnapshot listener.
  // Here we poll the MOCK_DB every 2 seconds to simulate real-time updates from Admin.
  useEffect(() => {
    if (status === 'AUTHENTICATED') {
      const interval = setInterval(syncUser, 2000);
      return () => clearInterval(interval);
    }
  }, [status, syncUser]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setStatus('LOADING');
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = MOCK_DB.users.find(u => u.email === email);
        const defaultPasswords: Record<string, string> = {
          'admin@gmail.com': 'admin123',
          'sales@gmail.com': 'sales123',
          'ops@gmail.com': 'ops123',
          'user1@gmail.com': 'user123'
        };
        
        const validPass = pass === (defaultPasswords[email] || 'password123');
        
        if (user && validPass) {
          setCurrentUser({ ...user });
          localStorage.setItem('synckraft_session', JSON.stringify(user));
          setStatus('AUTHENTICATED');
          resolve(true);
        } else {
          setStatus('UNAUTHENTICATED');
          resolve(false);
        }
      }, 800);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    setStatus('UNAUTHENTICATED');
    localStorage.removeItem('synckraft_session');
  };

  const updateProfileStatus = (newStatus: ProfileStatus) => {
    if (currentUser) {
      MOCK_DB.updateUser(currentUser.uid, { profileStatus: newStatus });
      syncUser();
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isLoggedIn: !!currentUser,
      role: currentUser?.role || null,
      authStatus: currentUser?.authStatus || null,
      profileStatus: currentUser?.profileStatus || null,
      status, 
      login, 
      logout, 
      updateProfileStatus,
      syncUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
