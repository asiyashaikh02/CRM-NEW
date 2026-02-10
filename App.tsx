
import React, { useState, useMemo, useEffect } from 'react';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { UserRole, RoutePath, ViewState } from './types';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { SalesDashboard } from './dashboards/SalesDashboard';
import { OpsDashboard } from './dashboards/OpsDashboard';
import { LeadsPage } from './pages/LeadsPage';
import { OrdersPage } from './pages/OrdersPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { UniversalAddPage } from './pages/UniversalAddPage';
import { UsersPage } from './pages/UsersPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { CustomerCreatePage } from './pages/CustomerCreatePage';
import { 
  Layout, 
  LogOut, 
  Sun, 
  Target, 
  ClipboardList, 
  IndianRupee, 
  Plus,
  Users,
  ShieldAlert,
  Lock,
  ChevronLeft,
  Briefcase,
  Activity,
  ArrowLeft
} from 'lucide-react';

const ROLE_PERMISSIONS: Record<UserRole, RoutePath[]> = {
  [UserRole.ADMIN]: ['dashboard', 'leads', 'lead-detail', 'orders', 'order-detail', 'payments', 'payment-detail', 'users', 'user-detail', 'customers', 'project-detail', 'add', 'reports'],
  [UserRole.SALES_MANAGER]: ['dashboard', 'leads', 'lead-detail', 'customers', 'project-detail', 'add-customer', 'add', 'users'],
  [UserRole.OPS_MANAGER]: ['dashboard', 'orders', 'order-detail', 'payments', 'payment-detail', 'customers', 'project-detail', 'users'],
  [UserRole.SALES_USER]: ['dashboard', 'leads', 'lead-detail', 'customers', 'project-detail', 'add-customer', 'add'],
  [UserRole.OPS_USER]: ['dashboard', 'orders', 'order-detail', 'payments', 'payment-detail', 'customers', 'project-detail'],
  [UserRole.SALES]: ['dashboard', 'leads', 'lead-detail', 'customers', 'project-detail', 'add-customer', 'add'],
  [UserRole.OPS]: ['dashboard', 'orders', 'order-detail', 'payments', 'payment-detail', 'customers', 'project-detail'],
  [UserRole.USER]: ['dashboard', 'leads', 'lead-detail', 'orders', 'order-detail', 'payments', 'payment-detail']
};

