
import React, { useState, useMemo } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { CustomerStatus, UserRole, RoutePath } from '../types';
import { formatCurrency } from '../config/appConfig';
import { useAuthContext } from '../context/AuthContext';
import { Search, Eye, Filter, Calculator, Lock } from 'lucide-react';

export const ProjectsPage: React.FC<{ onNavigate: (path: RoutePath, id?: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuthContext();
  const [search, setSearch] = useState('');

  const filteredProjects = useMemo(() => {
    let list = [...MOCK_DB.customers];

    // Strict Role Filtering
    if (currentUser?.role === UserRole.SALES_USER || currentUser?.role === UserRole.SALES) {
      // Sales only sees their own customers
      list = list.filter(c => c.createdBy === currentUser.uid);
    } else if (currentUser?.role === UserRole.OPS_USER || currentUser?.role === UserRole.OPS) {
      // Ops ONLY sees nodes that are assigned to them
      list = list.filter(c => c.assignedOps === currentUser.uid);
    } 
    // Sales Managers/Admins see all pertinent to their scope (Manager sees sub-nodes, Admin sees global)
    else if (currentUser?.role === UserRole.SALES_MANAGER) {
      // Sales Manager sees all sales-related leads
      list = list.filter(c => c.status !== CustomerStatus.DELETED);
    }

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => 
        c.companyName.toLowerCase().includes(s) || 
        c.name.toLowerCase().includes(s) || 
        c.customerId.toLowerCase().includes(s)
      );
    }
    return list;
  }, [currentUser, search]);

  const isOps = currentUser?.role === UserRole.OPS_USER || currentUser?.role === UserRole.OPS;

  return (
    <div className="space-y-10 text-left animate-fade-in pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Customer Registry</h2>
          <p className="text-slate-400 font-bold mt-3 uppercase text-[10px] tracking-[0.4em]">Segment Oversight Node</p>
        </div>
        {(currentUser?.role === UserRole.SALES_USER || currentUser?.role === UserRole.SALES) && (
          <button onClick={() => onNavigate('add-customer')} className="bg-brand-blue text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-brand-dark transition-all">
            Initialize New Customer
          </button>
        )}
      </header>

      <div className="flex flex-col md:flex-row gap-4">
         <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search registry by company, name or ID..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 pl-14 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue shadow-sm transition-all" 
            />
         </div>
      </div>

      <section className="space-y-4">
         {filteredProjects.length === 0 ? (
           <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100">
             <p className="font-bold text-slate-400 italic">No nodes identified in this telemetry segment.</p>
           </div>
         ) : (
           filteredProjects.map(p => (
             <div 
               key={p.id} 
               onClick={() => onNavigate('project-detail', p.id)} 
               className="flex flex-col md:flex-row items-start md:items-center justify-between p-7 bg-white rounded-[2rem] border border-slate-100 hover:border-brand-blue/30 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer group shadow-sm"
             >
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-brand-blue text-2xl uppercase group-hover:bg-brand-blue group-hover:text-white transition-all">
                     {p.companyName.charAt(0)}
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-brand-blue transition-colors">{p.companyName}</h4>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.name}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {p.customerId}</span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-8 mt-4 md:mt-0">
                   {!isOps && (
                     <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Yield</p>
                        <p className="text-lg font-black text-slate-900">{formatCurrency(p.finalPrice)}</p>
                     </div>
                   )}
                   <div className="flex flex-col items-end">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        p.status === CustomerStatus.APPROVED || p.status === CustomerStatus.TRANSFERRED_TO_OPS || p.status === CustomerStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' :
                        p.status === CustomerStatus.LOCKED ? 'bg-slate-900 text-white' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {p.status.replace(/_/g, ' ')}
                      </span>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-xl text-slate-300 group-hover:text-brand-blue transition-all">
                     <Eye size={20} />
                   </div>
                </div>
             </div>
           ))
         )}
      </section>
    </div>
  );
};
