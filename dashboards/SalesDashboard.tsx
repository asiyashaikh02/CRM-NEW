
import React, { useMemo } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { MOCK_DB } from '../data/mockDb';
// Fixed: RoutePath should be imported from types, not App
import { RoutePath } from '../types';
import { Plus, Target, ChevronRight, Briefcase, TrendingUp, Users } from 'lucide-react';
import { formatCurrency } from '../config/appConfig';

export const SalesDashboard: React.FC<{ onNavigate: (path: RoutePath, params?: any) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuthContext();

  const myStats = useMemo(() => {
    const myCustomers = MOCK_DB.customers.filter(c => c.createdBy === currentUser?.uid);
    return {
      portfolioCount: myCustomers.length,
      totalYield: myCustomers.reduce((acc, c) => acc + (c.billingAmount || 0), 0),
      activeLeads: MOCK_DB.leads.filter(l => l.salesUserId === currentUser?.uid).length
    };
  }, [currentUser]);

  const recentCustomers = useMemo(() => {
    return MOCK_DB.customers.filter(c => c.createdBy === currentUser?.uid).slice(0, 4);
  }, [currentUser]);

  return (
    <div className="space-y-12 text-left animate-fade-in">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div className="space-y-2">
          <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Sales Core</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">Revenue Deployment Hub</p>
        </div>
        
        {/* BIG PRIMARY CTA */}
        <button 
          onClick={() => onNavigate('add-customer' as any)}
          className="bg-brand-blue text-white px-10 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-brand-blue/30 hover:bg-brand-dark transition-all flex items-center gap-5 active:scale-95 group"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
            <Plus size={24} />
          </div>
          Initialize New Customer
        </button>
      </header>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <MetricCard label="Active Portfolio" value={myStats.portfolioCount} unit="Nodes" icon={<Briefcase className="text-indigo-500" />} />
        <MetricCard label="Pipeline Potential" value={myStats.activeLeads} unit="Leads" icon={<Target className="text-emerald-500" />} />
        <MetricCard label="Projected Yield" value={formatCurrency(myStats.totalYield)} unit="Capital" icon={<TrendingUp className="text-brand-blue" />} />
      </div>

      {/* RECENT ASSETS */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
         <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-bold font-grotesk tracking-tight text-slate-900">My Recent Customers</h3>
            <button onClick={() => onNavigate('customers' as any)} className="text-brand-blue font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue/5 px-4 py-2 rounded-xl transition-all flex items-center gap-2 group">
              View All Customers <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentCustomers.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                <p className="text-slate-400 font-bold italic">No active customer nodes initialized yet.</p>
                <button 
                  onClick={() => onNavigate('add-customer' as any)}
                  className="mt-4 text-brand-blue font-bold text-xs uppercase tracking-widest hover:underline"
                >
                  Create Your First Customer Now
                </button>
              </div>
            ) : (
              recentCustomers.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => onNavigate('project-detail' as any, { id: c.id })}
                  className="group flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-transparent hover:border-brand-blue/20 hover:bg-white hover:shadow-xl transition-all cursor-pointer"
                >
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-brand-blue shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
                        {c.companyName.charAt(0)}
                      </div>
                      <div>
                         <p className="font-bold text-slate-900 text-base leading-none">{c.companyName}</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{c.status.replace(/_/g, ' ')}</p>
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
    </div>
  );
};

const MetricCard = ({ label, value, unit, icon }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-2xl transition-all duration-300">
     <div className="space-y-1">
       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
       <div className="flex items-baseline gap-2">
         <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
         <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{unit}</span>
       </div>
     </div>
     <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
       {icon}
     </div>
  </div>
);
