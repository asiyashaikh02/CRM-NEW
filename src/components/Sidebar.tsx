import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Package, 
  CreditCard, 
  Bell, 
  UserCircle, 
  LogOut,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { UserRole, RoutePath, UserProfile } from '../types';

interface SidebarProps {
  user: UserProfile;
  currentPath: RoutePath;
  onNavigate: (path: RoutePath) => void;
  onLogout: () => void;
  notificationCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  user, 
  currentPath, 
  onNavigate, 
  onLogout,
  notificationCount 
}) => {
  const isAdmin = [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role);
  const isSalesAdmin = user.role === UserRole.SALES_ADMIN;
  const isOpsAdmin = user.role === UserRole.OPS_ADMIN;
  const isSalesUser = user.role === UserRole.SALES_USER;
  const isOpsUser = user.role === UserRole.OPS_USER;

  const navItems = [
    { id: 'dashboard', label: 'Control Tower', icon: LayoutDashboard, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES_ADMIN, UserRole.OPS_ADMIN, UserRole.SALES_USER, UserRole.OPS_USER] },
    { id: 'leads', label: 'Pipeline', icon: Target, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES_ADMIN, UserRole.SALES_USER] },
    { id: 'orders', label: 'Operations', icon: Package, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPS_ADMIN, UserRole.OPS_USER] },
    { id: 'payments', label: 'Settlements', icon: CreditCard, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPS_ADMIN] },
    { id: 'users', label: 'Personnel', icon: Users, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="w-80 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
      <div className="p-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-lg">
          <Zap size={24} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter">Synckraft</h1>
          <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Enterprise CRM v2.0</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {filteredNav.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as RoutePath)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
              currentPath === item.id 
                ? 'bg-slate-900 text-white shadow-xl translate-x-1' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon size={20} className={currentPath === item.id ? 'text-brand-blue' : 'group-hover:text-brand-blue'} />
            <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 space-y-4">
        <button
          onClick={() => onNavigate('notifications')}
          className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group"
        >
          <div className="flex items-center gap-4">
            <Bell size={18} className="text-slate-400 group-hover:text-brand-blue" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Signals</span>
          </div>
          {notificationCount > 0 && (
            <span className="bg-brand-blue text-white text-[8px] font-black px-2 py-1 rounded-full">{notificationCount}</span>
          )}
        </button>

        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white space-y-4 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-blue/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
              <UserCircle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black truncate">{user.name}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{user.role.replace('_', ' ')}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group relative z-10"
          >
            <LogOut size={14} className="text-slate-400 group-hover:text-rose-400" />
            <span className="text-[8px] font-black uppercase tracking-widest">Terminate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
