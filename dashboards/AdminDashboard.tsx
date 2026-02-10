
import React, { useMemo } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { useAuthContext } from '../context/AuthContext';
import { UserRole, RoutePath, CustomerStatus, WorkStatus, UserStatus } from '../types';
import { Target, ClipboardList, IndianRupee, ChevronRight, ShieldAlert, Clock, Users, Zap, CheckCircle } from 'lucide-react';

const SnapshotCard = ({ title, items, onMore }: any) => (
  <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-full flex flex-col">
    <div className="flex justify-between items-center mb-6 px-2">
      <h3 className="font-bold text-lg">{title}</h3>
      <button onClick={onMore} className="text-brand-blue text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all group">
        Registry <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
    <div className="space-y-3 flex-1">
      {items.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-slate-300 text-xs italic font-bold text-center">No active signals</div>
      ) : (
        items.map((item: any, i: number) => (
          <div 
            key={i} 
            className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center border border-transparent hover:border-slate-100 hover:bg-white transition-all cursor-default"
          >
            <div>
              <p className="text-sm font-bold text-slate-900">{item.companyName || item.name || item.displayName}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {item.role ? `${item.role} Node` : `${item.selectedPlan} - ${item.plantCapacity}kW`}
              </p>
            </div>
            <span className={`text-[8px] font-black px-2.5 py-1.5 rounded-lg border uppercase tracking-widest ${
              item.status === CustomerStatus.APPROVED || item.status === UserStatus.APPROVED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
              item.status === CustomerStatus.PENDING_APPROVAL || item.status === UserStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' :
              'bg-rose-50 text-rose-600 border-rose-100'
            }`}>
              {String(item.status).replace(/_/g, ' ')}
            </span>
          </div>
        ))
      )}
    </div>
  </div>
);

export const AdminDashboard: React.FC<{ onNavigate: (path: RoutePath, id?: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuthContext();

  const stats = useMemo(() => {
    const totalRevenue = MOCK_DB.customers.reduce((acc, c) => {
      const paid = c.payments.reduce((pa, p) => pa + p.amount, 0);
      return acc + paid;
    }, 0);

    const jobOverview = {
      scheduled: MOCK_DB.customers.filter(c => c.workStatus === WorkStatus.ASSIGNED).length,
      active: MOCK_DB.customers.filter(c => c.workStatus === WorkStatus.IN_PROGRESS).length,
      completed: MOCK_DB.customers.filter(c => c.workStatus === WorkStatus.COMPLETED).length,
    };

    const userMetrics = {
      total: MOCK_DB.users.length,
      pending: MOCK_DB.users.filter(u => u.status === UserStatus.PENDING).length,
    };

    return { totalRevenue, jobOverview, userMetrics };
  }, []);

  const pendingCustomers = useMemo(() => MOCK_DB.customers.filter(c => c.status === CustomerStatus.PENDING_APPROVAL).slice(0, 4), []);
  const pendingUsers = useMemo(() => MOCK_DB.users.filter(u => u.status === UserStatus.PENDING).slice(0, 4), []);

  return (
    <div className="space-y-10 animate-fade-in text-left pb-20">
      <header>
        <h2 className="text-5xl font-black tracking-tighter leading-none">Master Control</h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-4">
          SYSTEM OVERWATCH • AUTHENTICATED AS {currentUser?.displayName}
        </p>
      </header>

      {/* PRIMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricTile label="Network Personnel" val={stats.userMetrics.total} sub={`${stats.userMetrics.pending} PENDING`} icon={<Users className="text-brand-blue" />} onClick={() => onNavigate('users')} />
        <MetricTile label="Realized Revenue" val={`₹${stats.totalRevenue.toLocaleString()}`} sub="PAID IN FULL" icon={<IndianRupee className="text-emerald-500" />} onClick={() => onNavigate('payments')} />
        <MetricTile label="Active Projects" val={stats.jobOverview.active} sub="IN EXECUTION" icon={<Zap className="text-amber-500" />} onClick={() => onNavigate('customers')} />
        <MetricTile label="Completed Jobs" val={stats.jobOverview.completed} sub="ARCHIVED" icon={<CheckCircle className="text-slate-900" />} onClick={() => onNavigate('customers')} />
      </div>

      {/* OPERATIONS OVERVIEW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl space-y-8">
              <h3 className="text-xl font-black tracking-tight">Deployment Pipeline</h3>
              <div className="space-y-6">
                 <PipelineStep label="Scheduled / Assigned" count={stats.jobOverview.scheduled} color="bg-brand-blue" />
                 <PipelineStep label="In-Progress Execution" count={stats.jobOverview.active} color="bg-amber-500" />
                 <PipelineStep label="Project Completion" count={stats.jobOverview.completed} color="bg-emerald-500" />
              </div>
           </div>
        </div>
        
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <SnapshotCard title="Authorization Queue" items={pendingCustomers} onMore={() => onNavigate('customers')} />
          <SnapshotCard title="Personnel Registry" items={pendingUsers} onMore={() => onNavigate('users')} />
        </div>
      </div>
    </div>
  );
};

const MetricTile = ({ label, val, sub, icon, onClick }: any) => (
  <div onClick={onClick} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-blue/5 transition-colors">{icon}</div>
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{sub}</p>
    </div>
    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{val}</h3>
  </div>
);

const PipelineStep = ({ label, count, color }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    </div>
    <span className="text-xl font-black">{count}</span>
  </div>
);
