import React, { useState, useEffect, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  collection, onSnapshot, query, where, 
  getDocs, orderBy, deleteDoc, Timestamp, limit, serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, isFirebaseConfigured } from './lib/firebase';
import { 
  userService, leadService, orderService, paymentService, notificationService 
} from './lib/crm-service';
import { 
  UserRole, LeadStatus, OrderStatus, PlanType, PlanStatus, UserStatus,
  PaymentStatus, ClearanceStatus, PaymentMode, LeadPriority,
  Lead, Order, Payment, Notification, RoutePath, ViewState, UserProfile 
} from './types';
import { 
  LayoutDashboard, Users, Target, Package, CreditCard, Bell, 
  UserCircle, LogOut, Shield, Zap, Plus, Search, Filter, 
  ArrowRight, MapPin, Phone, Calendar, Clock, CheckCircle2, 
  TrendingUp, AlertTriangle, Loader2, ShieldCheck, ChevronRight,
  MoreVertical, Send, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

// New Components
import { Layout } from './components/Layout';
import { WhatsAppDashboard } from './components/WhatsAppDashboard';
import { SalesDashboard } from './components/SalesDashboard';
import { AdminDashboard } from './components/AdminDashboard';

const DEV_TEST_MODE = import.meta.env.VITE_DEV_TEST_MODE === 'true';

const TEST_USERS = [
  { email: 'admin@gmail.com', pass: 'admin123', role: UserRole.SUPER_ADMIN, name: 'Master Admin', dept: 'admin' },
  { email: 'sales@gmail.com', pass: 'sales123', role: UserRole.SALES_EXEC, name: 'Sales Lead', dept: 'sales' },
  { email: 'ops@gmail.com', pass: 'ops123', role: UserRole.OPERATIONS, name: 'Ops Chief', dept: 'ops' },
];

const useToast = () => {
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  return { toast, showToast };
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>({ path: 'dashboard' });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const { toast, showToast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("crm_user");
    if (saved && DEV_TEST_MODE) {
      const parsed = JSON.parse(saved);
      const testUser = TEST_USERS.find(u => u.email === parsed.email);
      if (testUser) {
        setUser({
          uid: `TEST-${testUser.role}`,
          name: testUser.name,
          displayName: testUser.name,
          email: testUser.email,
          phone: '0000000000',
          role: testUser.role as UserRole,
          department: testUser.dept as any,
          isActive: true,
          status: UserStatus.APPROVED,
          planType: PlanType.PLATINUM,
          planStatus: PlanStatus.ACTIVE,
          trialStartAt: null,
          trialEndAt: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          isDeleted: false,
          isProfileComplete: true,
        });
        setLoading(false);
      }
    }

    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const unsubProfile = userService.subscribeToProfile(fbUser.uid, (profile) => {
          setUser(profile);
          setLoading(false);
        });
        return () => unsubProfile();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !isFirebaseConfigured) return;

    const unsubs = [
      leadService.subscribeToLeads(user.role, user.uid, setLeads),
      orderService.subscribeToOrders(user.role, user.uid, setOrders),
      notificationService.subscribeToNotifications(user.uid, setNotifications),
    ];

    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OPS_ADMIN].includes(user.role)) {
      unsubs.push(paymentService.subscribeToPayments(setPayments));
    }

    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role)) {
      const q = query(collection(db, 'users'), where('isDeleted', '==', false));
      unsubs.push(onSnapshot(q, (snap) => {
        setAllUsers(snap.docs.map(d => d.data() as UserProfile));
      }));
    }

    return () => unsubs.forEach(u => u());
  }, [user]);

  const navigate = (path: RoutePath, id?: string) => setView({ path, id });

  const logout = async () => {
    if (DEV_TEST_MODE) localStorage.removeItem("crm_user");
    if (isFirebaseConfigured) await signOut(auth);
    setUser(null);
    navigate('dashboard');
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="space-y-6 text-center">
        <div className="w-20 h-20 bg-brand-blue rounded-[2rem] flex items-center justify-center text-white shadow-2xl animate-pulse mx-auto">
          <Zap size={40} fill="currentColor" />
        </div>
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.5em]">Initializing Neural Link</p>
      </div>
    </div>
  );

  if (!user) return <AuthPage setUser={setUser} navigate={navigate} />;

  if (user.status === UserStatus.PENDING) return <PendingAuth />;

  const renderContent = () => {
    switch (view.path) {
      case 'dashboard':
        if (user.role === UserRole.OPS_USER || user.role === UserRole.OPERATIONS) {
          return <WhatsAppDashboard user={user} orders={orders} />;
        }
        if (user.role === UserRole.SALES_USER || user.role === UserRole.SALES_EXEC) {
          return <SalesDashboard user={user} leads={leads} onNavigate={navigate} />;
        }
        return (
          <AdminDashboard 
            user={user} 
            leads={leads} 
            orders={orders} 
            payments={payments} 
            users={allUsers}
            onNavigate={navigate}
          />
        );
      case 'leads':
        return <SalesDashboard user={user} leads={leads} onNavigate={navigate} />;
      case 'orders':
        return <WhatsAppDashboard user={user} orders={orders} />;
      case 'payments':
        return <PaymentsPage user={user} orders={orders} leads={leads} />;
      case 'users':
        return <UsersPage />;
      case 'notifications':
        return <NotificationsPage notifications={notifications} />;
      default:
        return <div className="p-12 text-center text-slate-300 font-black uppercase tracking-widest">Protocol Not Found</div>;
    }
  };

  return (
    <Layout 
      user={user} 
      currentPath={view.path} 
      onNavigate={navigate} 
      onLogout={logout}
      notificationCount={notifications.filter(n => !n.isRead).length}
    >
      {renderContent()}
      
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-12 right-12 px-8 py-4 rounded-2xl shadow-2xl text-white font-black uppercase text-[10px] tracking-widest z-50 ${
            toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-brand-blue'
          }`}
        >
          {toast.msg}
        </motion.div>
      )}
    </Layout>
  );
}

const PendingAuth = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center space-y-6">
      <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl animate-bounce"><Shield size={32}/></div>
      <h2 className="text-3xl font-black">Pending Auth</h2>
      <p className="text-slate-400 font-bold">Node is active but unauthorized for session traffic.</p>
      <button onClick={()=>signOut(auth)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">Abort Session</button>
    </div>
  </div>
);

const AuthPage = ({ setUser, navigate }: { setUser: (u: UserProfile | null) => void, navigate: (path: RoutePath) => void }) => {
  const [login, setLogin] = useState(true);
  const [f, setF] = useState({ email: '', pass: '', name: '', role: UserRole.SALES_USER });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const sub = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (DEV_TEST_MODE) {
        const testUser = TEST_USERS.find(u => u.email === f.email && u.pass === f.pass);
        if (testUser) {
          localStorage.setItem("crm_user", JSON.stringify({
            email: testUser.email,
            role: testUser.role
          }));
          
          setUser({
            uid: `TEST-${testUser.role}`,
            name: testUser.name,
            displayName: testUser.name,
            email: testUser.email,
            phone: '0000000000',
            role: testUser.role as UserRole,
            department: testUser.dept as any,
            isActive: true,
            status: UserStatus.APPROVED,
            planType: PlanType.PLATINUM,
            planStatus: PlanStatus.ACTIVE,
            trialStartAt: null,
            trialEndAt: null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isDeleted: false,
            isProfileComplete: true,
          });

          showToast("Master Bypass Authorized.", "success");
          navigate('dashboard');
          setLoading(false);
          return;
        }
      }

      if (isFirebaseConfigured) {
        if (login) {
          await signInWithEmailAndPassword(auth, f.email, f.pass);
          showToast("Access authorized.", "success");
        } else {
          const c = await createUserWithEmailAndPassword(auth, f.email, f.pass);
          await userService.createUserProfile(c.user.uid, {
            name: f.name,
            email: f.email,
            role: f.role,
            department: f.role.includes('SALES') ? 'sales' : 'ops',
          });
          showToast("Node initialized. Awaiting admin approval.", "info");
        }
      } else {
        showToast("Firebase not configured. Use test accounts.", "error");
      }
    } catch (e: any) { 
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center space-y-6"
      >
        <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl"><Shield size={32}/></div>
        <h1 className="text-3xl font-black">Synckraft Portal</h1>
        
        {!isFirebaseConfigured && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 text-left">
            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
            <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-wider">
              Firebase not configured. Defaulting to <span className="font-black underline">Mock Mode</span>. Use test accounts to authorize.
            </p>
          </div>
        )}
        
        <form onSubmit={sub} className="space-y-4">
          {!login && (
            <input 
              required 
              placeholder="Full Name" 
              className="w-full bg-slate-50 p-5 rounded-2xl font-bold border border-transparent focus:border-brand-blue outline-none transition-all" 
              value={f.name} 
              onChange={e=>setF({...f, name: e.target.value})} 
            />
          )}
          <input 
            required 
            type="email" 
            placeholder="Email Address" 
            className="w-full bg-slate-50 p-5 rounded-2xl font-bold border border-transparent focus:border-brand-blue outline-none transition-all" 
            value={f.email} 
            onChange={e=>setF({...f, email: e.target.value})} 
          />
          <input 
            required 
            type="password" 
            placeholder="Passkey" 
            className="w-full bg-slate-50 p-5 rounded-2xl font-bold border border-transparent focus:border-brand-blue outline-none transition-all" 
            value={f.pass} 
            onChange={e=>setF({...f, pass: e.target.value})} 
          />
          <button 
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : (login ? 'Authorize' : 'Initialize')}
          </button>
        </form>
        
        <button type="button" onClick={()=>setLogin(!login)} className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
          {login ? 'Create new node?' : 'Return to login?'}
        </button>
      </motion.div>
    </div>
  );
};

const NotificationsPage = ({ notifications }: { notifications: Notification[] }) => (
  <div className="space-y-10 text-left">
    <header>
      <h2 className="text-4xl font-black tracking-tighter">Signal Feed</h2>
      <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1">Real-time System Broadcasts</p>
    </header>

    <div className="space-y-4">
      {notifications.length === 0 ? (
        <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto"><Bell size={40}/></div>
          <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No active signals.</p>
        </div>
      ) : notifications.map(n => (
        <div key={n.id} className={`flex gap-6 items-start p-8 rounded-[2.5rem] transition-all border ${n.isRead ? 'bg-white border-slate-50 opacity-60' : 'bg-white border-brand-blue/10 shadow-xl'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${n.isRead ? 'bg-slate-50 text-slate-300' : 'bg-brand-blue text-white shadow-lg'}`}>
            <Bell size={20}/>
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{n.type.replace('_', ' ')}</p>
              <p className="text-[8px] font-bold text-slate-300 uppercase">
                {n.createdAt instanceof Timestamp ? format(n.createdAt.toDate(), 'MMM dd, HH:mm') : ''}
              </p>
            </div>
            <p className="text-sm font-bold text-slate-900">{n.message}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PaymentsPage = ({ user, orders, leads }: { user: UserProfile, orders: Order[], leads: Lead[] }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    return paymentService.subscribeToPayments(setPayments);
  }, []);

  const handleVerify = async (payment: Payment, status: PaymentStatus, clearance: ClearanceStatus) => {
    try {
      await paymentService.verifyPayment(payment.id, status, clearance, user.uid);
      showToast(`Payment ${status.toLowerCase()} successfully.`, "success");
    } catch (error: any) {
      showToast("Verification failed: " + error.message, "error");
    }
  };

  return (
    <div className="space-y-10 text-left">
      <header>
        <h2 className="text-4xl font-black tracking-tighter">Financial Audit</h2>
        <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1">Pending Settlement Verification</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {payments.map(p => {
          const order = orders.find(o => o.id === p.orderId);
          const lead = leads.find(l => l.id === order?.leadId);
          return (
            <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:shadow-xl transition-all">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 overflow-hidden border border-slate-100 group-hover:border-brand-blue transition-colors">
                  <img src={p.proofUrl} className="w-full h-full object-cover" alt="Proof" />
                </div>
                <div>
                  <h4 className="text-xl font-black">{lead?.clientName || 'Unknown Client'}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">₹{p.amount.toLocaleString()}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{p.mode}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                {p.status === PaymentStatus.PENDING && (
                  <>
                    <button 
                      onClick={() => handleVerify(p, PaymentStatus.VERIFIED, ClearanceStatus.CLEARED)}
                      className="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all hover:bg-emerald-600"
                    >
                      Verify & Clear
                    </button>
                    {p.mode === PaymentMode.CHEQUE && (
                      <button 
                        onClick={() => handleVerify(p, PaymentStatus.REJECTED, ClearanceStatus.BOUNCED)}
                        className="px-8 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all hover:bg-rose-600"
                      >
                        Bounce Cheque
                      </button>
                    )}
                  </>
                )}
                {p.status !== PaymentStatus.PENDING && (
                  <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${p.status === PaymentStatus.VERIFIED ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    {p.status} • {p.clearanceStatus}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const UsersPage = () => (
  <div className="space-y-10 text-left">
    <header>
      <h2 className="text-4xl font-black tracking-tighter">Personnel Registry</h2>
      <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1">Master Audit Sequence Initialized</p>
    </header>

    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-20 flex flex-col items-center justify-center space-y-6 min-h-[500px]">
      <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
        <Users size={48} />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black">Registry Access Restricted</h3>
        <p className="text-slate-400 font-bold max-w-xs mx-auto">Full personnel management is only available in the Enterprise Command Center.</p>
      </div>
    </div>
  </div>
);
