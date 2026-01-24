
import React, { useState, useEffect } from 'react';
import { Customer, ExecutionStage } from '../types';
import { customerService } from '../services/customer.service';
import { Icons } from '../constants';
import { getOperationsOptimization } from '../services/geminiService';

export const OpsDashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [optimizationTip, setOptimizationTip] = useState<string>("Neural optimizer active. Analyze workstream for velocity improvements.");
  const [isOptimizing, setIsOptimizing] = useState(false);

  console.log("OpsDashboard: Render initiated");

  const fetchData = async () => {
    try {
      const c = await customerService.getCustomers();
      const activeOnes = (c as Customer[] || []).filter(cust => cust.status === 'ACTIVE');
      setCustomers(activeOnes);
    } catch (e) {
      console.error("OpsDashboard: Fetch error", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOptimize = async () => {
    if (!customers.length) {
      setOptimizationTip("Neural optimizer: No active workstreams detected for optimization.");
      return;
    }
    setIsOptimizing(true);
    // Use the first active customer as context for optimization
    const target = customers[0];
    try {
      const tips = await getOperationsOptimization(target.name, target.executionStage);
      setOptimizationTip(tips);
    } catch (error) {
      setOptimizationTip("Neural link disrupted. Optimization failed.");
    } finally {
      setIsOptimizing(false);
    }
  };

  if (isLoading) return <div className="text-slate-400 font-black uppercase tracking-widest animate-pulse">Initializing Execution Board...</div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter text-left">Ops Command</h2>
          <p className="text-slate-400 font-bold mt-2 uppercase text-xs tracking-[0.3em] text-left">Delivery & Resource Layer</p>
        </div>
        <button 
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="flex items-center gap-3 bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl disabled:opacity-50">
          <Icons.Sparkles />
          {isOptimizing ? 'Optimizing...' : 'Neural Optimization'}
        </button>
      </header>

      {(isOptimizing || optimizationTip !== "Neural optimizer active. Analyze workstream for velocity improvements.") && (
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 animate-in slide-in-from-top duration-500">
           <div className="flex items-center gap-4 mb-4">
              <Icons.Sparkles />
              <h4 className="font-black text-xs uppercase tracking-widest">AI Efficiency Insight</h4>
           </div>
           <p className={`text-indigo-100 text-sm font-bold leading-relaxed ${isOptimizing ? 'animate-pulse' : ''}`}>
             {isOptimizing ? 'Analyzing workstream velocity and phase transitions...' : optimizationTip}
           </p>
        </div>
      )}

      <section className="space-y-8 text-left">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Active Workstream</h3>
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
           <table className="w-full text-left">
             <thead className="bg-slate-50 border-b border-slate-100">
               <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                 <th className="px-10 py-6">Asset</th>
                 <th className="px-10 py-6">Execution Phase</th>
                 <th className="px-10 py-6 text-right">Burn Rate</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {customers.length === 0 ? (
                 <tr><td colSpan={3} className="px-10 py-20 text-center text-slate-300 font-bold italic">No active assets in pipeline.</td></tr>
               ) : (
                 customers.map(c => (
                   <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                     <td className="px-10 py-8">
                        <p className="font-black text-slate-900 text-base">{c.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Ref: {c.id?.toUpperCase()}</p>
                     </td>
                     <td className="px-10 py-8">
                        <select 
                          defaultValue={c.executionStage}
                          className="bg-slate-100 border-none rounded-xl text-[10px] font-black uppercase tracking-widest p-3 px-6 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none transition-all"
                        >
                           <option value={ExecutionStage.PLANNING}>Planning</option>
                           <option value={ExecutionStage.EXECUTION}>Execution</option>
                           <option value={ExecutionStage.DELIVERED}>Delivered</option>
                        </select>
                     </td>
                     <td className="px-10 py-8 text-right font-mono font-black text-rose-500 text-lg">${(c.internalCost || 0).toLocaleString()}</td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
        </div>
      </section>
    </div>
  );
};
