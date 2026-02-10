
import React, { useMemo } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { MOCK_DB } from '../data/mockDb';
import { RoutePath, UserRole, CustomerStatus } from '../types';
import { Plus, Target, ChevronRight, Briefcase, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../config/appConfig';
import { CountdownTimer } from '../components/CountdownTimer';

export const SalesDashboard: React.FC<{ onNavigate: (path: RoutePath, params?: any) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuthContext();

  const isManager = currentUser?.role === UserRole.SALES_MANAGER;

  const stats = useMemo(() => {
    MOCK_DB.checkDeadlines();
    const list = isManager 
      ? MOCK_DB.customers 
      : MOCK_DB.customers.filter(c => c.createdBy === currentUser?.uid);
    
    return {
      portfolioCount: list.length,
      totalYield: list.reduce((acc, c) => acc + (c.billingAmount || 0), 0),
      draftCount: list.filter(c => c.status === CustomerStatus.DRAFT).length,
      lockedCount: list.filter(c => c.status === CustomerStatus.LOCKED).length,
    };
  }, [currentUser, isManager]);

  const recentCustomers = useMemo(() => {
    const list = isManager 
      ? MOCK_DB.customers 
      : MOCK_DB.customers.filter(c => c.createdBy === currentUser?.uid);
    return list.slice(0, 5);
  }, [currentUser, isManager]);

  return (
    <div className="space-y-12 text-left animate-fade-in pb-20">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div className="space-y-2">
          <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">
            {isManager ? 'Sales Control' : 'Sales Core'}
          </h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">
            {isManager ? 'Manager Oversight Cluster' : 'Personal Revenue Deployment'}
          </p>
        </div>
        
        {!isManager && (
          <button 
            onClick={() => onNavigate('add-customer')}
            className="bg-brand-blue text-white px-10 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-brand-blue/30 hover:bg-brand-dark transition-all flex items-center gap-5 active:scale-95 group"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
              <Plus size={24} />
            </div>
            Initialize New Customer
          </button>
        )}
      </header>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard label="Total Portfolio" value={stats.portfolioCount} unit="Nodes" icon={<Briefcase className="text-indigo-500" />} />
        <MetricCard label="Drafting Queue" value={stats.draftCount} unit="Pending" icon={<Clock className="text-amber-500" />} />
        <MetricCard label="Locked Signals" value={stats.lockedCount} unit="Alert" icon={<AlertCircle className="text-rose-500" />} />
        <MetricCard label="Projected Yield" value={formatCurrency(stats.totalYield)} unit="Capital" icon={<TrendingUp className="text-brand-blue" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-bold font-grotesk tracking-tight text-slate-900">Recent Customer Units</h3>
              <button onClick={() => onNavigate('customers')} className="text-brand-blue font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue/5 px-4 py-2 rounded-xl transition-all flex items-center gap-2 group">
                View All Nodes <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
           
           <div className="space-y-4">
              {recentCustomers.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                  <p className="text-slate-400 font-bold italic">No active telemetry found.</p>
                </div>
              ) : (
                recentCustomers.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => onNavigate('project-detail', c.id)}
                    className="group flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-transparent hover:border-brand-blue/20 hover:bg-white hover:shadow-xl transition-all cursor-pointer"
                  >
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-brand-blue shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
                          {c.companyName.charAt(0)}
                        </div>
                        <div>
                           <p className="font-bold text-slate-900 text-base leading-none">{c.companyName}</p>
                           <div className="flex items-center gap-3 mt-2">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.status.replace(/_/g, ' ')}</span>
                             {c.status === CustomerStatus.DRAFT && (
                               <CountdownTimer deadline={c.conversionDeadline} className="text-[10px]" />
                             )}
                           </div>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="font-black text-slate-900 text-sm">{formatCurrency(c.billingAmount)}</p>
                        <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-brand-blue transition-colors mt-1" />
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl">
              <h3 className="text-xl font-black tracking-tight mb-8">Sales Protocol</h3>
              <div className="space-y-6">
                 <ProtocolLine icon={<Clock size={16}/>} label="72h Window" desc="Max draft time" />
                 <ProtocolLine icon={<Plus size={16}/>} label="Pricing" desc="Auto-calculated" />
                 <ProtocolLine icon={<Target size={16}/>} label="Locking" desc="Post-handoff block" />
              </div>
           </div>
           
           {isManager && (
             <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Manager Quick-View</h4>
                <div className="space-y-4">
                   <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                      <span className="text-xs font-bold text-slate-600">Active Execs</span>
                      <span className="text-xs font-black text-brand-blue">
                        {MOCK_DB.users.filter(u => u.role === UserRole.SALES_USER).length}
                      </span>
                   </div>
                   <button onClick={() => onNavigate('users')} className="w-full py-4 bg-slate-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-brand-blue hover:text-white transition-all">Audit Team Registry</button>
                </div>
             </div>
           )}
        </aside>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, unit, icon }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-2xl transition-all duration-300">
     <div className="space-y-1">
       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
       <div className="flex items-baseline gap-2">
         <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{value}</h3>
         <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{unit}</span>
       </div>
     </div>
     <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
       {icon}
     </div>
  </div>
);

const ProtocolLine = ({ icon, label, desc }: any) => (
  <div className="flex items-center gap-4">
     <div className="text-brand-blue">{icon}</div>
     <div>
        <p className="text-[10px] font-black uppercase tracking-widest leading-none">{label}</p>
        <p className="text-[10px] font-bold text-slate-500 mt-1">{desc}</p>
     </div>
  </div>
);
