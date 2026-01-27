
import React, { useMemo, useState } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { Icons } from '../constants';
import { ExecutionStage, InvoiceStatus, WorkStatus, Customer } from '../types';
import { formatCurrency } from '../config/appConfig';
import { RoutePath } from '../App';
import { customerService } from '../services/customer.service';
import { useAuthContext } from '../context/AuthContext';

export const ProjectDetailsPage: React.FC<{ id: string, onNavigate: (path: RoutePath, params?: any) => void }> = ({ id, onNavigate }) => {
  const { currentUser } = useAuthContext();
  const [refresh, setRefresh] = useState(0);
  
  const project = useMemo(() => {
    return MOCK_DB.customers.find(c => c.id === id);
  }, [id, refresh]);

  if (!project) return <div className="p-20 text-center font-black">Project Registry Node Not Found.</div>;

  const totalPaid = project.receipts.reduce((acc, r) => acc + r.amount, 0);
  const totalInvoiced = project.invoices.reduce((acc, i) => acc + i.totalAmount, 0);

  const handleUpdateStatus = async (status: WorkStatus) => {
    if (!currentUser) return;
    await customerService.updateCustomer(project.id, { workStatus: status }, currentUser.uid, currentUser.displayName);
    setRefresh(r => r + 1);
  };

  return (
    <div className="space-y-12 text-left animate-fade-in pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <button onClick={() => onNavigate('projects')} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            Return to Registry
          </button>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{project.companyName}</h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-[0.4em]">Node Index: {project.id}</p>
        </div>
        <div className="flex gap-4">
           <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${project.executionStage === ExecutionStage.CLOSED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-600 text-white border-indigo-600'}`}>{project.executionStage}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           {/* Financial Health */}
           <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-10">
              <StatItem label="Total Order Value" value={formatCurrency(project.billingAmount)} />
              <StatItem label="Invoiced Total" value={formatCurrency(totalInvoiced)} color="text-indigo-600" />
              <StatItem label="Amount Secured" value={formatCurrency(totalPaid)} color="text-emerald-500" />
           </section>

           {/* Execution Logs */}
           <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-xl font-black tracking-tight mb-8">Activity Audit Log</h3>
              <div className="space-y-6">
                {project.activityLogs.length === 0 ? (
                  <p className="text-slate-400 italic text-xs py-10 text-center">No telemetry logs recorded.</p>
                ) : (
                  project.activityLogs.map(log => (
                    <div key={log.id} className="flex gap-6 relative group">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0 font-bold text-[10px]">LOG</div>
                       <div className="space-y-1 pb-6 border-b border-slate-50 dark:border-slate-800 flex-1">
                          <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{log.action.replace('_', ' ')}</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">{log.note}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">{log.createdByName} • {new Date(log.createdAt).toLocaleString()}</p>
                       </div>
                    </div>
                  ))
                )}
              </div>
           </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
           {/* Actions / Meta */}
           <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
              <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Operations Control</p>
                 <select 
                   value={project.workStatus} 
                   onChange={(e) => handleUpdateStatus(e.target.value as WorkStatus)}
                   className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-black text-[10px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-600"
                 >
                    <option value={WorkStatus.ASSIGNED}>Assigned</option>
                    <option value={WorkStatus.IN_PROGRESS}>In Progress</option>
                    <option value={WorkStatus.ON_HOLD}>On Hold</option>
                    <option value={WorkStatus.COMPLETED}>Completed</option>
                 </select>
              </div>

              <div className="pt-8 border-t border-slate-50 dark:border-slate-800 space-y-6">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Contact Parameters</p>
                 <MetaRow label="Point of Contact" val={project.name} />
                 <MetaRow label="Digital Channel" val={project.email} />
                 <MetaRow label="Signal Stream" val={project.phone} />
                 <MetaRow label="Geographic HQ" val={project.location.city + ', ' + project.location.state} />
              </div>
           </section>

           <div className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-1000"><Icons.Sparkles /></div>
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Neural Summary</p>
              <p className="text-xs font-medium leading-relaxed italic opacity-90">"Registry node is healthy. Advance capital secured. Optimized for next-stage deployment."</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, color = 'text-slate-900 dark:text-white' }: any) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className={`text-2xl font-black tracking-tighter ${color}`}>{value}</p>
  </div>
);

const MetaRow = ({ label, val }: any) => (
  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
    <span className="text-slate-400">{label}</span>
    <span className="text-slate-900 dark:text-white">{val}</span>
  </div>
);
