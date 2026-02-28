'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Store, MapPin, Trash2, Calendar, IndianRupee, Package, ArrowDownLeft } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import EditShopDialog from '@/components/EditShopDialog';
import NotificationDialog from '@/components/NotificationDialog';
    
export default function ShopProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [shop, setShop] = useState<any>(null);
    const [sales, setSales] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [dialog, setDialog] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'confirm', onConfirm?: () => void }>({
        isOpen: false, title: '', message: '', type: 'success'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [shopRes, salesRes, paymentsRes] = await Promise.all([
                fetch(`/api/shops/${id}`),
                fetch(`/api/sales?shopId=${id}`),
                fetch(`/api/payments?shopId=${id}`)
            ]);

            if (!shopRes.ok) {
                router.push('/shops');
                return;
            }

            setShop(await shopRes.json());
            setSales(await salesRes.json());
            setPayments(await paymentsRes.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleDelete = () => {
        setDialog({
            isOpen: true,
            title: 'Delete Shop?',
            message: 'Are you sure you want to permanently delete this shop and all its sales history? This cannot be undone.',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    await fetch(`/api/shops/${id}`, { method: 'DELETE' });
                    router.push('/shops');
                } catch (err) {
                    console.error('Failed to delete shop');
                }
            }
        });
    };

    // Combine and sort sales and payments by date descending
    const timeline = useMemo(() => {
        const items = [
            ...sales.map(s => ({ ...s, type: 'sale' as const })),
            ...payments.map(p => ({ ...p, type: 'payment' as const }))
        ];
        return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sales, payments]);

    const totalBusiness = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);

    if (loading || !shop) {
        return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-400 font-bold">Loading shop details...</p></div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
            <header className="bg-white p-6 border-b border-slate-200">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold flex-1">Shop Profile</h1>
                </div>

                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{shop.name}</h2>
                        <div className="flex items-center gap-1.5 text-slate-500 mt-2 font-medium">
                            <MapPin className="w-4 h-4" />
                            {shop.area}
                        </div>
                    </div>
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Store className="w-8 h-8" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                    <EditShopDialog shop={shop} onUpdated={fetchData} />
                    <button
                        onClick={handleDelete}
                        className="h-12 bg-red-50 text-red-600 font-bold rounded-xl flex items-center justify-center gap-2 active:bg-red-100 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Shop
                    </button>
                </div>
            </header>

            <div className="p-4 flex flex-col gap-6 -mt-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Total Business</p>
                        <p className="text-xl font-black text-slate-800">{formatCurrency(totalBusiness)}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Pending Balance</p>
                        <p className={cn("text-xl font-black", shop.pendingBalance > 0 ? "text-orange-600" : "text-green-500")}>
                            {formatCurrency(shop.pendingBalance)}
                        </p>
                    </div>
                </div>

                {/* Timeline */}
                <div>
                    <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 px-2 tracking-wider">Activity History</h3>
                    <div className="flex flex-col gap-3">
                        {timeline.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">No activity recorded yet.</p>
                            </div>
                        ) : (
                            timeline.map((item: any) => (
                                <div key={item._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center",
                                                item.type === 'sale' ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                                            )}>
                                                {item.type === 'sale' ? <Package className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">
                                                    {item.type === 'sale' ? 'Products Sold' : 'Payment Received'}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 tracking-wider">
                                                    {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn("font-black text-lg", item.type === 'sale' ? "text-slate-800" : "text-green-600")}>
                                                {item.type === 'payment' ? '+' : ''}{formatCurrency(item.type === 'sale' ? item.totalAmount : item.amount)}
                                            </p>
                                            {item.type === 'sale' && (
                                                <p className="text-[10px] font-bold text-slate-400">
                                                    Paid: {formatCurrency(item.amountPaid || 0)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {item.type === 'sale' && item.items && (
                                        <div className="flex flex-col gap-1.5 pt-1">
                                            {item.items.map((cartItem: any) => (
                                                <div key={cartItem._id} className="flex justify-between text-xs font-medium text-slate-500">
                                                    <span>{cartItem.quantity}x {cartItem.productId?.name || 'Unknown Product'}</span>
                                                    <span>{formatCurrency(cartItem.price * cartItem.quantity)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <NotificationDialog
                {...dialog}
                onClose={() => {
                    setDialog({ ...dialog, isOpen: false });
                    if (dialog.type === 'confirm' && dialog.onConfirm) {
                        // handled by button inside dialog traditionally, but NotificationDialog
                        // uses onConfirm prop
                    }
                }}
            />
        </div>
    );
}
