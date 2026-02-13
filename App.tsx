
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  doc, onSnapshot, collection, query, where, setDoc, addDoc, updateDoc, 
  getDocs, orderBy, deleteDoc, Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './lib/firebase';
import { 
  UserRole, LeadStatus, OrderStatus, 
  Lead, Order, Payment, Notification, RoutePath, ViewState, UserProfile 
} from './types';
import { 
  Layout, LogOut, Sun, Target, Briefcase, Users, Bell, Shield, 
  ArrowLeft, Plus, MapPin, Loader2, IndianRupee, ClipboardList, 
  Phone, CheckCircle, Navigation, Camera, Image, ExternalLink, Clock
} from 'lucide-react';

// --- Global Constants ---
const EXPIRY_HOURS = 72;
const STATUS_STEPS = [
  OrderStatus.ASSIGNED,
  OrderStatus.ACCEPTED,
  OrderStatus.IN_PROGRESS,
  OrderStatus.WORKING,
  OrderStatus.COMPLETED,
  OrderStatus.PAYMENT_RECEIVED
];

// --- Helpers ---
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.ASSIGNED: return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-500', bar: 'bg-slate-500' };
    case OrderStatus.ACCEPTED: return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-500', bar: 'bg-blue-500' };
    case OrderStatus.IN_PROGRESS: return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-500', bar: 'bg-orange-500' };
    case OrderStatus.WORKING: return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-500', bar: 'bg-purple-500' };
    case OrderStatus.COMPLETED: return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-500', bar: 'bg-emerald-500' };
    case OrderStatus.PAYMENT_RECEIVED: return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-700', bar: 'bg-green-700' };
    default: return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', bar: 'bg-slate-300' };
  }
};

// --- UI Components ---

const LoadingScreen = () => (
  <div className="h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Core Synchronizing...</p>
    </div>
  </div>
);

