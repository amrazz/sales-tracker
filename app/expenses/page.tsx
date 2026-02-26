'use client';

import { useState, useEffect } from 'react';
import { ReceiptText, Plus, Trash2, Fuel, Utensils, Construction, PlusCircle } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ description: '', amount: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        const res = await fetch('/api/expenses');
        setExpenses(await res.json());
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || !formData.amount) return;

        setSubmitting(true);
        try {
            await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: formData.description,
                    amount: Number(formData.amount)
                }),
            });
            setFormData({ description: '', amount: '' });
            await fetchExpenses();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const quickDescriptions = [
        { label: 'Petrol/Diesel', icon: Fuel },
        { label: 'Lunch/Food', icon: Utensils },
        { label: 'Toll/Tax', icon: Construction },
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-white p-6 border-b border-slate-200">
                <h1 className="text-2xl font-bold">Daily Expenses</h1>
            </header>

            <div className="flex-1 p-4 pb-24">
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6 mb-8">
                    <h2 className="text-xs font-bold uppercase text-slate-400">Add New Expense</h2>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Description</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Diesel for van"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <div className="flex gap-2 mt-1">
                            {quickDescriptions.map((item) => (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, description: item.label })}
                                    className="text-[10px] font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 active:bg-slate-200 transition-all"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Amount Paid</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                            <input
                                required
                                type="number"
                                placeholder="0"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="h-14 w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 text-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="h-14 bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                    >
                        {submitting ? 'Saving...' : (
                            <>
                                <PlusCircle className="w-5 h-5" />
                                Add Expense
                            </>
                        )}
                    </button>
                </form>

                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center mb-1">
                        <h2 className="text-sm font-bold uppercase text-slate-400">Today's List</h2>
                        <span className="text-xs font-bold text-red-500">
                            Total: {formatCurrency(expenses.reduce((acc, curr) => acc + curr.amount, 0))}
                        </span>
                    </div>

                    {loading ? (
                        <p className="text-center py-4 text-slate-400">Loading...</p>
                    ) : expenses.length === 0 ? (
                        <p className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 text-sm">No expenses logged today</p>
                    ) : (
                        expenses.map((exp) => (
                            <div key={exp._id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                                        <ReceiptText className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{exp.description}</p>
                                        <p className="text-[10px] text-slate-400">{new Date(exp.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                <p className="font-bold text-red-500">-{formatCurrency(exp.amount)}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
