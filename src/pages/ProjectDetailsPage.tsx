
import React, { useMemo, useState, useEffect } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { CustomerStatus, UserRole, WorkStatus, RoutePath, PaymentMode } from '../types';
import { formatCurrency } from '../config/appConfig';
import { useAuthContext } from '../context/AuthContext';
import { CountdownTimer } from '../components/CountdownTimer';
import { 
  ArrowLeft, Send, CheckCircle, Clock, 
  FileText, ChevronRight, Ban, ThumbsUp, 
  IndianRupee, Plus, ShieldAlert, Lock, MapPin, 
  Zap, Workflow, AlertTriangle, Phone, Map, Image
} from 'lucide-react';

export const ProjectDetailsPage: React.FC<{ id: string, onNavigate: (path: RoutePath, params?: any) => void }> = ({ id, onNavigate }) => {
  const { currentUser } = useAuthContext();
  const [refresh, setRefresh] = useState(0);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  
  const [payForm, setPayForm] = useState({ amount: '', mode: PaymentMode.UPI, reference: '', proof: null as any });

  const project = useMemo(() => {
    MOCK_DB.checkDeadlines();
    return MOCK_DB.customers.find(c => c.id === id);
  }, [id, refresh]);

  if (!project) return <div className="p-20 text-center font-black">Node Signal Terminated.</div>;

  const handleAuthorizeAndForward = () => {
    MOCK_DB.forwardToAdmin(project.id, currentUser!.displayName);
    setRefresh(r => r + 1);
  };

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
    if (!payForm.proof) {
       alert("Mandatory: Proof of Payment required for settlement.");
       return;
    }
    MOCK_DB.addPayment(project.id, parseFloat(payForm.amount), payForm.mode, payForm.reference, currentUser!.displayName, "SIMULATED_STORAGE_URL");
    setPayForm({ amount: '', mode: PaymentMode.UPI, reference: '', proof: null });
    setShowPaymentModal(false);
    setRefresh(r => r + 1);
  };

  const totalPaid = useMemo(() => {
    return project.payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  }, [project.payments]);

  const settlementPercentage = Math.min(100, Math.round((totalPaid / project.finalPrice) * 100));

  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isManager = currentUser?.role === UserRole.SALES_MANAGER || currentUser?.role === UserRole.OPS_MANAGER;
  const isOpsUser = currentUser?.role === UserRole.OPS_USER || currentUser?.role === UserRole.OPS;
  const isOpsAssigned = currentUser?.uid === project.opsId;
  const isSalesOwner = currentUser?.uid === project.createdBy;
  
  const isDraft = project.status === CustomerStatus.DRAFT;
  const isPending = project.status === CustomerStatus.PENDING_APPROVAL;
  const isLocked = project.status === CustomerStatus.LOCKED;
  const isCompleted = project.status === CustomerStatus.COMPLETED;

  // Commercial Isolation: OPS sees NO pricing
  const showCommercials = !isOpsUser || isAdmin || isManager;

  return (
    <div className="max-w-6xl mx-auto space-y-8 lg:space-y-10 text-left animate-fade-in pb-24 lg:pb-20">
      {/* Workflow Tracker (Hide on simple Ops Mobile if needed, but useful for context) */}
      <div className="bg-white p-4 lg:p-6 rounded-[2rem] lg:rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between overflow-x-auto no-scrollbar gap-6 lg:gap-8">
         <Step active={isDraft} complete={!isDraft} label="Drafting" icon={<Plus size={14}/>} />
         <Step active={isPending} complete={project.status === CustomerStatus.APPROVED || project.status === CustomerStatus.TRANSFERRED_TO_OPS || project.status === CustomerStatus.COMPLETED} label="Approval" icon={<CheckCircle size={14}/>} />
         <Step active={project.status === CustomerStatus.APPROVED} complete={project.status === CustomerStatus.TRANSFERRED_TO_OPS || project.status === CustomerStatus.COMPLETED} label="Handoff" icon={<Send size={14}/>} />
         <Step active={project.status === CustomerStatus.TRANSFERRED_TO_OPS} complete={isCompleted} label="Execution" icon={<Zap size={14}/>} />
         <Step active={isCompleted} complete={settlementPercentage === 100} label="Finalized" icon={<Workflow size={14}/>} />
      </div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <button onClick={() => onNavigate(isOpsUser ? 'dashboard' : 'customers')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-blue mb-4 transition-colors">
            <ArrowLeft size={14} /> Back to Registry
          </button>
          <div className="flex items-center gap-3">
             <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 leading-none">{project.companyName}</h2>
             {(isSalesOwner && !isDraft) && <Lock size={20} className="text-slate-300" />}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <span className={`text-[9px] lg:text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border ${
              isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
              project.status === CustomerStatus.TRANSFERRED_TO_OPS ? 'bg-brand-blue/5 text-brand-blue border-brand-blue/10' :
              'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              {project.status.replace(/_/g, ' ')}
            </span>
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 truncate max-w-[200px]"><MapPin size={12}/> {project.address || 'Location Hidden'}</span>
          </div>
        </div>

        <div className="flex gap-2 lg:gap-3 w-full lg:w-auto">
          {isSalesOwner && isDraft && (
            <button onClick={handleAuthorizeAndForward} className="flex-1 lg:flex-none bg-brand-blue text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95">Forward</button>
          )}
          {(isAdmin || isManager) && isPending && (
            <>
              <button onClick={handleApprove} className="bg-emerald-600 text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase">Approve</button>
              <button onClick={() => setShowRejectInput(true)} className="bg-rose-600 text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase">Reject</button>
            </>
          )}
          {(isAdmin || isManager) && project.status === CustomerStatus.APPROVED && (
            <button onClick={() => setShowTransferModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase">Transfer Ops</button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-8 space-y-8 lg:space-y-10">
           
           {/* OPS MOBILE CONTEXT (Phase 4) */}
           {isOpsUser && (
             <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Specialist</p>
                   <p className="text-xl font-black text-slate-900 tracking-tight">{currentUser?.displayName}</p>
                   <p className="text-[10px] font-bold text-brand-blue uppercase mt-1">Status: {project.workStatus}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <a href={`tel:${project.phone}`} className="flex items-center justify-center gap-2 bg-brand-blue text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95">
                      <Phone size={14}/> Call Client
                   </a>
                   <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.address)}`} target="_blank" className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95">
                      <Map size={14}/> Navigation
                   </a>
                </div>
             </div>
           )}

           {/* OPS WORKFLOW STEPPER (Phase 4) */}
           {((isOpsAssigned || isAdmin) && project.status === CustomerStatus.TRANSFERRED_TO_OPS) && (
             <section className="bg-slate-900 p-8 lg:p-10 rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex flex-col gap-8 relative z-10">
                   <div>
                      <h3 className="text-2xl font-black tracking-tight leading-none">Job Execution Terminal</h3>
                      <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mt-2">Sequential Lifecycle Protocol Active</p>
                   </div>
                   
                   {/* MOBILE STEPPER */}
                   <div className="grid grid-cols-1 gap-4">
                      {project.workStatus === WorkStatus.ASSIGNED ? (
                        <button onClick={() => handleWorkStatusUpdate(WorkStatus.ACCEPTED)} className="w-full py-6 bg-brand-blue text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 animate-pulse">
                           Accept Job Assignment
                        </button>
                      ) : (
                        <div className="space-y-4">
                           <div className="flex items-center gap-4 text-emerald-500 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                              <CheckCircle size={20} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Protocol Initialized & Accepted</span>
                           </div>
                           
                           {!isCompleted && (
                             <div className="grid grid-cols-1 gap-3">
                                <StatusBtn active={project.workStatus === WorkStatus.IN_PROGRESS} label="Begin Setup" onClick={() => handleWorkStatusUpdate(WorkStatus.IN_PROGRESS)} />
                                <StatusBtn active={project.workStatus === WorkStatus.WORKING} label="Active Execution" onClick={() => handleWorkStatusUpdate(WorkStatus.WORKING)} />
                                <button onClick={() => { handleWorkStatusUpdate(WorkStatus.COMPLETED); setShowPaymentModal(true); }} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95">Mark Job Completed</button>
                             </div>
                           )}
                        </div>
                      )}
                   </div>
                </div>
             </section>
           )}

           {/* COMMERCIAL LEDGER (Restricted for Ops) */}
           {showCommercials && (
             <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                <div className="flex justify-between items-end">
                   <div>
                      <h3 className="text-xl font-black tracking-tight leading-none mb-4">Financial Settlement</h3>
                      <div className="flex items-center gap-4">
                         <div className="w-48 h-2 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${settlementPercentage}%` }}></div>
                         </div>
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{settlementPercentage}% Collected</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Outstanding</p>
                      <p className="text-3xl font-black text-rose-500 tracking-tighter">₹{(project.finalPrice - totalPaid).toLocaleString()}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                   <Stat label="Total Value" val={formatCurrency(project.finalPrice)} color="text-slate-900" />
                   <Stat label="Total Received" val={formatCurrency(totalPaid)} color="text-emerald-600" />
                   <Stat label="Plant Size" val={`${project.plantCapacity} kW`} />
                   <Stat label="Discount" val={formatCurrency(project.discount)} color="text-rose-400" />
                </div>
             </section>
           )}

           {/* ACTIVITY TIMELINE (Phase 4) */}
           <section className="bg-white p-8 lg:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 overflow-hidden relative">
              <h3 className="text-xl font-black tracking-tight leading-none">Job Timeline</h3>
              <div className="space-y-8 relative">
                 <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                 {project.timeline.slice().reverse().map((entry, idx) => (
                    <div key={idx} className="flex gap-6 relative z-10">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                        entry.action === 'APPROVED' ? 'bg-emerald-500 text-white' : 
                        entry.action === 'AUTO_LOCKED' ? 'bg-rose-600 text-white' :
                        'bg-white text-slate-400 border border-slate-100'
                      }`}>
                        <Zap size={12} />
                      </div>
                      <div className="pt-0.5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{entry.action}</p>
                        <p className="text-xs text-slate-900 font-bold leading-relaxed">{entry.remarks}</p>
                        <p className="text-[7px] font-black text-slate-300 uppercase mt-1.5">{new Date(entry.timestamp).toLocaleTimeString()} • {entry.userName}</p>
                      </div>
                    </div>
                 ))}
              </div>
           </section>
        </div>

        <aside className="lg:col-span-4 space-y-8">
           {isAdmin && (
              <div className="bg-amber-50 p-8 rounded-[3rem] border border-amber-200 space-y-4">
                 <h3 className="text-[10px] font-black tracking-tight uppercase text-amber-700">Admin Control</h3>
                 <OverrideButton label="Force Job Closure" onClick={() => handleAdminOverrideStatus(WorkStatus.COMPLETED)} />
                 <OverrideButton label="Reset to Draft" onClick={() => { MOCK_DB.updateCustomer(project.id, { status: CustomerStatus.DRAFT, conversionDeadline: Date.now() + 72*60*60*1000 }, currentUser!.uid, currentUser!.displayName); setRefresh(r => r + 1); }} />
              </div>
           )}

           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Metadata</h4>
              <SideMeta label="Plan" val={showCommercials ? project.selectedPlan : 'REDACTED'} />
              <SideMeta label="Exec" val={MOCK_DB.users.find(u => u.uid === project.createdBy)?.displayName} />
              <SideMeta label="City" val={project.city} />
           </div>
        </aside>
      </div>

      {/* Settlement Modal (Phase 4 Enforcement) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
           <div className="bg-white w-full max-w-md rounded-[3rem] p-10 lg:p-12 shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setShowPaymentModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors">✕</button>
              <h3 className="text-2xl font-black tracking-tighter mb-2">Payment Verification</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-10">Mandatory Proof Required</p>
              
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                 {showCommercials && (
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Outstanding (₹)</label>
                      <input readOnly value={project.finalPrice - totalPaid} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xl font-black text-rose-500 outline-none" />
                   </div>
                 )}
                 <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Payment Mode</label>
                    <select value={payForm.mode} onChange={e => setPayForm({...payForm, mode: e.target.value as PaymentMode})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold">
                       <option value={PaymentMode.UPI}>UPI / Digital</option>
                       <option value={PaymentMode.CASH}>Physical Cash</option>
                       <option value={PaymentMode.TRANSFER}>Bank Transfer</option>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Reference / Remark</label>
                    <input required value={payForm.reference} onChange={e => setPayForm({...payForm, reference: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold" placeholder="Trans ID or Note" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Payment Proof (Screenshot/Photo)</label>
                    <div className={`relative w-full h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${payForm.proof ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                       <input type="file" onChange={e => setPayForm({...payForm, proof: e.target.files?.[0]})} className="absolute inset-0 opacity-0 cursor-pointer" />
                       {payForm.proof ? (
                         <div className="text-emerald-600 flex flex-col items-center gap-1">
                            <CheckCircle size={24} />
                            <span className="text-[10px] font-black uppercase">Captured</span>
                         </div>
                       ) : (
                         <div className="text-slate-300 flex flex-col items-center gap-1">
                            <Image size={24} />
                            <span className="text-[10px] font-black uppercase">Upload Proof</span>
                         </div>
                       )}
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20">Authorize Settlement</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const Step = ({ active, complete, label, icon }: any) => (
  <div className={`flex items-center gap-2 lg:gap-3 shrink-0 py-1.5 px-3 lg:px-4 rounded-xl lg:rounded-2xl transition-all ${active ? 'bg-slate-900 text-white shadow-xl scale-105' : complete ? 'text-emerald-500 opacity-100' : 'text-slate-300 opacity-40'}`}>
     <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-lg flex items-center justify-center ${active ? 'bg-brand-blue' : complete ? 'bg-emerald-50' : 'bg-slate-50'}`}>
        {complete ? <CheckCircle size={14} /> : icon}
     </div>
     <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest">{label}</span>
  </div>
);

const StatusBtn = ({ active, label, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-brand-blue text-white shadow-lg border-2 border-white/20' : 'bg-slate-800 text-slate-500 hover:text-white'}`}
  >
    {label}
  </button>
);

const Stat = ({ label, val, color }: any) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`text-sm lg:text-base font-black ${color}`}>{val}</p>
  </div>
);

const SideMeta = ({ label, val }: any) => (
  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pb-2 border-b border-slate-50">
    <span className="text-slate-400">{label}</span>
    <span className="text-slate-900 truncate ml-2">{val}</span>
  </div>
);

const OverrideButton = ({ label, onClick }: any) => (
  <button onClick={onClick} className="px-4 py-3 bg-white border border-amber-200 text-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all w-full">
    {label}
  </button>
);
