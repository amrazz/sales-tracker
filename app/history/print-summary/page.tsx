'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import PrintActions from '@/components/PrintActions';

function PrintSummaryContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const start = searchParams.get('start');
    const end = searchParams.get('end');

    useEffect(() => {
        if (!start || !end) return;

        const fetchSales = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/sales?startDate=${start}&endDate=${end}`);
                const data = await res.json();
                setSales(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
    }, [start, end]);

    // Aggregate sales by shop
    const shopSummaries = useMemo(() => {
        const summaries: Record<string, { shopName: string, area: string, totalAmount: number, invoiceCount: number }> = {};

        sales.forEach(sale => {
            const shopId = sale.shopId?._id || 'walk-in';
            if (!summaries[shopId]) {
                summaries[shopId] = {
                    shopName: sale.shopId?.name || 'Walk-in / Unknown',
                    area: sale.shopId?.area || '',
                    totalAmount: 0,
                    invoiceCount: 0
                };
            }
            summaries[shopId].totalAmount += (sale.totalAmount || 0);
            summaries[shopId].invoiceCount += 1;
        });

        // Convert to array and sort by total amount descending
        return Object.values(summaries).sort((a, b) => b.totalAmount - a.totalAmount);
    }, [sales]);

    const grandTotal = useMemo(() => {
        return shopSummaries.reduce((sum, shop) => sum + shop.totalAmount, 0);
    }, [shopSummaries]);

    if (!start || !end) {
        return <div className="p-10 text-center font-bold text-red-500">Invalid Date Range</div>;
    }

    if (loading) {
        return <div className="p-10 text-center font-bold text-slate-500">Generating Summary...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white flex flex-col items-center py-10 print:py-0">
            {/* Action Bar */}
            <div className="print:hidden w-full max-w-3xl bg-white p-4 rounded-2xl shadow-sm mb-6 flex justify-between items-center border border-slate-200">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-600 font-bold hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <PrintActions targetId="print-container" fileName={`Sales_Summary_${new Date().toISOString().split('T')[0]}`} />
            </div>

            {/* Document Container */}
            <div id="print-container" className="w-full max-w-3xl bg-white p-6 sm:p-10 print:p-8 print:shadow-none shadow-xl border border-slate-200 print:border-none rounded-3xl print:rounded-none">

                {/* Header */}
                <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase text-slate-900">Sales Range Summary</h1>
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm font-bold text-slate-600 border border-slate-200 p-4 rounded-lg bg-slate-50">
                        <div className="text-center sm:text-left">
                            <span className="text-slate-400 uppercase tracking-widest text-[10px] block mb-1">Period Start</span>
                            {new Date(start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-center sm:text-right">
                            <span className="text-slate-400 uppercase tracking-widest text-[10px] block mb-1">Period End</span>
                            {new Date(end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="mb-10">
                    {shopSummaries.length === 0 ? (
                        <p className="text-center text-slate-500 font-bold py-10">No sales recorded in this period.</p>
                    ) : (
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Shop & Area</th>
                                    <th className="py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Invoices</th>
                                    <th className="py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {shopSummaries.map((shop, idx) => (
                                    <tr key={idx}>
                                        <td className="py-3 pr-2">
                                            <p className="font-bold text-slate-900">{shop.shopName}</p>
                                            {shop.area && <p className="text-[10px] font-bold text-slate-500">{shop.area}</p>}
                                        </td>
                                        <td className="py-3 font-medium text-slate-600 text-center">{shop.invoiceCount}</td>
                                        <td className="py-3 font-black text-slate-900 text-right">{formatCurrency(shop.totalAmount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t-2 border-slate-900">
                                <tr>
                                    <td colSpan={2} className="py-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                                        Grand Total
                                    </td>
                                    <td className="py-4 font-black text-slate-900 text-right text-lg">
                                        {formatCurrency(grandTotal)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>

                <div className="text-center mt-12 text-[10px] text-slate-400 uppercase tracking-widest">
                    <p>End of Report</p>
                </div>
            </div>
        </div>
    );
}

export default function SalesHistoryPrintSummaryPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center font-bold text-slate-500">Loading Summary...</div>}>
            <PrintSummaryContent />
        </Suspense>
    );
}
