
import React, { useState } from 'react';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { UserRole, UserStatus } from './types';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { SalesDashboard } from './dashboards/SalesDashboard';
import { OpsDashboard } from './dashboards/OpsDashboard';
import { ProfilePage } from './dashboards/ProfilePage';
import { Icons } from './constants';

// --- SUB-COMPONENTS FOR CLEAN FLOW ---

const LoginScreen: React.FC<{ onSwitchToRegister: () => void }> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthContext();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(email, password)) {
      alert("Invalid Security Credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl">
            <Icons.Dashboard />
          </div>
        </div>
        <h2 className="text-3xl font-black text-white text-center mb-2 tracking-tight">Synckraft</h2>
        <p className="text-slate-500 text-center mb-10 text-sm font-medium uppercase tracking-widest">Master Authority Login</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-black text-white uppercase tracking-widest transition-all">Sign In</button>
        </form>
        <button onClick={onSwitchToRegister} className="w-full mt-6 text-indigo-400 text-xs font-bold uppercase tracking-widest hover:underline">New to Synckraft? Register</button>
      </div>
    </div>
  );
};

const RegisterScreen: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.SALES);
  const { register } = useAuthContext();
  const [success, setSuccess] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register(name, email, role);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 w-full max-w-md text-center shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-4">Registration Sent</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">Identity created for {email}. Access is currently PENDING. Await Master Admin verification.</p>
          <button onClick={onSwitchToLogin} className="w-full bg-indigo-600 py-4 rounded-2xl font-black text-white uppercase">Return to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-black text-white text-center mb-8 tracking-tight">Access Registry</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white outline-none" required />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white outline-none" required />
          <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white outline-none">
            <option value={UserRole.SALES}>SALES AGENT</option>
            <option value={UserRole.OPERATIONS}>OPS SPECIALIST</option>
          </select>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-black text-white uppercase tracking-widest transition-all">Register Protocol</button>
        </form>
        <button onClick={onSwitchToLogin} className="w-full mt-6 text-slate-500 text-xs font-bold uppercase tracking-widest hover:underline">Already have access? Login</button>
      </div>
    </div>
  );
};

const PendingView: React.FC = () => {
  const { logout, currentUser } = useAuthContext();
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-8 border-2 border-amber-500/20 shadow-2xl">
        <div className="text-amber-500 scale-150"><Icons.Users /></div>
      </div>
      <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Access Restricted</h1>
      <p className="text-slate-400 max-w-md mb-12 leading-relaxed">Identity detected: <span className="text-indigo-400">{currentUser?.email}</span>. Account awaiting Master Admin verification.</p>
      <button onClick={logout} className="px-10 py-4 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase hover:bg-slate-700 transition-all">Logout</button>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const AuthenticatedApp: React.FC = () => {
  const { currentUser, logout } = useAuthContext();
  const [screen, setScreen] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile'>('dashboard');

  console.log("RENDER DEBUG - USER:", currentUser);

  // 1. ANONYMOUS STATE
  if (currentUser === null) {
    if (screen === 'REGISTER') return <RegisterScreen onSwitchToLogin={() => setScreen('LOGIN')} />;
    return <LoginScreen onSwitchToRegister={() => setScreen('REGISTER')} />;
  }

  // 2. PENDING STATE
  if (currentUser.status === UserStatus.PENDING) {
    return <PendingView />;
  }

  // 3. AUTHORIZED STATE
  let mainContent;
  if (activeTab === 'profile') {
    mainContent = <ProfilePage />;
  } else {
    // Role Switch
    switch (currentUser.role) {
      case UserRole.MASTER_ADMIN: mainContent = <AdminDashboard />; break;
      case UserRole.SALES: mainContent = <SalesDashboard />; break;
      case UserRole.OPERATIONS: mainContent = <OpsDashboard />; break;
      default: mainContent = <div className="p-20 text-slate-400 text-center font-black">UNAUTHORIZED ROLE</div>;
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 font-inter overflow-hidden">
      <aside className="w-72 bg-slate-900 flex flex-col p-6 shadow-2xl shrink-0 z-10">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white">S</div>
          <h1 className="text-lg font-black text-white tracking-tight">Synckraft</h1>
        </div>

        <nav className="flex-1 space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
            <Icons.Dashboard /> Dashboard
          </button>
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
            <Icons.Users /> Profile
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="mb-6 px-2">
            <p className="text-white text-sm font-bold truncate">{currentUser.displayName}</p>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{currentUser.role.replace('_', ' ')}</p>
          </div>
          <button onClick={logout} className="w-full py-3 bg-slate-800 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-400 transition-all">Logout</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 relative">
        <div className="max-w-6xl mx-auto">
          {mainContent}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
