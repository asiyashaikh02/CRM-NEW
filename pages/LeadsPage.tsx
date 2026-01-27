
import React, { useState, useMemo } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { Icons } from '../constants';
import { LeadStatus, LeadSource, LeadPriority } from '../types';
import { formatCurrency } from '../config/appConfig';
import { RoutePath } from '../App';

export const LeadsPage: React.FC<{ params?: any, onNavigate: (path: RoutePath, params?: any) => void }> = ({ params, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'NETWORK' | 'CONVERTED'>(params?.source === 'network' ? 'NETWORK' : 'ALL');
  const [search, setSearch] = useState('');

  const filteredLeads = useMemo(() => {
    let list = MOCK_DB.leads;
    if (activeTab === 'NETWORK') list = list.filter(l => l.source === 'network' || l.source === LeadSource.WEBSITE);
    if (activeTab === 'CONVERTED') list = list.filter(l => l.status === LeadStatus.CONVERTED);
    
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(l => l.companyName.toLowerCase().includes(s) || l.name.toLowerCase().includes(s));
    }
    return list;
  }, [activeTab, search]);

  return (
    <div className="space-y-12 text-left animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Leads Registry</h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold mt-2 uppercase text-xs tracking-[0.3em]">Pipeline Management Node</p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <TabBtn label="All Signal" active={activeTab === 'ALL'} onClick={() => setActiveTab('ALL')} />
           <TabBtn label="Network Only" active={activeTab === 'NETWORK'} onClick={() => setActiveTab('NETWORK')} />
           <TabBtn label="Converted Assets" active={activeTab === 'CONVERTED'} onClick={() => setActiveTab('CONVERTED')} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="mb-8 relative max-w-md">
           <input type="text" placeholder="Search company or contact..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 pl-12 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all" />
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Leads /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
           {filteredLeads.length === 0 ? (
             <div className="col-span-full py-20 text-center text-slate-400 italic font-bold">No leads matching current telemetry signals.</div>
           ) : (
             filteredLeads.map(l => (
               <div key={l.id} className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 hover:border-indigo-200 transition-all group">
                 <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">🌐</div>
                    <span className={`text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest border ${l.priority === LeadPriority.HIGH ? 'bg-rose-50 text-rose-500' : 'bg-white text-slate-400'}`}>{l.priority}</span>
                 </div>
                 <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{l.companyName}</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{l.name} • {l.source}</p>
                 <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <p className="text-2xl font-black text-indigo-600">{formatCurrency(l.potentialValue)}</p>
                    <button className="p-3 bg-white dark:bg-slate-900 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm"><Icons.Sparkles /></button>
                 </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
};

const TabBtn = ({ label, active, onClick }: any) => (
  <button onClick={onClick} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{label}</button>
);