const Timeline = ({ currentStatus }: { currentStatus: OrderStatus }) => {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="space-y-6 relative ml-2">
      <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-100"></div>
      {STATUS_STEPS.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isActive = idx === currentIndex;
        const isFuture = idx > currentIndex;
        const colors = getStatusColor(step);

        return (
          <div key={step} className={`flex gap-6 items-center transition-all duration-300 ${isFuture ? 'opacity-30' : 'opacity-100'}`}>
            <div className={`z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isActive ? `${colors.bg} ${colors.border} shadow-lg shadow-current/20 scale-110 animate-pulse` : isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
              {isCompleted ? <CheckCircle size={14} /> : <div className={`w-2 h-2 rounded-full ${isActive ? colors.bar : 'bg-current'}`} />}
            </div>
            <div className="flex flex-col">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? colors.text : 'text-slate-400'}`}>
                {step.replace('_', ' ')}
              </span>
              {isActive && <span className="text-[8px] font-bold text-slate-300 uppercase">Current Phase</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- App Shell ---

const App = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>({ path: 'dashboard' });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  const navigate = (path: RoutePath, id?: string) => {
    const newState = { path, id };
    window.history.pushState(newState, '', `#${path}${id ? '/' + id : ''}`);
    setView(newState);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        onSnapshot(doc(db, "users", fbUser.uid), (snap) => {
          if (snap.exists()) setUser(snap.data() as UserProfile);
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user || !user.isActive && user.role !== UserRole.SUPER_ADMIN) return;

    const unsubNotif = onSnapshot(query(collection(db, "notifications"), where("toUserId", "==", user.uid), orderBy("createdAt", "desc")), (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
    });

    const leadQuery = user.role === UserRole.SUPER_ADMIN ? collection(db, "leads") : 
                      user.role === UserRole.SALES_ADMIN ? query(collection(db, "leads"), where("salesAdminId", "==", user.uid)) :
                      user.role === UserRole.SALES_USER ? query(collection(db, "leads"), where("createdBy", "==", user.uid)) : null;
    const unsubLead = leadQuery ? onSnapshot(leadQuery, (snap) => setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead)))) : () => {};

    const orderQuery = (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.OPS_ADMIN) ? collection(db, "orders") :
                       user.role === UserRole.OPS_USER ? query(collection(db, "orders"), where("opsUserId", "==", user.uid)) :
                       user.role === UserRole.SALES_USER ? query(collection(db, "orders"), where("salesUserId", "==", user.uid)) : null;
    const unsubOrder = orderQuery ? onSnapshot(orderQuery, (snap) => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)))) : () => {};

    const unsubUsers = (user.role.includes('ADMIN') || user.role === UserRole.SUPER_ADMIN) ? onSnapshot(collection(db, "users"), (snap) => setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)))) : () => {};

    return () => { unsubNotif(); unsubLead(); unsubOrder(); unsubUsers(); };
  }, [user]);

  if (loading) return <LoadingScreen />;
  if (!user) return <AuthPage setUser={setUser} />;
  if (!user.isActive && user.role !== UserRole.SUPER_ADMIN) return <InactiveNotice />;

  // --- Sub-Pages ---

  const LeadsPage = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState({ clientName: '', clientPhone: '', address: '', lat: 0, lng: 0, price: 0, quantity: 1, discount: 0 });
    const autocompleteRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (isCreating && autocompleteRef.current && (window as any).google) {
        const ac = new (window as any).google.maps.places.Autocomplete(autocompleteRef.current);
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          if (place.geometry) {
            setForm(f => ({ ...f, address: place.formatted_address || '', lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }));
          }
        });
      }
    }, [isCreating]);

    const handleApprove = async (lead: Lead) => {
      // 1. Update Lead Status
      await updateDoc(doc(db, "leads", lead.id), { status: LeadStatus.FORWARDED, approvedAt: Date.now() });
      
      // 2. Automatically Create Order for Ops
      const opsAdmins = users.filter(u => u.role === UserRole.OPS_ADMIN);
      const orderData = {
        leadId: lead.id,
        salesUserId: lead.createdBy,
        opsUserId: '', // Initially unassigned
        assignedBy: user.uid,
        status: OrderStatus.ASSIGNED,
        timeline: {},
        createdAt: Date.now()
      };
      const orderRef = await addDoc(collection(db, "orders"), orderData);

      // 3. Notify Ops Admins
      for (const admin of opsAdmins) {
        await addDoc(collection(db, "notifications"), {
          toUserId: admin.uid,
          type: 'NEW_ASSIGNMENT',
          message: `New Order assigned for ${lead.clientName}. Needs field deployment.`,
          relatedId: orderRef.id,
          isRead: false,
          createdAt: Date.now()
        });
      }
    };

    return (
      <div className="space-y-10 animate-fade-in text-left">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tighter">Pipeline Registry</h2>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1">Confirmed Potential Assets</p>
          </div>
          {(user.role === UserRole.SALES_USER || user.role === UserRole.SALES_ADMIN) && (
            <button onClick={() => setIsCreating(true)} className="bg-brand-blue text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl flex items-center gap-3">
              <Plus size={18}/> New Node
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map(l => {
            const isExpired = Date.now() > l.expiresAt;
            return (
              <div key={l.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="text-xl font-black truncate">{l.clientName}</h4>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{l.clientPhone}</p>
                  </div>
                  <div className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg ${l.status === LeadStatus.FORWARDED ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
                    {l.status}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                  <MapPin size={12}/> <span className="truncate">{l.location.address}</span>
                </div>
                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase">Strategic Yield</p>
                    <p className="text-lg font-black text-brand-blue">₹{l.finalPrice.toLocaleString()}</p>
                  </div>
                  {(user.role === UserRole.SALES_USER || user.role === UserRole.SALES_ADMIN) && l.status === LeadStatus.DRAFT && !isExpired && (
                    <button onClick={() => handleApprove(l)} className="px-5 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg">Approve</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isCreating && <LeadModal close={() => setIsCreating(false)} user={user} />}
      </div>
    );
  };

  const OrdersPage = () => {
    const [assigningId, setAssigningId] = useState<string | null>(null);

    const updateStatus = async (order: Order, nextStatus: OrderStatus) => {
      const timelineKey = nextStatus === OrderStatus.ACCEPTED ? 'acceptedAt' : nextStatus === OrderStatus.WORKING ? 'startedAt' : nextStatus === OrderStatus.COMPLETED ? 'completedAt' : nextStatus === OrderStatus.PAYMENT_RECEIVED ? 'paymentAt' : null;
      const updates: any = { status: nextStatus };
      if (timelineKey) updates[`timeline.${timelineKey}`] = Date.now();
      await updateDoc(doc(db, "orders", order.id), updates);
      
      // Notify Sales
      await addDoc(collection(db, "notifications"), {
        toUserId: order.salesUserId,
        type: 'STATUS_UPDATE',
        message: `Execution node ${order.id} transitioned to ${nextStatus}.`,
        relatedId: order.id,
        isRead: false,
        createdAt: Date.now()
      });
    };

    const handleAssign = async (orderId: string, opsId: string) => {
      await updateDoc(doc(db, "orders", orderId), { opsUserId: opsId });
      setAssigningId(null);
      await addDoc(collection(db, "notifications"), { toUserId: opsId, type: 'NEW_ASSIGNMENT', message: `High priority mission assigned to your node.`, relatedId: orderId, isRead: false, createdAt: Date.now() });
    };

    const getNextStatus = (current: OrderStatus): OrderStatus | null => {
      const idx = STATUS_STEPS.indexOf(current);
      if (idx === -1 || idx === STATUS_STEPS.length - 1) return null;
      return STATUS_STEPS[idx + 1];
    };

    return (
      <div className="space-y-10 animate-fade-in text-left">
        <header>
          <h2 className="text-4xl font-black tracking-tighter">Execution Fleet</h2>
          <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1">Live Deployment Operations</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {orders.map(o => {
            const lead = leads.find(l => l.id === o.leadId);
            const statusStyle = getStatusColor(o.status);
            const nextStatus = getNextStatus(o.status);
            const isOpsUser = user.role === UserRole.OPS_USER;

            return (
              <div key={o.id} className={`bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 border-l-8 ${statusStyle.border}`}>
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="text-2xl font-black text-slate-900">{lead?.clientName || 'Syncing...'}</h4>
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
                        <Phone size={12}/> {lead?.clientPhone}
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${statusStyle.bg} ${statusStyle.text}`}>
                      {o.status.replace('_', ' ')}
                    </div>
                  </div>

                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead?.location.address || '')}`} target="_blank" className="flex items-center gap-2 text-brand-blue font-bold text-xs p-4 bg-blue-50 rounded-2xl">
                    <MapPin size={16}/> <span className="truncate">{lead?.location.address}</span>
                  </a>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${statusStyle.bar}`} style={{ width: `${((STATUS_STEPS.indexOf(o.status) + 1) / STATUS_STEPS.length) * 100}%` }}></div>
                  </div>

                  {/* Timeline */}
                  <div className="pt-4 border-t border-slate-50">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Mission Progress</p>
                    <Timeline currentStatus={o.status} />
                  </div>

                  {/* Ops Actions */}
                  {isOpsUser && nextStatus && (
                    <div className="pt-8">
                      <button 
                        onClick={() => updateStatus(o, nextStatus)} 
                        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all text-white ${getStatusColor(nextStatus).bar}`}
                      >
                        Transition to {nextStatus.replace('_', ' ')}
                      </button>
                    </div>
                  )}

                  {/* Admin Actions */}
                  {user.role === UserRole.OPS_ADMIN && !o.opsUserId && (
                    <div className="pt-6">
                      <button onClick={() => setAssigningId(o.id)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase">Assign Node Personnel</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {assigningId && <AssignModal users={users} onAssign={(opsId) => handleAssign(assigningId, opsId)} close={() => setAssigningId(null)} />}
      </div>
    );
  };

  const Dashboard = () => {
    const stats = useMemo(() => {
      const activeLeads = leads.filter(l => l.status !== LeadStatus.FORWARDED).length;
      const activeOrders = orders.filter(o => o.status !== OrderStatus.PAYMENT_RECEIVED).length;
      const totalYield = leads.reduce((acc, l) => acc + l.finalPrice, 0);
      return { activeLeads, activeOrders, totalYield };
    }, [leads, orders]);

    return (
      <div className="space-y-10 animate-fade-in text-left">
        <header>
          <h2 className="text-5xl font-black tracking-tighter leading-none">Control Tower</h2>
          <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.4em] mt-3">Auth Identity: {user.name}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-4">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Pipeline</p>
              <h3 className="text-5xl font-black tracking-tighter text-brand-blue">{stats.activeLeads}</h3>
           </div>
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-4">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Fleet Operations</p>
              <h3 className="text-5xl font-black tracking-tighter text-indigo-600">{stats.activeOrders}</h3>
           </div>
           <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white space-y-4 shadow-2xl">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Global Yield</p>
              <h3 className="text-4xl font-black tracking-tighter">₹{stats.totalYield.toLocaleString()}</h3>
           </div>
        </div>

        <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
           <h3 className="text-2xl font-black tracking-tight">Real-time Signals</h3>
           <div className="space-y-6">
              {notifications.length === 0 ? <p className="text-slate-300 font-bold italic py-10 text-center">No active signals.</p> : notifications.map(n => (
                <div key={n.id} className="flex gap-6 items-start p-6 bg-slate-50 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-blue shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-all"><Bell size={20}/></div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{n.type.replace('_', ' ')}</p>
                    <p className="text-sm font-bold text-slate-900">{n.message}</p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase">{new Date(n.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
           </div>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-inter overflow-hidden h-screen">
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-100 p-8 flex-col shrink-0 overflow-y-auto">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg"><Shield size={22}/></div>
          <span className="font-grotesk font-bold text-2xl tracking-tighter">Synckraft.</span>
        </div>
        <nav className="flex-1 space-y-2">
          {[
            { label: 'Control', path: 'dashboard', icon: <Sun size={20}/> },
            { label: 'Pipeline', path: 'leads', icon: <Target size={20}/> },
            { label: 'Execution', path: 'orders', icon: <Briefcase size={20}/> },
            { label: 'Personnel', path: 'users', icon: <Users size={20}/>, roles: [UserRole.SUPER_ADMIN, UserRole.SALES_ADMIN, UserRole.OPS_ADMIN] },
          ].filter(item => !item.roles || item.roles.includes(user.role)).map(item => (
            <button key={item.path} onClick={() => navigate(item.path as RoutePath)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${view.path === item.path ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => signOut(auth)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm uppercase text-rose-500 hover:bg-rose-50 transition-all"><LogOut size={20} /> Terminate</button>
      </aside>

      <main className="flex-1 overflow-y-auto h-full flex flex-col relative">
        <header className="h-20 bg-white border-b border-slate-100 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {view.path !== 'dashboard' && <button onClick={() => window.history.back()} className="p-3 bg-slate-50 rounded-xl"><ArrowLeft size={18} /></button>}
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{view.path} Sequence</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-[10px] font-black text-emerald-500"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> LIVE NETWORK</div>
            <button className="p-3 text-slate-400 bg-slate-50 rounded-xl relative"><Bell size={18} /><div className="absolute top-3 right-3 w-1.5 h-1.5 bg-rose-500 rounded-full"></div></button>
          </div>
        </header>

        <div className="p-6 lg:p-10 flex-1">
          {view.path === 'dashboard' && <Dashboard />}
          {view.path === 'leads' && <LeadsPage />}
          {view.path === 'orders' && <OrdersPage />}
          {view.path === 'users' && <UsersPage />}
        </div>

        <nav className="md:hidden h-20 bg-white border-t border-slate-100 flex items-center justify-around px-4">
          <button onClick={() => navigate('dashboard')} className={`p-4 rounded-2xl ${view.path === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Sun size={20}/></button>
          <button onClick={() => navigate('leads')} className={`p-4 rounded-2xl ${view.path === 'leads' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Target size={20}/></button>
          <button onClick={() => navigate('orders')} className={`p-4 rounded-2xl ${view.path === 'orders' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Briefcase size={20}/></button>
        </nav>
      </main>
    </div>
  );
};

// --- Modals ---

const LeadModal = ({ close, user }: any) => {
  const [f, setF] = useState({ clientName: '', clientPhone: '', address: '', price: 0, qty: 1, disc: 0 });
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((window as any).google) {
      const ac = new (window as any).google.maps.places.Autocomplete(ref.current!);
      ac.addListener('place_changed', () => {
        const p = ac.getPlace();
        if (p.geometry) setF(prev => ({ ...prev, address: p.formatted_address || '' }));
      });
    }
  }, []);

  const save = async (e: any) => {
    e.preventDefault();
    const final = (f.price * f.qty) - f.disc;
    await addDoc(collection(db, "leads"), { createdBy: user.uid, salesAdminId: user.adminId || '', clientName: f.clientName, clientPhone: f.clientPhone, location: { address: f.address, lat: 0, lng: 0 }, basePrice: f.price, quantity: f.qty, discount: f.disc, finalPrice: final, status: LeadStatus.DRAFT, createdAt: Date.now(), expiresAt: Date.now() + (EXPIRY_HOURS * 3600000) });
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <form onSubmit={save} className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl relative space-y-4">
        <h3 className="text-2xl font-black text-center mb-8">Initialize Lead Node</h3>
        <input required placeholder="Client Name" className="w-full bg-slate-50 p-5 rounded-2xl font-bold border border-slate-100" value={f.clientName} onChange={e=>setF({...f, clientName: e.target.value})} />
        <input required placeholder="Phone" className="w-full bg-slate-50 p-5 rounded-2xl font-bold border border-slate-100" value={f.clientPhone} onChange={e=>setF({...f, clientPhone: e.target.value})} />
        <input ref={ref} required placeholder="Map Location" className="w-full bg-slate-50 p-5 rounded-2xl font-bold border border-slate-100" value={f.address} onChange={e=>setF({...f, address: e.target.value})} />
        <div className="grid grid-cols-2 gap-4">
          <input required type="number" placeholder="Price" className="w-full bg-slate-50 p-5 rounded-2xl font-bold border border-slate-100" onChange={e=>setF({...f, price: parseFloat(e.target.value)})} />
          <input required type="number" placeholder="Quantity" className="w-full bg-slate-50 p-5 rounded-2xl font-bold border border-slate-100" onChange={e=>setF({...f, qty: parseFloat(e.target.value)})} />
        </div>
        <button type="submit" className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black uppercase text-xs">Deploy Signal</button>
        <button onClick={close} className="w-full text-slate-400 font-bold text-xs uppercase pt-2">Cancel</button>
      </form>
    </div>
  );
};

const AssignModal = ({ users, onAssign, close }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
    <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl space-y-6">
      <h3 className="text-xl font-black text-center">Personnel Selection</h3>
      <div className="space-y-2">
        {users.filter((u: any) => u.role === UserRole.OPS_USER && u.isActive).map((u: any) => (
          <button key={u.uid} onClick={() => onAssign(u.uid)} className="w-full p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl font-bold text-sm text-left transition-all">{u.name}</button>
        ))}
      </div>
      <button onClick={close} className="w-full text-slate-400 font-bold text-xs uppercase pt-2 text-center">Abort</button>
    </div>
  </div>
);

const AuthPage = ({ setUser }: any) => {
  const [login, setLogin] = useState(true);
  const [f, setF] = useState({ email: '', pass: '', name: '', role: UserRole.SALES_USER });
  const [err, setErr] = useState('');

  const sub = async (e: any) => {
    e.preventDefault();
    try {
      if (login) await signInWithEmailAndPassword(auth, f.email, f.pass);
      else {
        const c = await createUserWithEmailAndPassword(auth, f.email, f.pass);
        await setDoc(doc(db, "users", c.user.uid), { uid: c.user.uid, name: f.name, email: f.email, role: f.role, department: f.role.includes('SALES') ? 'sales' : 'ops', isActive: false, createdAt: Date.now() });
      }
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <form onSubmit={sub} className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center space-y-6">
        <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl"><Shield size={32}/></div>
        <h1 className="text-3xl font-black">Synckraft Portal</h1>
        {err && <p className="text-rose-500 text-xs font-bold">{err}</p>}
        {!login && <input required placeholder="Name" className="w-full bg-slate-50 p-5 rounded-2xl font-bold" value={f.name} onChange={e=>setF({...f, name: e.target.value})} />}
        <input required type="email" placeholder="Email" className="w-full bg-slate-50 p-5 rounded-2xl font-bold" value={f.email} onChange={e=>setF({...f, email: e.target.value})} />
        <input required type="password" placeholder="Passkey" className="w-full bg-slate-50 p-5 rounded-2xl font-bold" value={f.pass} onChange={e=>setF({...f, pass: e.target.value})} />
        <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">{login ? 'Authorize' : 'Initialize'}</button>
        <button type="button" onClick={()=>setLogin(!login)} className="text-slate-400 font-bold text-xs uppercase">{login ? 'Create node?' : 'Login?'}</button>
      </form>
    </div>
  );
};

const InactiveNotice = () => (
  <div className="h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
    <div className="max-w-md bg-white p-12 rounded-[3.5rem] shadow-xl space-y-6">
      <Shield size={64} className="mx-auto text-amber-500" />
      <h2 className="text-3xl font-black">Pending Auth</h2>
      <p className="text-slate-400 font-bold">Node is active but unauthorized for session traffic.</p>
      <button onClick={()=>signOut(auth)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">Abort Session</button>
    </div>
  </div>
);

const UsersPage = () => (
  <div className="p-20 text-center space-y-4">
    <Users size={48} className="mx-auto text-slate-100" />
    <h3 className="text-xl font-black">Personnel Registry</h3>
    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Master Audit Sequence Initialized</p>
  </div>
);

export default App;
