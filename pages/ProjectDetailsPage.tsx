
import React, { useMemo, useState } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { Icons } from '../constants';
import { ExecutionStage, WorkStatus, CustomerStatus, PaymentMode, InvoiceType } from '../types';
import { formatCurrency } from '../config/appConfig';
import { RoutePath } from '../App';
import { useAuthContext } from '../context/AuthContext';
import { CountdownTimer } from '../components/CountdownTimer';

export const ProjectDetailsPage: React.FC<{ id: string, onNavigate: (path: RoutePath, params?: any) => void }> = ({ id, onNavigate }) => {
  const { currentUser } = useAuthContext();
  const [refresh, setRefresh] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const project = useMemo(() => {
    MOCK_DB.checkDeadlines();
    return MOCK_DB.customers.find(c => c.id === id);
  }, [id, refresh]);

  if (!project) return <div className="p-20 text-center font-black">Project Registry Node Not Found.</div>;

  const totalCollected = project.payments.reduce((acc, p) => acc + p.amount, 0);
  const balance = Math.max(0, project.billingAmount - totalCollected);
  const collectionPercent = (totalCollected / project.billingAmount) * 100;

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const amount = Number(formData.get('amount'));
    const type = formData.get('type') as InvoiceType;
    const mode = formData.get('mode') as PaymentMode;
    
    if (amount > 0 && currentUser) {
      MOCK_DB.recordPayment(project.id, { amount, type, mode, notes: formData.get('notes') as string }, currentUser);
      setIsPaymentModalOpen(false);
      setRefresh(r => r + 1);
    }
  };

  const handleCompleteTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && selectedTask) {
      // Simulate proof upload with dummy URLs
      const proofs = ["https://picsum.photos/400/300", "https://picsum.photos/400/301"];
      MOCK_DB.completeTask(project.id, selectedTask.id, proofs, currentUser);
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      setRefresh(r => r + 1);
    }
  };

  return (
    <div className="space-y-12 text-left animate-fade-in pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="flex-1">
          <button onClick={() => onNavigate('projects')} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            Registry Index
          </button>
          <div className="flex items-center gap-6">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{project.companyName}</h2>
            {project.status === CustomerStatus.CONVERTING && (
              <div className="bg-slate-900 px-4 py-2 rounded-2xl border border-white/5 shadow-xl">
                 <p className="text-[7px] font-black uppercase text-slate-500 mb-0.5">Acquisition Deadline</p>
                 <CountdownTimer deadline={project.conversionDeadline} className="text-lg" />
              </div>
            )}
          </div>
          <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-[0.4em]">Project UID: {project.id}</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => setIsPaymentModalOpen(true)} className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl shadow-emerald-600/10 active:scale-95 transition-all">₹ Record Payment</button>
           <span className={`px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border ${project.executionStage === ExecutionStage.CLOSED ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-indigo-600 text-white border-indigo-600'}`}>{project.executionStage}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           {/* Financial Ledger Card */}
           <section className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="text-xl font-black tracking-tight">Financial Ledger</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Capital Accumulation Protocol</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Total Order Value</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(project.billingAmount)}</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-10">
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Collected Capital</p>
                       <p className="text-xl font-black">{formatCurrency(totalCollected)}</p>
                    </div>
                    <div className="h-4 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden p-1 border border-slate-100 dark:border-slate-700">
                       <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${collectionPercent}%` }} />
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 text-right uppercase">{collectionPercent.toFixed(1)}% Secured</p>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                       <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Remaining Balance</p>
                       <p className="text-2xl font-black mt-1">{formatCurrency(balance)}</p>
                    </div>
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">₹</div>
                 </div>
              </div>

              {/* Payments History List */}
              <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 pb-2">Recent Capital Inflows</p>
                 {project.payments.length === 0 ? (
                   <p className="py-8 text-center text-slate-300 italic text-xs font-bold">No payment signals recorded yet.</p>
                 ) : (
                   project.payments.map(p => (
                     <div key={p.id} className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl group border border-transparent hover:border-emerald-100 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">📄</div>
                           <div>
                              <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{p.type} PAYMENT</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{p.id} • {p.mode}</p>
                           </div>
                        </div>
                        <div className="text-right flex items-center gap-6">
                           <div>
                              <p className="text-sm font-black text-indigo-600">{formatCurrency(p.amount)}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(p.createdAt).toLocaleDateString()}</p>
                           </div>
                           <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Icons.Sparkles /></button>
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </section>

           {/* Milestone Tasks Section */}
           <section className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-xl font-black tracking-tight">Milestone Execution</h3>
                 <span className="text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg">Operational Node</span>
              </div>
              <div className="space-y-6">
                 {project.tasks.map(task => (
                   <div key={task.id} className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden group">
                      {task.status === 'COMPLETED' && <div className="absolute top-0 right-0 p-4 bg-emerald-500 text-white text-[8px] font-black uppercase rounded-bl-2xl">Verified</div>}
                      <div className="flex items-center gap-6">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-white dark:bg-slate-900 text-slate-400'}`}>
                           {task.status === 'COMPLETED' ? '✅' : '⚙️'}
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{task.milestoneLinked ? `${task.milestoneLinked} Milestone` : 'Project Task'}</p>
                            <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{task.name}</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">Assigned to: {task.assignedToName}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto">
                         {task.status !== 'COMPLETED' ? (
                           <button 
                             onClick={() => { setSelectedTask(task); setIsTaskModalOpen(true); }}
                             className="w-full md:w-auto bg-slate-900 dark:bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                           >
                              <Icons.Sparkles /> Mark Completed
                           </button>
                         ) : (
                           <div className="flex gap-2">
                              {task.proofs.map((p: any, i: number) => (
                                <div key={i} className="w-10 h-10 bg-slate-200 rounded-lg overflow-hidden border border-white dark:border-slate-800 hover:scale-110 transition-transform cursor-pointer shadow-sm">
                                   <img src={p.url} className="w-full h-full object-cover opacity-80" />
                                </div>
                              ))}
                           </div>
                         )}
                      </div>
                   </div>
                 ))}
              </div>
           </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
           {/* System Activity Hub */}
           <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-black tracking-tight mb-8">Authority Logs</h3>
              <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-50 dark:before:bg-slate-800">
                {project.activityLogs.map(log => (
                  <div key={log.id} className="flex gap-6 relative">
                     <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-900 flex items-center justify-center text-[10px] z-10">
                        {log.action.includes('PAYMENT') ? '₹' : '✅'}
                     </div>
                     <div className="space-y-1 pb-2 border-b border-slate-50 dark:border-slate-800 flex-1">
                        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{log.action.replace('_', ' ')}</p>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{log.note}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(log.createdAt).toLocaleString()}</p>
                     </div>
                  </div>
                ))}
              </div>
           </section>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 border border-slate-200 dark:border-slate-800 relative">
              <button onClick={() => setIsPaymentModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-rose-500 transition-colors">✕</button>
              <h3 className="text-2xl font-black tracking-tighter mb-2">Record Payment Signal</h3>
              <p className="text-slate-400 text-xs font-medium mb-10">Initializing ledger authority update...</p>
              
              <form onSubmit={handleRecordPayment} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest">Amount (₹)</label>
                    <input name="amount" type="number" required placeholder="0" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 text-2xl font-black text-indigo-600 focus:ring-2 focus:ring-indigo-600 outline-none" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest">Payment Node</label>
                       <select name="type" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-bold text-xs outline-none">
                          <option value={InvoiceType.ADVANCE}>Advance Payment</option>
                          <option value={InvoiceType.MILESTONE}>Milestone Completion</option>
                          <option value={InvoiceType.FINAL}>Final Settlement</option>
                          <option value={InvoiceType.ADJUSTMENT}>Adjustment</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest">Signal Channel</label>
                       <select name="mode" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-bold text-xs outline-none">
                          {/* Fixed: Use string literals for PaymentMode values */}
                          <option value="UPI">UPI (Preferred)</option>
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                          <option value="CASH">Hard Currency (Cash)</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest">Internal Memo</label>
                    <input name="notes" placeholder="Transaction ID or notes..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-bold text-xs outline-none" />
                 </div>
                 <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">Authorize Capital Sync</button>
              </form>
           </div>
        </div>
      )}

      {/* Task Completion Modal */}
      {isTaskModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 border border-slate-200 dark:border-slate-800 relative">
              <button onClick={() => setIsTaskModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-rose-500 transition-colors">✕</button>
              <h3 className="text-2xl font-black tracking-tighter mb-2">Authorize Task Completion</h3>
              <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-10">{selectedTask.name}</p>
              
              <form onSubmit={handleCompleteTask} className="space-y-10">
                 <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 tracking-widest">Upload Completion Proof (Required)</label>
                    <div className="h-40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center gap-4 group hover:border-indigo-400 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-950/50">
                       <div className="text-3xl opacity-20 group-hover:scale-110 transition-transform">📸</div>
                       <p className="text-[9px] font-black uppercase text-slate-400">Select Proof Screenshots (Max 5)</p>
                    </div>
                 </div>
                 <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed italic">"SIR, verifying this completion will update the project timeline and may trigger payment requirements."</p>
                 </div>
                 <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">Lock Milestone & Proof</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const StatMini = ({ label, val }: any) => (
  <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
     <p className="text-xl font-black text-slate-900 dark:text-white">{val}</p>
  </div>
);
