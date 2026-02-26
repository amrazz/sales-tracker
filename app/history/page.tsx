'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Search, ReceiptText, Package, CalendarOff, CalendarDays, Wallet, CreditCard, Printer } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

type DateFilter = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

export default function HistoryPage() {
    const router = useRouter();
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Date Filtering State
    const [filter, setFilter] = useState<DateFilter>('today');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const fetchSales = async (startDate: Date, endDate: Date) => {
        setLoading(true);
        try {
            const startIso = startDate.toISOString();
            const endIso = endDate.toISOString();
            const res = await fetch(`/api/sales?startDate=${startIso}&endDate=${endIso}`);
            const data = await res.json();
            setSales(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (filter === 'custom') {
            if (customStart && customEnd) {
                fetchSales(new Date(customStart), new Date(customEnd));
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

        fetchSales(start, end);
    }, [filter, customStart, customEnd]);

    const filteredSales = useMemo(() => {
        if (!searchQuery.trim()) return sales;
        const lowerQuery = searchQuery.toLowerCase();
        return sales.filter((s: any) =>
            s.shopId?.name?.toLowerCase().includes(lowerQuery) ||
            s.shopId?.area?.toLowerCase().includes(lowerQuery)
        );
    }, [sales, searchQuery]);

    // Financial Helpers (Matching Analytics logic for legacy support)
    const getPaid = (s: any) => s.amountPaid !== undefined && s.amountPaid !== null ? s.amountPaid : (s.paymentType === 'credit' ? 0 : s.totalAmount);
    const getCredit = (s: any) => (s.totalAmount || 0) - getPaid(s);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="bg-white p-6 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold leading-tight">Sales History</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sales.length} transactions found</p>
                    </div>
                </div>

                {/* Date Filters */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-4">
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
                    <div className="flex gap-2 mb-4 animate-in slide-in-from-top-2 duration-200">
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

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by shop name or area..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>
            </header>

            <div className="flex-1 p-4 pb-24">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <ReceiptText className="w-10 h-10 text-slate-400 mb-4 animate-pulse" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading history...</p>
                    </div>
                ) : filteredSales.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm mt-4">
                        <CalendarOff className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-bold uppercase tracking-wider text-sm">No sales found</p>
                        <p className="text-xs text-slate-400 mt-1">Try selecting a different date range.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredSales.map((sale) => (
                            <div key={sale._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                {/* Card Header */}
                                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                                    <div>
                                        <h3 className="font-black text-slate-800 tracking-tight text-lg">
                                            {sale.shopId?.name || 'Unknown Shop'}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                {sale.shopId?.area || 'No Area'}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(sale.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className="flex flex-col items-end mb-1">
                                            {sale.discount > 0 && (
                                                <p className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded mb-1">
                                                    -{formatCurrency(sale.discount)} Discount
                                                </p>
                                            )}
                                            <p className="font-black text-lg text-slate-900 leading-none">
                                                {formatCurrency(sale.totalAmount)}
                                            </p>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Bill</p>
                                    </div>
                                </div>

                                {/* Financials Summary */}
                                <div className="grid grid-cols-2 p-3 gap-3 border-b border-slate-50">
                                    <div className="bg-green-50/50 p-2 rounded-xl flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                            {sale.paymentType === 'upi' ? <CreditCard className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Received</p>
                                            <p className="text-sm font-black text-green-700">{formatCurrency(getPaid(sale))}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "p-2 rounded-xl flex items-center gap-2",
                                        getCredit(sale) > 0 ? "bg-orange-50/50" : "bg-slate-50/50"
                                    )}>
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center",
                                            getCredit(sale) > 0 ? "bg-orange-100 text-orange-600" : "bg-slate-200 text-slate-400"
                                        )}>
                                            <CalendarDays className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Credit</p>
                                            <p className={cn(
                                                "text-sm font-black",
                                                getCredit(sale) > 0 ? "text-orange-700" : "text-slate-400"
                                            )}>{formatCurrency(getCredit(sale))}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="p-4 bg-white">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Package className="w-4 h-4 text-slate-400" />
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Items Provided ({sale.items.length})</h4>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {sale.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center text-sm bg-slate-50 px-3 py-2 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-700 uppercase tracking-tight text-xs">{item.productId?.name || 'Unknown Product'}</span>
                                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">x{item.quantity}</span>
                                                </div>
                                                <span className="font-black text-slate-900">{formatCurrency(item.quantity * (item.price || 0))}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Print Action */}
                                <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                                    <Link
                                        href={`/history/${sale._id}/print`}
                                        className="flex items-center gap-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-xl hover:shadow-md transition-all active:scale-95"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print Bill
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
