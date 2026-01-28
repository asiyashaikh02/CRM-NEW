
import React, { useMemo } from 'react';
import { MOCK_DB } from '../data/mockDb';
import { formatCurrency } from '../config/appConfig';
import { ExecutionStage, CustomerStatus } from '../types';

export const ReportsPage: React.FC = () => {
  const stats = useMemo(() => {
    const totalRev = MOCK_DB.customers.reduce((acc, c) => acc + c.billingAmount, 0);
    const totalCollected = MOCK_DB.customers.reduce((acc, c) => acc + c.payments.reduce((sum, p) => sum + p.amount, 0), 0);
    const activeProjects = MOCK_DB.customers.filter(c => c.executionStage !== ExecutionStage.CLOSED).length;
    const conversionRate = ((MOCK_DB.customers.length / (MOCK_DB.leads.length + MOCK_DB.customers.length)) * 100).toFixed(1);

    return { totalRev, totalCollected, activeProjects, conversionRate };
  }, []);

  return (
    <div className="space-y-12 text-left animate-fade-in pb-20">
      <header>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Analytical Intelligence</h2>
        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em] mt-1">Network Performance Audit</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <ReportCard label="Projected Yield" value={formatCurrency(stats.totalRev)} color="text-indigo-600" />
        <ReportCard label="Secured Capital" value={formatCurrency(stats.totalCollected)} color="text-emerald-600" />
        <ReportCard label="Active Nodes" value={stats.activeProjects} color="text-blue-600" />
        <ReportCard label="Signal Conversion" value={`${stats.conversionRate}%`} color="text-amber-600" />
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl font-black tracking-tight mb-8">Node Performance Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Authority Node</th>
                <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Total Portfolio</th>
                <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Yield Contrib.</th>
                <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {MOCK_DB.users.filter(u => u.role !== 'USER').map(u => (
                <tr key={u.uid} className="group hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                  <td className="py-6">
                    <p className="text-sm font-black">{u.displayName}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{u.role}</p>
                  </td>
                  <td className="py-6 font-bold text-xs">{MOCK_DB.customers.filter(c => c.salesId === u.uid || c.opsId === u.uid).length} Assets</td>
                  <td className="py-6 font-bold text-xs text-indigo-600">
                    {formatCurrency(MOCK_DB.customers.filter(c => c.salesId === u.uid).reduce((acc, c) => acc + c.billingAmount, 0))}
                  </td>
                  <td className="py-6">
                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: '75%' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ReportCard = ({ label, value, color }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
  </div>
);
