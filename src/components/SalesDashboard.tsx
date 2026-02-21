import React, { useState } from 'react';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  MapPin,
  Phone,
  Calendar,
  Zap,
  Filter,
  Search
} from 'lucide-react';
import { Lead, LeadStatus, LeadPriority, UserProfile, RoutePath } from '../types';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { motion } from 'motion/react';

interface SalesDashboardProps {
  user: UserProfile;
  leads: Lead[];
  onNavigate: (path: RoutePath, id?: string) => void;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({ user, leads, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Active Pipeline', value: leads.filter(l => l.status !== LeadStatus.CONVERTED).length, icon: Target, color: 'bg-brand-blue' },
    { label: 'Converted Nodes', value: leads.filter(l => l.status === LeadStatus.CONVERTED).length, icon: CheckCircle2, color: 'bg-emerald-500' },
    { label: 'Potential Revenue', value: `₹${leads.reduce((acc, l) => acc + (l.finalPrice || 0), 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-amber-500' },
  ];

  const filteredLeads = leads.filter(l => 
    l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.clientPhone.includes(searchQuery)
  );

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all"
          >
            <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black tracking-tighter">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              placeholder="Search pipeline by name or phone..." 
              className="w-full bg-white py-5 pl-16 pr-8 rounded-[2rem] text-sm font-bold border border-slate-100 shadow-sm focus:border-brand-blue outline-none transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => onNavigate('lead-detail')}
            className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs shadow-2xl flex items-center justify-center gap-3 hover:bg-brand-blue transition-all active:scale-95"
          >
            <Plus size={18} />
            New Node Entry
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredLeads.map((lead, i) => {
            const isExpired = lead.expiresAt instanceof Timestamp ? Date.now() > lead.expiresAt.toMillis() : false;
            
            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-2xl transition-all group relative overflow-hidden"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start">
                  <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    lead.status === LeadStatus.CONVERTED ? 'bg-emerald-50 text-emerald-500' :
                    isExpired ? 'bg-rose-50 text-rose-500' :
                    'bg-brand-blue/5 text-brand-blue'
                  }`}>
                    {isExpired ? 'EXPIRED' : lead.status}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    lead.priority === LeadPriority.HIGH ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' :
                    lead.priority === LeadPriority.MEDIUM ? 'bg-amber-500' : 'bg-slate-300'
                  }`} />
                </div>

                <div>
                  <h4 className="text-2xl font-black tracking-tight group-hover:text-brand-blue transition-colors">{lead.clientName}</h4>
                  <div className="flex items-center gap-2 mt-2 text-slate-400">
                    <MapPin size={12} />
                    <p className="text-[10px] font-bold uppercase tracking-widest truncate">{lead.location.address}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50">
                  <div>
                    <p className="text-[8px] font-black uppercase text-slate-300 tracking-widest mb-1">Potential</p>
                    <p className="text-lg font-black">₹{lead.finalPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-slate-300 tracking-widest mb-1">Capacity</p>
                    <p className="text-lg font-black">{lead.panelCount} Panels</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={14} />
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                      {lead.createdAt instanceof Timestamp ? format(lead.createdAt.toDate(), 'MMM dd') : 'N/A'}
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigate('lead-detail', lead.id)}
                    className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>

                {/* Expiry Progress Bar */}
                {!isExpired && lead.status !== LeadStatus.CONVERTED && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50 overflow-hidden">
                    <motion.div 
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 72 * 3600, ease: 'linear' }}
                      className="h-full bg-brand-blue"
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
