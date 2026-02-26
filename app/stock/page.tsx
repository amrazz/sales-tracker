'use client';

import { useState, useEffect, useMemo } from 'react';
import { Package, Trash2, Search, ArrowUpDown, Check, Plus, Tag, X, LayoutGrid } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import QuickAddProduct from '@/components/QuickAddProduct';
import NotificationDialog from '@/components/NotificationDialog';
import EditProductDialog from '@/components/EditProductDialog';

export default function StockPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'catalog' | 'wastage'>('catalog');
    const [formData, setFormData] = useState({ productId: '', quantity: '' });
    const [submitting, setSubmitting] = useState(false);

    // Catalog Search/Sort
    const [catalogSearch, setCatalogSearch] = useState('');

    // Dialog state
    const [dialog, setDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning' | 'confirm';
        onConfirm?: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = (id: string) => {
        setDialog({
            isOpen: true,
            title: 'Delete Product?',
            message: 'Are you sure you want to remove this product from your catalog?',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    await fetch(`/api/products/${id}`, { method: 'DELETE' });
                    await fetchData();
                } catch (err) {
                    console.error(err);
                }
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productId || !formData.quantity) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: formData.productId,
                    quantity: Number(formData.quantity),
                    type: 'wastage'
                }),
            });

            if (!res.ok) throw new Error('Failed to record wastage');

            setFormData({ productId: '', quantity: '' });
            await fetchData();
            setActiveTab('catalog');
            setDialog({
                isOpen: true,
                title: 'Wastage Recorded',
                message: 'Product stock has been updated.',
                type: 'success'
            });
        } catch (err) {
            console.error(err);
            setDialog({
                isOpen: true,
                title: 'Error',
                message: 'Failed to record wastage.',
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const filteredCatalog = useMemo(() => {
        if (!catalogSearch.trim()) return products;
        const lower = catalogSearch.toLowerCase();
        return products.filter(p => p.name.toLowerCase().includes(lower));
    }, [products, catalogSearch]);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="bg-white p-6 border-b border-slate-200">
                <h1 className="text-2xl font-bold">Stock Management</h1>
            </header>

            {/* Tabs */}
            <div className="flex p-1.5 bg-slate-100 m-4 rounded-2xl overflow-x-auto no-scrollbar">
                {[
                    { id: 'catalog', label: 'Catalog' },
                    { id: 'wastage', label: 'Wastage' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex-1 min-w-[80px] py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-tighter",
                            activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 px-4 pb-24">
                {activeTab === 'catalog' ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search catalog..."
                                    value={catalogSearch}
                                    onChange={(e) => setCatalogSearch(e.target.value)}
                                    className="w-full h-11 pl-9 pr-4 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <QuickAddProduct onAdded={fetchData} />
                        </div>

                        <div className="flex flex-col gap-3">
                            {filteredCatalog.length === 0 ? (
                                <div className="text-center py-10 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500 font-bold uppercase text-xs tracking-wider">No items found</p>
                                </div>
                            ) : (
                                filteredCatalog.map((p) => (
                                    <div key={p._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center transition-all">
                                        <div>
                                            <h3 className="font-black text-slate-800 uppercase tracking-tight leading-tight">{p.name}</h3>
                                            <div className="flex flex-col gap-0.5 mt-1">
                                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                                                    {formatCurrency(p.price || 0)} / {p.unit}
                                                </span>
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider",
                                                    (p.stock || 0) > 0 ? "text-slate-500" : "text-red-400"
                                                )}>
                                                    {(p.stock || 0) > 0 ? `${p.stock} in stock` : 'No stock'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <EditProductDialog product={p} onUpdated={fetchData} />
                                            <button
                                                onClick={() => handleDeleteProduct(p._id)}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                                <Trash2 className="text-red-500" />
                                Add Wastage
                            </h2>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Select Item</label>
                            <select
                                required
                                value={formData.productId}
                                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                className="h-14 bg-slate-50 border border-slate-200 rounded-2xl px-4 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            >
                                <option value="">Choose an item...</option>
                                {products.map((p) => (
                                    <option key={p._id} value={p._id}>{p.name} ({p.unit})</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Quantity</label>
                            <input
                                required
                                type="number"
                                placeholder="0"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="h-14 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-2xl font-black text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-lg transition-all active:scale-95 shadow-xl uppercase tracking-tight bg-red-500 text-white shadow-red-100"
                        >
                            {submitting ? 'Processing...' : (
                                <>
                                    <Check className="w-6 h-6" />
                                    Save Wastage
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>

            <NotificationDialog
                {...dialog}
                onClose={() => setDialog({ ...dialog, isOpen: false })}
            />
        </div>
    );
}
