
import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { MOCK_DATA } from '../data/mockDb';
import { Icons } from '../constants';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuthContext();
  const profile = MOCK_DATA.profiles.find(p => p.uid === currentUser?.uid) || {
    uniqueId: 'UID-GEN-PENDING',
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    contact: 'NOT_SET',
    address: 'HQ_DEFAULT',
    role: currentUser?.role || ''
  };

  return (
    <div className="max-w-4xl space-y-12 animate-in slide-in-from-bottom duration-700">
      <header>
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Credential Hub</h2>
        <p className="text-slate-400 font-bold mt-2 uppercase text-xs tracking-[0.3em]">Identity Security Protocol</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm text-center">
           <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black mx-auto mb-8 shadow-2xl shadow-indigo-200 border-4 border-white">
             {profile.name.charAt(0)}
           </div>
           <h3 className="text-2xl font-black text-slate-900 tracking-tight">{profile.name}</h3>
           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-3 bg-indigo-50 inline-block px-4 py-1.5 rounded-xl border border-indigo-100">
             {profile.uniqueId}
           </p>
           
           <div className="mt-10 pt-10 border-t border-slate-100 space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Designation</span>
                <span className="text-slate-900">{profile.role}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Network Status</span>
                <span className="text-emerald-500">Authorized</span>
              </div>
           </div>
        </div>

        <div className="md:col-span-2 space-y-10">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Identity Metadata</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <ProfileField label="Registry Email" value={profile.email} disabled />
                <ProfileField label="Contact Channel" value={profile.contact} placeholder="+1 000 000 0000" />
                <ProfileField label="Geographic HQ" value={profile.address} placeholder="HQ Location" />
                <ProfileField label="Role Credential" value={profile.role} disabled />
              </div>
              <button className="bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl">Update Metadata</button>
           </div>

           <div className="p-10 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] text-indigo-700 text-sm font-medium italic flex items-center gap-6">
              <div className="text-indigo-600 scale-150"><Icons.Sparkles /></div>
              <p>"Note: Your industrial identifier (UID) and system role are immutable by the current authorization level. Contact a Master Admin for credential alterations."</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({ label, value, placeholder, disabled }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">{label}</label>
    <input 
      type="text"
      className={`w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold transition-all outline-none ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'focus:ring-2 focus:ring-indigo-500 focus:bg-white'}`}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
    />
  </div>
);
