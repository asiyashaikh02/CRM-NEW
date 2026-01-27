
import React, { useState, useMemo } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { Icons } from '../constants';
import { UserStatus, UserRole, maskAadhaar } from '../types';
import { formatCurrency } from '../config/appConfig';
import { RoutePath } from '../App';

export const UsersPage: React.FC<{ params?: any, onNavigate: (path: RoutePath, params?: any) => void }> = ({ params, onNavigate }) => {
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>(params?.role || 'ALL');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>(params?.status || 'ALL');
  const [search, setSearch] = useState('');

  const users = useMemo(() => {
    let list = MOCK_DB.users;
    if (roleFilter !== 'ALL') list = list.filter(u => u.role === roleFilter);
    if (statusFilter !== 'ALL') list = list.filter(u => u.status === statusFilter);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(u => u.displayName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
    }
    return list;
  }, [roleFilter, statusFilter, search]);

  return (
    <div className="space-y-12 text-left animate-fade-in">
      <div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Identity Registry</h2>
        <p className="text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-[0.3em]">Network Unit Management</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between gap-6 mb-10">
           <div className="flex flex-wrap gap-4">
              <FilterSelect label="Authority Role" value={roleFilter} onChange={(v: any) => setRoleFilter(v)}>
                 <option value="ALL">All Authority</option>
                 <option value={UserRole.SALES}>Sales Unit</option>
                 <option value={UserRole.OPERATIONS}>Ops Node</option>
                 <option value={UserRole.MASTER_ADMIN}>Master Admin</option>
              </FilterSelect>
              <FilterSelect label="Authorization" value={statusFilter} onChange={(v: any) => setStatusFilter(v)}>
                 <option value="ALL">All Signals</option>
                 <option value={UserStatus.APPROVED}>Authorized</option>
                 <option value={UserStatus.PENDING}>Review Required</option>
                 <option value={UserStatus.DISABLED}>Suspended</option>
              </FilterSelect>
           </div>
           <div className="relative max-w-sm w-full">
              <input type="text" placeholder="Filter identity registry..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 pl-12 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all" />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Users /></div>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-6 px-4">Node Identity</th>
                    <th className="pb-6 px-4">Access Level</th>
                    <th className="pb-6 px-4">Status</th>
                    <th className="pb-6 px-4">Yield Index</th>
                    <th className="pb-6 px-4">Registry Date</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                 {users.map(u => (
                   <tr key={u.uid} onClick={() => onNavigate('user-detail', { id: u.uid })} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                      <td className="py-8 px-4">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md transition-transform group-hover:scale-110">{u.displayName.charAt(0)}</div>
                            <div>
                               <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{u.displayName}</p>
                               <p className="text-[10px] text-slate-400 font-bold tracking-tight">{u.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="py-8 px-4 text-[9px] font-black uppercase tracking-widest text-indigo-600">{u.role}</td>
                      <td className="py-8 px-4">
                         <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${u.status === UserStatus.APPROVED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{u.status}</span>
                      </td>
                      <td className="py-8 px-4 text-sm font-black text-slate-700 dark:text-slate-300">
                        {formatCurrency(MOCK_DB.customers.filter(c => c.salesId === u.uid).reduce((a,b) => a+b.billingAmount, 0))}
                      </td>
                      <td className="py-8 px-4 text-[10px] font-bold text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                   </tr>
                 ))}
                 {users.length === 0 && (
                   <tr>
                     <td colSpan={5} className="py-20 text-center font-bold text-slate-300 italic">No node identities found matching current telemetry signals.</td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

const FilterSelect = ({ label, value, onChange, children }: any) => (
  <div className="space-y-1">
    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest ml-2">{label}</p>
    <select value={value} onChange={e => onChange(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-[9px] font-black uppercase outline-none focus:ring-2 focus:ring-indigo-600 transition-all cursor-pointer">
       {children}
    </select>
  </div>
);
