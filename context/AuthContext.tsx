
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserStatus, Location } from '../types';
import { MOCK_DB } from '../data/mockDb';

export type AuthStatus = 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

interface AuthContextType {
  currentUser: User | null;
  status: AuthStatus;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (form: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('LOADING');

  useEffect(() => {
    const initAuth = () => {
      const saved = localStorage.getItem('synckraft_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const dbUser = MOCK_DB.users.find(u => u.uid === parsed.uid);
          if (dbUser) {
            setCurrentUser({ ...dbUser });
            setStatus('AUTHENTICATED');
          } else {
            localStorage.removeItem('synckraft_session');
            setStatus('UNAUTHENTICATED');
          }
        } catch (e) {
          localStorage.removeItem('synckraft_session');
          setStatus('UNAUTHENTICATED');
        }
      } else {
        setStatus('UNAUTHENTICATED');
      }
    };
    setTimeout(initAuth, 800);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setStatus('LOADING');
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = MOCK_DB.users.find(u => u.email === email);
        const defaultPasswords: Record<string, string> = {
          'admin@gmail.com': 'admin123',
          'user1@gmail.com': 'user123',
          'sales@gmail.com': 'sales123',
          'ops@gmail.com': 'ops123'
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
      }, 1000);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    setStatus('UNAUTHENTICATED');
    localStorage.removeItem('synckraft_session');
  };

  const register = (form: any) => {
    const newUser: User = {
      uid: `uid-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      email: form.email,
      displayName: form.name,
      role: UserRole.USER, 
      status: UserStatus.PENDING,
      mobile: form.mobile,
      location: {
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode
      },
      age: parseInt(form.age),
      gender: form.gender,
      aadhaar: form.aadhaar,
      createdAt: Date.now()
    };
    MOCK_DB.addUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ currentUser, status, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
