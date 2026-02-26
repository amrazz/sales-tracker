'use client';

import { useState } from 'react';
import { Plus, X, Check, Box, Tag, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import NotificationDialog from './NotificationDialog';

interface QuickAddProductProps {
    onAdded: (product: any, initialStock?: number, initialPrice?: number) => void;
}

export default function QuickAddProduct({ onAdded }: QuickAddProductProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('box');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Dialog state
    const [dialog, setDialog] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !unit) return;

        setSubmitting(true);
        try {
            const prodRes = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, unit, price: Number(price) || 0, stock: Number(stock) || 0 }),
            });

            if (prodRes.status === 409) {
                setDialog({
                    isOpen: true,
                    title: 'Already Exists',
                    message: `A product named "${name}" is already in your catalog.`,
                    type: 'error'
                });
                setSubmitting(false);
                return;
            }

            const newProduct = await prodRes.json();

            onAdded(newProduct, Number(stock) || 0, Number(price) || 0);

            setName('');
            setUnit('box');
            setPrice('');
            setStock('');
            setIsOpen(false);
        } catch (err) {
            console.error('Failed to add product:', err);
            setDialog({
                isOpen: true,
                title: 'Error',
                message: 'Something went wrong while adding the product.',
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
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shadow-md active:scale-90 transition-all"
                type="button"
            >
                <Plus className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">New Product</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Setup item & stock</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                    <Box className="w-3 h-3" />
                                    Product Name
                                </label>
                                <input
                                    autoFocus
                                    required
                                    type="text"
                                    placeholder="e.g. Fresh Milk"
                                    className="h-12 bg-slate-100/50 border border-slate-200 rounded-xl px-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                    <Layers className="w-3 h-3" />
                                    Select Unit
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['box', 'kg', 'ltr'].map((u) => (
                                        <button
                                            key={u}
                                            type="button"
                                            onClick={() => setUnit(u)}
                                            className={cn(
                                                "h-10 rounded-xl text-xs font-bold border transition-all uppercase",
                                                unit === u
                                                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                                    : "bg-white border-slate-200 text-slate-500"
                                            )}
                                        >
                                            {u}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                        <Tag className="w-3 h-3" />
                                        Unit Price
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                        <input
                                            type="number"
                                            className="h-12 w-full bg-slate-100/50 border border-slate-200 rounded-xl pl-7 pr-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                        <Check className="w-3 h-3" />
                                        Initial Stock
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="h-12 bg-blue-50/30 border border-blue-100 rounded-xl px-4 text-blue-600 font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !name}
                                className="mt-2 h-12 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:bg-slate-200"
                            >
                                {submitting ? 'Creating...' : 'Save Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <NotificationDialog
                isOpen={dialog.isOpen}
                onClose={() => setDialog({ ...dialog, isOpen: false })}
                title={dialog.title}
                message={dialog.message}
                type={dialog.type}
            />
        </>
    );
}
