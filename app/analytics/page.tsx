'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    CreditCard,
    Receipt,
    CalendarDays,
    ChevronLeft,
    TrendingUp,
    Store,
    ArrowDownLeft,
    Share2
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';

type DateFilter = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

export default function AnalyticsPage() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<DateFilter>('month');

    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const fetchAnalytics = async (startDate: Date, endDate: Date) => {
        setLoading(true);
        try {
            const startIso = startDate.toISOString();
            const endIso = endDate.toISOString();
            const res = await fetch(`/api/analytics?startDate=${startIso}&endDate=${endIso}`);
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (filter === 'custom') {
            if (customStart && customEnd) {
                fetchAnalytics(new Date(customStart), new Date(customEnd));
            }
            return;
        }

        const now = new Date();
        let start = new Date();
        let end = new Date();

        if (filter === 'today') {
            // keep as today
        } else if (filter === 'yesterday') {
            start.setDate(now.getDate() - 1);
            end.setDate(now.getDate() - 1);
        } else if (filter === 'week') {
            start.setDate(now.getDate() - 6);
        } else if (filter === 'month') {
            start.setDate(1); // First of current month
        }

        fetchAnalytics(start, end);
    }, [filter, customStart, customEnd]);

    const getFilterLabel = () => {
        if (filter === 'today') return "Today's Metrics";
        if (filter === 'yesterday') return "Yesterday's Metrics";
        if (filter === 'week') return "Last 7 Days";
        if (filter === 'month') return "This Month";
        return "Custom Range";
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="print:hidden bg-white p-6 border-b border-slate-200 sticky top-0 z-10">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold flex-1">Analytics Hub</h1>
                </div>

                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
                    {[
                        { id: 'today', label: 'Today' },
                        { id: 'yesterday', label: 'Yesterday' },
                        { id: 'week', label: '7 Days' },
                        { id: 'month', label: 'Month' },
                        { id: 'custom', label: 'Custom' }
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setFilter(btn.id as DateFilter)}
                            className={cn(
                                "whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
                                filter === btn.id
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                                    : "bg-white text-slate-500 border-slate-200"
                            )}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                {filter === 'custom' && (
                    <div className="flex gap-2 mt-2">
                        <input
                            type="date"
                            value={customStart}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="flex-1 h-12 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                        />
                        <input
                            type="date"
                            value={customEnd}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="flex-1 h-12 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                        />
                    </div>
                )}
            </header>

            <div className="flex-1 p-4 pb-24">
                {loading || !data ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <BarChart3 className="w-10 h-10 text-slate-400 mb-4 animate-pulse" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Crunching numbers...</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider">
                                {getFilterLabel()}
                            </h2>
                        </div>

                        {/* Master Metric */}
                        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                            <TrendingUp className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-800 opacity-50" />
                            <div className="relative">
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Net Profit</p>
                                <h3 className={cn("text-4xl font-black tracking-tight", data.netProfit >= 0 ? "text-green-400" : "text-red-400")}>
                                    {formatCurrency(data.netProfit)}
                                </h3>
                                <div className="flex gap-4 mt-6">
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Total Rev</p>
                                        <p className="font-bold">{formatCurrency(data.totalRevenue)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Expenses</p>
                                        <p className="font-bold text-red-300">{formatCurrency(data.totalExpenses)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Breakdown */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Revenue Breakdown</h3>
                                <span className="text-[10px] font-black bg-white px-2 py-1 rounded border border-slate-200 flex items-center gap-1">
                                    <Store className="w-3 h-3 text-blue-500" />
                                    {data.salesCount} Sales
                                </span>
                            </div>
                            <div className="flex flex-col text-sm">
                                <div className="flex justify-between items-center p-4 border-b border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 text-green-600">
                                            <Wallet className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-slate-700">Cash Sales</span>
                                    </div>
                                    <span className="font-black text-slate-900">{formatCurrency(data.totalCashSales)}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 border-b border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-50 text-purple-600">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-slate-700">Online / UPI</span>
                                    </div>
                                    <span className="font-black text-slate-900">{formatCurrency(data.totalUPISales)}</span>
                                </div>
                                <div className="flex justify-between items-center p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-50 text-orange-600">
                                            <Receipt className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-slate-700">Credit Given</span>
                                    </div>
                                    <span className="font-black text-slate-900">{formatCurrency(data.totalCreditSales)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Operational Flow */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 mb-3">
                                    <ArrowDownLeft className="w-5 h-5" />
                                </div>
                                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Old Credit Recovered</p>
                                <p className="text-xl font-black text-slate-800">{formatCurrency(data.totalOldCashReceived)}</p>
                                <p className="text-[10px] font-medium text-slate-400 mt-2">{data.paymentsCount} payments logged</p>
                            </div>
                            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 text-red-600 mb-3">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Total Expenses</p>
                                <p className="text-xl font-black text-slate-800">{formatCurrency(data.totalExpenses)}</p>
                                <p className="text-[10px] font-medium text-slate-400 mt-2">{data.expensesCount} expenses logged</p>
                            </div>
                        </div>

                        <Link
                            href="/summary/print"
                            className="print:hidden mt-4 w-full h-14 bg-white border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all text-slate-700"
                        >
                            <Share2 className="w-5 h-5" />
                            Share / Export Formal Report
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
