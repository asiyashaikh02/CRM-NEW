
import React, { useMemo, useState } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { Icons } from '../constants';
import { LeadStatus, LeadPriority, RoutePath } from '../types';
import { formatCurrency } from '../config/appConfig';
import { useAuthContext } from '../context/AuthContext';
import { MapPin, Navigation, Globe } from 'lucide-react';

export const LeadDetailsPage: React.FC<{ id: string, onNavigate: (path: RoutePath, params?: any) => void }> = ({ id, onNavigate }) => {
  const { currentUser } = useAuthContext();
  const lead = useMemo(() => MOCK_DB.leads.find(l => l.id === id), [id]);
  const [isConverting, setIsConverting] = useState(false);
  const [convForm, setConvForm] = useState({
    value: lead?.potentialValue || 0,
    advance: 15,
    gst: true
  });

  if (!lead) return <div className="p-20 text-center font-black">Lead Signal Lost.</div>;

  const handleConvert = () => {
    const customerId = MOCK_DB.convertLead(lead.id, {
      userId: currentUser!.uid,
      userName: currentUser!.displayName,
      billingAmount: convForm.value,
      gstApplied: convForm.gst,
      advanceRequired: (convForm.value * convForm.advance) / 100
    });
    if (customerId) onNavigate('project-detail', customerId);
  };

  return (
    <div className="space-y-12 text-left animate-fade-in pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <button onClick={() => onNavigate('leads')} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-blue mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            Signal Pipeline
          </button>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{lead.companyName}</h2>
          <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-[0.4em]">UID: {lead.id}</p>
        </div>
        <div className="flex gap-4">
           {lead.status !== LeadStatus.CONVERTED && (
             <button onClick={() => setIsConverting(true)} className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-10 py-4 rounded-xl shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">Convert to Customer</button>
           )}
           <span className={`px-5 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 bg-white`}>{lead.status}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-10">
              <DataBlock label="Primary Contact" val={lead.name} />
              <DataBlock label="Potential Yield" val={formatCurrency(lead.potentialValue)} color="text-brand-blue" />
              <DataBlock label="Signal Priority" val={lead.priority} color={lead.priority === LeadPriority.HIGH ? 'text-rose-500' : 'text-slate-900'} />
           </section>

           <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black tracking-tight mb-8">Asset Visualization</h3>
              <div className="aspect-video bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden flex items-center justify-center">
                 {lead.lat && lead.lng ? (
                   <img 
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${lead.lat},${lead.lng}&zoom=15&size=800x400&markers=color:blue%7Clabel:S%7C${lead.lat},${lead.lng}&key=YOUR_API_KEY`} 
                    alt="Map Preview"
                    className="w-full h-full object-cover"
                   />
                 ) : (
                   <div className="text-center space-y-3">
                      <MapPin size={40} className="mx-auto text-slate-200" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No Coordinate Data Cached</p>
                   </div>
                 )}
              </div>
              <div className="mt-8 flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                 <div className="flex items-center gap-4">
                    <Navigation className="text-brand-blue" size={20} />
                    <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Telemetry Coordinates</p>
                       <p className="text-xs font-bold font-mono">{lead.lat || 0}, {lead.lng || 0}</p>
                    </div>
                 </div>
                 <button className="px-4 py-2 bg-white rounded-lg border border-slate-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <Globe size={14}/> Open Externally
                 </button>
              </div>
           </section>

           <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black tracking-tight mb-8">Intelligence Log</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed italic bg-slate-50 p-8 rounded-3xl border border-slate-100">
                "{lead.notes || 'No contextual intelligence logged for this node.'}"
              </p>
           </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
           <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Node Meta</h4>
              <MetaLine label="Stream Source" val={lead.source} />
              <MetaLine label="Digital ID" val={lead.email || 'None'} />
              <MetaLine label="City Node" val={lead.city || 'Unassigned'} />
              <MetaLine label="Sync Date" val={new Date(lead.createdAt).toLocaleDateString()} />
           </section>
        </div>
      </div>

      {isConverting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 border border-slate-200 relative">
              <button onClick={() => setIsConverting(false)} className="absolute top-8 right-8 text-slate-400 hover:text-rose-500 font-black">✕</button>
              <h3 className="text-2xl font-black tracking-tighter mb-2">Authorize Conversion</h3>
              <p className="text-slate-400 text-xs font-medium mb-10 italic">"Converting lead node to operational operational asset"</p>
              
              <div className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-500 ml-4 tracking-widest">Final Project Yield (₹)</label>
                    <input type="number" value={convForm.value} onChange={e => setConvForm({...convForm, value: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-2xl font-black text-brand-blue focus:ring-2 focus:ring-brand-blue outline-none" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-slate-500 ml-4 tracking-widest">Advance % Protocol</label>
                       <select value={convForm.advance} onChange={e => setConvForm({...convForm, advance: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-xs outline-none">
                          <option value={15}>15% (Standard)</option>
                          <option value={25}>25% (High Priority)</option>
                          <option value={50}>50% (Advance Critical)</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-slate-500 ml-4 tracking-widest">Tax Protocol</label>
                       <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <input type="checkbox" checked={convForm.gst} onChange={e => setConvForm({...convForm, gst: e.target.checked})} className="w-5 h-5 accent-brand-blue" />
                          <span className="text-xs font-black uppercase text-slate-400 tracking-widest">18% GST</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={handleConvert} className="w-full bg-brand-blue text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Authorize Sync & Lifecycle Transition</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const DataBlock = ({ label, val, color = 'text-slate-900' }: any) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-xl font-black tracking-tight ${color}`}>{val}</p>
  </div>
);

const MetaLine = ({ label, val }: any) => (
  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest border-b border-slate-50 pb-2">
    <span className="text-slate-400">{label}</span>
    <span className="text-slate-900">{val}</span>
  </div>
);
