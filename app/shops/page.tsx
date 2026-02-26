'use client';

import { useState, useEffect, useMemo } from 'react';
import { Store, Plus, Search, MapPin, ChevronLeft, Loader2, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

export default function ShopsPage() {
    const [shops, setShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name_asc' | 'balance_desc' | 'balance_asc'>('name_asc');

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            const res = await fetch('/api/shops');
            const data = await res.json();
            setShops(data);
        } catch (error) {
            console.error('Error fetching shops:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAndSortedShops = useMemo(() => {
        let result = shops;

        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(shop =>
                shop.name.toLowerCase().includes(lowerQuery) ||
                (shop.area && shop.area.toLowerCase().includes(lowerQuery))
            );
        }

        result = [...result].sort((a, b) => {
            if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
            if (sortBy === 'balance_desc') return b.pendingBalance - a.pendingBalance;
            if (sortBy === 'balance_asc') return a.pendingBalance - b.pendingBalance;
            return 0;
        });

        return result;
    }, [shops, searchQuery, sortBy]);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="bg-white p-6 border-b border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold">Shops Directory</h1>
                </div>
                <Link
                    href="/shops/add"
                    className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </Link>
            </header>

            <main className="flex-1 p-4 pb-24">
                <div className="flex flex-col gap-4">
                    {/* Search and Sort Controls */}
                    {shops.length > 0 && (
                        <div className="flex gap-2 mb-2">
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
                                    <option value="name_asc">Name (A-Z)</option>
                                    <option value="balance_desc">Highest Balance</option>
                                    <option value="balance_asc">Lowest Balance</option>
                                </select>
                                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : shops.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <Store className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-500 mb-4">No shops found yet.</p>
                            <Link
                                href="/shops/add"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
                            >
                                <Plus className="w-5 h-5" />
                                Add First Shop
                            </Link>
                        </div>
                    ) : filteredAndSortedShops.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm">No shops match your search.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredAndSortedShops.map((shop) => {
                                if (!shop._id) return null; // FIX for ObjectID cast error
                                return (
                                    <Link
                                        href={`/shops/${shop._id}`}
                                        key={shop._id}
                                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:border-blue-300 active:scale-[0.98]"
                                    >
                                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                            <Store className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-lg leading-tight">{shop.name}</p>
                                            <div className="flex items-center gap-1 text-slate-400 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                <p className="text-xs font-medium">{shop.area}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase text-slate-400">Balance</p>
                                            <p className="font-bold text-slate-700">₹{shop.pendingBalance}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
