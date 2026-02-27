'use client';

import { useState, useEffect, useMemo } from 'react';
import { Wallet, History, Plus, Check, ArrowDownLeft, Store, Search, ArrowUpDown } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import NotificationDialog from '@/components/NotificationDialog';

export default function CreditsPage() {
    const [shops, setShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedShop, setSelectedShop] = useState<any>(null);
    const [amount, setAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [view, setView] = useState<'list' | 'pay'>('list');

    // Search & Sort state
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'balance_desc' | 'balance_asc' | 'name_asc'>('balance_desc');

    // Dialog state
    const [dialog, setDialog] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' }>({
        isOpen: false, title: '', message: '', type: 'success'
    });

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        setLoading(true);
        const res = await fetch('/api/shops');
        const data = await res.json();
        setShops(data.filter((s: any) => s.pendingBalance > 0));
        setLoading(false);
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedShop || !amount) return;

        setSubmitting(true);
        try {
            await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopId: selectedShop._id,
                    amount: Number(amount)
                }),
            });
            setAmount('');
            setSelectedShop(null);
            await fetchShops();
            setView('list');
            setDialog({
                isOpen: true,
                title: 'Payment Recorded',
                message: `Successfully logged payment for ${selectedShop?.name}.`,
                type: 'success'
            });
        } catch (err) {
            console.error(err);
            setDialog({
                isOpen: true,
                title: 'Error',
                message: 'Failed to record payment.',
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const filteredAndSortedShops = useMemo(() => {
        let result = shops.filter(shop => shop != null); // Ensure no nulls in the array

        // Search filter
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(shop => {
                const shopName = shop?.name || '';
                const shopArea = shop?.area || '';
                return shopName.toLowerCase().includes(lowerQuery) ||
                    shopArea.toLowerCase().includes(lowerQuery);
            });
        }

        // Sorting
        result = [...result].sort((a, b) => {
            if (sortBy === 'balance_desc') return (b?.pendingBalance || 0) - (a?.pendingBalance || 0);
            if (sortBy === 'balance_asc') return (a?.pendingBalance || 0) - (b?.pendingBalance || 0);
            if (sortBy === 'name_asc') return (a?.name || '').localeCompare(b?.name || '');
            return 0;
        });

        return result;
    }, [shops, searchQuery, sortBy]);

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-white p-6 border-b border-slate-200">
                <h1 className="text-2xl font-bold">Credit Ledger</h1>
            </header>

            <div className="flex-1 p-4 pb-24">
                {view === 'list' ? (
                    <div className="flex flex-col gap-6">
                        <div className="bg-orange-600 p-6 rounded-3xl text-white shadow-xl">
                            <p className="text-orange-100 text-xs font-medium uppercase tracking-widest mb-1">Total Market Credit</p>
                            <h3 className="text-4xl font-black">
                                {formatCurrency(shops.reduce((acc, curr) => acc + (curr?.pendingBalance || 0), 0))}
                            </h3>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h2 className="text-sm font-bold uppercase text-slate-400">Pending by Shop</h2>

                            {/* Search and Sort Controls */}
                            {shops.length > 0 && (
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search shop or area..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full h-12 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>
                                    <div className="relative shrink-0">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as any)}
                                            className="h-12 pl-4 pr-10 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                        >
                                            <option value="balance_desc">Highest Balance</option>
                                            <option value="balance_asc">Lowest Balance</option>
                                            <option value="name_asc">Name (A-Z)</option>
                                        </select>
                                        <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <p className="text-center py-10">Loading...</p>
                            ) : shops.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <Check className="w-10 h-10 text-green-400 mx-auto mb-2" />
                                    <p className="text-slate-500 text-sm">All cleared! No pending credits.</p>
                                </div>
                            ) : filteredAndSortedShops.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500 text-sm">No shops match your search.</p>
                                </div>
                            ) : (
                                filteredAndSortedShops.map(shop => (
                                    <div key={shop._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-lg">{shop?.name || 'Unknown'}</p>
                                            <p className="text-xs text-slate-500">{shop?.area || 'No Area'}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <p className="font-black text-orange-600">{formatCurrency(shop?.pendingBalance || 0)}</p>
                                            <button
                                                onClick={() => { setSelectedShop(shop); setView('pay'); }}
                                                className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg active:bg-blue-100 transition-all flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Log Payment
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <button
                            onClick={() => { setView('list'); setSelectedShop(null); }}
                            className="text-sm font-bold text-slate-400 flex items-center gap-1"
                        >
                            ← Back to list
                        </button>

                        <form onSubmit={handlePayment} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                                <Store className="w-6 h-6 text-slate-400" />
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Recording payment for</p>
                                    <p className="font-bold text-lg">{selectedShop?.name || 'Unknown'}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase text-slate-400">Amount Received</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                                    <input
                                        required
                                        type="number"
                                        max={selectedShop?.pendingBalance || 0}
                                        value={amount}
                                        onChange={(e) => {
                                            let val = Number(e.target.value);
                                            const maxAllowed = selectedShop?.pendingBalance || 0;
                                            if (val > maxAllowed) val = maxAllowed;
                                            setAmount(e.target.value === '' ? '' : val.toString());
                                        }}
                                        className="h-16 w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 text-2xl font-black focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-300 transition-all"
                                        placeholder="Enter amount..."
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500">Max allowed: {formatCurrency(selectedShop?.pendingBalance || 0)}</p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !selectedShop}
                                className="h-14 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:bg-slate-300"
                            >
                                {submitting ? 'Saving...' : (
                                    <>
                                        <ArrowDownLeft className="w-5 h-5" />
                                        Record Received Money
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <NotificationDialog
                isOpen={dialog.isOpen}
                onClose={() => setDialog({ ...dialog, isOpen: false })}
                title={dialog.title}
                message={dialog.message}
                type={dialog.type}
            />
        </div>
    );
}
