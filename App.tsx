
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  doc, onSnapshot, collection, query, where, setDoc, addDoc, updateDoc, 
  serverTimestamp, getDoc, getDocs, orderBy, Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './lib/firebase';
import { 
  UserRole, UserProfile, LeadStatus, OrderStatus, 
  Lead, Order, Payment, Notification, RoutePath, ViewState 
} from './types';
import { 
  Layout, LogOut, Sun, Target, Briefcase, Users, Bell, Shield, 
  ArrowLeft, Plus, MapPin, Loader2, IndianRupee, ClipboardList, 
  Phone, CheckCircle, Navigation, Camera, Search, Filter, Trash
} from 'lucide-react';

// --- Global Constants ---
const EXPIRY_HOURS = 72;

// --- Components ---

const LoadingScreen = () => (
  <div className="h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Network Synchronizing...</p>
    </div>
  </div>
);

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', role: UserRole.SALES_USER });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const profile: UserProfile = {
          uid: cred.user.uid,
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          department: form.role.includes('SALES') ? 'sales' : 'ops',
          isActive: false,
          createdAt: Date.now()
        };
        await setDoc(doc(db, "users", cred.user.uid), profile);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-brand-blue/20">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Synckraft Portal</h1>
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.3em] font-black mt-2">Production Auth Gateway</p>
        </div>

        {error && <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-xs font-bold mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input type="text" placeholder="Full Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold" />
              <input type="tel" placeholder="Phone" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold" />
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value as UserRole})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold">
                <option value={UserRole.SALES_USER}>Sales Specialist</option>
                <option value={UserRole.OPS_USER}>Ops Specialist</option>
              </select>
            </>
          )}
          <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold" />
          <input type="password" placeholder="Access Key" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold" />
          
          <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
            {loading ? 'Authorizing...' : isLogin ? 'Authorize' : 'Register Node'}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
          {isLogin ? 'Create new node?' : 'Existing node login?'}
        </button>
      </div>
    </div>
  );
};

// --- Main App Logic ---

