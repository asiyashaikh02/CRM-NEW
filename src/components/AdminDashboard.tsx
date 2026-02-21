import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Shield,
  Zap,
  Clock,
  Search
} from 'lucide-react';
import { 
  UserProfile, 
  Lead, 
  Order, 
  Payment, 
  UserRole, 
  PaymentStatus, 
  ClearanceStatus,
  LeadStatus,
  OrderStatus,
  PlanType,
  RoutePath
} from '../types';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';

interface AdminDashboardProps {
  user: UserProfile;
  leads: Lead[];
  orders: Order[];
  payments: Payment[];
  users: UserProfile[];
  onNavigate: (path: RoutePath, id?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, 
  leads, 
  orders, 
  payments, 
  users,
  onNavigate 
}) => {
  const isSuper = user.role === UserRole.SUPER_ADMIN;
  const isSalesAdmin = user.role === UserRole.SALES_ADMIN;
  const isOpsAdmin = user.role === UserRole.OPS_ADMIN;

  // Metrics Calculation
  const metrics = useMemo(() => {
    const totalRevenue = payments
      .filter(p => p.status === PaymentStatus.VERIFIED)
      .reduce((acc, p) => acc + p.amount, 0);
    
    const pendingRevenue = payments
      .filter(p => p.status === PaymentStatus.PENDING)
      .reduce((acc, p) => acc + p.amount, 0);

    const conversionRate = leads.length > 0 
      ? (leads.filter(l => l.status === LeadStatus.CONVERTED).length / leads.length) * 100 
      : 0;

    const activeTrials = users.filter(u => u.planType === PlanType.TRIAL && u.planStatus === 'ACTIVE').length;
    const bouncedCheques = payments.filter(p => p.clearanceStatus === ClearanceStatus.BOUNCED).length;

    return {
      totalRevenue,
      pendingRevenue,
      conversionRate,
      activeTrials,
      bouncedCheques,
      totalLeads: leads.length,
      totalOrders: orders.length,
      activeUsers: users.filter(u => u.isActive).length
    };
  }, [leads, orders, payments, users]);

  const chartData = [
    { name: 'Mon', rev: 4000, leads: 24 },
    { name: 'Tue', rev: 3000, leads: 13 },
    { name: 'Wed', rev: 2000, leads: 98 },
    { name: 'Thu', rev: 2780, leads: 39 },
    { name: 'Fri', rev: 1890, leads: 48 },
    { name: 'Sat', rev: 2390, leads: 38 },
    { name: 'Sun', rev: 3490, leads: 43 },
  ];

  const COLORS = ['#0F172A', '#3B82F6', '#10B981', '#F59E0B'];

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black tracking-tighter leading-none">
            {isSuper ? 'Command Center' : isSalesAdmin ? 'Sales Strategy' : 'Ops Intelligence'}
          </h2>
          <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.4em] mt-4">System Health: Optimal</p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-3">
            <Activity size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Live Feed</span>
          </div>
        </div>
      </header>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Total Revenue" 
          value={`₹${metrics.totalRevenue.toLocaleString()}`} 
          trend="+12.5%" 
          up={true}
          icon={TrendingUp}
          color="text-emerald-500"
        />
        <MetricCard 
          label="Conversion" 
          value={`${metrics.conversionRate.toFixed(1)}%`} 
          trend="+2.1%" 
          up={true}
          icon={Zap}
          color="text-brand-blue"
        />
        <MetricCard 
          label="Active Trials" 
          value={metrics.activeTrials.toString()} 
          trend="-4" 
          up={false}
          icon={Clock}
          color="text-amber-500"
        />
        <MetricCard 
          label="Bounced" 
          value={metrics.bouncedCheques.toString()} 
          trend="+1" 
          up={false}
          icon={AlertTriangle}
          color="text-rose-500"
        />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black tracking-tight">Revenue Velocity</h3>
            <select className="bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94A3B8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                  itemStyle={{fontSize: '10px', fontWeight: 900, textTransform: 'uppercase'}}
                />
                <Area type="monotone" dataKey="rev" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-blue/20 rounded-full blur-3xl" />
          <h3 className="text-xl font-black tracking-tight relative z-10">Plan Distribution</h3>
          <div className="h-64 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Trial', value: 400 },
                    { name: 'Silver', value: 300 },
                    { name: 'Gold', value: 300 },
                    { name: 'Platinum', value: 200 },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {['Trial', 'Silver', 'Gold', 'Platinum'].map((plan, i) => (
              <div key={plan} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}} />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{plan}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity / Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Settlements */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black tracking-tight">Recent Settlements</h3>
            <button onClick={() => onNavigate('payments')} className="text-[10px] font-black uppercase text-brand-blue tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {payments.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-900 hover:text-white transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-all">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black">₹{p.amount.toLocaleString()}</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest opacity-50">{p.mode} • {p.status}</p>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-slate-300 group-hover:text-white" />
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black tracking-tight">Top Personnel</h3>
            <button onClick={() => onNavigate('users')} className="text-[10px] font-black uppercase text-brand-blue tracking-widest hover:underline">Manage Team</button>
          </div>
          <div className="space-y-4">
            {users.slice(0, 5).map(u => (
              <div key={u.uid} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-900 hover:text-white transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-all">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black">{u.name}</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest opacity-50">{u.role.replace('_', ' ')} • {u.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-500">98% Efficiency</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, trend, up, icon: Icon, color }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 group transition-all hover:shadow-xl"
  >
    <div className="flex justify-between items-start">
      <div className={`w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center ${color} group-hover:bg-slate-900 group-hover:text-white transition-all`}>
        <Icon size={20} />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-black ${up ? 'text-emerald-500' : 'text-rose-500'}`}>
        {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trend}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black tracking-tighter">{value}</h3>
    </div>
  </motion.div>
);
