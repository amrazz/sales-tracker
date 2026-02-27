'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import PrintActions from '@/components/PrintActions';

export default function SettlementPrintPage() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch today's summary by default for the settlement report
        fetch('/api/summary')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="p-10 text-center font-bold text-slate-500">Generating Report...</div>;
    }

    if (!data) {
        return <div className="p-10 text-center font-bold text-red-500">Could not load summary data.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white flex flex-col items-center py-10 print:py-0">
            {/* Action Bar (Hidden in Print) */}
            <div className="print:hidden w-full max-w-3xl bg-white p-4 rounded-2xl shadow-sm mb-6 flex justify-between items-center border border-slate-200">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-600 font-bold hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <PrintActions targetId="print-container" fileName={`Settlement_Report_${new Date().toISOString().split('T')[0]}`} />
            </div>

            {/* A4 format optimized document */}
            <div id="print-container" className="w-full max-w-3xl bg-white p-6 sm:p-10 print:p-8 print:shadow-none shadow-xl border border-slate-200 print:border-none rounded-3xl print:rounded-none">

                {/* Header */}
                <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase text-slate-900">Daily Settlement Report</h1>
                    <div className="mt-4 flex justify-between items-center text-sm font-bold text-slate-600 border border-slate-200 p-4 rounded-lg bg-slate-50">
                        <div>
                            <span className="text-slate-400 uppercase tracking-widest text-[10px] block mb-1">Date</span>
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="text-right">
                            <span className="text-slate-400 uppercase tracking-widest text-[10px] block mb-1">Generated At</span>
                            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>

                {/* Section 1: Cash Accounting */}
                <div className="mb-10">
                    <h2 className="text-lg font-black uppercase text-slate-800 tracking-tight mb-4 border-b border-slate-200 pb-2">1. Cash Accounting</h2>
                    <table className="w-full text-left text-sm">
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="py-4 font-medium text-slate-600">Today's Cash Sales</td>
                                <td className="py-4 font-bold text-slate-900 text-right">{formatCurrency(data.totalCashSales)}</td>
                            </tr>
                            <tr>
                                <td className="py-4 font-medium text-slate-600">Old Credit Recovered (Cash)</td>
                                <td className="py-4 font-bold text-slate-900 text-right">{formatCurrency(data.totalOldCashReceived)}</td>
                            </tr>
                            <tr>
                                <td className="py-4 font-medium text-slate-600">Total Expenses (Deducted)</td>
                                <td className="py-4 font-bold text-red-600 text-right">-{formatCurrency(data.totalExpenses)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="flex justify-between items-center mt-8 p-6 bg-slate-100/50 border border-slate-200 rounded-xl">
                        <span className="font-black text-slate-900 uppercase tracking-tight">Net Profit</span>
                        <span className="font-black text-xl text-slate-900">{formatCurrency(data.totalCashExpected)}</span>
                    </div>
                </div>

                {/* Section 2: Online & Credit */}
                <div className="mb-10">
                    <h2 className="text-lg font-black uppercase text-slate-800 tracking-tight mb-4 border-b border-slate-200 pb-2">2. Online Payments & Credit</h2>
                    <table className="w-full text-left text-sm">
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="py-4 font-medium text-slate-600">Total UPI Payments Received</td>
                                <td className="py-4 font-bold text-purple-700 text-right">{formatCurrency(data.totalUPISales)}</td>
                            </tr>
                            <tr>
                                <td className="py-4 font-medium text-slate-600">New Credit Given Today (Unpaid)</td>
                                <td className="py-4 font-bold text-orange-600 text-right">{formatCurrency(data.totalCreditSales)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="text-center mt-16 text-[10px] text-slate-400 uppercase tracking-widest">
                    <p>End of Report</p>
                </div>

            </div>
        </div>
    );
}
