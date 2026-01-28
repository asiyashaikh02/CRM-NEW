
import React, { useMemo } from 'react';
import { UserStatus, LeadStatus, ExecutionStage, InvoiceStatus } from '../types';
import { MOCK_DB } from '../data/mockDb';
import { Icons } from '../constants';
import { formatCurrency } from '../config/appConfig';
import { RoutePath } from '../App';

export const AdminDashboard: React.FC<{ onNavigate: (path: RoutePath, params?: any) => void }> = ({ onNavigate }) => {
  const users = MOCK_DB.users;
  const leads = MOCK_DB.leads;
  const customers = MOCK_DB.customers;

  const stats = useMemo(() => {
    MOCK_DB.checkDeadlines();
    const totalCollected = customers.reduce((acc, c) => {
      return acc + (c.payments?.reduce((sum, p) => sum + p.amount, 0) || 0);
    }, 0);

    const projectFlow = {
      initiated: customers.filter(c => c.executionStage === ExecutionStage.PLANNING).length,
      advReceived: customers.filter(c => c.payments?.some(p => p.type === 'ADVANCE')).length,
      inProgress: customers.filter(c => c.executionStage === ExecutionStage.EXECUTION).length,
      onHold: customers.filter(c => c.workStatus === 'ON_HOLD').length,
      completed: customers.filter(c => c.executionStage === ExecutionStage.CLOSED).length
    };

    return { totalCollected, projectFlow };
  }, [users, leads, customers]);

  return (
    <div className="space-y-10 text-left animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Command Control</h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[9px] tracking-[0.3em]">Network Authority Summary</p>
        </div>
        <button onClick={() => onNavigate('reports')} className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl">Full Analytics</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          label="Network Leads" 
          value={leads.filter(l => l.source === 'network').length} 
          color="indigo" 
          icon={<Icons.Leads />} 
          onClick={() => onNavigate('leads', { source: 'network' })} 
        />
        <SummaryCard 
          label="Active Pipeline" 
          value={leads.filter(l => l.status !== LeadStatus.CONVERTED).length} 
          color="blue" 
          icon={<Icons.Leads />} 
          onClick={() => onNavigate('leads')} 
        />
        <SummaryCard 
          label="Active Projects" 
          value={customers.filter(c => c.executionStage !== ExecutionStage.CLOSED).length} 
          color="emerald" 
          icon={<Icons.Operations />} 
          onClick={() => onNavigate('projects', { status: 'active' })} 
        />
        <SummaryCard 
          label="Registry Tasks" 
          value={users.filter(u => u.status === UserStatus.PENDING).length} 
          color="amber" 
          icon={<Icons.Users />} 
          onClick={() => onNavigate('users', { status: UserStatus.PENDING })} 
          pulse={users.filter(u => u.status === UserStatus.PENDING).length > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <section 
          onClick={() => onNavigate('projects-flow')}
          className="lg:col-span-8 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer group hover:border-indigo-500 transition-all"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black tracking-tight">Deployment Strategy Flow</h3>
            <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest group-hover:underline">View Pipeline Hub</span>
          </div>
          <div className="flex items-center gap-1 w-full h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl p-1 overflow-hidden">
             <FlowSegment color="bg-slate-400" count={stats.projectFlow.initiated} total={customers.length} label="Initiated" />
             <FlowSegment color="bg-blue-500" count={stats.projectFlow.advReceived} total={customers.length} label="Advance Rec" />
             <FlowSegment color="bg-orange-500" count={stats.projectFlow.inProgress} total={customers.length} label="In Progress" />
             <FlowSegment color="bg-rose-500" count={stats.projectFlow.onHold} total={customers.length} label="On Hold" />
             <FlowSegment color="bg-emerald-500" count={stats.projectFlow.completed} total={customers.length} label="Completed" />
          </div>
          <div className="grid grid-cols-5 gap-2 mt-4">
             <FlowLegend color="bg-slate-400" label="Initiated" />
             <FlowLegend color="bg-blue-500" label="Adv Paid" />
             <FlowLegend color="bg-orange-500" label="Execution" />
             <FlowLegend color="bg-rose-500" label="Delayed" />
             <FlowLegend color="bg-emerald-500" label="Finalized" />
          </div>
        </section>

        <section 
          onClick={() => onNavigate('users')}
          className="lg:col-span-4 bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col justify-between cursor-pointer hover:bg-slate-800 transition-all group shadow-2xl"
        >
           <div>
             <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Identity Node Registry</p>
             <h3 className="text-3xl font-black tracking-tighter">{users.length} Authority Nodes</h3>
           </div>
           <div className="pt-10 space-y-4">
              <UserRow label="Sales Authority" count={users.filter(u => u.role === 'SALES').length} onClick={() => onNavigate('users', { role: 'SALES' })} />
              <UserRow label="Ops Operations" count={users.filter(u => u.role === 'OPERATIONS').length} onClick={() => onNavigate('users', { role: 'OPERATIONS' })} />
              <div className="pt-4 border-t border-white/10 flex justify-between items-center text-indigo-400 font-black text-[9px] uppercase tracking-widest group-hover:text-white transition-colors">
                 <span>Manage Node Registry</span>
                 <Icons.Sparkles />
              </div>
           </div>
        </section>
      </div>

      <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative group">
         <div className="absolute top-0 right-0 p-10 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-45 duration-1000"><Icons.Sparkles /></div>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Capital Index</p>
               <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{formatCurrency(stats.totalCollected)}</p>
            </div>
            <div className="flex gap-4">
               <div className="text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Conversion Index</p>
                  <p className="text-xl font-black text-indigo-600">84.2%</p>
               </div>
               <div className="text-right border-l border-slate-100 dark:border-slate-800 pl-4">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Task Velocity</p>
                  <p className="text-xl font-black text-emerald-500">4.2d</p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

const SummaryCard = ({ label, value, color, icon, onClick, pulse }: any) => {
  const cMap: any = { indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100', blue: 'text-blue-600 bg-blue-50 border-blue-100', emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100', amber: 'text-amber-600 bg-amber-50 border-amber-100' };
  return (
    <div onClick={onClick} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 cursor-pointer group hover:shadow-xl transition-all relative">
      <div className={`w-10 h-10 ${cMap[color]} border rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>{icon}</div>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter truncate">{value}</h3>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</p>
      {pulse && <span className="absolute top-6 right-6 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span></span>}
    </div>
  );
};

const FlowSegment = ({ color, count, total, label }: any) => {
  const width = total > 0 ? (count / total) * 100 : 0;
  if (width === 0) return null;
  return (
    <div className={`h-full ${color} rounded-lg transition-all duration-1000`} style={{ width: `${width}%` }} />
  );
};

const FlowLegend = ({ color, label }: any) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${color}`} />
    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
  </div>
);

const UserRow = ({ label, count, onClick }: any) => (
  <div onClick={(e) => { e.stopPropagation(); onClick(); }} className="flex justify-between items-center text-xs font-bold text-white/70 hover:text-white cursor-pointer transition-colors">
     <span>{label}</span>
     <span className="bg-white/10 px-2 py-0.5 rounded-lg text-[10px]">{count}</span>
  </div>
);
