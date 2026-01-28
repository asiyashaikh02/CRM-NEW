
import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { MOCK_DB } from '../data/mockDb';
import { Icons } from '../constants';
import { formatCurrency } from '../config/appConfig';
import { userService } from '../services/user.service';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  // Fixed: Changed MOCK_DB.profiles to MOCK_DB.users
  const [form, setForm] = useState<any>(() => MOCK_DB.users.find((p: any) => p.uid === currentUser?.uid) || {});
  const [isSaving, setIsSaving] = useState(false);

  // Fixed: Mapping user data from MOCK_DB.users to the expected profile display object
  const userFromDb = MOCK_DB.users.find((p: any) => p.uid === currentUser?.uid);
  const profile = {
    uniqueId: userFromDb?.uid || 'UID-GEN-PENDING',
    name: userFromDb?.displayName || currentUser?.displayName || '',
    email: userFromDb?.email || currentUser?.email || '',
    contact: userFromDb?.mobile || 'NOT_SET',
    address: userFromDb?.location?.address || 'HQ_DEFAULT',
    role: userFromDb?.role || currentUser?.role || '',
    createdAt: userFromDb?.createdAt || Date.now()
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await userService.updateUser(currentUser!.uid, form);
      setIsEditing(false);
      // In real app, refetching context would happen
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-12 animate-fade-in pb-20 text-left">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Profile Node</h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold mt-2 uppercase text-xs tracking-[0.4em]">Identity Authentication Index</p>
        </div>
        <div className="flex gap-4">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
            >
              Edit Identity
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)} 
                className="px-8 py-3 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Abort
              </button>
              <button 
                onClick={handleUpdate} 
                disabled={isSaving}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
              >
                {isSaving ? 'Syncing...' : 'Confirm Sync'}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Profile Card */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-center relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 scale-125"><Icons.Sparkles /></div>
             <div className="w-36 h-36 bg-indigo-600 rounded-[3rem] flex items-center justify-center text-white text-6xl font-black mx-auto mb-8 shadow-2xl border-4 border-white dark:border-slate-800 transition-transform group-hover:scale-105">
               {profile.name.charAt(0)}
             </div>
             <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{profile.name}</h3>
             <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mt-3 bg-indigo-50 dark:bg-indigo-900/30 inline-block px-5 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800">
               {profile.uniqueId}
             </p>
             
             <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 space-y-5">
                <StatLine icon="📞" label="Channel" value={profile.contact} />
                <StatLine icon="✉️" label="Registry" value={profile.email} />
                <StatLine icon="🔑" label="Access" value={profile.role} />
             </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
             <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] mb-10">System Milestones</h4>
             <div className="space-y-10 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                <TimelineItem icon="🚀" label="Node Initialized" date={new Date(profile.createdAt).toLocaleDateString()} isActive />
                <TimelineItem icon="✅" label="Protocol Approved" date="Verification Success" />
                <TimelineItem icon="📈" label="Market Access" date="Pending Milestone" />
             </div>
          </div>
        </div>

        {/* Edit Metadata */}
        <div className="lg:col-span-8 space-y-10">
           <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-12">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm"><Icons.Users /></div>
                 <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Metadata Repository</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <FormField 
                  label="Registry Name" 
                  value={isEditing ? form.name : profile.name} 
                  disabled={!isEditing} 
                  onChange={(v: string) => setForm({...form, name: v})}
                />
                <FormField 
                  label="Work Email" 
                  value={profile.email} 
                  disabled 
                  description="Registry Immutable"
                />
                <FormField 
                  label="Contact Channel" 
                  value={isEditing ? form.contact : profile.contact} 
                  disabled={!isEditing} 
                  onChange={(v: string) => setForm({...form, contact: v})}
                />
                <FormField 
                  label="Role Access" 
                  value={profile.role} 
                  disabled 
                  description="Authority Restricted"
                />
                <div className="sm:col-span-2">
                  <FormField 
                    label="Geographic HQ Address" 
                    value={isEditing ? form.address : profile.address} 
                    disabled={!isEditing} 
                    onChange={(v: string) => setForm({...form, address: v})}
                  />
                </div>
              </div>
           </div>

           <div className="p-10 bg-indigo-600 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 p-20 opacity-10 group-hover:scale-110 transition-transform duration-1000"><Icons.Sparkles /></div>
              <div className="flex items-start gap-8">
                 <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-white shrink-0"><Icons.Sparkles /></div>
                 <div className="space-y-4">
                    <h5 className="text-lg font-black uppercase tracking-widest">Security Protocol Notice</h5>
                    <p className="text-indigo-100 text-sm font-medium leading-relaxed italic opacity-90">
                      "System metadata updates are recorded in the central authority audit log. Role credentials and Unique IDs are managed exclusively by the Network Master Admin to ensure infrastructure integrity."
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatLine = ({ icon, label, value }: any) => (
  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
    <span className="text-slate-400 dark:text-slate-500 flex items-center gap-2"><span>{icon}</span> {label}</span>
    <span className="text-slate-900 dark:text-white truncate max-w-[120px]">{value}</span>
  </div>
);

const TimelineItem = ({ icon, label, date, isActive }: any) => (
  <div className="flex items-start gap-6 relative group">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm z-10 border-4 transition-all duration-500 ${isActive ? 'bg-indigo-600 border-indigo-100 dark:border-slate-800 text-white scale-110' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}>
      {icon}
    </div>
    <div className="space-y-1">
      <p className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{label}</p>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{date}</p>
    </div>
  </div>
);

const FormField = ({ label, value, onChange, disabled, description }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center px-2">
      <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{label}</label>
      {description && <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest">{description}</span>}
    </div>
    <input 
      type="text"
      className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold transition-all outline-none text-slate-900 dark:text-white ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : 'focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900'}`}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
    />
  </div>
);
