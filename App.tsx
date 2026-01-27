
import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { UserRole, UserStatus } from './types';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { SalesDashboard } from './dashboards/SalesDashboard';
import { OpsDashboard } from './dashboards/OpsDashboard';
import { ProfilePage } from './dashboards/ProfilePage';
import { LeadsPage } from './pages/LeadsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { UsersPage } from './pages/UsersPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { Icons } from './constants';
import { MOCK_DB } from './data/mockDb';

export type RoutePath = 'dashboard' | 'leads' | 'projects' | 'projects-flow' | 'project-detail' | 'users' | 'user-detail' | 'profile';

interface RouteState {
  path: RoutePath;
  params?: Record<string, any>;
}

const AppRouter: React.FC = () => {
  const { currentUser, status, logout } = useAuthContext();
  const [page, setPage] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [route, setRoute] = useState<RouteState>({ path: 'dashboard' });
  const [showWelcome, setShowWelcome] = useState(false);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'AUTHENTICATED' && currentUser?.status === UserStatus.APPROVED) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentUser?.status, status]);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) html.classList.add('dark');
    else html.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const navigate = (path: RoutePath, params?: Record<string, any>) => {
    setRoute({ path, params });
  };

  if (status === 'LOADING') return <SystemLoader />;
  if (status === 'UNAUTHENTICATED') {
    return page === 'LOGIN' 
      ? <LoginScreen onSwitchToRegister={() => setPage('REGISTER')} /> 
      : <RegisterScreen onSwitchToLogin={() => setPage('LOGIN')} />;
  }

  if (currentUser?.status === UserStatus.PENDING) return <PendingApprovalScreen onLogout={logout} />;
  if (showWelcome) return <WelcomeScreen name={currentUser?.displayName || 'Authorized User'} />;

  const renderContent = () => {
    switch (route.path) {
      case 'leads': return <LeadsPage params={route.params} onNavigate={navigate} />;
      case 'projects':
      case 'projects-flow': return <ProjectsPage isFlow={route.path === 'projects-flow'} params={route.params} onNavigate={navigate} />;
      case 'project-detail': return <ProjectDetailsPage id={route.params?.id} onNavigate={navigate} />;
      case 'users': return <UsersPage params={route.params} onNavigate={navigate} />;
      case 'user-detail': return <UserDetailPage id={route.params?.id} onNavigate={navigate} />;
      case 'profile': return <ProfilePage />;
      case 'dashboard':
      default:
        switch (currentUser?.role) {
          case UserRole.MASTER_ADMIN: return <AdminDashboard onNavigate={navigate} />;
          case UserRole.SALES: return <SalesDashboard onNavigate={navigate} />;
          case UserRole.OPERATIONS: return <OpsDashboard onNavigate={navigate} />;
          default: return <div className="p-20 text-center font-black">Role Undefined. Contact Admin.</div>;
        }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-inter overflow-hidden">
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} bg-white dark:bg-slate-900 flex flex-col p-4 shadow-xl shrink-0 z-20 sidebar-transition border-r border-slate-200 dark:border-slate-800`}>
        <div onClick={() => navigate('dashboard')} className="flex items-center gap-3 mb-10 px-2 cursor-pointer group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg transition-transform group-hover:scale-110">S</div>
          {!isSidebarCollapsed && <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Synckraft</h1>}
        </div>
        <nav className="flex-1 space-y-2">
          <SidebarLink icon={<Icons.Dashboard />} label="Dashboard" isActive={route.path === 'dashboard'} isCollapsed={isSidebarCollapsed} onClick={() => navigate('dashboard')} />
          <SidebarLink icon={<Icons.Leads />} label="Leads" isActive={route.path === 'leads'} isCollapsed={isSidebarCollapsed} onClick={() => navigate('leads')} />
          <SidebarLink icon={<Icons.Operations />} label="Projects" isActive={route.path === 'projects' || route.path === 'projects-flow' || route.path === 'project-detail'} isCollapsed={isSidebarCollapsed} onClick={() => navigate('projects')} />
          {currentUser?.role === UserRole.MASTER_ADMIN && (
            <SidebarLink icon={<Icons.Users />} label="User Registry" isActive={route.path === 'users' || route.path === 'user-detail'} isCollapsed={isSidebarCollapsed} onClick={() => navigate('users')} />
          )}
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
          <SidebarLink icon={<Icons.Users />} label="Profile" isActive={route.path === 'profile'} isCollapsed={isSidebarCollapsed} onClick={() => navigate('profile')} />
          <button onClick={logout} className={`w-full flex items-center gap-3 p-4 text-slate-400 hover:text-rose-500 rounded-2xl transition-all ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <Icons.Users />
            {!isSidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>}
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 glass-morphism flex items-center justify-between px-8 z-10 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{route.path.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {isDarkMode ? <span className="text-amber-400">☀️</span> : <span className="text-slate-500">🌙</span>}
            </button>
            <div className="flex items-center gap-3 ml-4">
              <div className="text-right hidden sm:block"><p className="text-[10px] font-black text-slate-900 dark:text-white leading-none">{currentUser?.displayName}</p></div>
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">{currentUser?.displayName.charAt(0)}</div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 relative animate-fade-in bg-slate-50 dark:bg-slate-950">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const SidebarLink: React.FC<{ icon: React.ReactNode, label: string, isActive?: boolean, isCollapsed: boolean, onClick: () => void }> = ({ icon, label, isActive, isCollapsed, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} ${isCollapsed ? 'justify-center p-4' : ''}`}>
    <div className={`w-5 h-5 flex items-center justify-center transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
    {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>}
  </button>
);

const SystemLoader: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full" />
    <p className="mt-6 text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Initializing Command Console...</p>
  </div>
);

const PendingApprovalScreen: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-8 border border-amber-500/20 text-amber-500 font-bold text-3xl">!</div>
    <h1 className="text-3xl font-black text-white mb-4 tracking-tighter">Verification Required</h1>
    <p className="text-slate-400 max-w-sm mb-10 text-xs">Your node is active but requires Master Admin authorization to sync. Contact the system administrator.</p>
    <div className="flex gap-4">
      <button onClick={() => window.location.reload()} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Check Status</button>
      <button onClick={onLogout} className="px-8 py-4 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Sign Out</button>
    </div>
  </div>
);

