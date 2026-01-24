
import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { UserRole } from '../types';

interface RoleGuardProps {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ roles, children, fallback }) => {
  const { currentUser } = useAuthContext();

  if (!currentUser || !roles.includes(currentUser.role)) {
    return <>{fallback || <div className="p-8 text-slate-400 font-bold">Unauthorized Access Protocol Initialized.</div>}</>;
  }

  return <>{children}</>;
};
