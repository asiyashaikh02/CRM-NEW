
import React, { useState } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { UserRole, RoutePath, LeadStatus, LeadPriority } from '../types';
import { Plus, Target, Mail, Phone, MapPin, ChevronRight, Edit3 } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';

export const LeadsPage: React.FC<{ onNavigate: (path: RoutePath, id?: string) => void, selectedId?: string }> = ({ onNavigate, selectedId }) => {
  const { currentUser } = useAuthContext();
  const lead = selectedId ? MOCK_DB.leads.find(l => l.id === selectedId) : null;
  const canEdit = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SALES;

  if (selectedId && lead) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-fade-in text-left">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-slate-900">{lead.name}</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">{lead.companyName}</p>
          </div>
          <div className="flex gap-3">
             <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border tracking-widest ${lead.status === LeadStatus.CONVERTED ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-blue/5 text-brand-blue'}`}>
               {lead.status}
             </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Contact Identity</h4>
              <div className="space-y-4">
                 <div className="flex items-center gap-4 text-slate-600"><Mail size={16}/><span className="text-sm font-bold">{lead.email || 'No email registered'}</span></div>
                 <div className="flex items-center gap-4 text-slate-600"><Phone size={16}/><span className="text-sm font-bold">{lead.phone}</span></div>
                 <div className="flex items-center gap-4 text-slate-600"><MapPin size={16}/><span className="text-sm font-bold">{lead.location}</span></div>
              </div>
           </div>
           
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dossier Intelligence</h4>
              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Priority</p>
                    <p className={`text-sm font-black ${lead.priority === LeadPriority.HIGH ? 'text-rose-500' : 'text-slate-900'}`}>{lead.priority}</p>
                 </div>
                 <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Potential Yield</p>
                    <p className="text-sm font-black text-slate-900">₹{lead.potentialValue.toLocaleString()}</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[3rem] text-white">
           <h3 className="text-xl font-bold mb-6">Operations Log</h3>
           <p className="text-slate-400 text-sm leading-relaxed italic">"{lead.notes || 'No contextual intelligence logged for this lead node.'}"</p>
           {canEdit && (
             <button className="mt-8 flex items-center gap-2 text-brand-blue text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
               <Edit3 size={14}/> Append Intelligence
             </button>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter">Leads Registry</h2>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">Pipeline Telemetry</p>
        </div>
        {canEdit && (
          <button onClick={() => onNavigate('add')} className="bg-brand-blue text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-brand-dark">
            <Plus size={16} /> New Lead
          </button>
        )}
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Entity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Contact</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Source</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_DB.leads.map(lead => (
                <tr 
                  key={lead.id} 
                  onClick={() => onNavigate('lead-detail', lead.id)}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-900">{lead.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{lead.companyName}</p>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-600 font-medium">{lead.phone}</td>
                  <td className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">{lead.source}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border tracking-widest ${lead.status === LeadStatus.CONVERTED ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-blue/5 text-brand-blue'}`}>
                      {lead.status}
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
