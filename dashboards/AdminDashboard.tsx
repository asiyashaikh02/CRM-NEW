
import React, { useState } from 'react';
import { UserStatus, UserRole } from '../types';
import { MOCK_DB } from '../data/mockDb';
import { Icons } from '../constants';

export const AdminDashboard: React.FC = () => {
  const [refresh, setRefresh] = useState(0); // Simple trigger for local re-renders

  const users = MOCK_DB.users;
  const leads = MOCK_DB.leads;
  const customers = MOCK_DB.customers;

  const handleApprove = (uid: string) => {
    MOCK_DB.approveUser(uid);
    setRefresh(r => r + 1);
  };

  const pending = users.filter(u => u.status === UserStatus.PENDING);
  const activeTeamCount = users.filter(u => u.status === UserStatus.APPROVED).length;

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Command Centre</h2>
        <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-[0.3em]">Identity & Ecosystem Oversight</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Pipeline Leads" value={leads.length} icon={<Icons.Leads />} color="indigo" />
        <StatCard label="Active Assets" value={customers.length} icon={<Icons.Operations />} color="emerald" />
        <StatCard label="Verified Team" value={activeTeamCount} icon={<Icons.Users />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Queue */}
        <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900">Pending Authorization</h3>
            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">{pending.length}</span>
          </div>
          <div className="space-y-4">
            {pending.length === 0 ? (
              <p className="text-slate-400 text-sm italic py-10 text-center">No identities awaiting verification.</p>
            ) : (
              pending.map(u => (
                <div key={u.uid} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{u.displayName}</p>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{u.role}</p>
                  </div>
                  <button onClick={() => handleApprove(u.uid)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-lg shadow-lg">Verify</button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* System Activity */}
        <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
           <h3 className="text-xl font-black text-slate-900 mb-8">Ecosystem Snapshot</h3>
           <div className="space-y-6">
             <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-700 text-xs font-medium">
               Neural optimizer suggests 3 workflow improvements in Operations to reduce burn rate by 12%.
             </div>
             <div className="flex items-center gap-4 text-slate-500 text-xs">
               <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
               <p>All core systems operational.</p>
             </div>
           </div>
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: any) => {
  const cMap: any = { indigo: 'text-indigo-600 bg-indigo-50', emerald: 'text-emerald-600 bg-emerald-50', amber: 'text-amber-600 bg-amber-50' };
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
      <div className={`w-12 h-12 ${cMap[color]} rounded-xl flex items-center justify-center mb-4`}>{icon}</div>
      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
};