const App = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>({ path: 'dashboard' });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Navigation Logic
  const navigate = (path: RoutePath, id?: string) => {
    const newState = { path, id };
    window.history.pushState(newState, '', `#${path}${id ? '/' + id : ''}`);
    setView(newState);
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state) setView(e.state);
      else setView({ path: 'dashboard' });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auth Listener
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

  // Data Listeners
  useEffect(() => {
    if (!user || !user.isActive && user.role !== UserRole.SUPER_ADMIN) return;

    // Notifications
    const qNotif = query(collection(db, "notifications"), where("toUserId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubNotif = onSnapshot(qNotif, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
    });

    // Leads based on role
    let qLead;
    if (user.role === UserRole.SUPER_ADMIN) qLead = collection(db, "leads");
    else if (user.role === UserRole.SALES_ADMIN) qLead = query(collection(db, "leads"), where("salesAdminId", "==", user.uid));
    else if (user.role === UserRole.SALES_USER) qLead = query(collection(db, "leads"), where("createdBy", "==", user.uid));
    
    let unsubLead = () => {};
    if (qLead) {
      unsubLead = onSnapshot(qLead, (snap) => {
        setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead)));
      });
    }

    // Orders based on role
    let qOrder;
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.OPS_ADMIN) qOrder = collection(db, "orders");
    else if (user.role === UserRole.OPS_USER) qOrder = query(collection(db, "orders"), where("opsUserId", "==", user.uid));
    else if (user.role === UserRole.SALES_USER) qOrder = query(collection(db, "orders"), where("salesUserId", "==", user.uid));

    let unsubOrder = () => {};
    if (qOrder) {
      unsubOrder = onSnapshot(qOrder, (snap) => {
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      });
    }

    // Users (Admins only)
    let unsubUsers = () => {};
    if (user.role.includes('ADMIN') || user.role === UserRole.SUPER_ADMIN) {
      unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
        setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
      });
    }

    return () => { unsubNotif(); unsubLead(); unsubOrder(); unsubUsers(); };
  }, [user]);

  if (loading) return <LoadingScreen />;
  if (!user) return <AuthPage />;
  if (!user.isActive && user.role !== UserRole.SUPER_ADMIN) {
    return (
      <div className="h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md text-center space-y-6 bg-white p-12 rounded-[3rem] shadow-xl">
          <Shield size={64} className="mx-auto text-amber-500 animate-pulse" />
          <h2 className="text-3xl font-black">Authorization Pending</h2>
          <p className="text-slate-400 font-bold">Your node is active but not authorized for session traffic. Contact your administrator.</p>
          <button onClick={() => signOut(auth)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">Exit Portal</button>
        </div>
      </div>
    );
  }

  // --- Sub-Components for Pages ---

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
            setForm(f => ({
              ...f,
              address: place.formatted_address || '',
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }));
          }
        });
      }
    }, [isCreating]);

    const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      const finalPrice = (form.price * form.quantity) - form.discount;
      const leadData = {
        createdBy: user.uid,
        salesAdminId: user.adminId || '',
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        location: { address: form.address, lat: form.lat, lng: form.lng },
        basePrice: form.price,
        quantity: form.quantity,
        discount: form.discount,
        finalPrice,
        status: LeadStatus.DRAFT,
        createdAt: Date.now(),
        expiresAt: Date.now() + (EXPIRY_HOURS * 3600000)
      };
      await addDoc(collection(db, "leads"), leadData);
      setIsCreating(false);
    };

    const approveLead = async (lead: Lead) => {
      await updateDoc(doc(db, "leads", lead.id), { 
        status: LeadStatus.APPROVED, 
        approvedAt: Date.now() 
      });
      // Logic for Ops assignment happens here usually via Cloud Function or manual trigger
    };

    const forwardToOps = async (lead: Lead) => {
      const opsAdmins = users.filter(u => u.role === UserRole.OPS_ADMIN);
      const opsAdminId = opsAdmins[0]?.uid || '';
      
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
      await updateDoc(doc(db, "leads", lead.id), { status: LeadStatus.FORWARDED });
      
      // Notify Ops Admin
      if (opsAdminId) {
        await addDoc(collection(db, "notifications"), {
          toUserId: opsAdminId,
          type: 'NEW_ASSIGNMENT',
          message: `New Lead ${lead.clientName} forwarded for Ops assignment.`,
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
            <h2 className="text-4xl font-black tracking-tighter">Pipeline registry</h2>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.3em] mt-1">Confirmed Signals</p>
          </div>
          {(user.role === UserRole.SALES_USER || user.role === UserRole.SALES_ADMIN) && (
            <button onClick={() => setIsCreating(true)} className="bg-brand-blue text-white px-8 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-3 shadow-xl">
              <Plus size={18}/> New Node
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map(l => {
            const isExpired = Date.now() > l.expiresAt;
            const progress = l.status === LeadStatus.FORWARDED ? 100 : l.status === LeadStatus.APPROVED ? 66 : 33;
            
            return (
              <div key={l.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 relative overflow-hidden group">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <h4 className="text-xl font-black text-slate-900 truncate">{l.clientName}</h4>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{l.clientPhone}</p>
                   </div>
                   <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${isExpired && l.status === LeadStatus.DRAFT ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                      {l.status}
                   </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin size={14} className="shrink-0" />
                  <p className="text-[10px] font-bold truncate">{l.location.address}</p>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                    <span className="text-slate-400">Yield</span>
                    <span className="text-brand-blue">₹{l.finalPrice.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-blue transition-all" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {l.status === LeadStatus.DRAFT && (user.role === UserRole.SALES_USER || user.role === UserRole.SALES_ADMIN) && !isExpired && (
                    <button onClick={() => approveLead(l)} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase">Approve</button>
                  )}
                  {l.status === LeadStatus.APPROVED && (user.role === UserRole.SALES_ADMIN || user.role === UserRole.SUPER_ADMIN) && (
                    <button onClick={() => forwardToOps(l)} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase">Forward to Ops</button>
                  )}
                  {isExpired && l.status === LeadStatus.DRAFT && <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest text-center w-full">Node Expired</p>}
                </div>
              </div>
            );
          })}
        </div>

        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl relative">
              <button onClick={() => setIsCreating(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">✕</button>
              <h3 className="text-2xl font-black tracking-tighter mb-8 text-center">Initialize Lead Node</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <input required placeholder="Client Name" className="w-full bg-slate-50 p-5 rounded-2xl font-bold text-sm outline-none border border-slate-100" value={form.clientName} onChange={e=>setForm({...form, clientName: e.target.value})} />
                <input required type="tel" placeholder="Phone Number" className="w-full bg-slate-50 p-5 rounded-2xl font-bold text-sm outline-none border border-slate-100" value={form.clientPhone} onChange={e=>setForm({...form, clientPhone: e.target.value})} />
                <input ref={autocompleteRef} placeholder="Search Location (Google Maps)" className="w-full bg-slate-50 p-5 rounded-2xl font-bold text-sm outline-none border border-slate-100" value={form.address} onChange={e=>setForm({...form, address: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="number" placeholder="Price" className="w-full bg-slate-50 p-5 rounded-2xl font-bold text-sm outline-none border border-slate-100" value={form.price} onChange={e=>setForm({...form, price: parseFloat(e.target.value)})} />
                  <input required type="number" placeholder="Quantity" className="w-full bg-slate-50 p-5 rounded-2xl font-bold text-sm outline-none border border-slate-100" value={form.quantity} onChange={e=>setForm({...form, quantity: parseFloat(e.target.value)})} />
                </div>
                <input required type="number" placeholder="Strategic Discount" className="w-full bg-slate-50 p-5 rounded-2xl font-bold text-sm outline-none border border-slate-100" value={form.discount} onChange={e=>setForm({...form, discount: parseFloat(e.target.value)})} />
                <div className="pt-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Final Yield: ₹{((form.price * form.quantity) - form.discount).toLocaleString()}</p>
                  <button type="submit" className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-brand-blue/20">Sync Node</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const OrdersPage = () => {
    const [assigningId, setAssigningId] = useState<string | null>(null);

    const updateStatus = async (order: Order, nextStatus: OrderStatus) => {
      const timelineKey = 
        nextStatus === OrderStatus.ACCEPTED ? 'acceptedAt' : 
        nextStatus === OrderStatus.WORKING ? 'startedAt' : 
        nextStatus === OrderStatus.COMPLETED ? 'completedAt' : 
        nextStatus === OrderStatus.PAYMENT_RECEIVED ? 'paymentAt' : null;

      const updates: any = { status: nextStatus };
      if (timelineKey) updates[`timeline.${timelineKey}`] = Date.now();
      
      await updateDoc(doc(db, "orders", order.id), updates);
      
      // Notify Sales
      await addDoc(collection(db, "notifications"), {
        toUserId: order.salesUserId,
        type: 'STATUS_UPDATE',
        message: `Order status for ${order.id} updated to ${nextStatus}.`,
        relatedId: order.id,
        isRead: false,
        createdAt: Date.now()
      });
    };

    const handleAssign = async (orderId: string, opsId: string) => {
      await updateDoc(doc(db, "orders", orderId), { opsUserId: opsId });
      setAssigningId(null);
      // Notify Ops User
      await addDoc(collection(db, "notifications"), {
        toUserId: opsId,
        type: 'NEW_ASSIGNMENT',
        message: `You have been assigned a new task: ${orderId}.`,
        relatedId: orderId,
        isRead: false,
        createdAt: Date.now()
      });
    };

    const handlePaymentReceived = async (order: Order) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const fileRef = ref(storage, `payments/${order.id}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const url = await getDownloadURL(snapshot.ref);

        await addDoc(collection(db, "payments"), {
          orderId: order.id,
          amount: leads.find(l => l.id === order.leadId)?.finalPrice || 0,
          proofUrl: url,
          uploadedBy: user.uid,
          createdAt: Date.now()
        });

        await updateStatus(order, OrderStatus.PAYMENT_RECEIVED);
      };
      input.click();
    };

    return (
      <div className="space-y-10 animate-fade-in text-left">
        <header>
          <h2 className="text-4xl font-black tracking-tighter">Execution Fleet</h2>
          <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.3em] mt-1">Live Node Deployment</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map(o => {
            const lead = leads.find(l => l.id === o.leadId);
            const opsUser = users.find(u => u.uid === o.opsUserId);
            
            return (
              <div key={o.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-black text-slate-900">{lead?.clientName || 'Syncing...'}</h4>
                    <p className="text-[10px] font-black text-slate-300 uppercase mt-1">ID: {o.id}</p>
                  </div>
                  <div className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest">{o.status}</div>
                </div>

                {lead && (
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                    <MapPin size={12}/> {lead.location.address}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-brand-blue">
                       <Users size={14}/>
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400">
                       {o.opsUserId ? opsUser?.name : 'Unassigned'}
                    </p>
                  </div>
                  {user.role === UserRole.OPS_ADMIN && !o.opsUserId && (
                    <button onClick={() => setAssigningId(o.id)} className="bg-brand-blue text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase">Assign</button>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  {user.role === UserRole.OPS_USER && o.opsUserId === user.uid && (
                    <>
                      {o.status === OrderStatus.ASSIGNED && <button onClick={() => updateStatus(o, OrderStatus.ACCEPTED)} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase">Accept</button>}
                      {o.status === OrderStatus.ACCEPTED && <button onClick={() => updateStatus(o, OrderStatus.IN_PROGRESS)} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase">Initialize</button>}
                      {o.status === OrderStatus.IN_PROGRESS && <button onClick={() => updateStatus(o, OrderStatus.WORKING)} className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase">Begin Work</button>}
                      {o.status === OrderStatus.WORKING && <button onClick={() => updateStatus(o, OrderStatus.COMPLETED)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase">Complete Task</button>}
                      {o.status === OrderStatus.COMPLETED && <button onClick={() => handlePaymentReceived(o)} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2"><Camera size={14}/> Upload Proof</button>}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {assigningId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl space-y-6">
              <h3 className="text-xl font-black text-center">Assign Personnel</h3>
              <div className="space-y-2">
                {users.filter(u => u.role === UserRole.OPS_USER && u.isActive).map(u => (
                  <button key={u.uid} onClick={() => handleAssign(assigningId, u.uid)} className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl font-bold text-sm text-left transition-all">
                    {u.name}
                  </button>
                ))}
              </div>
              <button onClick={() => setAssigningId(null)} className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest pt-4">Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const UsersPage = () => {
    const toggleActive = async (uid: string, current: boolean) => {
      await updateDoc(doc(db, "users", uid), { isActive: !current });
    };

    const deleteUser = async (uid: string) => {
      // In production we usually disable instead of delete
      await updateDoc(doc(db, "users", uid), { isActive: false, role: 'DEACTIVATED' as any });
    };

    return (
      <div className="space-y-10 animate-fade-in text-left">
        <header>
          <h2 className="text-4xl font-black tracking-tighter">Network personnel</h2>
          <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.3em] mt-1">Authorized Nodes</p>
        </header>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-8 py-6 text-left">Entity</th>
                <th className="px-8 py-6 text-left">Department</th>
                <th className="px-8 py-6 text-left">Status</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{u.email}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 rounded-lg">{u.role.replace('_', ' ')}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`w-2.5 h-2.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button onClick={() => toggleActive(u.uid, u.isActive)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${u.isActive ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      {u.isActive ? 'Deactivate' : 'Authorize'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const Dashboard = () => {
    const stats = useMemo(() => {
      const activeLeads = leads.filter(l => l.status !== LeadStatus.FORWARDED).length;
      const activeOrders = orders.filter(o => o.status !== OrderStatus.PAYMENT_RECEIVED).length;
      const totalYield = leads.reduce((acc, l) => acc + l.finalPrice, 0);
      return { activeLeads, activeOrders, totalYield };
    }, []);

    return (
      <div className="space-y-10 animate-fade-in text-left">
        <header>
          <h2 className="text-5xl font-black tracking-tighter leading-none">Control Tower</h2>
          <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.4em] mt-3">Live Session: {user.name}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Pipeline</p>
              <h3 className="text-5xl font-black tracking-tighter text-brand-blue">{stats.activeLeads}</h3>
           </div>
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Fleet Missions</p>
              <h3 className="text-5xl font-black tracking-tighter text-indigo-600">{stats.activeOrders}</h3>
           </div>
           <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-4 shadow-2xl">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Portfolio Yield</p>
              <h3 className="text-4xl font-black tracking-tighter text-white">₹{stats.totalYield.toLocaleString()}</h3>
           </div>
        </div>

        <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
           <h3 className="text-2xl font-black tracking-tight">Real-time Signals</h3>
           <div className="space-y-6">
              {notifications.length === 0 ? (
                <p className="text-slate-300 font-bold italic py-10 text-center">No active signals in sector.</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="flex gap-6 items-start p-6 bg-slate-50 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 group">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-blue shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-all">
                      <Bell size={20}/>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{n.type.replace('_', ' ')}</p>
                      <p className="text-sm font-bold text-slate-900">{n.message}</p>
                      <p className="text-[8px] font-bold text-slate-300 uppercase">{new Date(n.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
           </div>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-inter overflow-hidden h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-100 p-8 flex-col shrink-0 overflow-y-auto">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg">
            <Shield size={22} />
          </div>
          <span className="font-grotesk font-bold text-2xl tracking-tighter">Synckraft.</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { label: 'Control', path: 'dashboard', icon: <Sun size={20}/> },
            { label: 'Leads', path: 'leads', icon: <Target size={20}/> },
            { label: 'Orders', path: 'orders', icon: <Briefcase size={20}/> },
            { label: 'Users', path: 'users', icon: <Users size={20}/>, roles: [UserRole.SUPER_ADMIN, UserRole.SALES_ADMIN, UserRole.OPS_ADMIN] },
          ].filter(item => !item.roles || item.roles.includes(user.role)).map(item => (
            <button key={item.path} onClick={() => navigate(item.path as RoutePath)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${view.path === item.path ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-slate-50">
          <button onClick={() => signOut(auth)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all">
            <LogOut size={20} /> Terminate
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col h-full relative">
        <header className="h-20 bg-white border-b border-slate-100 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-4">
            {view.path !== 'dashboard' && <button onClick={() => window.history.back()} className="p-3 bg-slate-50 rounded-xl"><ArrowLeft size={18} /></button>}
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{view.path} sequence</p>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-black text-emerald-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            ENCRYPTED LIVE FEED
          </div>
        </header>

        <div className="p-6 lg:p-10 flex-1">
          {view.path === 'dashboard' && <Dashboard />}
          {view.path === 'leads' && <LeadsPage />}
          {view.path === 'orders' && <OrdersPage />}
          {view.path === 'users' && <UsersPage />}
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden h-20 bg-white border-t border-slate-100 flex items-center justify-around px-4 shrink-0">
          <button onClick={() => navigate('dashboard')} className={`p-4 rounded-2xl ${view.path === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Sun size={20}/></button>
          <button onClick={() => navigate('leads')} className={`p-4 rounded-2xl ${view.path === 'leads' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Target size={20}/></button>
          <button onClick={() => navigate('orders')} className={`p-4 rounded-2xl ${view.path === 'orders' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Briefcase size={20}/></button>
          {user.role.includes('ADMIN') && <button onClick={() => navigate('users')} className={`p-4 rounded-2xl ${view.path === 'users' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Users size={20}/></button>}
        </nav>
      </main>
    </div>
  );
};

export default App;
