
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { LeadSource, RoutePath, LeadStatus, OrderStatus } from '../types';
import { Sun, ArrowRight, Target, ClipboardList, MapPin, Navigation } from 'lucide-react';

const InputField = ({ label, value, onChange, placeholder, type = 'text', inputRef }: any) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">{label}</label>
    <input 
      ref={inputRef}
      type={type} 
      value={value || ""} 
      onChange={e => onChange(e.target.value)} 
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue" 
      placeholder={placeholder}
      required
    />
  </div>
);

export const UniversalAddPage: React.FC<{ onNavigate: (path: RoutePath) => void }> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'LEAD' | 'CONVERT'>('LEAD');
  const addressRef = useRef<HTMLInputElement>(null);
  
  // Lead Form
  const [leadForm, setLeadForm] = useState({ 
    name: '', 
    phone: '', 
    location: '', 
    city: '', 
    lat: 0, 
    lng: 0, 
    source: LeadSource.OFFLINE,
    companyName: ''
  });
  
  // Convert Form
  const [convLeadId, setConvLeadId] = useState('');
  const [convForm, setConvForm] = useState({ panelCount: 0, date: '', cleaner: '' });

  useEffect(() => {
    // Fix: Cast window to any to access the global google object injected by the Maps script
    if (activeTab === 'LEAD' && addressRef.current && (window as any).google) {
      const autocomplete = new (window as any).google.maps.places.Autocomplete(addressRef.current);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || '';
          
          let city = '';
          if (place.address_components) {
            const cityComp = place.address_components.find(c => c.types.includes('locality'));
            if (cityComp) city = cityComp.long_name;
          }

          setLeadForm(prev => ({
            ...prev,
            location: address,
            lat,
            lng,
            city: city || prev.city
          }));
        }
      });
    }
  }, [activeTab]);

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setLeadForm(prev => ({ ...prev, lat: latitude, lng: longitude }));
        
        // Reverse geocoding could be added here if needed
        // Fix: Cast window to any to access google.maps.Geocoder
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
             setLeadForm(prev => ({ ...prev, location: results[0].formatted_address }));
          }
        });
      });
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    MOCK_DB.createLead(leadForm);
    onNavigate('leads');
  };

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    MOCK_DB.convertLeadToOrder(convLeadId, convForm.panelCount, new Date(convForm.date).getTime(), convForm.cleaner);
    onNavigate('orders');
  };

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
          <InputField label="Contact Name" value={leadForm.name} onChange={(v: string) => setLeadForm(prev => ({...prev, name: v}))} placeholder="Client Full Name" />
          <InputField label="Company Entity" value={leadForm.companyName} onChange={(v: string) => setLeadForm(prev => ({...prev, companyName: v}))} placeholder="Organization Name" />
          <InputField label="Phone Signal" value={leadForm.phone} onChange={(v: string) => setLeadForm(prev => ({...prev, phone: v}))} placeholder="9988xxxxxx" />
          
          <div className="flex gap-4 items-end">
            <InputField 
              inputRef={addressRef}
              label="Asset Location (Google Address)" 
              value={leadForm.location} 
              onChange={(v: string) => setLeadForm(prev => ({...prev, location: v}))} 
              placeholder="Search street or area..." 
            />
            <button 
              type="button" 
              onClick={detectLocation}
              className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-brand-blue hover:bg-slate-100 transition-colors"
              title="Detect Coordinates"
            >
              <Navigation size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="City Registry" value={leadForm.city} onChange={(v: string) => setLeadForm(prev => ({...prev, city: v}))} placeholder="Mumbai" />
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Source Channel</label>
              <select value={leadForm.source} onChange={e => setLeadForm(prev => ({...prev, source: e.target.value as any}))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold outline-none">
                <option value={LeadSource.OFFLINE}>Offline Registry</option>
                <option value={LeadSource.ADS}>Digital Ads</option>
                <option value={LeadSource.REFERRAL}>Network Referral</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
             <Sun size={18} /> Authorize Lead Node
          </button>
        </form>
      ) : (
        <form onSubmit={handleConvert} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Select Lead Node</label>
            <select value={convLeadId} onChange={e => setConvLeadId(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold outline-none">
              <option value="">Choose a signal...</option>
              {MOCK_DB.leads.filter(l => l.status !== LeadStatus.CONVERTED).map(l => (
                <option key={l.id} value={l.id}>{l.name} — {l.companyName} ({l.city})</option>
              ))}
            </select>
          </div>
          <InputField label="Asset Count (Panels)" type="number" value={convForm.panelCount.toString()} onChange={(v: string) => setConvForm(prev => ({...prev, panelCount: parseInt(v) || 0}))} placeholder="Quantity" />
          <InputField label="Deployment Date" type="date" value={convForm.date} onChange={(v: string) => setConvForm(prev => ({...prev, date: v}))} />
          <InputField label="Assign Specialist" value={convForm.cleaner} onChange={(v: string) => setConvForm(prev => ({...prev, cleaner: v}))} placeholder="Name" />
          <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
             Initialize Protocol <ArrowRight size={18} />
          </button>
        </form>
      )}
    </div>
  );
};
