
import React, { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { MOCK_DB, PLAN_RATES } from '../data/mockDb';
import { RoutePath, PlanType } from '../types';
import { Sun, Calculator, BadgeInfo, ArrowRight, Calendar } from 'lucide-react';

const InputField = ({ label, placeholder, value, onChange, type = 'text', inputRef }: any) => (
  <div className="space-y-2 text-left flex-1">
    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">{label}</label>
    <input 
      ref={inputRef}
      required 
      type={type} 
      placeholder={placeholder} 
      value={value || ""} 
      onChange={e => onChange(e.target.value)} 
      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-brand-blue outline-none transition-all" 
    />
  </div>
);

const SummaryLine = ({ label, val, color = "text-slate-400" }: any) => (
  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
     <span className="text-slate-500">{label}</span>
     <span className={color}>{val}</span>
  </div>
);

export const CustomerCreatePage: React.FC<{ onNavigate: (p: RoutePath, id?: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuthContext();
  const addressRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ 
    name: '', 
    companyName: '', 
    email: '', 
    phone: '', 
    city: '', 
    address: '',
    lat: 0,
    lng: 0,
    plantCapacity: 0, 
    selectedPlan: PlanType.SILVER, 
    discount: 0,
    serviceDate: '' // Added for Phase 3
  });

  const [calc, setCalc] = useState({ base: 0, final: 0 });

  useEffect(() => {
    if (addressRef.current && (window as any).google) {
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

          setForm(prev => ({
            ...prev,
            address: address,
            lat,
            lng,
            city: city || prev.city
          }));
        }
      });
    }
  }, []);

  useEffect(() => {
    const rate = PLAN_RATES[form.selectedPlan];
    const base = form.plantCapacity * rate;
    const final = base - form.discount;
    setCalc({ base, final });
  }, [form.plantCapacity, form.selectedPlan, form.discount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const customer = MOCK_DB.createCustomer(form, currentUser.uid);
    onNavigate('project-detail', customer.id);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 animate-fade-in text-left">
      <header className="mb-12">
        <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Initialization</h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-4">New Asset Registry Protocol</p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Entity/Company" placeholder="Solar Solutions Ltd" value={form.companyName} onChange={(v: string) => setForm(prev => ({...prev, companyName: v}))} />
              <InputField label="Primary Contact" placeholder="John Doe" value={form.name} onChange={(v: string) => setForm(prev => ({...prev, name: v}))} />
              <InputField label="Phone Channel" placeholder="9876543210" value={form.phone} onChange={(v: string) => setForm(prev => ({...prev, phone: v}))} />
              <InputField label="Target Service Date" type="date" value={form.serviceDate} onChange={(v: string) => setForm(prev => ({...prev, serviceDate: v}))} />
           </div>

           <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  inputRef={addressRef}
                  label="Full Asset Address (Google Search)" 
                  placeholder="Search location..." 
                  value={form.address} 
                  onChange={(v: string) => setForm(prev => ({...prev, address: v}))} 
                />
                <InputField label="City Node" placeholder="Mumbai" value={form.city} onChange={(v: string) => setForm(prev => ({...prev, city: v}))} />
              </div>
           </div>

           <div className="pt-8 border-t border-slate-50 space-y-6">
              <h4 className="text-[10px] font-black uppercase text-brand-blue tracking-widest flex items-center gap-2">
                <Calculator size={14}/> Technical Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <InputField label="Plant Capacity (kW)" type="number" value={form.plantCapacity.toString()} onChange={(v: string) => setForm(prev => ({...prev, plantCapacity: parseFloat(v) || 0}))} />
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">Deployment Plan</label>
                    <select 
                      value={form.selectedPlan} 
                      onChange={e => setForm(prev => ({...prev, selectedPlan: e.target.value as PlanType}))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                       <option value={PlanType.SILVER}>Silver (₹2,500/kW)</option>
                       <option value={PlanType.GOLD}>Gold (₹4,000/kW)</option>
                       <option value={PlanType.PLATINUM}>Platinum (₹6,000/kW)</option>
                    </select>
                 </div>
              </div>
              <InputField label="Strategic Discount (₹)" type="number" value={form.discount.toString()} onChange={(v: string) => setForm(prev => ({...prev, discount: parseFloat(v) || 0}))} />
           </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl space-y-8">
              <h3 className="text-xl font-black tracking-tight leading-none">Financial Summary</h3>
              <div className="space-y-4">
                 <SummaryLine label="Base Quotation" val={`₹${calc.base.toLocaleString()}`} />
                 <SummaryLine label="Discount Applied" val={`- ₹${form.discount.toLocaleString()}`} color="text-rose-400" />
                 <div className="pt-4 border-t border-white/10">
                    <p className="text-[10px] font-black uppercase text-brand-blue tracking-widest mb-1">Final Deployment Yield</p>
                    <p className="text-3xl font-black text-white tracking-tighter">₹{calc.final.toLocaleString()}</p>
                 </div>
              </div>
              <button type="submit" className="w-full bg-brand-blue py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-brand-dark transition-all flex items-center justify-center gap-3 active:scale-95">
                 Initialize Draft <ArrowRight size={18} />
              </button>
           </div>
           
           <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-amber-500">
                <BadgeInfo size={20} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Protocol Note</h4>
              </div>
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                Assets start in <b>DRAFT</b> status. You have <b>72 hours</b> to finalize pricing before automatic lockout.
              </p>
           </div>
        </aside>
      </form>
    </div>
  );
};
