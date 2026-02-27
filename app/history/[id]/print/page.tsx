'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import PrintActions from '@/components/PrintActions';

export default function InvoicePrintPage() {
    const params = useParams();
    const router = useRouter();
    const [sale, setSale] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params.id) return;
        fetch(`/api/sales/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setSale(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [params.id]);

    if (loading) {
        return <div className="p-10 text-center font-bold text-slate-500">Loading Invoice...</div>;
    }

    if (!sale || sale.error) {
        return <div className="p-10 text-center font-bold text-red-500">Invoice not found.</div>;
    }

    // Financial Helpers
    const getPaid = (s: any) => s.amountPaid !== undefined && s.amountPaid !== null ? s.amountPaid : (s.paymentType === 'credit' ? 0 : s.totalAmount);
    const getCredit = (s: any) => (s.totalAmount || 0) - getPaid(s);

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white flex flex-col items-center py-10 print:py-0">
            {/* Action Bar (Hidden in Print) */}
            <div className="print:hidden w-full max-w-2xl bg-white p-4 rounded-2xl shadow-sm mb-6 flex justify-between items-center border border-slate-200">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-600 font-bold hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <PrintActions targetId="print-container" fileName={`Invoice_${sale?.shopId?.name?.replace(/\s+/g, '_') || 'Customer'}_${new Date(sale?.date).getTime()}`} />
            </div>

            {/* A5 / Receipt paper format optimized card */}
            <div id="print-container" className="w-full max-w-2xl bg-white p-6 sm:p-10 print:p-6 sm:print:p-10 print:shadow-none shadow-xl border border-slate-200 print:border-none rounded-3xl print:rounded-none">

                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-xl font-black tracking-tighter uppercase text-slate-900">Tax Invoice</h1>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mt-1">Delivery Challan</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-slate-800 text-lg">Van Sales Tracker</p>
                        <p className="text-xs text-slate-500 font-medium">Auto-generated receipt</p>
                    </div>
                </div>

                {/* Customer Details & Meta */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Billed To</p>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{sale.shopId?.name || 'Walk-in Customer'}</h2>
                        <p className="text-sm font-medium text-slate-600 mt-1">{sale.shopId?.area || ''}</p>
                        {sale.shopId?.phone && <p className="text-sm font-medium text-slate-600">Ph: {sale.shopId.phone}</p>}
                    </div>
                    <div className="text-right flex flex-col items-end justify-start">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 min-w-[150px]">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Invoice Date</p>
                            <p className="font-bold text-slate-800">
                                {new Date(sale.date).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                })}
                            </p>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                                {new Date(sale.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</th>
                                <th className="py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Qty</th>
                                <th className="py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Rate</th>
                                <th className="py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sale.items.map((item: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="py-4 px-1 font-bold text-slate-800 text-sm uppercase">{item.productId?.name || 'Item'}</td>
                                    <td className="py-4 px-1 font-bold text-slate-800 text-sm text-center">{item.quantity}</td>
                                    <td className="py-4 px-1 font-medium text-slate-600 text-sm text-right">{formatCurrency(item.price)}</td>
                                    <td className="py-4 px-1 font-black text-slate-900 text-sm text-right">{formatCurrency(item.quantity * item.price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Financial Summary */}
                <div className="flex justify-end mb-16">
                    <div className="w-full max-w-xs">
                        <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                            <span className="font-bold text-slate-500">Subtotal</span>
                            <span className="font-black text-slate-800">{formatCurrency(sale.subtotal || sale.totalAmount + (sale.discount || 0))}</span>
                        </div>
                        {sale.discount > 0 && (
                            <div className="flex justify-between py-2 border-b border-slate-100 text-sm text-red-600">
                                <span className="font-bold">Discount</span>
                                <span className="font-black">-{formatCurrency(sale.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                            <span className="font-bold text-slate-500 underline decoration-slate-900 decoration-2 underline-offset-4 tracking-tighter uppercase">Total Amount</span>
                            <span className="font-black text-slate-900 text-lg">{formatCurrency(sale.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                            <span className="font-bold text-slate-500">Amount Paid ({sale.paymentType?.toUpperCase()})</span>
                            <span className="font-black text-green-700">{formatCurrency(getPaid(sale))}</span>
                        </div>
                        {getCredit(sale) > 0 && (
                            <div className="flex justify-between py-3 border-b-2 border-slate-900 mt-1">
                                <span className="font-black text-slate-900 uppercase">Balance Due</span>
                                <span className="font-black text-orange-600 text-lg">{formatCurrency(getCredit(sale))}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="text-center pt-8 border-t border-slate-200">
                    <p className="font-bold text-slate-800 uppercase tracking-widest text-xs mb-1">Thank you for your business!</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">This is a system generated invoice.</p>
                </div>

            </div>
        </div>
    );
}
