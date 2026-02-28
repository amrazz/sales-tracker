'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ClipboardList,
    Plus,
    Calendar,
    Store,
    Package,
    CheckCircle2,
    Clock,
    XCircle,
    Truck,
    Receipt,
    ChevronRight,
    Search,
    Filter,
    X
} from 'lucide-react';
import Link from 'next/link';
import NewOrderFlow from '@/components/NewOrderFlow';
import OrderDeliveryModal from '@/components/OrderDeliveryModal';
import { cn, formatCurrency } from '@/lib/utils';
import NotificationDialog from '@/components/NotificationDialog';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'pending' | 'delivered' | 'cancelled' | 'new'>('pending');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const [dialog, setDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error';
    }>({ isOpen: false, title: '', message: '', type: 'success' });

    useEffect(() => {
        if (view !== 'new') {
            fetchOrders();
        }
    }, [view, dateFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            let url = `/api/orders?status=${view}`;
            if (dateFilter) {
                url += `&startDate=${dateFilter}&endDate=${dateFilter}`;
            }
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled' })
            });

            if (res.ok) {
                fetchOrders();
                setDialog({
                    isOpen: true,
                    title: 'Cancelled',
                    message: 'Order has been cancelled successfully.',
                    type: 'success'
                });
            } else {
                const data = await res.json();
                setDialog({
                    isOpen: true,
                    title: 'Error',
                    message: data.error || 'Failed to cancel order',
                    type: 'error'
                });
            }
        } catch (error) {
            setDialog({
                isOpen: true,
                title: 'Error',
                message: 'Something went wrong',
                type: 'error'
            });
        }
    };

    const handleBillGeneration = (order: any) => {
        if (order.saleId) {
            router.push(`/shops/${order.shopId._id}?saleId=${order.saleId}`);
        } else {
            setDialog({
                isOpen: true,
                title: 'Error',
                message: 'Sale record not found for this order.',
                type: 'error'
            });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-orange-500" />;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-50 text-green-700 border-green-100';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-orange-50 text-orange-700 border-orange-100';
        }
    };

    if (view === 'new') {
        return (
            <NewOrderFlow
                onBack={() => setView('pending')}
                onComplete={() => {
                    setView('pending');
                }}
            />
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6 pb-24 min-h-screen bg-slate-50">
            <header className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orders</h1>
                        <p className="text-slate-500 text-sm font-medium">Manage take orders & deliveries</p>
                    </div>
                    <button
                        onClick={() => setView('new')}
                        className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 active:scale-90 transition-all font-black"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                    {[
                        { id: 'pending', label: 'Pending', icon: Clock },
                        { id: 'delivered', label: 'Delivered', icon: Truck },
                        { id: 'cancelled', label: 'Cancelled', icon: XCircle }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setView(tab.id as any)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all",
                                view === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find order..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                    </div>
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                </div>
            </header>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <ClipboardList className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-400">No {view} orders found</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {orders.filter(o =>
                        o.shopId?.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((order) => (
                        <div
                            key={order._id}
                            onClick={() => view === 'delivered' && handleBillGeneration(order)}
                            className={cn(
                                "bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500",
                                view === 'delivered' && "cursor-pointer hover:border-blue-200 active:scale-[0.98] transition-all"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner">
                                        <Store className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-lg leading-tight">{order.shopId?.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md tracking-wider">
                                                {new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                            <span className="text-lg font-black text-blue-600 ml-1">{formatCurrency(order.totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1 pt-2 border-t border-slate-50">
                                {order.items?.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between text-xs font-bold text-slate-500">
                                        <span>{item.quantity}x {item.productId?.name}</span>
                                        <span>{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 pt-2">
                                {view === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setIsDeliveryModalOpen(true);
                                            }}
                                            className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-blue-100"
                                        >
                                            <Truck className="w-4 h-4" />
                                            Deliver
                                        </button>
                                        <button
                                            onClick={() => handleCancelOrder(order._id)}
                                            className="h-12 w-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center active:bg-red-100 transition-all font-bold"
                                        >
                                            <X />
                                        </button>
                                    </>
                                )}
                                {view === 'cancelled' && (
                                    <div className="w-full py-2 text-center text-[10px] font-black uppercase text-red-400 tracking-widest bg-red-50/50 rounded-xl border border-red-50">
                                        Order Cancelled
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isDeliveryModalOpen && (
                <OrderDeliveryModal
                    order={selectedOrder}
                    onClose={() => setIsDeliveryModalOpen(false)}
                    onSuccess={() => {
                        setIsDeliveryModalOpen(false);
                        setView('delivered');
                        fetchOrders();
                        setDialog({
                            isOpen: true,
                            title: 'Success!',
                            message: 'Order delivered and payment recorded.',
                            type: 'success'
                        });
                    }}
                />
            )}

            <NotificationDialog
                {...dialog}
                onClose={() => setDialog({ ...dialog, isOpen: false })}
            />
        </div>
    );
}
