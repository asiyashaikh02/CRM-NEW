
import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { MOCK_DB } from '../data/mockDb';
import { Icons } from '../constants';

export const SalesDashboard: React.FC = () => {
  const { currentUser } = useAuthContext();
  
  // Direct data access from MOCK_DB
  const leads = MOCK_DB.leads.filter(l => l.salesUserId === currentUser?.uid);
  const customers = MOCK_DB.customers.filter(c => c.salesUserId === currentUser?.uid);

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Sales Arena</h2>
        <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-[0.3em]">Engagement & Conversion Layer</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6">Active Pipeline</h3>
            <div className="space-y-4">
              {leads.length === 0 ? (
                <p className="text-slate-400 text-center py-10">No active leads in pipeline.</p>
              ) : (
                leads.map(l => (
                  <div key={l.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">{l.company}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{l.name} • ${l.potentialValue.toLocaleString()}</p>
                    </div>
                    <button onClick={() => { MOCK_DB.convertToCustomer(l.id); window.location.reload(); }} className="bg-slate-900 text-white text-[10px] font-black uppercase px-5 py-2.5 rounded-xl hover:bg-black transition-all">Convert</button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6">Asset Portfolio</h3>
            <div className="space-y-4">
               {customers.length === 0 ? (
                 <p className="text-slate-400 text-center py-10">No converted assets yet.</p>
               ) : (
                 customers.map(c => (
                   <div key={c.id} className="flex items-center justify-between p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                     <div>
                       <p className="font-bold text-slate-900">{c.name}</p>
                       <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md uppercase tracking-tighter border border-emerald-100 mt-2 inline-block">{c.status}</span>
                     </div>
                     <p className="font-black text-slate-900 text-lg">${c.billingAmount.toLocaleString()}</p>
                   </div>
                 ))
               )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Icons.Sparkles />
              <h4 className="font-black text-xs uppercase tracking-widest">Neural Advisor</h4>
            </div>
            <p className="text-slate-400 text-xs italic leading-relaxed mb-6">"Based on current industrial trends, the TechFlow expansion represents a 84% conversion probability if activated within 48h."</p>
            <button className="w-full bg-indigo-600 py-3 rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-indigo-700 transition-all">Refresh Insight</button>
          </div>
        </aside>
      </div>
    </div>
  );
};
