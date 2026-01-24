
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserStatus } from '../types';
import { MOCK_DB } from '../data/mockDb';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Restore session synchronously on mount (if possible) or very first tick
  useEffect(() => {
    const saved = localStorage.getItem('synckraft_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Refresh from mock DB to get latest status
        const dbUser = MOCK_DB.users.find(u => u.uid === parsed.uid);
        if (dbUser) {
          setCurrentUser(dbUser);
        } else {
          localStorage.removeItem('synckraft_session');
        }
      } catch (e) {
        localStorage.removeItem('synckraft_session');
      }
    }
  }, []);

  const login = (email: string, pass: string): boolean => {
    const user = MOCK_DB.users.find(u => u.email === email);
    // Simple password check: admin123 for admin, user123 for others
    const validPass = pass === (email === 'admin@gmail.com' ? 'admin123' : 'user123');
    
    if (user && validPass) {
      setCurrentUser({ ...user });
      localStorage.setItem('synckraft_session', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('synckraft_session');
  };

  const register = (name: string, email: string, role: UserRole) => {
    const newUser: User = {
      uid: `uid-${Math.random().toString(36).substr(2, 9)}`,
      email,
      displayName: name,
      role,
      status: UserStatus.PENDING,
      createdAt: Date.now()
    };
    MOCK_DB.addUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