const WelcomeScreen: React.FC<{ name: string }> = ({ name }) => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
    <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">Welcome, {name.split(' ')[0]}</h1>
    <p className="text-indigo-400 font-bold uppercase text-[10px] tracking-[0.4em] animate-pulse">Syncing Enterprise Node...</p>
  </div>
);

const LoginScreen: React.FC<{ onSwitchToRegister: () => void }> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { login } = useAuthContext();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    const success = await login(email, password);
    if (!success) setError(true);
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className={`bg-slate-900 p-12 rounded-[3rem] border border-slate-800 w-full max-w-md shadow-2xl transition-transform ${error ? 'animate-shake' : ''}`}>
        <div className="flex justify-center mb-8"><div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">S</div></div>
        <h2 className="text-2xl font-black text-white text-center mb-2 tracking-tight">Synckraft Enterprise</h2>
        <p className="text-slate-500 text-center mb-10 text-[10px] font-black uppercase tracking-widest">System Authentication</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Work Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
          <input type="password" placeholder="Passkey" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none" required />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-black text-white uppercase tracking-widest shadow-xl transition-all active:scale-95">Verify ID</button>
        </form>
        <button onClick={onSwitchToRegister} className="w-full mt-8 text-indigo-400 text-[10px] font-black uppercase tracking-widest">Register New Authority Node</button>
      </div>
    </div>
  );
};

const RegisterScreen: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const { register } = useAuthContext();
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', address: '', city: '', state: '', pincode: '', age: '', gender: 'Male', aadhaar: '', password: '' });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register(form);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
        <div className="bg-slate-900 p-12 rounded-[3rem] border border-slate-800 w-full max-w-md shadow-2xl animate-in zoom-in-95">
          <h2 className="text-2xl font-black text-white mb-4 tracking-tighter">Registration Complete</h2>
          <p className="text-slate-400 mb-10 text-xs">Identity submitted for verification. Node access is currently: PENDING.</p>
          <button onClick={onSwitchToLogin} className="w-full bg-indigo-600 py-4 rounded-2xl font-black text-white uppercase tracking-widest">Return to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 p-12 rounded-[3.5rem] border border-slate-800 w-full max-w-2xl shadow-2xl animate-in slide-in-from-bottom">
        <h2 className="text-2xl font-black text-white tracking-tight mb-8">Node Registry</h2>
        <form onSubmit={handleRegister} className="space-y-6">
          {step === 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white outline-none" required />
              <input type="email" placeholder="Work Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white outline-none" required />
              <input type="tel" placeholder="Mobile" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white outline-none" required />
              <input type="password" placeholder="Passkey" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white outline-none" required />
              <div className="md:col-span-2 pt-4">
                <button type="button" onClick={() => setStep(2)} className="w-full bg-indigo-600 py-4 rounded-2xl font-black text-white uppercase tracking-widest shadow-xl">Next Phase</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Aadhaar UID" value={form.aadhaar} onChange={e => setForm({...form, aadhaar: e.target.value})} className="md:col-span-2 w-full bg-slate-800 border-none rounded-2xl p-4 text-white outline-none" required />
              <input type="text" placeholder="HQ Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="md:col-span-2 w-full bg-slate-800 border-none rounded-2xl p-4 text-white outline-none" required />
              <div className="md:col-span-2 pt-4 flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-slate-800 py-4 rounded-2xl font-black text-white uppercase tracking-widest">Back</button>
                <button type="submit" className="flex-[2] bg-indigo-600 py-4 rounded-2xl font-black text-white uppercase tracking-widest shadow-xl">Confirm Registry</button>
              </div>
            </div>
          )}
        </form>
        <button onClick={onSwitchToLogin} className="w-full mt-8 text-slate-500 text-[10px] font-black uppercase tracking-widest">Already authorized? Log In</button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
