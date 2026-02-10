
import React, { useMemo, useState } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { CustomerStatus, UserRole, WorkStatus, RoutePath, PaymentMode } from '../types';
import { formatCurrency } from '../config/appConfig';
import { useAuthContext } from '../context/AuthContext';
import { 
  ArrowLeft, Send, CheckCircle, Clock, 
  FileText, ChevronRight, Ban, ThumbsUp, 
  IndianRupee, Plus, ShieldAlert, Lock, MapPin, 
  Zap, Workflow
} from 'lucide-react';

export const ProjectDetailsPage: React.FC<{ id: string, onNavigate: (path: RoutePath, params?: any) => void }> = ({ id, onNavigate }) => {
  const { currentUser } = useAuthContext();
  const [refresh, setRefresh] = useState(0);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  
  // Payment Form State
  const [payForm, setPayForm] = useState({ amount: '', mode: PaymentMode.UPI, reference: '' });

  const project = useMemo(() => MOCK_DB.customers.find(c => c.id === id), [id, refresh]);

  if (!project) return <div className="p-20 text-center font-black">Node Signal Terminated.</div>;

  const handleApprove = () => {
    MOCK_DB.approveCustomer(project.id, currentUser!);
    setRefresh(r => r + 1);
  };

  const handleReject = () => {
    if (!rejectReason) {
      setShowRejectInput(true);
      return;
    }
    MOCK_DB.rejectCustomer(project.id, currentUser!, rejectReason);
    setShowRejectInput(false);
    setRefresh(r => r + 1);
  };

  const handleTransfer = (opsUserId: string) => {
    MOCK_DB.assignOps(project.id, opsUserId);
    setShowTransferModal(false);
    setRefresh(r => r + 1);
  };

  const handleWorkStatusUpdate = (status: WorkStatus) => {
    MOCK_DB.updateWorkStatus(project.id, status, currentUser!.displayName);
    setRefresh(r => r + 1);
  };

  const handleAdminOverrideStatus = (status: WorkStatus) => {
    MOCK_DB.updateWorkStatus(project.id, status, `MASTER_OVERRIDE: ${currentUser!.displayName}`);
    setRefresh(r => r + 1);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    MOCK_DB.addPayment(project.id, parseFloat(payForm.amount), payForm.mode, payForm.reference, currentUser!.displayName);
    setPayForm({ amount: '', mode: PaymentMode.UPI, reference: '' });
    setShowPaymentModal(false);
    setRefresh(r => r + 1);
  };

  const totalPaid = useMemo(() => {
    return project.payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  }, [project.payments]);

  const settlementPercentage = Math.min(100, Math.round((totalPaid / project.finalPrice) * 100));

  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isOpsAssigned = currentUser?.uid === project.opsId;
  const isSalesOwner = currentUser?.uid === project.createdBy;
  const isPending = project.status === CustomerStatus.PENDING_APPROVAL;
  
  // Strict Permission Check: Once approved, Sales loses edit access.
  const salesLocked = isSalesOwner && project.status !== CustomerStatus.PENDING_APPROVAL && project.status !== CustomerStatus.APPROVED;

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-left animate-fade-in pb-20">
      {/* Workflow Tracker */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between overflow-x-auto no-scrollbar gap-8">
         <Step active={true} complete={project.status !== CustomerStatus.PENDING_APPROVAL} label="Created" icon={<Plus size={14}/>} />
         <Step active={project.status === CustomerStatus.PENDING_APPROVAL} complete={project.status === CustomerStatus.APPROVED || project.status === CustomerStatus.TRANSFERRED_TO_OPS || project.status === CustomerStatus.COMPLETED} label="Approval" icon={<CheckCircle size={14}/>} />
         <Step active={project.status === CustomerStatus.APPROVED} complete={project.status === CustomerStatus.TRANSFERRED_TO_OPS || project.status === CustomerStatus.COMPLETED} label="Ops Handoff" icon={<Send size={14}/>} />
         <Step active={project.status === CustomerStatus.TRANSFERRED_TO_OPS} complete={project.status === CustomerStatus.COMPLETED} label="Execution" icon={<Zap size={14}/>} />
         <Step active={project.status === CustomerStatus.COMPLETED} complete={settlementPercentage === 100} label="Finalized" icon={<Workflow size={14}/>} />
      </div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <button onClick={() => onNavigate('customers')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-blue mb-4 transition-colors">
            <ArrowLeft size={14} /> Registry Index
          </button>
          <div className="flex items-center gap-3">
             <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">{project.companyName}</h2>
             {salesLocked && <Lock size={20} className="text-slate-300" title="Locked for Ops Ownership" />}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border ${
              project.status === CustomerStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
              project.status === CustomerStatus.TRANSFERRED_TO_OPS ? 'bg-brand-blue/5 text-brand-blue border-brand-blue/10' :
              'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              {project.status.replace(/_/g, ' ')}
            </span>
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"><MapPin size={12}/> {project.address || 'Location Unknown'}</span>
          </div>
        </div>

        <div className="flex gap-3">
          {isAdmin && isPending && (
            <>
              <button onClick={handleApprove} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-2"><ThumbsUp size={16} /> Authorize</button>
              <button onClick={() => setShowRejectInput(true)} className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-rose-700 transition-all flex items-center gap-2"><Ban size={16} /> Reject</button>
            </>
          )}

          {isSalesOwner && project.status === CustomerStatus.APPROVED && (
            <button onClick={() => setShowTransferModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-brand-blue transition-all flex items-center gap-3 active:scale-95"><Send size={16} /> Transfer to Ops</button>
          )}

          {isOpsAssigned && (
            <button onClick={() => setShowPaymentModal(true)} className="bg-brand-blue text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-brand-dark transition-all flex items-center gap-3 active:scale-95"><Plus size={16} /> Log Payment</button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           {/* EXECUTION HUB */}
           {(isOpsAssigned || isAdmin) && (
             <section className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-8 shadow-2xl border-l-[12px] border-brand-blue">
                <div className="flex justify-between items-center">
                   <div>
                      <h3 className="text-2xl font-black tracking-tight leading-none">Execution Terminal</h3>
                      <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-2">Ownership: {isOpsAssigned ? 'Direct Control' : 'Master Admin Override'}</p>
                   </div>
                   <div className="flex gap-3">
                      <StatusButton active={project.workStatus === WorkStatus.ACCEPTED} label="Accept" onClick={() => handleWorkStatusUpdate(WorkStatus.ACCEPTED)} />
                      <StatusButton active={project.workStatus === WorkStatus.IN_PROGRESS} label="Executing" onClick={() => handleWorkStatusUpdate(WorkStatus.IN_PROGRESS)} />
                      <StatusButton active={project.workStatus === WorkStatus.COMPLETED} label="Complete" onClick={() => handleWorkStatusUpdate(WorkStatus.COMPLETED)} />
                   </div>
                </div>
             </section>
           )}

           {/* Financial Ledger */}
           <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
              <div className="flex justify-between items-end">
                 <div>
                    <h3 className="text-xl font-black tracking-tight leading-none mb-4">Financial Ledger</h3>
                    <div className="flex items-center gap-4">
                       <div className="w-48 h-2 bg-slate-50 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${settlementPercentage}%` }}></div>
                       </div>
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{settlementPercentage}% Settled</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Outstanding Yield</p>
                    <p className="text-3xl font-black text-rose-500 tracking-tighter">₹{(project.finalPrice - totalPaid).toLocaleString()}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <Stat label="Project Value" val={formatCurrency(project.finalPrice)} color="text-slate-900" />
                 <Stat label="Total Collected" val={formatCurrency(totalPaid)} color="text-emerald-600" />
                 <Stat label="Capacity" val={`${project.plantCapacity} kW`} />
                 <Stat label="Sales Rate" val={project.selectedPlan} color="text-slate-400" />
              </div>

              {project.payments.length > 0 && (
                <div className="pt-8 border-t border-slate-50 space-y-4">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Transaction Audit</p>
                   {project.payments.map((p: any) => (
                     <div key={p.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 transition-all group">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-blue shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-all"><IndianRupee size={18} /></div>
                           <div>
                              <p className="text-sm font-black text-slate-900">₹{p.amount.toLocaleString()}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.mode} • Ref: {p.reference}</p>
                           </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(p.createdAt).toLocaleDateString()}</p>
                     </div>
                   ))}
                </div>
              )}
           </section>

           <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 overflow-hidden relative">
              <h3 className="text-xl font-black tracking-tight leading-none">Event Registry</h3>
              <div className="space-y-10 relative">
                 <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                 {project.timeline.slice().reverse().map((entry, idx) => (
                    <div key={idx} className="flex gap-8 relative z-10">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                        entry.action === 'APPROVED' ? 'bg-emerald-500 text-white' : 
                        entry.action === 'PAYMENT_RECORDED' ? 'bg-brand-blue text-white' :
                        'bg-white text-slate-400 border border-slate-100'
                      }`}>
                        {entry.action === 'PAYMENT_RECORDED' ? <IndianRupee size={14} /> : <Zap size={14} />}
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{entry.action.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-slate-900 font-bold leading-relaxed">{entry.remarks}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase mt-2 tracking-widest">{entry.userName} • {new Date(entry.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                 ))}
              </div>
           </section>
        </div>

        <aside className="lg:col-span-4 space-y-8">
           {isAdmin && (
              <div className="bg-amber-50 p-8 rounded-[3rem] border border-amber-200 space-y-6">
                 <div className="flex items-center gap-3 text-amber-700">
                    <ShieldAlert size={18} />
                    <h3 className="text-xs font-black tracking-tight uppercase">Master Override</h3>
                 </div>
                 <div className="grid grid-cols-1 gap-3">
                    <OverrideButton label="Force Job Closure" onClick={() => handleAdminOverrideStatus(WorkStatus.COMPLETED)} />
                    <OverrideButton label="Reset Progress" onClick={() => handleAdminOverrideStatus(WorkStatus.IN_PROGRESS)} />
                 </div>
              </div>
           )}

           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><FileText size={14}/> Node Meta</h4>
              <div className="space-y-4">
                 <SideMeta label="Plan Type" val={project.selectedPlan} />
                 <SideMeta label="Lead Origin" val={project.createdBy} />
                 <SideMeta label="Registry ID" val={project.customerId} />
                 <SideMeta label="Assigned Ops" val={project.assignedOps || 'PENDING'} />
              </div>
           </div>
           
           <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-4">Operations Status</h4>
              <p className="text-xs font-medium leading-relaxed opacity-70 italic">"Registry handoff confirmed. Financial settlement is the primary objective of this unit node."</p>
           </div>
        </aside>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl border border-slate-200 relative">
              <button onClick={() => setShowPaymentModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-rose-500 transition-colors font-black">✕</button>
              <h3 className="text-2xl font-black tracking-tighter mb-2">Record Settlement</h3>
              <p className="text-slate-500 text-xs font-medium mb-10 italic leading-relaxed">Financial reconciliation required for project closure.</p>
              
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Settlement Amount (₹)</label>
                    <input required type="number" placeholder="50000" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xl font-black focus:ring-2 focus:ring-brand-blue outline-none" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Channel Mode</label>
                    <select value={payForm.mode} onChange={e => setPayForm({...payForm, mode: e.target.value as PaymentMode})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs font-bold outline-none">
                       <option value={PaymentMode.UPI}>UPI Registry</option>
                       <option value={PaymentMode.CASH}>Physical Handoff</option>
                       <option value={PaymentMode.TRANSFER}>Bank Protocol</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Transaction ID / Reference</label>
                    <input required placeholder="TXN-998877" value={payForm.reference} onChange={e => setPayForm({...payForm, reference: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs font-bold focus:ring-2 focus:ring-brand-blue outline-none" />
                 </div>
                 <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">Verify & Record Transaction</button>
              </form>
           </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl border border-slate-200">
              <h3 className="text-2xl font-black tracking-tighter mb-2">Ops Handoff</h3>
              <p className="text-slate-400 text-xs font-medium mb-10">Assigning unit ownership to an operations specialist.</p>
              <div className="space-y-4 mt-6">
                 {MOCK_DB.users.filter(u => u.role === UserRole.OPS).map(u => (
                   <button key={u.uid} onClick={() => handleTransfer(u.uid)} className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-brand-blue hover:text-white transition-all group">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-brand-blue shadow-sm">{u.displayName.charAt(0)}</div>
                       <p className="font-bold text-sm text-left">{u.displayName}</p>
                     </div>
                     <ChevronRight size={14} className="text-slate-300 group-hover:text-white" />
                   </button>
                 ))}
                 <button onClick={() => setShowTransferModal(false)} className="w-full py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest mt-4">Cancel Registry Transfer</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const Step = ({ active, complete, label, icon }: any) => (
  <div className={`flex items-center gap-3 shrink-0 py-2 px-4 rounded-2xl transition-all ${active ? 'bg-slate-900 text-white shadow-xl' : complete ? 'text-emerald-500' : 'text-slate-300 opacity-50'}`}>
     <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${active ? 'bg-brand-blue' : complete ? 'bg-emerald-50' : 'bg-slate-50'}`}>
        {complete ? <CheckCircle size={14} /> : icon}
     </div>
     <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
     {!active && !complete && <div className="w-2 h-2 rounded-full bg-slate-100"></div>}
  </div>
);

const StatusButton = ({ active, label, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-brand-blue text-white shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-white hover:bg-slate-700'}`}
  >
    {label}
  </button>
);

const OverrideButton = ({ label, onClick }: any) => (
  <button onClick={onClick} className="px-4 py-3 bg-white border border-amber-200 text-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all shadow-sm">
    {label}
  </button>
);

const Stat = ({ label, val, color = 'text-slate-900' }: any) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`text-base font-black tracking-tight ${color}`}>{val}</p>
  </div>
);

const SideMeta = ({ label, val }: any) => (
  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest border-b border-slate-50 pb-2 last:border-0">
    <span className="text-slate-400">{label}</span>
    <span className="text-slate-900 truncate ml-2">{val}</span>
  </div>
);
