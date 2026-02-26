'use client';

import { useState } from 'react';
import { Store, MapPin, Check, Plus, Loader2 } from 'lucide-react';
import NotificationDialog from './NotificationDialog';

export default function EditShopDialog({ shop, onUpdated }: { shop: any, onUpdated: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(shop.name);
    const [area, setArea] = useState(shop.area);
    const [submitting, setSubmitting] = useState(false);
    const [dialog, setDialog] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' }>({
        isOpen: false, title: '', message: '', type: 'success'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`/api/shops/${shop._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, area }),
            });
            if (res.ok) {
                setIsOpen(false);
                onUpdated();
            } else {
                throw new Error('Failed to update');
            }
        } catch (err) {
            setDialog({
                isOpen: true,
                title: 'Error',
                message: 'Failed to update shop details.',
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full h-12 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 active:bg-slate-50 transition-colors"
            >
                Edit Details
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-100 flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <Store className="w-6 h-6 text-blue-600" />
                                Edit Shop
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 font-bold">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Shop Name</label>
                                <input
                                    type="text"
                                    required
                                    className="h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Area / Location
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-4 h-14 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:bg-slate-300"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <NotificationDialog {...dialog} onClose={() => setDialog({ ...dialog, isOpen: false })} />
        </>
    );
}
