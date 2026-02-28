'use client';

import { useState } from 'react';
import {
    CheckCircle2,
    X,
    ShoppingCart,
    CreditCard,
    Wallet,
    CircleDollarSign
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface OrderDeliveryModalProps {
    order: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function OrderDeliveryModal({ order, onClose, onSuccess }: OrderDeliveryModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [paymentType, setPaymentType] = useState<'cash' | 'upi' | 'credit'>('cash');
    const [amountPaid, setAmountPaid] = useState<string>(order.totalAmount.toString());

    const handleDeliver = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/orders/${order._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'delivered',
                    paymentInfo: {
                        paymentType,
                        amountPaid: Number(amountPaid)
                    }
                })
            });

            if (res.ok) {
                onSuccess();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[40px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-500">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Complete Delivery</h3>
                            <p className="text-slate-500 font-medium text-sm">Recording payment for {order.shopId?.name}</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl flex flex-col gap-1 mb-8">
                        <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest">Order Total</p>
                        <h3 className="text-4xl font-black">{formatCurrency(order.totalAmount)}</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Payment Method</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'cash', icon: CircleDollarSign, label: 'Cash' },
                                    { id: 'upi', icon: CreditCard, label: 'UPI' },
                                    { id: 'credit', icon: Wallet, label: 'Credit' }
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            setPaymentType(type.id as any);
                                            setAmountPaid(type.id === 'credit' ? '0' : order.totalAmount.toString());
                                        }}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all active:scale-95 gap-2",
                                            paymentType === type.id
                                                ? "bg-blue-50 border-blue-600 text-blue-600"
                                                : "bg-slate-50 border-slate-50 text-slate-400"
                                        )}
                                    >
                                        <type.icon className="w-6 h-6" />
                                        <span className="text-[10px] font-bold uppercase">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {paymentType !== 'credit' && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Amount Received</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">₹</span>
                                    <input
                                        type="number"
                                        className="h-16 w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-6 text-2xl font-black text-slate-900 focus:border-blue-500 outline-none transition-all"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleDeliver}
                            disabled={submitting}
                            className="w-full h-16 bg-slate-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-2xl active:scale-95 disabled:opacity-50 transition-all mt-4"
                        >
                            {submitting ? 'Processing...' : 'Finish & Confirm Delivery'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
