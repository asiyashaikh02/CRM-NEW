
import React, { useState } from 'react';
import { RoutePath } from '../App';
import { Icons } from '../constants';
import { MOCK_DB } from '../data/mockDb';
import { useAuthContext } from '../context/AuthContext';
import { UserRole, LeadSource, LeadPriority } from '../types';

type EntityType = 'LEAD' | 'USER' | 'CUSTOMER';

interface AddFormState {
  type: EntityType;
  name: string;
  mobile: string;
  email: string;
  address: {
    fullAddress: string;
    city: string;
    state: string;
    pincode: string;
    lat: number;
    lng: number;
  };
  // Dynamic fields
  companyName?: string;
  source?: string;
  notes?: string;
  role?: UserRole;
  age?: string;
  gender?: string;
  aadhaar?: string;
  billingAmount?: number;
  gstNumber?: string;
}

export const UniversalAddPage: React.FC<{ onNavigate: (path: RoutePath, params?: any) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuthContext();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<AddFormState>({
    type: 'LEAD',
    name: '',
    mobile: '',
    email: '',
    address: { fullAddress: '', city: '', state: '', pincode: '', lat: 19.076, lng: 72.8777 },
    gender: 'Male',
    role: UserRole.SALES,
    source: LeadSource.MANUAL,
    priority: LeadPriority.MEDIUM as any
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFinalConfirm = () => {
    if (!currentUser) return;
    const uniqueId = MOCK_DB.createEntity(form, form.type, currentUser);
    
    // Explicit Redirection Logic
    if (form.type === 'LEAD') onNavigate('lead-detail', { id: uniqueId });
    else if (form.type === 'USER') onNavigate('user-detail', { id: uniqueId });
    else if (form.type === 'CUSTOMER') onNavigate('project-detail', { id: uniqueId });
  };

  const isStep1Valid = form.name.length > 2 && form.mobile.length === 10;

  return (
    <div className="max-w-4xl mx-auto py-10 animate-fade-in text-left">
      <header className="mb-12 flex justify-between items-center">
         <div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Initialization Core</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">Registry Authority Node</p>
         </div>
         <div className="flex gap-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-indigo-600' : 'w-4 bg-slate-200 dark:bg-slate-800'}`} />
            ))}
         </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12"><Icons.Sparkles /></div>

         {step === 1 && (
           <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <div className="space-y-2">
                 <h3 className="text-2xl font-black tracking-tight">Phase 1: Basic Parameters</h3>
                 <p className="text-slate-400 text-xs font-medium">Define the core identity of the network entry.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <FormInput label="Registry Type" type="select" value={form.type} onChange={v => setForm({...form, type: v as any})}>
                    <option value="LEAD">Leads Pipeline</option>
                    <option value="CUSTOMER">Active Customer</option>
                    <option value={UserRole.MASTER_ADMIN === currentUser?.role ? 'USER' : ''}>Authority User</option>
                 </FormInput>
                 <FormInput label="Identity Name *" placeholder="Enter full name" value={form.name} onChange={v => setForm({...form, name: v})} />
                 <FormInput label="Signal Stream (Mobile) *" placeholder="10-digit number" value={form.mobile} onChange={v => setForm({...form, mobile: v})} />
                 <FormInput label="Digital Channel (Email)" placeholder="name@domain.com" value={form.email} onChange={v => setForm({...form, email: v})} />
              </div>
              <div className="pt-10 flex justify-end">
                 <button onClick={nextStep} disabled={!isStep1Valid} className="px-12 py-5 bg-indigo-600 disabled:opacity-30 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95">Verify & Proceed</button>
              </div>
           </div>
         )}

         {step === 2 && (
           <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <div className="space-y-2">
                 <h3 className="text-2xl font-black tracking-tight">Phase 2: Geographic Matrix</h3>
                 <p className="text-slate-400 text-xs font-medium">Pinpoint the physical location node. This can be skipped if unknown.</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6">
                 <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📍</div>
                    <input 
                      placeholder="Search location via Maps Engine..." 
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 pl-12 text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all"
                      value={form.address.fullAddress}
                      onChange={e => setForm({...form, address: {...form.address, fullAddress: e.target.value}})}
                    />
                 </div>
                 <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=19.076,72.8777&zoom=13&size=800x400&key=MOCK')] bg-cover opacity-50 blur-sm group-hover:blur-0 transition-all duration-1000" />
                    <div className="relative z-10 p-6 bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-white/20 shadow-2xl text-center">
                       <p className="text-[10px] font-black uppercase text-indigo-600 mb-2">Maps Preview Active</p>
                       <p className="text-[9px] font-bold text-slate-400">Marker Position: {form.address.lat}, {form.address.lng}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormInput label="City" value={form.address.city} onChange={v => setForm({...form, address: {...form.address, city: v}})} compact />
                    <FormInput label="State" value={form.address.state} onChange={v => setForm({...form, address: {...form.address, state: v}})} compact />
                    <FormInput label="Zip" value={form.address.pincode} onChange={v => setForm({...form, address: {...form.address, pincode: v}})} compact />
                    <FormInput label="Country" value="India" disabled compact />
                 </div>
              </div>

              <div className="pt-10 flex justify-between">
                 <button onClick={prevStep} className="px-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Return</button>
                 <button onClick={nextStep} className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Lock Location</button>
              </div>
           </div>
         )}

         {step === 3 && (
           <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <div className="space-y-2">
                 <h3 className="text-2xl font-black tracking-tight">Phase 3: Deep Metadata</h3>
                 <p className="text-slate-400 text-xs font-medium">Contextual parameters for the {form.type.toLowerCase()} registry.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {form.type === 'LEAD' && (
                   <>
                     <FormInput label="Entity/Company" placeholder="Workplace Name" value={form.companyName} onChange={v => setForm({...form, companyName: v})} />
                     <FormInput label="Signal Source" type="select" value={form.source} onChange={v => setForm({...form, source: v})}>
                        <option value={LeadSource.MANUAL}>Manual Entry</option>
                        <option value={LeadSource.WEBSITE}>Global Website</option>
                        <option value={LeadSource.INSTAGRAM}>Instagram Ad</option>
                        <option value={LeadSource.REFERRAL}>Network Referral</option>
                     </FormInput>
                     <div className="md:col-span-2">
                        <FormInput label="Priority Notes" type="textarea" placeholder="Identify mission parameters..." value={form.notes} onChange={v => setForm({...form, notes: v})} />
                     </div>
                   </>
                 )}

                 {form.type === 'USER' && (
                   <>
                     <FormInput label="Authority Role" type="select" value={form.role} onChange={v => setForm({...form, role: v as any})}>
                        <option value={UserRole.SALES}>Sales Agent</option>
                        <option value={UserRole.OPERATIONS}>Ops Manager</option>
                     </FormInput>
                     <FormInput label="Masked Identity (Aadhaar)" placeholder="12-digit UID" value={form.aadhaar} onChange={v => setForm({...form, aadhaar: v})} />
                     <FormInput label="Age Node" value={form.age} onChange={v => setForm({...form, age: v})} />
                     <FormInput label="Gender Identity" type="select" value={form.gender} onChange={v => setForm({...form, gender: v})}>
                        <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                     </FormInput>
                   </>
                 )}

                 {form.type === 'CUSTOMER' && (
                   <>
                     <FormInput label="Contract Value (₹)" placeholder="Expected project yield" value={form.billingAmount?.toString()} onChange={v => setForm({...form, billingAmount: parseInt(v) || 0})} />
                     <FormInput label="GSTIN Identifier" placeholder="Tax registry number" value={form.gstNumber} onChange={v => setForm({...form, gstNumber: v})} />
                   </>
                 )}
              </div>

              <div className="pt-10 flex justify-between">
                 <button onClick={prevStep} className="px-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Back</button>
                 <button onClick={nextStep} className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Review Registry</button>
              </div>
           </div>
         )}

         {step === 4 && (
           <div className="space-y-10 animate-in zoom-in-95 duration-500">
              <div className="space-y-2">
                 <h3 className="text-2xl font-black tracking-tight">Phase 4: Final Validation</h3>
                 <p className="text-slate-400 text-xs font-medium">Verify data integrity before authorizing node creation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6">
                    <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Registry Summary</p>
                    <SummaryRow label="Name" val={form.name} />
                    <SummaryRow label="Type" val={form.type} />
                    <SummaryRow label="Signal" val={form.mobile} />
                    <SummaryRow label="Address" val={form.address.city || 'Geotagged Only'} />
                 </div>
                 <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex flex-col justify-center items-center text-center space-y-4 shadow-2xl">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 font-black text-2xl">?</div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pending System Assignment</p>
                    <p className="text-xs font-bold text-indigo-200">Once confirmed, a permanent Unique ID will be generated for this authority node.</p>
                 </div>
              </div>

              <div className="pt-10 flex justify-between gap-6">
                 <button onClick={prevStep} className="flex-1 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest border border-slate-100 dark:border-slate-800 rounded-[2rem]">Edit Registry</button>
                 <button onClick={handleFinalConfirm} className="flex-[2] py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Confirm & Create Node</button>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};

const FormInput = ({ label, placeholder, value, onChange, type = 'text', children, disabled, compact }: any) => (
  <div className="space-y-2">
     <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-4">{label}</label>
     {type === 'select' ? (
       <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none cursor-pointer">
          {children}
       </select>
     ) : type === 'textarea' ? (
       <textarea placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold min-h-[120px] focus:ring-2 focus:ring-indigo-600 outline-none" />
     ) : (
       <input type={type} disabled={disabled} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl ${compact ? 'p-3 text-xs' : 'p-4 text-sm'} font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all ${disabled ? 'opacity-50' : ''}`} />
     )}
  </div>
);

const SummaryRow = ({ label, val }: any) => (
  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
     <span className="text-slate-400">{label}</span>
     <span className="text-slate-900 dark:text-white">{val}</span>
  </div>
);
