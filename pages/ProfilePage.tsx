
import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { Smartphone, MapPin, CreditCard, ShieldCheck, HeartPulse, UserCheck } from 'lucide-react';

const Input = ({ label, value, onChange, placeholder, icon, required, disabled, type = 'text' }: any) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
      <input 
        type={type} 
        value={value || ""} 
        onChange={e => onChange(e.target.value)} 
        disabled={disabled}
        className={`w-full bg-slate-50 border border-brand-border rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none transition-all ${icon ? 'pl-12' : ''} ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`} 
        placeholder={placeholder} 
        required={required}
      />
    </div>
  </div>
);

export const ProfileCompletionPage: React.FC<{ isStandalone?: boolean; onComplete?: () => void }> = ({ isStandalone, onComplete }) => {
  const { currentUser, updateProfile } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    mobile: currentUser?.mobile || '',
    address: currentUser?.address || '',
    govtId: currentUser?.govtId || '',
    emergencyContact: currentUser?.emergencyContact || '',
    bankAccount: currentUser?.bankDetails?.account || '',
    bankIfsc: currentUser?.bankDetails?.ifsc || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate network authorization delay
    await new Promise(r => setTimeout(r, 1200));

    // Update user profile with all new fields
    updateProfile({
      mobile: form.mobile,
      address: form.address,
      govtId: form.govtId,
      aadhaar: form.govtId, // Mapping for backward compatibility with schema
      emergencyContact: form.emergencyContact,
      isProfileComplete: true,
      bankDetails: {
        account: form.bankAccount,
        ifsc: form.bankIfsc
      }
    });

    setLoading(false);
    if (onComplete) onComplete();
    else alert("Registry Identity Updated Successfully. Your profile is now verified.");
  };

  return (
    <div className={`text-left animate-fade-in ${isStandalone ? '' : 'max-w-4xl space-y-12'}`}>
      {!isStandalone && (
        <header>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Identity Verification</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-3">Registry Node Configuration</p>
        </header>
      )}

      <form onSubmit={handleSubmit} className={`${isStandalone ? 'space-y-6' : 'bg-white p-12 rounded-[3.5rem] border border-brand-border shadow-sm space-y-8'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Primary Contact Signal" 
            value={form.mobile} 
            onChange={(v: string) => setForm(prev => ({...prev, mobile:v}))} 
            placeholder="10-digit mobile number" 
            icon={<Smartphone size={16}/>} 
            required 
          />
          <Input 
            label="Government Identity UID" 
            value={form.govtId} 
            onChange={(v: string) => setForm(prev => ({...prev, govtId:v}))} 
            placeholder="Aadhaar / PAN / Passport" 
            icon={<ShieldCheck size={16}/>} 
            required 
          />
        </div>

        <Input 
          label="Registry Base Location (Full Address)" 
          value={form.address} 
          onChange={(v: string) => setForm(prev => ({...prev, address:v}))} 
          placeholder="Complete street address, city, and pincode" 
          icon={<MapPin size={16}/>} 
          required 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Emergency Contingency Node" 
            value={form.emergencyContact} 
            onChange={(v: string) => setForm(prev => ({...prev, emergencyContact:v}))} 
            placeholder="Name & contact of kin" 
            icon={<HeartPulse size={16}/>} 
            required 
          />
          <Input 
            label="Primary Identity (Display Name)" 
            value={currentUser?.displayName || ''} 
            onChange={() => {}} 
            placeholder="Verified name" 
            icon={<UserCheck size={16}/>} 
            disabled 
          />
        </div>

        <div className="pt-6 border-t border-slate-100">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6">Financial Settlement Protocol</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Bank Account Cluster" 
              value={form.bankAccount} 
              onChange={(v: string) => setForm(prev => ({...prev, bankAccount:v}))} 
              placeholder="Account sequence" 
              icon={<CreditCard size={16}/>} 
              required 
            />
            <Input 
              label="Bank IFSC Protocol" 
              value={form.bankIfsc} 
              onChange={(v: string) => setForm(prev => ({...prev, bankIfsc:v}))} 
              placeholder="Branch registry code" 
              icon={<CreditCard size={16}/>} 
              required 
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-brand-blue transition-all active:scale-95 disabled:opacity-50">
          {loading ? 'Authorizing Registry Nodes...' : 'Finalize Verification & Remove Restrictions'}
        </button>
      </form>
    </div>
  );
};
