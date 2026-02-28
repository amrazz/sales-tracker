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
  ReceiptText,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/summary')
      .then(res => res.json())
      .then(d => {
        setSummary(d);
        setLoading(false);
      });

    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const stats = [
    { label: 'Today Sales', value: summary ? formatCurrency(summary.totalCashSales + summary.totalUPISales + summary.totalCreditSales) : '₹0', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Credits', value: summary ? formatCurrency(summary.totalPendingCredits) : '₹0', icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Expenses', value: summary ? formatCurrency(summary.totalExpenses) : '₹0', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const quickActions = [
    { label: 'New Sale', href: '/sales', icon: Plus, bg: 'bg-blue-600', text: 'text-white' },
    { label: 'Shops', href: '/shops', icon: Store, bg: 'bg-slate-100', text: 'text-slate-800' },
    { label: 'Expense', href: '/expenses', icon: ReceiptText, bg: 'bg-slate-100', text: 'text-slate-800' },
    { label: 'Stock In', href: '/stock', icon: PackageCheck, bg: 'bg-slate-100', text: 'text-slate-800' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  return (
    <div className="flex flex-col gap-6 p-6 pb-24">
      <header className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{getGreeting()}</h1>
          <p className="text-slate-500 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>

        <div className="relative z-50">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden hover:bg-slate-200 transition-colors shadow-sm active:scale-95"
          >
            {user?.name ? (
              <span className="text-lg font-black text-blue-600">
                {user.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="w-6 h-6 text-slate-500" />
            )}
          </button>

          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-5 py-3 border-b border-slate-50 mb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</p>
                  <p className="text-base font-bold text-slate-900 truncate mt-0.5">{user?.name || 'User'}</p>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Profile
                </Link>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
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
