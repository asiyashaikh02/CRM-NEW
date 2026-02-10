
import React, { useState } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { RoutePath, UserRole, PaymentStatus, PaymentMode } from '../types';
import { useAuthContext } from '../context/AuthContext';
import { IndianRupee, ShieldCheck, ShieldAlert, ChevronRight, CreditCard, Banknote } from 'lucide-react';

export const PaymentsPage: React.FC<{ onNavigate: (path: RoutePath, id?: string) => void, selectedId?: string }> = ({ onNavigate, selectedId }) => {
  const { currentUser } = useAuthContext();
  const [, setRefresh] = useState(0);
  const payment = selectedId ? MOCK_DB.payments.find(p => p.id === selectedId) : null;
  const canEdit = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.OPS;

  const togglePayment = (paymentId: string, currentStatus: PaymentStatus) => {
    if (!canEdit) return;
    const nextStatus = currentStatus === PaymentStatus.PENDING ? PaymentStatus.PAID : PaymentStatus.PENDING;
    MOCK_DB.updatePaymentStatus(paymentId, nextStatus);
    setRefresh(r => r + 1);
  };

  if (selectedId && payment) {
    return (
      <div className="max-w-3xl mx-auto space-y-10 animate-fade-in text-left">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-slate-900">{payment.clientName}</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Dossier: {payment.id}</p>
          </div>
          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border tracking-widest flex items-center gap-2 ${payment.status === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
            {payment.status === PaymentStatus.PAID ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
            {payment.status}
          </span>
        </header>

        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm text-center space-y-8">
           <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl font-black text-4xl tracking-tighter">
             <IndianRupee size={32}/> {payment.amount.toLocaleString()}
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Node</p>
                 <p className="text-sm font-black text-slate-900">{payment.orderId}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement Mode</p>
                 <div className="flex items-center justify-center gap-2 font-black text-sm uppercase">
                    {payment.mode === PaymentMode.UPI ? <CreditCard size={14}/> : <Banknote size={14}/>}
                    {payment.mode}
                 </div>
              </div>
           </div>

           {canEdit && (
             <div className="pt-6 border-t border-slate-50">
                <button 
                  onClick={() => togglePayment(payment.id, payment.status)}
                  className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${payment.status === PaymentStatus.PENDING ? 'bg-slate-900 text-white shadow-slate-900/20' : 'bg-white text-slate-400 border border-slate-200'}`}
                >
                  {payment.status === PaymentStatus.PENDING ? 'Authorize & Confirm Payment' : 'Reset Settlement Status'}
                </button>
             </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div>
        <h2 className="text-4xl font-black tracking-tighter">Settlement Registry</h2>
        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">Financial Pipeline Signal</p>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Client Entity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Settlement Status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_DB.payments.map(pay => (
                <tr 
                  key={pay.id} 
                  onClick={() => onNavigate('payment-detail', pay.id)}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-5 font-bold text-slate-900">{pay.clientName}</td>
                  <td className="px-8 py-5 text-sm font-black text-emerald-600">₹{pay.amount.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border tracking-widest ${pay.status === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <ChevronRight className="inline-block text-slate-300 group-hover:text-brand-blue transition-colors" size={18}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
