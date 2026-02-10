
import React, { useState } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { RoutePath, UserRole, OrderStatus } from '../types';
import { useAuthContext } from '../context/AuthContext';
import { CheckCircle, Clock, ChevronRight, ClipboardList, Package } from 'lucide-react';

export const OrdersPage: React.FC<{ onNavigate: (path: RoutePath, id?: string) => void, selectedId?: string }> = ({ onNavigate, selectedId }) => {
  const { currentUser } = useAuthContext();
  const [, setRefresh] = useState(0);
  const order = selectedId ? MOCK_DB.orders.find(o => o.id === selectedId) : null;
  const canEdit = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.OPS;

  const toggleStatus = (orderId: string, currentStatus: OrderStatus) => {
    if (!canEdit) return;
    const nextStatus = currentStatus === OrderStatus.SCHEDULED ? OrderStatus.COMPLETED : OrderStatus.SCHEDULED;
    MOCK_DB.updateOrderStatus(orderId, nextStatus);
    setRefresh(r => r + 1);
  };

  if (selectedId && order) {
    return (
      <div className="max-w-3xl mx-auto space-y-10 animate-fade-in text-left">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-slate-900">{order.clientName}</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Dossier: {order.id}</p>
          </div>
          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border tracking-widest flex items-center gap-2 ${order.status === OrderStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            {order.status === OrderStatus.COMPLETED ? <CheckCircle size={10} /> : <Clock size={10} />}
            {order.status}
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Package size={14}/> Node Parameters</h4>
              <div className="space-y-4">
                 <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-xs text-slate-400 font-bold">Panel Sequence</span>
                    <span className="text-sm font-black">{order.panelCount} Units</span>
                 </div>
                 <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-xs text-slate-400 font-bold">Deployment Date</span>
                    <span className="text-sm font-black">{new Date(order.serviceDate).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-xs text-slate-400 font-bold">Assigned Cleaner</span>
                    <span className="text-sm font-black text-brand-blue">{order.assignedCleaner}</span>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col justify-center items-center text-center">
              <ClipboardList size={40} className="text-brand-blue mb-4 opacity-40"/>
              <h4 className="text-lg font-bold mb-4 leading-tight">Authorize Operation Milestone</h4>
              {canEdit ? (
                <button 
                  onClick={() => toggleStatus(order.id, order.status)}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${order.status === OrderStatus.SCHEDULED ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-white text-slate-900 shadow-white/5'}`}
                >
                  {order.status === OrderStatus.SCHEDULED ? 'Confirm Job Completion' : 'Reset to Scheduled'}
                </button>
              ) : (
                <p className="text-slate-500 text-[10px] uppercase font-bold">Authorization required</p>
              )}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div>
        <h2 className="text-4xl font-black tracking-tighter">Orders Repository</h2>
        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">Active Deployment Pipeline</p>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Client Node</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Deployment Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Operation Status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_DB.orders.map(o => (
                <tr 
                  key={o.id} 
                  onClick={() => onNavigate('order-detail', o.id)}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-5 font-bold text-slate-900">{o.clientName}</td>
                  <td className="px-8 py-5 text-sm text-slate-600 font-bold">{new Date(o.serviceDate).toLocaleDateString()}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border tracking-widest ${o.status === OrderStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {o.status}
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
