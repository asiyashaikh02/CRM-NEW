
import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { MOCK_DB } from '../data/mockDb';
import { Smartphone, ShieldCheck, MapPin, Building2, CheckCircle } from 'lucide-react';

export const ProfilePage: React.FC<{ isStandalone?: boolean }> = ({ isStandalone }) => {
  const { currentUser, updateProfile } = useAuthContext();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    mobile: currentUser?.mobile || '',
    aadhaar: currentUser?.aadhaar || '',
    address: currentUser?.address || '',
    bankAccount: currentUser?.bankDetails?.account || '',
    bankIfsc: currentUser?.bankDetails?.ifsc || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1000));

    const updatedData = {
      ...form,
      isProfileComplete: true,
      bankDetails: {
        account: form.bankAccount,
        ifsc: form.bankIfsc
      }
    };

    updateProfile(updatedData);
    setLoading(false);
    if (!isStandalone) alert("Identity Registry Updated Successfully.");
  };

  if (!currentUser) return null;

  return (
    <div className={`text-left animate-fade-in ${isStandalone ? '' : 'max-w-4xl space-y-12'}`}>
      {!isStandalone && (
        <header>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Identity Node</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-1">Registry Authentication Core</p>
        </header>
      )}

      <form onSubmit={handleSubmit} className={`${isStandalone ? 'space-y-8' : 'bg-white p-12 rounded-[3.5rem] border border-brand-border shadow-sm space-y-10'}`}>
        {step === 1 ? (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileField label="Mobile Signal" value={form.mobile} onChange={v => setForm({...form, mobile: v})} placeholder="99xxxxxxxx" required />
              <ProfileField label="Aadhaar UID" value={form.aadhaar} onChange={v => setForm({...form, aadhaar: v})} placeholder="XXXX XXXX XXXX" required />
            </div>
            <ProfileField label="Full Residence Address" value={form.address} onChange={v => setForm({...form, address: v})} placeholder="Street, City, PIN" required />
            <button type="button" onClick={() => setStep(2)} className="w-full py-4 bg-brand-blue text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-blue/20 active:scale-95 transition-all">Phase 2: Billing Registry</button>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileField label="Bank Account #" value={form.bankAccount} onChange={v => setForm({...form, bankAccount: v})} placeholder="000000000000" required />
              <ProfileField label="IFSC Code" value={form.bankIfsc} onChange={v => setForm({...form, bankIfsc: v})} placeholder="BANK0001234" required />
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 text-slate-400 font-black uppercase text-xs">Back</button>
              <button type="submit" disabled={loading} className="flex-[2] py-4 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">
                {loading ? 'Authorizing...' : 'Authorize Identity'}
              </button>
            </div>
          </div>
        )}

        {!isStandalone && (
          <div className="pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="flex items-center gap-4">
                <ShieldCheck className="text-brand-blue" />
                <div><p className="text-[10px] font-black uppercase text-slate-400">Status</p><p className="text-xs font-bold">{currentUser.status}</p></div>
             </div>
             <div className="flex items-center gap-4">
                <Building2 className="text-brand-blue" />
                <div><p className="text-[10px] font-black uppercase text-slate-400">Role</p><p className="text-xs font-bold">{currentUser.role}</p></div>
             </div>
             <div className="flex items-center gap-4">
                <CheckCircle className="text-emerald-500" />
                <div><p className="text-[10px] font-black uppercase text-slate-400">Sync</p><p className="text-xs font-bold">Node Activated</p></div>
             </div>
          </div>
        )}
      </form>
    </div>
  );
};

const ProfileField = ({ label, value, onChange, placeholder, required }: any) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-4">{label}</label>
    <input 
      type="text" 
      required={required}
      value={value} 
      onChange={e => onChange(e.target.value)} 
      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-300" 
      placeholder={placeholder} 
    />
  </div>
);
