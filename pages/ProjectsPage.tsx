
import React, { useState, useMemo } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { Icons } from '../constants';
import { ExecutionStage, CustomerStatus, WorkStatus } from '../types';
import { formatCurrency } from '../config/appConfig';
import { RoutePath } from '../App';
import { CountdownTimer } from '../components/CountdownTimer';

export const ProjectsPage: React.FC<{ isFlow?: boolean, params?: any, onNavigate: (path: RoutePath, params?: any) => void }> = ({ isFlow, params, onNavigate }) => {
  const [view, setView] = useState<'LIST' | 'FLOW'>(isFlow ? 'FLOW' : 'LIST');
  const [search, setSearch] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const projects = useMemo(() => {
    MOCK_DB.checkDeadlines();
    let list = MOCK_DB.customers;
    if (params?.status === 'active') list = list.filter(c => c.executionStage !== ExecutionStage.CLOSED);
    if (params?.status === 'delayed') list = list.filter(c => c.workStatus === WorkStatus.ON_HOLD);
    if (params?.stage) list = list.filter(c => c.executionStage === params.stage);
    
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => c.companyName.toLowerCase().includes(s) || c.name.toLowerCase().includes(s));
    }
    return list;
  }, [params, search, refreshTrigger]);

  const handleDeadlineExpire = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-12 text-left animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Project Hub</h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-[0.3em]">Operational Oversight Node</p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <button onClick={() => setView('LIST')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'LIST' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Registry List</button>
           <button onClick={() => setView('FLOW')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'FLOW' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Pipeline Flow</button>
        </div>
      </div>

      {view === 'FLOW' ? (
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
           <FlowColumn title="Initiated" projects={projects.filter(p => p.executionStage === ExecutionStage.PLANNING)} color="bg-slate-400" onNavigate={onNavigate} onExpire={handleDeadlineExpire} />
           <FlowColumn title="In Progress" projects={projects.filter(p => p.executionStage === ExecutionStage.EXECUTION)} color="bg-orange-500" onNavigate={onNavigate} onExpire={handleDeadlineExpire} />
           <FlowColumn title="Delivered" projects={projects.filter(p => p.executionStage === ExecutionStage.DELIVERED)} color="bg-indigo-500" onNavigate={onNavigate} onExpire={handleDeadlineExpire} />
           <FlowColumn title="Finalized" projects={projects.filter(p => p.executionStage === ExecutionStage.CLOSED)} color="bg-emerald-500" onNavigate={onNavigate} onExpire={handleDeadlineExpire} />
        </section>
      ) : (
        <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
           <div className="mb-10 relative max-w-md">
              <input type="text" placeholder="Filter project registry..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 pl-12 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all" />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Operations /></div>
           </div>
           <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="py-20 text-center font-bold text-slate-300">Registry empty for current telemetry signals.</div>
              ) : (
                projects.map(p => (
                  <div key={p.id} onClick={() => onNavigate('project-detail', { id: p.id })} className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-indigo-400 transition-all cursor-pointer group shadow-sm hover:shadow-md relative overflow-hidden">
                     <div className="flex items-center gap-6 mb-4 md:mb-0">
                        <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all text-xl">{p.companyName.charAt(0)}</div>
                        <div>
                           <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{p.companyName}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{p.name} • {p.id.slice(-6)}</p>
                        </div>
                     </div>
                     <div className="flex flex-wrap items-center gap-10 w-full md:w-auto">
                        {p.status === CustomerStatus.CONVERTING && (
                           <div className="flex flex-col items-center px-6 py-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                              <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Acquisition Window</p>
                              <CountdownTimer deadline={p.conversionDeadline} onExpire={handleDeadlineExpire} className="text-sm" />
                           </div>
                        )}
                        <div className="text-left md:text-right flex-1 min-w-[120px]">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue Hub</p>
                           <p className="text-base font-black text-indigo-600">{formatCurrency(p.billingAmount)}</p>
                        </div>
                        <div className="flex flex-col items-end flex-1 min-w-[120px]">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Deployment Phase</p>
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${p.executionStage === ExecutionStage.CLOSED ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>{p.executionStage}</span>
                        </div>
                     </div>
                  </div>
                ))
              )}
           </div>
        </section>
      )}
    </div>
  );
};

const FlowColumn = ({ title, projects, color, onNavigate, onExpire }: any) => (
  <div className="space-y-6">
     <div className="flex items-center gap-3 px-4">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</h4>
        <span className="ml-auto text-[9px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{projects.length}</span>
     </div>
     <div className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800 space-y-4 min-h-[500px]">
        {projects.map((p: any) => (
          <div key={p.id} onClick={() => onNavigate('project-detail', { id: p.id })} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all cursor-pointer group animate-in slide-in-from-bottom duration-300">
             <div className="flex justify-between items-start mb-2">
                <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">{p.name}</p>
                {p.status === CustomerStatus.CONVERTING && (
                  <CountdownTimer deadline={p.conversionDeadline} onExpire={onExpire} className="text-[9px]" />
                )}
             </div>
             <h5 className="font-black text-slate-900 dark:text-white leading-tight">{p.companyName}</h5>
             <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-400">{formatCurrency(p.billingAmount)}</p>
                <Icons.Sparkles />
             </div>
          </div>
        ))}
     </div>
  </div>
);
