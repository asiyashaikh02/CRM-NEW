
import React, { useMemo, useState } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { Icons } from '../constants';
import { UserStatus, UserRole, maskAadhaar, User, RoutePath } from '../types';
import { formatCurrency } from '../config/appConfig';
import { userService } from '../services/user.service';
import { ChevronRight, Briefcase, IndianRupee } from 'lucide-react';

export const UserDetailPage: React.FC<{ id: string, onNavigate: (path: RoutePath, params?: any) => void }> = ({ id, onNavigate }) => {
  const [refresh, setRefresh] = useState(0);
  
  const user = useMemo(() => {
    return MOCK_DB.users.find(u => u.uid === id);
  }, [id, refresh]);

  if (!user) return <div className="p-20 text-center font-black">Identity Registry Node Not Found.</div>;

  const associatedProjects = useMemo(() => {
    return MOCK_DB.customers.filter(c => c.createdBy === user.uid || c.opsId === user.uid);
  }, [user.uid]);

  const performance = useMemo(() => {
    const leads = MOCK_DB.leads.filter(l => l.salesUserId === user.uid).length;
    const revenue = associatedProjects.reduce((acc, c) => acc + (c.billingAmount || 0), 0);
    return { leads, projects: associatedProjects.length, revenue };
  }, [user.uid, associatedProjects]);

  const handleStatusUpdate = async (status: UserStatus) => {
    await userService.updateUser(user.uid, { status });
    setRefresh(r => r + 1);
  };

  const handleRoleUpdate = async (role: UserRole) => {
    await userService.updateUser(user.uid, { role });
    setRefresh(r => r + 1);
  };

  return (
    <div className="space-y-12 text-left animate-fade-in pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <button onClick={() => onNavigate('users')} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            Registry Index
          </button>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{user.displayName}</h2>
          <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-[0.4em]">Unit Identity: {user.uid}</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
           <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${user.status === UserStatus.APPROVED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{user.status}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-10">
           <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm text-center">
              <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black mx-auto mb-8 shadow-2xl border-4 border-white">
                {user.displayName.charAt(0)}
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{user.displayName}</h3>
              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-2">{user.role}</p>
              
              <div className="mt-10 pt-10 border-t border-slate-50 space-y-4">
                 <DetailRow label="Digital Registry" val={user.email} />
                 <MetricLine label="Contact Node" val={user.mobile} />
                 <MetricLine label="Aadhaar UID" val={maskAadhaar(user.aadhaar)} />
                 <MetricLine label="Registry Date" val={new Date(user.createdAt).toLocaleDateString()} />
              </div>
           </section>

           <div className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Authority Control</h4>
              <div className="space-y-4">
                 <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Override Access Level</p>
                 <select 
                   value={user.role} 
                   onChange={(e) => handleRoleUpdate(e.target.value as UserRole)}
                   className="w-full bg-slate-800 border-none rounded-xl p-4 font-black text-[10px] uppercase tracking-widest text-white outline-none focus:ring-2 focus:ring-indigo-600"
                 >
                    <option value={UserRole.SALES}>Sales Specialist</option>
                    <option value={UserRole.OPS}>Ops Specialist</option>
                    <option value={UserRole.ADMIN}>Master Admin</option>
                 </select>
              </div>
              <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                 <button onClick={() => handleStatusUpdate(UserStatus.APPROVED)} className="bg-emerald-600 py-4 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Authorize</button>
                 <button onClick={() => handleStatusUpdate(UserStatus.BLOCKED)} className="bg-rose-600 py-4 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Block Access</button>
              </div>
           </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
           {/* Productivity Hub */}
           <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black tracking-tight mb-10">Productivity Telemetry</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                 <MetricCard label="Pipeline Signals" val={performance.leads} />
                 <MetricCard label="Managed Nodes" val={performance.projects} />
                 <MetricCard label="Lifecycle Yield" val={formatCurrency(performance.revenue)} color="text-emerald-500" />
              </div>
           </section>

           {/* Associated Projects Registry */}
           <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black tracking-tight mb-8">Associated Customer Nodes</h3>
              <div className="space-y-4">
                 {associatedProjects.length === 0 ? (
                   <p className="text-slate-400 font-bold italic text-center py-10">No customer nodes associated with this personnel.</p>
                 ) : (
                   associatedProjects.map(c => (
                     <div 
                        key={c.id} 
                        onClick={() => onNavigate('project-detail', c.id)}
                        className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl hover:border-brand-blue/20 border border-transparent transition-all cursor-pointer group"
                     >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-blue shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-all"><Briefcase size={16}/></div>
                           <div>
                              <p className="text-sm font-bold text-slate-900">{c.companyName}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.status}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Billing</p>
                              <p className="text-xs font-black">{formatCurrency(c.finalPrice)}</p>
                           </div>
                           <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-blue" />
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, val }: any) => (
  <div className="text-left">
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-black text-slate-900 truncate">{val}</p>
  </div>
);

const MetricLine = ({ label, val }: any) => (
  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest border-b border-slate-50 pb-2">
    <span className="text-slate-400">{label}</span>
    <span className="text-slate-900">{val}</span>
  </div>
);

const MetricCard = ({ label, val, color = 'text-indigo-600' }: any) => (
  <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</p>
    <p className={`text-3xl font-black tracking-tighter ${color}`}>{val}</p>
  </div>
);
