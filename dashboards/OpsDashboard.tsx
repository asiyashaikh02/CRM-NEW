
import React, { useMemo } from 'react';
import { Customer, ExecutionStage, WorkStatus } from '../types';
import { Icons } from '../constants';
import { useAuthContext } from '../context/AuthContext';
import { formatCurrency } from '../config/appConfig';
import { MOCK_DB } from '../data/mockDb';
import { RoutePath } from '../App';

export const OpsDashboard: React.FC<{ onNavigate: (path: RoutePath, params?: any) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuthContext();

  const customers = useMemo(() => {
    return MOCK_DB.customers.filter(c => c.opsId === currentUser?.uid);
  }, [currentUser]);

  const stats = useMemo(() => ({
    active: customers.filter(c => c.workStatus !== WorkStatus.COMPLETED).length,
    efficiency: "92%",
    delayed: customers.filter(c => c.workStatus === WorkStatus.ON_HOLD).length
  }), [customers]);

  return (
    <div className="space-y-10 animate-fade-in text-left">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Execution Command</h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase text-[9px] tracking-[0.3em]">Operational Health Dashboard</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <HealthCard label="Active Deployment" value={stats.active} icon="⚙️" onClick={() => onNavigate('projects', { status: 'active' })} />
        <HealthCard label="Internal Velocity" value={stats.efficiency} icon="⚡" onClick={() => onNavigate('projects-flow')} />
        <HealthCard label="Protocol Delays" value={stats.delayed} icon="⚠️" color="text-rose-500" onClick={() => onNavigate('projects', { status: 'delayed' })} pulse={stats.delayed > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <section className="lg:col-span-8 bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm group">
           <h3 className="text-xl font-black tracking-tight mb-8">Performance Node Architecture</h3>
           <div className="space-y-10">
              <div className="flex items-end gap-6">
                 <p className="text-6xl font-black tracking-tighter text-indigo-600">{stats.efficiency}</p>
                 <div className="pb-2"><p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Node Success Index</p></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <button onClick={() => onNavigate('projects')} className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 p-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95">Open Assignment Registry</button>
                 <button onClick={() => onNavigate('projects-flow')} className="bg-indigo-600 text-white p-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95">Visual Execution Flow</button>
              </div>
           </div>
        </section>

        <aside className="lg:col-span-4 bg-indigo-600 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl overflow-hidden relative">
           <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Icons.Sparkles /></div>
           <h4 className="text-[10px] font-black uppercase tracking-widest">AI Oversight Protocol</h4>
           <p className="text-sm font-medium leading-relaxed italic opacity-90">"Asset deployment cycles are currently synced. Master Registry reports 2 nodes awaiting final billing finalization."</p>
           <div className="pt-6 border-t border-white/20">
              <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200">System Priority</p>
              <p className="text-lg font-black mt-2 tracking-tight">Cycle-Time Optimization</p>
           </div>
        </aside>
      </div>
    </div>
  );
};

const HealthCard = ({ label, value, icon, onClick, color = 'text-indigo-600', pulse }: any) => (
  <div onClick={onClick} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 cursor-pointer hover:shadow-lg transition-all relative flex items-center justify-between group">
     <div>
       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
       <p className={`text-3xl font-black ${color}`}>{value}</p>
     </div>
     <div className="text-2xl opacity-20 group-hover:opacity-100 transition-opacity">{icon}</div>
     {pulse && <span className="absolute top-4 right-4 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span></span>}
  </div>
);
