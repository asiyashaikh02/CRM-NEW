
import React, { useState, useMemo } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { UserRole, RoutePath, UserStatus, User } from '../types';
import { Mail, ShieldCheck, ChevronRight, User as UserIcon, Lock, CheckCircle, Plus, MapPin, Key } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';

const InputField = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">{label}</label>
    <input 
      type={type} 
      value={value || ""} 
      onChange={e => onChange(e.target.value)} 
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue" 
      placeholder={placeholder}
      required
    />
  </div>
);

export const UsersPage: React.FC<{ onNavigate: (path: RoutePath, id?: string) => void, selectedId?: string }> = ({ onNavigate, selectedId }) => {
  const { currentUser } = useAuthContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState({ displayName: '', email: '', password: '', role: UserRole.SALES_USER, assignedArea: '' });

  const user = selectedId ? MOCK_DB.users.find(u => u.uid === selectedId) : null;

  const filteredUsers = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.ADMIN) return MOCK_DB.users;
    // Sales Head only sees their execs
    if (currentUser.role === UserRole.SALES_MANAGER) return MOCK_DB.users.filter(u => u.role === UserRole.SALES_USER || u.uid === currentUser.uid);
    // Ops Head only sees their execs
    if (currentUser.role === UserRole.OPS_MANAGER) return MOCK_DB.users.filter(u => u.role === UserRole.OPS_USER || u.uid === currentUser.uid);
    return [currentUser];
  }, [currentUser, refresh]);

  const isHead = currentUser && [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.OPS_MANAGER].includes(currentUser.role);

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    MOCK_DB.createUser(form, currentUser!);
    setShowAddModal(false);
    setForm({ displayName: '', email: '', password: '', role: UserRole.SALES_USER, assignedArea: '' });
    setRefresh(r => r + 1);
  };

  const handleApprove = (uid: string) => {
    MOCK_DB.approveUser(uid);
    setRefresh(r => r + 1);
  };

  if (selectedId && user) {
    return (
      <div className="max-w-3xl mx-auto space-y-10 animate-fade-in text-left">
        <header className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-8">
          <div className="w-24 h-24 bg-brand-blue rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-brand-blue/20">
            {user.displayName.charAt(0)}
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-slate-900">{user.displayName}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] font-black bg-brand-blue/5 text-brand-blue px-3 py-1 rounded-full uppercase tracking-widest">{user.role.replace('_', ' ')}</span>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2 ${user.status === UserStatus.APPROVED ? 'text-emerald-500' : 'text-amber-500'}`}>
                {user.status === UserStatus.APPROVED ? <CheckCircle size={10}/> : <Lock size={10}/>}
                {user.status}
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Network Identity</h4>
              <div className="space-y-4">
                 <div className="flex items-center gap-4 text-slate-600"><Mail size={16}/><span className="text-sm font-bold">{user.email}</span></div>
                 <div className="flex items-center gap-4 text-slate-600"><MapPin size={16}/><span className="text-sm font-bold">{user.assignedArea || 'Global'}</span></div>
                 <div className="flex items-center gap-4 text-slate-600"><Lock size={16}/><span className="text-xs font-mono font-bold text-slate-400">UID: {user.uid}</span></div>
              </div>
           </div>
           
           <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col justify-center">
              {user.status === UserStatus.PENDING && isHead && (
                <button onClick={() => handleApprove(user.uid)} className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                   <ShieldCheck size={18} /> Authorize Node
                </button>
              )}
              {user.status === UserStatus.APPROVED && (
                <div className="text-center space-y-2">
                   <CheckCircle size={40} className="mx-auto text-emerald-500 opacity-50 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Synchronized</p>
                   <p className="text-xs font-bold text-white">Personnel is active within the cluster.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter">Personnel Cluster</h2>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">Authorized Network Hierarchy</p>
        </div>
        {isHead && (
          <button onClick={() => setShowAddModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-3 hover:bg-brand-blue transition-all">
            <Plus size={16} /> New Employee
          </button>
        )}
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Personnel</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Area Assignment</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Auth Status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => (
                <tr 
                  key={u.uid} 
                  onClick={() => onNavigate('user-detail', u.uid)}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                        <UserIcon size={18}/>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.displayName}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{u.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-600 font-bold uppercase tracking-widest text-[10px]">{u.assignedArea || 'Unassigned'}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${u.status === UserStatus.APPROVED ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{u.status}</span>
                    </div>
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

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl border border-slate-200">
              <h3 className="text-2xl font-black tracking-tighter mb-2">Initialize Personnel</h3>
              <p className="text-slate-400 text-xs font-medium mb-10 italic">"Adding sub-unit to the department registry"</p>
              
              <form onSubmit={handleCreateEmployee} className="space-y-6">
                 <InputField label="Employee Name" value={form.displayName} onChange={(v: string) => setForm({...form, displayName: v})} placeholder="Full verified name" />
                 <InputField label="Network Email" type="email" value={form.email} onChange={(v: string) => setForm({...form, email: v})} placeholder="registry@synckraft.me" />
                 <div className="grid grid-cols-2 gap-4">
                    <InputField label="Access Password" type="password" value={form.password} onChange={(v: string) => setForm({...form, password: v})} placeholder="Min 6 chars" />
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Deployment Role</label>
                       <select value={form.role} onChange={e => setForm({...form, role: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold outline-none">
                          {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SALES_MANAGER) && <option value={UserRole.SALES_USER}>Sales Executive</option>}
                          {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.OPS_MANAGER) && <option value={UserRole.OPS_USER}>Ops Executive</option>}
                          {currentUser?.role === UserRole.ADMIN && <option value={UserRole.SALES_MANAGER}>Sales Manager</option>}
                          {currentUser?.role === UserRole.ADMIN && <option value={UserRole.OPS_MANAGER}>Ops Manager</option>}
                       </select>
                    </div>
                 </div>
                 <InputField label="Assigned Area / Territory" value={form.assignedArea} onChange={(v: string) => setForm({...form, assignedArea: v})} placeholder="e.g. Mumbai North" />

                 <div className="pt-6 flex gap-4">
                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Cancel</button>
                    <button type="submit" className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                       <ShieldCheck size={18} /> Sync Employee
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