const LoginPage = ({ onLogin }: any) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await onLogin(email, pass);
    if (!result.success) setError(result.message || "Authentication failure.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-inter">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 text-center">
        <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-lg shadow-brand-blue/30">
          <Sun size={32} />
        </div>
        <h1 className="text-3xl font-bold font-grotesk tracking-tight text-slate-900 leading-none">Synckraft Portal</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Lock size={10} className="text-amber-500" />
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.3em] font-black">PHASE 5 • FINAL PRODUCTION</p>
        </div>
        {error && <div className="bg-rose-50 text-rose-500 p-4 rounded-xl text-xs font-bold mt-6">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4 mt-8">
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue transition-all" placeholder="Registry Email" />
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-blue transition-all" placeholder="Access Key" />
          <button type="submit" disabled={loading} className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-brand-dark transition-all">
            {loading ? 'Decrypting...' : 'Authorize Access'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { currentUser, status, logout, login } = useAuthContext();
  const [view, setView] = useState<ViewState>({ path: 'dashboard' });

  // Browser History Sync
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        setView(event.state);
      } else {
        setView({ path: 'dashboard' });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const canAccess = (path: RoutePath): boolean => {
    if (!currentUser) return false;
    const allowed = ROLE_PERMISSIONS[currentUser.role] || [];
    return allowed.includes(path);
  };

  const navigate = (path: RoutePath, id?: string) => {
    if (canAccess(path)) {
      const newState = { path, id };
      window.history.pushState(newState, '', `#${path}${id ? '/' + id : ''}`);
      setView(newState);
    }
  };

  const menuItems = useMemo(() => {
    if (!currentUser) return [];
    const allOptions = [
      { id: 'dashboard', icon: <Layout size={18}/>, label: 'Dashboard', path: 'dashboard' as RoutePath },
      { id: 'leads', icon: <Target size={18}/>, label: 'Leads', path: 'leads' as RoutePath },
      { id: 'customers', icon: <Briefcase size={18}/>, label: 'Customers', path: 'customers' as RoutePath },
      { id: 'orders', icon: <ClipboardList size={18}/>, label: 'Orders', path: 'orders' as RoutePath },
      { id: 'payments', icon: <IndianRupee size={18}/>, label: 'Payments', path: 'payments' as RoutePath },
      { id: 'users', icon: <Users size={18}/>, label: 'Personnel', path: 'users' as RoutePath },
      { id: 'reports', icon: <Activity size={18}/>, label: 'Audit Log', path: 'reports' as RoutePath },
    ];
    return allOptions.filter(item => canAccess(item.path));
  }, [currentUser]);

  if (status === 'LOADING') return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div></div>;
  if (!currentUser) return <LoginPage onLogin={login} />;

  const renderDashboard = () => {
    switch (currentUser.role) {
      case UserRole.ADMIN:
        return <AdminDashboard onNavigate={navigate} />;
      case UserRole.SALES_MANAGER:
      case UserRole.SALES_USER:
      case UserRole.SALES:
        return <SalesDashboard onNavigate={navigate} />;
      case UserRole.OPS_MANAGER:
      case UserRole.OPS_USER:
      case UserRole.OPS:
        return <OpsDashboard onNavigate={navigate} />;
      default:
        return <AdminDashboard onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-inter overflow-hidden h-screen">
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col z-40 shadow-sm shrink-0 md:h-full overflow-y-auto">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg"><Sun size={20} /></div>
          <span className="font-grotesk font-bold tracking-tight text-xl text-slate-900 leading-none">Synckraft</span>
        </div>
        <nav className="flex-1 space-y-1">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => navigate(item.path)} 
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${view.path === item.path ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
          {canAccess('add-customer') && (
            <button onClick={() => navigate('add-customer')} className="w-full flex items-center gap-4 px-4 py-3.5 mt-4 rounded-2xl font-bold text-sm bg-brand-blue text-white shadow-xl shadow-brand-blue/20 hover:bg-brand-dark transition-all">
              <Plus size={18}/> New Node
            </button>
          )}
        </nav>
        <div className="pt-8 mt-8 border-t border-slate-100">
          <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-900 uppercase truncate">{currentUser.displayName}</p>
            <p className="text-[7px] font-black text-brand-blue uppercase tracking-widest mt-1">{currentUser.role.replace('_', ' ')} SECURITY</p>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3.5 mt-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-bold text-sm"><LogOut size={18}/> Exit Portal</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col h-full relative">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            {window.history.length > 1 && (
              <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{view.path.replace('-', ' ')} segment</div>
          </div>
          <div className="hidden md:flex text-[10px] font-black text-slate-900 items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            LIVE DEPLOYMENT STREAM
          </div>
        </header>

        <div className="p-6 md:p-10 flex-1">
          {view.path === 'dashboard' && renderDashboard()}
          {(view.path === 'leads' || view.path === 'lead-detail') && <LeadsPage onNavigate={navigate} selectedId={view.id} />}
          {(view.path === 'orders' || view.path === 'order-detail') && <OrdersPage onNavigate={navigate} selectedId={view.id} />}
          {(view.path === 'payments' || view.path === 'payment-detail') && <PaymentsPage onNavigate={navigate} selectedId={view.id} />}
          {(view.path === 'users' || view.path === 'user-detail') && <UsersPage onNavigate={navigate} selectedId={view.id} />}
          {(view.path === 'customers' || view.path === 'project-detail') && <ProjectsPage onNavigate={navigate} />}
          {view.path === 'project-detail' && view.id && <ProjectDetailsPage id={view.id} onNavigate={navigate} />}
          {view.path === 'add-customer' && <CustomerCreatePage onNavigate={navigate} />}
          {view.path === 'add' && <UniversalAddPage onNavigate={navigate} />}
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
