
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { UserRole, AuthStatus, ProfileStatus } from './types';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { SalesDashboard } from './dashboards/SalesDashboard';
import { OpsDashboard } from './dashboards/OpsDashboard';
import { ProfilePage } from './dashboards/ProfilePage';
import { LeadsPage } from './pages/LeadsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { UsersPage } from './pages/UsersPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { LeadDetailsPage } from './pages/LeadDetailsPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { UniversalAddPage } from './pages/UniversalAddPage';
import { ReportsPage } from './pages/ReportsPage';
import { Icons } from './constants';
import { MOCK_DB } from './data/mockDb';

export type RoutePath = 'dashboard' | 'leads' | 'lead-detail' | 'projects' | 'projects-flow' | 'project-detail' | 'users' | 'user-detail' | 'profile' | 'add' | 'reports';

interface RouteState {
  path: RoutePath;
  params?: Record<string, any>;
}

const AppRouter: React.FC = () => {
  const { currentUser, isLoggedIn, authStatus, profileStatus, status, logout, updateProfileStatus } = useAuthContext();
  const [route, setRoute] = useState<RouteState>({ path: 'dashboard' });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showProfileModal, setShowProfileModal] = useState(false);

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
  if (!isLoggedIn) return <LoginScreen />;

  // PHASE 1 MANDATORY LOGIC
  const isUnverified = authStatus === AuthStatus.UNVERIFIED;
  const isIncompleteProfile = authStatus === AuthStatus.ACTIVE && profileStatus !== ProfileStatus.COMPLETED;
  const isDashboardLocked = isUnverified || isIncompleteProfile;

  // Sidebar Visibility Rule: Hidden for unverified, visible but locked for active+incomplete
  const showSidebar = !isUnverified;

  const renderContent = () => {
    switch (route.path) {
      case 'add': return <UniversalAddPage onNavigate={navigate} />;
      case 'leads': return <LeadsPage params={route.params} onNavigate={navigate} />;
      case 'lead-detail': return <LeadDetailsPage id={route.params?.id} onNavigate={navigate} />;
      case 'projects':
      case 'projects-flow': return <ProjectsPage isFlow={route.path === 'projects-flow'} params={route.params} onNavigate={navigate} />;
      case 'project-detail': return <ProjectDetailsPage id={route.params?.id} onNavigate={navigate} />;
      case 'users': return <UsersPage params={route.params} onNavigate={navigate} />;
      case 'user-detail': return <UserDetailPage id={route.params?.id} onNavigate={navigate} />;
      case 'profile': return <ProfilePage />;
      case 'reports': return <ReportsPage />;
      case 'dashboard':
      default:
        switch (currentUser?.role) {
          case UserRole.MASTER_ADMIN: return <AdminDashboard onNavigate={navigate} />;
          case UserRole.SALES: return <SalesDashboard onNavigate={navigate} />;
          case UserRole.OPERATIONS: return <OpsDashboard onNavigate={navigate} />;
          default: return <div className="p-20 text-center font-black">Unauthorized Node Access</div>;
        }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-inter overflow-hidden relative">
      {/* SIDEBAR */}
      {showSidebar && (
        <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} bg-white dark:bg-slate-900 flex flex-col p-4 shadow-xl shrink-0 z-20 sidebar-transition border-r border-slate-200 dark:border-slate-800 ${isIncompleteProfile ? 'pointer-events-none grayscale opacity-30 select-none' : ''}`}>
          <div onClick={() => !isDashboardLocked && navigate('dashboard')} className="flex items-center gap-3 mb-10 px-2 cursor-pointer group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg transition-transform group-hover:scale-110">S</div>
            {!isSidebarCollapsed && <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Synckraft</h1>}
          </div>
          
          <nav className="flex-1 space-y-2">
            <SidebarLink icon={<Icons.Dashboard />} label="Dashboard" isActive={route.path === 'dashboard'} isCollapsed={isSidebarCollapsed} onClick={() => navigate('dashboard')} />
            {currentUser?.role === UserRole.MASTER_ADMIN && (
              <SidebarLink icon={<Icons.Users />} label="Users" isActive={route.path === 'users' || route.path === 'user-detail'} isCollapsed={isSidebarCollapsed} onClick={() => navigate('users')} />
            )}
            <SidebarLink icon={<Icons.Leads />} label="Leads" isActive={route.path === 'leads' || route.path === 'lead-detail'} isCollapsed={isSidebarCollapsed} onClick={() => navigate('leads')} />
            <SidebarLink icon={<Icons.Operations />} label="Projects" isActive={route.path === 'projects' || route.path === 'projects-flow' || route.path === 'project-detail'} isCollapsed={isSidebarCollapsed} onClick={() => navigate('projects')} />
            <SidebarLink icon={<Icons.Dashboard />} label="Reports" isActive={route.path === 'reports'} isCollapsed={isSidebarCollapsed} onClick={() => navigate('reports')} />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <SidebarLink icon={<Icons.Users />} label="My Profile" isActive={route.path === 'profile'} isCollapsed={isSidebarCollapsed} onClick={() => navigate('profile')} />
          </div>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 glass-morphism flex items-center justify-between px-8 z-10 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-4">
             {showSidebar && (
               <button onClick={() => !isIncompleteProfile && setIsSidebarCollapsed(!isSidebarCollapsed)} className={`p-2 text-slate-400 hover:text-indigo-600 transition-colors ${isIncompleteProfile ? 'opacity-20 cursor-not-allowed' : ''}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
               </button>
             )}
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{route.path} Registry</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <div className={`flex items-center gap-3 ${isDashboardLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}`} onClick={() => !isDashboardLocked && navigate('profile')}>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-900 dark:text-white leading-none">{currentUser?.displayName}</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">{currentUser?.role}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                {currentUser?.displayName.charAt(0)}
              </div>
            </div>
            {/* LOGOUT - ALWAYS ENABLED */}
            <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Emergency Logout">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        {/* STATE OVERLAY BANNERS */}
        {isUnverified && (
          <div className="absolute inset-x-0 top-16 z-30 bg-rose-600 text-white p-4 text-center shadow-xl animate-slide-down flex items-center justify-center gap-6">
             <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs animate-pulse">🔒</div>
             <p className="text-[11px] font-black uppercase tracking-[0.2em]">Your account is pending administrator approval.</p>
             <div className="w-8 h-8" /> 
          </div>
        )}
        {isIncompleteProfile && (
          <div className="absolute inset-x-0 top-16 z-30 bg-indigo-600 text-white p-4 text-center shadow-xl animate-slide-down flex items-center justify-center gap-6">
             <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs">👤</div>
             <p className="text-[11px] font-black uppercase tracking-[0.1em]">Complete your profile to unlock full dashboard access.</p>
             <button 
                onClick={() => setShowProfileModal(true)} 
                className="bg-white text-indigo-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
             >
               Start Onboarding
             </button>
          </div>
        )}

        {/* MAIN VIEW - BLUR LOGIC */}
        <main className={`flex-1 overflow-y-auto p-8 relative animate-fade-in bg-slate-50 dark:bg-slate-950 transition-all duration-1000 ${isDashboardLocked ? 'blur-2xl select-none pointer-events-none grayscale scale-[0.98]' : ''}`}>
          {renderContent()}
        </main>

        {/* PROFILE COMPLETION OVERLAY */}
        {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in">
             <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl animate-in zoom-in-95 border border-slate-200 dark:border-slate-800 relative">
                <button onClick={() => setShowProfileModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-rose-500 transition-colors">✕</button>
                <ProfileOnboardingModule onComplete={() => { setShowProfileModal(false); updateProfileStatus(ProfileStatus.COMPLETED); }} />
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileOnboardingModule: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { currentUser } = useAuthContext();
  const [form, setForm] = useState({
    name: currentUser?.displayName || '',
    mobile: currentUser?.mobile || '',
    address: currentUser?.location?.address || '',
    city: currentUser?.location?.city || '',
    state: currentUser?.location?.state || '',
    pincode: currentUser?.location?.pincode || '',
    roleDetails: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    MOCK_DB.updateUser(currentUser!.uid, { 
      displayName: form.name, 
      mobile: form.mobile, 
      location: { address: form.address, city: form.city, state: form.state, pincode: form.pincode },
      profileStatus: ProfileStatus.COMPLETED,
      profileCompleted: true
    });
    // Trigger local update immediately
    onComplete();
  };

  return (
    <div className="space-y-8">
       <div className="text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-xl shadow-indigo-600/20">S</div>
          <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">Identity Hub Sync</h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Operational Onboarding Protocol</p>
       </div>
       <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Verified Identity Name" value={form.name} onChange={v => setForm({...form, name: v})} />
          <Input label="Primary Communication Channel" value={form.mobile} onChange={v => setForm({...form, mobile: v})} />
          <div className="grid grid-cols-2 gap-4">
             <Input label="Registry City" value={form.city} onChange={v => setForm({...form, city: v})} />
             <Input label="Zip/Pincode" value={form.pincode} onChange={v => setForm({...form, pincode: v})} />
          </div>
          <Input label="Geographic HQ Address" value={form.address} onChange={v => setForm({...form, address: v})} />
          
          <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/30 active:scale-95 transition-all mt-6">Authorize Identity Sync</button>
       </form>
    </div>
  );
};

const Input = ({ label, value, onChange }: any) => (
  <div className="space-y-1">
    <label className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] ml-4">{label}</label>
    <input 
      required
      value={value} 
      onChange={e => onChange(e.target.value)}
      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all shadow-inner" 
    />
  </div>
);

const SystemLoader: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
    <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full shadow-2xl shadow-indigo-600/50" />
    <p className="mt-8 text-indigo-400 text-[11px] font-black uppercase tracking-[0.5em] animate-pulse">Initializing Security Protocol...</p>
  </div>
);

const SidebarLink: React.FC<{ icon: React.ReactNode, label: string, isActive?: boolean, isCollapsed: boolean, onClick: () => void }> = ({ icon, label, isActive, isCollapsed, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all group ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} ${isCollapsed ? 'justify-center' : ''}`}>
    <div className={`w-5 h-5 flex items-center justify-center ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>{icon}</div>
    {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest text-left">{label}</span>}
  </button>
);

const LoginScreen: React.FC = () => {
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
      <div className={`bg-slate-900 p-12 rounded-[4rem] border border-slate-800 w-full max-w-md shadow-2xl transition-all ${error ? 'animate-shake' : ''}`}>
        <div className="flex justify-center mb-8"><div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-600/20">S</div></div>
        <h2 className="text-3xl font-black text-white text-center mb-2 tracking-tight">Synckraft Enterprise</h2>
        <p className="text-slate-500 text-center mb-10 text-[10px] font-black uppercase tracking-[0.3em]">Network Authority Terminal</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Registry Signal (Email)" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800 border-none rounded-2xl p-5 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" required />
          <input type="password" placeholder="Passkey Override" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800 border-none rounded-2xl p-5 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" required />
          <button type="submit" className="w-full bg-indigo-600 py-5 rounded-[2rem] font-black text-white uppercase tracking-widest shadow-xl shadow-indigo-600/30 active:scale-95 transition-all mt-4">Authorize Node Access</button>
        </form>
        <div className="mt-10 p-5 bg-slate-800/40 rounded-3xl border border-slate-700/50 text-[10px] text-slate-500 font-mono space-y-2">
           <p className="text-indigo-400 font-black mb-1 tracking-widest uppercase">System Test Signals:</p>
           <div className="flex justify-between"><span>Admin Hub:</span> <span className="text-slate-300">admin@gmail.com</span></div>
           <div className="flex justify-between"><span>Sales Node:</span> <span className="text-slate-300">sales@gmail.com</span></div>
           <div className="flex justify-between"><span>Pending Node:</span> <span className="text-slate-300 font-black text-rose-400">user1@gmail.com</span></div>
           <p className="mt-2 text-[9px] italic border-t border-slate-700 pt-2 text-center">Protocol Passkey: password123</p>
        </div>
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
