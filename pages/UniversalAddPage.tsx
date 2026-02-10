
import React, { useState } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { LeadSource, RoutePath } from '../types';
import { Sun, ArrowRight, Target, ClipboardList } from 'lucide-react';

export const UniversalAddPage: React.FC<{ onNavigate: (path: RoutePath) => void }> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'LEAD' | 'CONVERT'>('LEAD');
  
  // Lead Form
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', location: '', source: LeadSource.OFFLINE });
  
  // Convert Form
  const [convLeadId, setConvLeadId] = useState('');
  const [convForm, setConvForm] = useState({ panelCount: 0, date: '', cleaner: '' });

  const handleCreateLead = (e: any) => {
    e.preventDefault();
    MOCK_DB.createLead(leadForm);
    onNavigate('leads');
  };

  const handleConvert = (e: any) => {
    e.preventDefault();
    MOCK_DB.convertLeadToOrder(convLeadId, convForm.panelCount, new Date(convForm.date).getTime(), convForm.cleaner);
    onNavigate('orders');
  };

  const Input = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue" 
        placeholder={placeholder}
        required
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-fade-in text-left">
      <header className="flex bg-white p-2 rounded-2xl border border-slate-200">
        <button onClick={() => setActiveTab('LEAD')} className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${activeTab === 'LEAD' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
          <Target size={14} /> 1. New Lead
        </button>
        <button onClick={() => setActiveTab('CONVERT')} className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${activeTab === 'CONVERT' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
          <ClipboardList size={14} /> 2. Convert to Order
        </button>
      </header>

      {activeTab === 'LEAD' ? (
        <form onSubmit={handleCreateLead} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-6">
          <Input label="Name" value={leadForm.name} onChange={v => setLeadForm({...leadForm, name: v})} placeholder="Client Full Name" />
          <Input label="Phone" value={leadForm.phone} onChange={v => setLeadForm({...leadForm, phone: v})} placeholder="9988xxxxxx" />
          <Input label="Location" value={leadForm.location} onChange={v => setLeadForm({...leadForm, location: v})} placeholder="Area / Street" />
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Source</label>
            <select value={leadForm.source} onChange={e => setLeadForm({...leadForm, source: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold outline-none">
              <option value={LeadSource.OFFLINE}>Offline</option>
              <option value={LeadSource.ADS}>Ads</option>
              <option value={LeadSource.REFERRAL}>Referral</option>
            </select>
          </div>
          <button type="submit" className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
             <Sun size={18} /> Save Lead Record
          </button>
        </form>
      ) : (
        <form onSubmit={handleConvert} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Select Lead</label>
            <select value={convLeadId} onChange={e => setConvLeadId(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold outline-none">
              <option value="">Choose a lead...</option>
              {MOCK_DB.leads.filter(l => l.status !== 'Converted').map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.location})</option>
              ))}
            </select>
          </div>
          <Input label="Panel Count" type="number" value={convForm.panelCount.toString()} onChange={v => setConvForm({...convForm, panelCount: parseInt(v) || 0})} placeholder="Number of panels" />
          <Input label="Service Date" type="date" value={convForm.date} onChange={v => setConvForm({...convForm, date: v})} />
          <Input label="Assign Cleaner" value={convForm.cleaner} onChange={v => setConvForm({...convForm, cleaner: v})} placeholder="Cleaner Name" />
          <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
             Initialize Order <ArrowRight size={18} />
          </button>
        </form>
      )}
    </div>
  );
};
