import React from 'react';
import { Sidebar } from './Sidebar';
import { UserProfile, RoutePath } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  user: UserProfile;
  currentPath: RoutePath;
  onNavigate: (path: RoutePath) => void;
  onLogout: () => void;
  notificationCount: number;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  user, 
  currentPath, 
  onNavigate, 
  onLogout, 
  notificationCount,
  children 
}) => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-brand-blue/10 selection:text-brand-blue">
      <Sidebar 
        user={user} 
        currentPath={currentPath} 
        onNavigate={onNavigate} 
        onLogout={onLogout}
        notificationCount={notificationCount}
      />
      
      <main className="flex-1 p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
