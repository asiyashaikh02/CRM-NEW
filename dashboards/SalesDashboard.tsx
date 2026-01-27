
import React, { useMemo } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { MOCK_DB } from '../data/mockDb';
import { Icons } from '../constants';
import { LeadStatus, ExecutionStage, InvoiceStatus } from '../types';
import { formatCurrency } from '../config/appConfig';
import { RoutePath } from '../App';

export const SalesDashboard: React.FC<{ onNavigate: (path: RoutePath, params?: any) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuthContext();

  const stats = useMemo(() => {
    const myLeads = MOCK_DB.leads.filter(l => l.salesUserId === currentUser?.uid);
    const myCustomers = MOCK_DB.customers.filter(c => c.salesId === currentUser?.uid);
    
    return {
      activeLeads: myLeads.filter(l => l.status !== LeadStatus.CONVERTED).length,
      networkLeads: myLeads.filter(l => l.source === 'network' && l.status !== LeadStatus.CONVERTED).length,
      activeProjects: myCustomers.filter(c => c.executionStage !== ExecutionStage.CLOSED).length,
      totalYield: myCustomers.reduce((acc, c) => acc + c.receipts.reduce((sum, r) => sum + r.amount, 0), 0)
    };
  }, [currentUser]);

  return (
    <div className="space-y-10 animate-fade-in text-left">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Sales Console</h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase text-[9px] tracking-[0.3em]">Capital Flow Oversight</p>
        </div>
        <button onClick={() => onNavigate('leads')} className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-3 active:scale-95">
          <Icons.Sparkles /> Manage Leads
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Network Signals" value={stats.networkLeads} color="indigo" icon="🌐" onClick={() => onNavigate('leads', { source: 'network' })} />
        <MetricCard label="Active Pipeline" value={stats.activeLeads} color="blue" icon="📂" onClick={() => onNavigate('leads')} />
        <MetricCard label="Live Portfolios" value={stats.activeProjects} color="emerald" icon="⚡" onClick={() => onNavigate('projects', { status: 'active' })} />
        <MetricCard label="Secured Capital" value={formatCurrency(stats.totalYield)} color="amber" icon="💎" onClick={() => onNavigate('projects', { filter: 'paid' })} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <section className="lg:col-span-12 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between gap-10">
               <div className="space-y-4 flex-1">
                  <h3 className="text-xl font-black tracking-tight">Acquisition Performance</h3>
                  <p className="text-slate-400 font-medium leading-relaxed max-w-md text-xs">Node conversion protocols are performing within 12% of peak efficiency. Target acquisition cycle: 4.5 days.</p>
                  <div className="flex gap-4 pt-4">
                     <button onClick={() => onNavigate('projects-flow')} className="px-6 py-3 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all">Audit Pipeline Flow</button>
                  </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
                  <StatMini label="Conversion Rate" value="84%" />
                  <StatMini label="Cycle Velocity" value="4.2d" />
                  <StatMini label="Lead Velocity" value="+12%" color="text-emerald-500" />
               </div>
            </div>
         </section>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, color, icon, onClick }: any) => {
  const cMap: any = { indigo: 'bg-indigo-50 text-indigo-600', blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600' };
  return (
    <div onClick={onClick} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 cursor-pointer group hover:shadow-xl transition-all">
      <div className={`w-12 h-12 ${cMap[color]} rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform shadow-sm`}>{icon}</div>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter truncate">{value}</h3>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</p>
    </div>
  );
};

const StatMini = ({ label, value, color = 'text-indigo-600' }: any) => (
  <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
     <p className={`text-2xl font-black ${color}`}>{value}</p>
  </div>
);
