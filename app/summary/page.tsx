'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    CreditCard,
    Receipt,
    CheckCircle,
    Share2
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';

export default function SummaryPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/summary')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-10 text-center">Loading Summary...</div>;

    const sections = [
        {
            title: "Cash Accounting",
            items: [
                { label: "Today's Cash Sales", value: data.totalCashSales, icon: ArrowUpRight, color: "text-green-600" },
                { label: "Old Money Received", value: data.totalOldCashReceived, icon: Wallet, color: "text-blue-600" },
                { label: "Total Expenses", value: -data.totalExpenses, icon: ArrowDownRight, color: "text-red-500" },
            ],
            footer: { label: "Cash Expected in Hand", value: data.totalCashExpected, highlight: true }
        },
        {
            title: "Other Transactions",
            items: [
                { label: "UPI / Online Total", value: data.totalUPISales, icon: CreditCard, color: "text-purple-600" },
                { label: "New Credit Given Today", value: data.totalCreditSales, icon: Receipt, color: "text-orange-600" },
            ]
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="bg-white p-6 border-b border-slate-200 sticky top-0 z-10">
                <h1 className="text-2xl font-bold">Nightly Summary</h1>
                <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                    {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </header>

            <div className="flex-1 p-4 pb-24">
                {sections.map((section, idx) => (
                    <div key={idx} className="mb-6">
                        <h2 className="text-xs font-bold uppercase text-slate-400 ml-2 mb-3">{section.title}</h2>
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-sm">
                            <div className="flex flex-col">
                                {section.items.map((item, i) => (
                                    <div key={i} className={cn(
                                        "flex justify-between items-center p-5",
                                        i !== section.items.length - 1 && "border-b border-slate-100"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-slate-50", item.color)}>
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-slate-600">{item.label}</span>
                                        </div>
                                        <span className={cn("font-bold", item.color)}>
                                            {formatCurrency(item.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {section.footer && (
                                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-400">{section.footer.label}</span>
                                    <span className="text-2xl font-black">{formatCurrency(section.footer.value)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <div className="bg-green-50 border border-green-200 p-6 rounded-3xl flex flex-col items-center gap-4 text-center mb-8">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h3 className="text-green-800 font-bold text-lg">Day Successfully Closed</h3>
                        <p className="text-green-600 text-sm font-medium">Please cross-check the physical cash before leaving.</p>
                    </div>
                </div>

                <Link
                    href="/summary/print"
                    className="print:hidden w-full h-14 bg-white border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all text-slate-700"
                >
                    <Share2 className="w-5 h-5" />
                    Share / Export Formal Report
                </Link>
            </div>
        </div>
    );
}
