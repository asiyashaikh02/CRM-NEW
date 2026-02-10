
import React, { useMemo } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { MOCK_DB } from '../data/mockDb';
import { CustomerStatus, WorkStatus, RoutePath } from '../types';
import { CheckCircle, Clock, Play, TrendingUp, IndianRupee, ChevronRight, Zap, ShieldCheck } from 'lucide-react';

export const OpsDashboard: React.FC<{ onNavigate: (path: RoutePath, params?: any) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuthContext();

  const myAssignments = useMemo(() => {
    return MOCK_DB.customers.filter(c => c.assignedOps === currentUser?.uid);
  }, [currentUser]);

  const stats = useMemo(() => {
    const active = myAssignments.filter(c => c.workStatus === WorkStatus.IN_PROGRESS).length;
    const completed = myAssignments.filter(c => c.workStatus === WorkStatus.COMPLETED).length;
    const uncollected = myAssignments.reduce((acc, c) => {
      const totalPaid = c.payments.reduce((pa, p) => pa + p.amount, 0);
      return acc + (c.finalPrice - totalPaid);
    }, 0);
    return { active, completed, uncollected };
  }, [myAssignments]);

  const jobsByPriority = useMemo(() => {
    return {
      execution: myAssignments.filter(c => c.workStatus !== WorkStatus.COMPLETED),
      settlement: myAssignments.filter(c => {
        const totalPaid = c.payments.reduce((pa, p) => pa + p.amount, 0);
        return totalPaid < c.finalPrice;
      })
    };
  }, [myAssignments]);

  return (
    <div className="space-y-10 text-left animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Ops Command</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-3">Specialist Registry: {currentUser?.displayName}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center gap-3">
             <ShieldCheck size={20} />
             <span className="text-[10px] font-black uppercase tracking-widest">Active Node Certified</span>
          </div>
        </div>
      </header>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <MetricCard label="Active Deployments" val={stats.active} icon={<Play className="text-brand-blue"/>} />
         <MetricCard label="Lifecycle Yield" val={`₹${stats.uncollected.toLocaleString()}`} icon={<IndianRupee className="text-rose-500"/>} />
         <MetricCard label="Network Complete" val={stats.completed} icon={<CheckCircle className="text-emerald-500"/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
           {/* EXECUTION REGISTRY */}
           <section className="space-y-6">
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-3"><Zap size={20} className="text-brand-blue"/> Active Execution Queue</h3>
              {jobsByPriority.execution.length === 0 ? (
                <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center shadow-sm">
                   <Clock size={40} className="mx-auto text-slate-200 mb-6" />
                   <p className="text-slate-400 font-bold italic">No active deployment signals found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobsByPriority.execution.map(c => (
                    <OpsJobCard key={c.id} job={c} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
           </section>

           {/* SETTLEMENT REGISTRY */}
           <section className="space-y-6">
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-3"><IndianRupee size={20} className="text-emerald-500"/> Settlement Pending</h3>
              <div className="space-y-4">
                {jobsByPriority.settlement.map(c => (
                   <OpsJobCard key={c.id} job={c} onNavigate={onNavigate} variant="settlement" />
                ))}
              </div>
           </section>
        </div>

        <aside className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <TrendingUp size={120} className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-45 transition-transform duration-1000" />
              <h3 className="text-xl font-black tracking-tight mb-10 leading-none">Ops Intelligence</h3>
              <div className="space-y-8 relative z-10">
                 <MetricItem label="Site Velocity" val="High" color="text-brand-blue" />
                 <MetricItem label="Financial Integrity" val="Verified" color="text-emerald-400" />
                 <MetricItem label="Protocol Status" val="Optimal" />
              </div>
           </div>
           
           <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm text-center">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Security Clearance</h4>
              <p className="text-xs font-bold leading-relaxed text-slate-500 mb-8">Specialists are strictly authorized for execution and financial recording only.</p>
              <button className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all">Support Protocol</button>
           </div>
        </aside>
      </div>
    </div>
  );
};

const OpsJobCard = ({ job, onNavigate, variant = 'execution' }: any) => {
  const totalPaid = job.payments.reduce((acc: any, p: any) => acc + p.amount, 0);
  const outstanding = job.finalPrice - totalPaid;

  return (
    <div 
      onClick={() => onNavigate('project-detail', job.id)}
      className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-xl hover:border-brand-blue/20 transition-all cursor-pointer group"
    >
       <div className="flex items-center gap-6 flex-1">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl font-black text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
            {job.companyName.charAt(0)}
          </div>
          <div>
             <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-brand-blue transition-colors">{job.companyName}</h4>
             <div className="flex items-center gap-3 mt-3">
                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${variant === 'execution' ? 'bg-brand-blue/5 text-brand-blue' : 'bg-rose-50 text-rose-600'}`}>
                  {variant === 'execution' ? job.workStatus : `₹${outstanding.toLocaleString()} Pending`}
                </span>
                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.plantCapacity}kW</p>
             </div>
          </div>
       </div>
       <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-blue transition-all" />
    </div>
  );
};

const MetricCard = ({ label, val, icon }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
     <div className="space-y-1">
       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
       <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{val}</h3>
     </div>
     <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-100 transition-colors">{icon}</div>
  </div>
);

const MetricItem = ({ label, val, color = 'text-white' }: any) => (
  <div className="flex justify-between items-center pb-5 border-b border-white/5">
     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
     <span className={`text-sm font-black ${color}`}>{val}</span>
  </div>
);
