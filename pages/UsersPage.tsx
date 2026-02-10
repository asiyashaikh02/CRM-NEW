
import React from 'react';
import { MOCK_DB } from '../data/mockDb';
import { UserRole, RoutePath, UserStatus } from '../types';
import { Mail, ShieldCheck, ChevronRight, User as UserIcon, Lock, CheckCircle } from 'lucide-react';

const ROLE_MODULES: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['Dashboard', 'Leads', 'Orders', 'Payments', 'Users', 'Quick Add'],
  [UserRole.SALES]: ['Dashboard', 'Leads', 'Quick Add'],
  [UserRole.OPS]: ['Dashboard', 'Orders', 'Payments'],
  [UserRole.USER]: ['Dashboard', 'Leads', 'Orders', 'Payments'],
  [UserRole.SALES_USER]: ['Dashboard', 'Leads', 'Quick Add'],
  [UserRole.OPS_USER]: ['Dashboard', 'Orders', 'Payments'],
  [UserRole.SALES_MANAGER]: ['Dashboard', 'Leads', 'Quick Add'],
  [UserRole.OPS_MANAGER]: ['Dashboard', 'Orders', 'Payments']
};

export const UsersPage: React.FC<{ onNavigate: (path: RoutePath, id?: string) => void, selectedId?: string }> = ({ onNavigate, selectedId }) => {
  const user = selectedId ? MOCK_DB.users.find(u => u.uid === selectedId) : null;

  if (selectedId && user) {
    return (
      <div className="max-w-3xl mx-auto space-y-10 animate-fade-in text-left">
        <header className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-8">
          <div className="w-24 h-24 bg-brand-blue rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-brand-blue/20">
            {user.displayName.charAt(0)}
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-slate-900">{user.displayName}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] font-black bg-brand-blue/5 text-brand-blue px-3 py-1 rounded-full uppercase tracking-widest">{user.role}</span>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2 ${user.status === UserStatus.APPROVED ? 'text-emerald-500' : 'text-amber-500'}`}>
                {user.status === UserStatus.APPROVED ? <CheckCircle size={10}/> : <Lock size={10}/>}
                {user.status}
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Network Identity</h4>
              <div className="space-y-4">
                 <div className="flex items-center gap-4 text-slate-600"><Mail size={16}/><span className="text-sm font-bold">{user.email}</span></div>
                 <div className="flex items-center gap-4 text-slate-600"><Lock size={16}/><span className="text-xs font-mono font-bold text-slate-400">UID: {user.uid}</span></div>
              </div>
           </div>
           
           <div className="bg-slate-900 p-10 rounded-[3rem] text-white">
              <h4 className="text-[10px] font-black uppercase text-brand-blue tracking-widest mb-6">Authorized Modules</h4>
              <div className="flex flex-wrap gap-2">
                 {ROLE_MODULES[user.role].map(mod => (
                   <span key={mod} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                     {mod}
                   </span>
                 ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div>
        <h2 className="text-4xl font-black tracking-tighter">Identity Registry</h2>
        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">Authorized Network Personnel</p>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">User Node</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Privilege</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Auth Status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_DB.users.map(u => (
                <tr 
                  key={u.uid} 
                  onClick={() => onNavigate('user-detail', u.uid)}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                        <UserIcon size={18}/>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.displayName}</p>
                        <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black bg-slate-50 text-slate-500 px-3 py-1 rounded-lg uppercase tracking-widest">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${u.status === UserStatus.APPROVED ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{u.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <ChevronRight className="inline-block text-slate-300 group-hover:text-brand-blue transition-colors" size={18}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
