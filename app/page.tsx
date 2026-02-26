'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  CreditCard,
  AlertCircle,
  ArrowRight,
  Plus,
  PackageCheck,
  CheckCircle2,
  Store,
  BarChart3,
  ReceiptText
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/summary')
      .then(res => res.json())
      .then(d => {
        setSummary(d);
        setLoading(false);
      });
  }, []);

  const stats = [
    { label: 'Today Sales', value: summary ? formatCurrency(summary.totalCashSales + summary.totalUPISales + summary.totalCreditSales) : '₹0', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Credits', value: summary ? formatCurrency(summary.totalCreditSales) : '₹0', icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Expenses', value: summary ? formatCurrency(summary.totalExpenses) : '₹0', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const quickActions = [
    { label: 'New Sale', href: '/sales', icon: Plus, bg: 'bg-blue-600', text: 'text-white' },
    { label: 'Shops', href: '/shops', icon: Store, bg: 'bg-slate-100', text: 'text-slate-800' },
    { label: 'Log Expense', href: '/expenses', icon: ReceiptText, bg: 'bg-slate-100', text: 'text-slate-800' },
    { label: 'Stock In', href: '/stock', icon: PackageCheck, bg: 'bg-slate-100', text: 'text-slate-800' },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 pb-24">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Good Morning!</h1>
        <p className="text-slate-500 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`p-4 rounded-2xl ${stat.bg} ${i === 0 ? 'col-span-2' : ''} flex flex-col gap-2`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{loading ? '...' : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-bold shadow-sm active:scale-95 transition-all ${action.bg} ${action.text}`}
            >
              <action.icon className="w-5 h-5" />
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Advanced Links */}
      <section className="flex flex-col gap-3">
        <Link
          href="/history"
          className="flex items-center justify-between p-5 bg-purple-50 border border-purple-100 rounded-2xl active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-purple-900">Sales History</p>
              <p className="text-xs text-purple-600 font-medium">Search past transactions</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-purple-400" />
        </Link>

        <Link
          href="/analytics"
          className="flex items-center justify-between p-5 bg-blue-50 border border-blue-100 rounded-2xl active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-blue-900">Analytics & Reports</p>
              <p className="text-xs text-blue-600 font-medium">Monthly profit & metrics</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-blue-400" />
        </Link>



        {/* Summary Link */}
        <Link
          href="/summary"
          className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl shadow-lg active:scale-[0.98] transition-all"
        >
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-400">End of Day</span>
            <span className="text-lg font-bold">Daily Closing Summary</span>
          </div>
          <ArrowRight className="w-6 h-6" />
        </Link>
      </section>
    </div>
  );
}
