'use client';

import { useState, Suspense } from 'react';
import { Store, Plus, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function AddShopForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [newShop, setNewShop] = useState({ name: '', area: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleAddShop = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newShop.name || !newShop.area) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/shops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newShop),
            });
            if (res.ok) {
                const returnUrl = searchParams.get('returnUrl');
                if (returnUrl) {
                    router.push(returnUrl);
                } else {
                    router.push('/shops');
                }
            }
        } catch (error) {
            console.error('Error adding shop:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="bg-white p-6 border-b border-slate-200 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Add Shop</h1>
            </header>

            <main className="flex-1 p-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-600" />
                        Enter Shop Details
                    </h2>
                    <form onSubmit={handleAddShop} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shop Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Mubarak Store"
                                className="h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={newShop.name}
                                onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Area / Location</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Market Road"
                                className="h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={newShop.area}
                                onChange={(e) => setNewShop({ ...newShop, area: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-6 w-full h-14 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:bg-slate-300"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    Save Shop
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default function AddShopPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center font-bold text-slate-500">Loading form...</div>}>
            <AddShopForm />
        </Suspense>
    );
}
