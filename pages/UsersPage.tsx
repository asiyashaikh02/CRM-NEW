
import React, { useState, useMemo } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { Icons } from '../constants';
import { UserStatus, UserRole, maskAadhaar } from '../types';
import { formatCurrency } from '../config/appConfig';
import { RoutePath } from '../App';

export const UsersPage: React.FC<{ params?: any, onNavigate: (path: RoutePath, params?: any) => void }> = ({ params, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<UserStatus>(params?.status || UserStatus.PENDING);
  const [search, setSearch] = useState('');

  const users = useMemo(() => {
    let list = MOCK_DB.users.filter(u => u.status === activeTab);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(u => u.displayName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
    }
    return list;
  }, [activeTab, search]);

  return (
    <div className="space-y-12 text-left animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Identity Management</h2>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em] mt-1">Network Authority Node Registry</p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <StatusTab label="Pending" active={activeTab === UserStatus.PENDING} onClick={() => setActiveTab(UserStatus.PENDING)} count={MOCK_DB.users.filter(u => u.status === UserStatus.PENDING).length} />
           <StatusTab label="Active" active={activeTab === UserStatus.APPROVED} onClick={() => setActiveTab(UserStatus.APPROVED)} />
           <StatusTab label="Disabled" active={activeTab === UserStatus.DISABLED} onClick={() => setActiveTab(UserStatus.DISABLED)} />
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="mb-10 relative max-w-sm">
           <input type="text" placeholder="Filter identities..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 pl-12 text-xs font-bold outline-none ring-2 ring-slate-100 dark:ring-slate-800 focus:ring-indigo-600 transition-all" />
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Users /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {users.length === 0 ? (
             <div className="col-span-full py-20 text-center text-slate-300 italic font-black">No signals detected in this cluster.</div>
           ) : (
             users.map(u => (
               <div key={u.uid} onClick={() => onNavigate('user-detail', { id: u.uid })} className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:border-indigo-400 transition-all cursor-pointer group shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl group-hover:scale-110 transition-transform">
                      {u.displayName.charAt(0)}
                    </div>
                    <span className="text-[8px] font-black bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 uppercase tracking-widest">{u.role}</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{u.displayName}</h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">{u.email}</p>
                  
                  <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{u.profileCompleted ? 'Profile Sync OK' : 'Profile Locked'}</p>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Icons.Sparkles /></button>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
};

const StatusTab = ({ label, active, onClick, count }: any) => (
  <button onClick={onClick} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
    {label}
    {count !== undefined && <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{count}</span>}
  </button>
);
