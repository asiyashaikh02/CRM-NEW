
import React, { useMemo, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { MOCK_DB } from '../data/mockDb';
import { CustomerStatus, WorkStatus, RoutePath } from '../types';
import { CheckCircle, Clock, Play, TrendingUp, IndianRupee, ChevronRight, Zap, ShieldCheck, Map, Phone, Briefcase } from 'lucide-react';

export const OpsDashboard: React.FC<{ onNavigate: (path: RoutePath, params?: any) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuthContext();
  const [filter, setFilter] = useState<'ACTIVE' | 'PENDING' | 'COMPLETED'>('ACTIVE');

  const myAssignments = useMemo(() => {
    return MOCK_DB.customers.filter(c => c.assignedOps === currentUser?.uid);
  }, [currentUser]);

  const stats = useMemo(() => {
    const active = myAssignments.filter(c => c.workStatus === WorkStatus.IN_PROGRESS || c.workStatus === WorkStatus.WORKING).length;
    const pending = myAssignments.filter(c => c.workStatus === WorkStatus.ASSIGNED).length;
    const completed = myAssignments.filter(c => c.workStatus === WorkStatus.COMPLETED).length;
    return { active, pending, completed };
  }, [myAssignments]);

  const displayedJobs = useMemo(() => {
    if (filter === 'ACTIVE') return myAssignments.filter(c => c.workStatus === WorkStatus.IN_PROGRESS || c.workStatus === WorkStatus.WORKING);
    if (filter === 'PENDING') return myAssignments.filter(c => c.workStatus === WorkStatus.ASSIGNED || c.workStatus === WorkStatus.ACCEPTED);
    return myAssignments.filter(c => c.workStatus === WorkStatus.COMPLETED);
  }, [myAssignments, filter]);

  return (
    <div className="space-y-8 text-left animate-fade-in pb-24 lg:pb-10">
      <header className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Job Control</h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">Field Specialist: {currentUser?.displayName}</p>
      </header>

      {/* MOBILE MINI STATS */}
      <div className="grid grid-cols-3 gap-3">
         <MiniStat active={filter === 'PENDING'} onClick={() => setFilter('PENDING')} label="Pending" count={stats.pending} color="text-amber-500" />
         <MiniStat active={filter === 'ACTIVE'} onClick={() => setFilter('ACTIVE')} label="Working" count={stats.active} color="text-brand-blue" />
         <MiniStat active={filter === 'COMPLETED'} onClick={() => setFilter('COMPLETED')} label="Done" count={stats.completed} color="text-emerald-500" />
      </div>

      {/* JOBS LIST */}
      <section className="space-y-4">
        {displayedJobs.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center shadow-sm">
             <Clock size={40} className="mx-auto text-slate-100 mb-6" />
             <p className="text-slate-400 font-bold text-xs">No signals in this segment.</p>
          </div>
        ) : (
          displayedJobs.map(c => (
            <div 
              key={c.id} 
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6 hover:shadow-xl transition-all"
            >
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-brand-blue text-lg">
                      {c.companyName.charAt(0)}
                    </div>
                    <div>
                       <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none">{c.companyName}</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{c.address || 'Location Hidden'}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${c.workStatus === WorkStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-blue/5 text-brand-blue'}`}>
                    {c.workStatus}
                  </div>
               </div>

               {/* MOBILE ACTION BUTTONS */}
               <div className="grid grid-cols-3 gap-3 pt-2">
                  <ActionButton icon={<Phone size={16}/>} label="Call" onClick={(e) => { e.stopPropagation(); window.location.href=`tel:${c.phone}`; }} color="bg-brand-blue" />
                  <ActionButton icon={<Map size={16}/>} label="Nav" onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`, '_blank'); }} color="bg-indigo-600" />
                  <ActionButton icon={<ChevronRight size={16}/>} label="Open" onClick={() => onNavigate('project-detail', c.id)} color="bg-slate-900" />
               </div>
            </div>
          ))
        )}
      </section>

      {/* OPS PILLAR FOOTER */}
      <div className="fixed bottom-6 left-6 right-6 lg:relative lg:bottom-0 lg:left-0 lg:right-0 bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center"><ShieldCheck size={20}/></div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest leading-none">Security Active</p>
               <p className="text-[8px] font-bold text-slate-500 mt-1 uppercase">Field Auth Cluster {new Date().getFullYear()}</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-[10px] font-black text-slate-300">Total Cycle</p>
            <p className="text-lg font-black tracking-tighter">{myAssignments.length} Jobs</p>
         </div>
      </div>
    </div>
  );
};

const MiniStat = ({ active, onClick, label, count, color }: any) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-3xl border transition-all text-left flex flex-col justify-between h-24 ${active ? 'bg-white shadow-lg border-slate-100 ring-2 ring-brand-blue/10' : 'bg-slate-50 border-transparent opacity-60'}`}
  >
    <p className={`text-[9px] font-black uppercase tracking-widest ${color}`}>{label}</p>
    <p className="text-2xl font-black text-slate-900 leading-none">{count}</p>
  </button>
);

const ActionButton = ({ icon, label, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className={`${color} text-white flex flex-col items-center justify-center gap-1 p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg`}
  >
    {icon}
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);
