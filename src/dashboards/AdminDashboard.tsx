
import React, { useMemo } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { useAuthContext } from '../context/AuthContext';
import { UserRole, RoutePath, CustomerStatus, WorkStatus, UserStatus } from '../types';
import { Target, ClipboardList, IndianRupee, ChevronRight, ShieldAlert, Clock, Users, Zap, CheckCircle, BarChart3, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../config/appConfig';

export const AdminDashboard: React.FC<{ onNavigate: (path: RoutePath, id?: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuthContext();

  const stats = useMemo(() => {
    MOCK_DB.checkDeadlines();
    const totalPotential = MOCK_DB.customers.reduce((acc, c) => acc + (c.finalPrice || 0), 0);
    const totalCollected = MOCK_DB.customers.reduce((acc, c) => {
      return acc + c.payments.reduce((pa, p) => pa + p.amount, 0);
    }, 0);

    const jobMetrics = {
      draft: MOCK_DB.customers.filter(c => c.status === CustomerStatus.DRAFT).length,
      approved: MOCK_DB.customers.filter(c => c.status === CustomerStatus.APPROVED).length,
      ops: MOCK_DB.customers.filter(c => c.status === CustomerStatus.TRANSFERRED_TO_OPS).length,
      done: MOCK_DB.customers.filter(c => c.status === CustomerStatus.COMPLETED).length,
    };

    const personnel = {
      sales: MOCK_DB.users.filter(u => u.role === UserRole.SALES_USER || u.role === UserRole.SALES_MANAGER).length,
      ops: MOCK_DB.users.filter(u => u.role === UserRole.OPS_USER || u.role === UserRole.OPS_MANAGER).length,
      pending: MOCK_DB.users.filter(u => u.status === UserStatus.PENDING).length,
    };

    return { totalPotential, totalCollected, jobMetrics, personnel };
  }, []);

  const latestTimeline = useMemo(() => {
    const allEvents = MOCK_DB.customers.flatMap(c => c.timeline.map(t => ({ ...t, company: c.companyName, id: c.id })));
    return allEvents.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);
  }, []);

  return (
    <div className="space-y-10 animate-fade-in text-left pb-10">
      <header className="flex flex-col gap-2">
        <h2 className="text-5xl font-black tracking-tighter leading-none text-slate-900">Global Oversight</h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">Master Control • Session: {currentUser?.displayName}</p>
      </header>

      {/* CORE FINANCIAL AUDIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <AuditCard 
           label="Portfolio Valuation" 
           val={formatCurrency(stats.totalPotential)} 
           sub="Contracted Yield" 
           icon={<BarChart3 className="text-brand-blue"/>} 
         />
         <AuditCard 
           label="Liquidity Realized" 
           val={formatCurrency(stats.totalCollected)} 
           sub="Confirmed Settlement" 
           icon={<TrendingUp className="text-emerald-500"/>} 
         />
         <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Settlement Delta</p>
              <h3 className="text-3xl font-black tracking-tighter text-rose-400">
                {formatCurrency(stats.totalPotential - stats.totalCollected)}
              </h3>
            </div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Outstanding Net Balance</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* PERSONNEL REGISTRY SUMMARY */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-xl font-black tracking-tight">Network Health</h3>
              <div className="space-y-6">
                 <HealthBar label="Sales Cluster" val={stats.personnel.sales} color="bg-brand-blue" />
                 <HealthBar label="Ops Operations" val={stats.personnel.ops} color="bg-indigo-600" />
                 <HealthBar label="Auth Queue" val={stats.personnel.pending} color="bg-amber-500" />
              </div>
              <button onClick={() => onNavigate('users')} className="w-full py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all">Audit Personnel</button>
           </div>

           <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white space-y-4 shadow-xl">
              <CheckCircle size={28} className="opacity-40" />
              <h4 className="text-2xl font-black tracking-tighter leading-none">{stats.jobMetrics.done} Projects</h4>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-80">Full Lifecycle Completion</p>
           </div>
        </div>

        {/* GLOBAL TIMELINE FEED */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10 overflow-hidden">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold font-grotesk tracking-tight text-slate-900">Signal Intelligence</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Audit</span>
           </div>
           
           <div className="space-y-8 relative">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-50"></div>
              {latestTimeline.map((t, i) => (
                <div key={i} className="flex gap-6 relative z-10 group cursor-pointer" onClick={() => onNavigate('project-detail', t.id)}>
                   <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all">
                      <Zap size={14} />
                   </div>
                   <div className="flex-1 pb-4 border-b border-slate-50">
                      <div className="flex justify-between items-start">
                         <p className="text-[10px] font-black uppercase text-brand-blue tracking-widest mb-1">{t.action}</p>
                         <span className="text-[8px] font-bold text-slate-300">{new Date(t.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-brand-blue transition-colors">{t.company}</p>
                      <p className="text-xs text-slate-400 font-medium mt-1">{t.remarks}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const AuditCard = ({ label, val, sub, icon }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between h-48 hover:shadow-xl transition-all">
     <div className="flex justify-between items-start">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">{icon}</div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">{sub}</p>
     </div>
     <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{val}</h3>
     </div>
  </div>
);

const HealthBar = ({ label, val, color }: any) => (
  <div className="space-y-2">
     <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-900">{val} Units</span>
     </div>
     <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${Math.min(100, (val/10)*100)}%` }}></div>
     </div>
  </div>
);
