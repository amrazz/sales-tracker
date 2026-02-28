'use client';

import { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Plus,
    Minus,
    Search,
    Trash2,
    CheckCircle2,
    ChevronRight,
    Calendar,
    ArrowLeft,
    Store,
    Package
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import NotificationDialog from '@/components/NotificationDialog';

export default function NewOrderFlow({ onBack, onComplete }: { onBack: () => void, onComplete: () => void }) {
    const [shops, setShops] = useState<any[]>([]);
    const [searchShopQuery, setSearchShopQuery] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);

    const [selectedShop, setSelectedShop] = useState<any>(null);
    const [cart, setCart] = useState<any[]>([]);
    const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
    const [submitting, setSubmitting] = useState(false);

    const [dialog, setDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning' | 'confirm';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    useEffect(() => {
        const fetchData = async () => {
            const [shopRes, prodRes] = await Promise.all([
                fetch('/api/shops'),
                fetch('/api/products')
            ]);
            setShops(await shopRes.json());
            setProducts(await prodRes.json());
            setLoading(false);
        };
        fetchData();
    }, []);

    const addToCart = (product: any) => {
        const existing = cart.find(item => item.productId === product._id);
        if (existing) {
            setCart(cart.map(item =>
                item.productId === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product._id,
                name: product.name,
                unit: product.unit,
                quantity: 1,
                price: product.price || 0
            }]);
        }
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.productId === productId) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const totalSubtotal = cart.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);

    const handleSubmit = async () => {
        if (!selectedShop || cart.length === 0) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopId: selectedShop._id,
                    items: cart,
                    subtotal: totalSubtotal,
                    discount: 0,
                    totalAmount: totalSubtotal,
                    deliveryDate
                }),
            });
            if (res.ok) {
                setDialog({
                    isOpen: true,
                    title: 'Order Placed!',
                    message: `Order for ${selectedShop.name} has been recorded.`,
                    type: 'success'
                });
                onComplete();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-400">Initialising Order System...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="bg-white p-6 border-b border-slate-200">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold">New Take Order</h1>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={cn(
                            "h-1.5 flex-1 rounded-full transition-all",
                            step >= s ? "bg-blue-600" : "bg-slate-200"
                        )} />
                    ))}
                </div>
            </header>

            <div className="flex-1 p-4 pb-24">
                {step === 1 && (
                    <div className="flex flex-col gap-4">
                        <h2 className="text-sm font-bold uppercase text-slate-400">Step 1: Select Store</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search store..."
                                value={searchShopQuery}
                                onChange={(e) => setSearchShopQuery(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 bg-white border border-slate-200 rounded-xl font-bold"
                            />
                        </div>
                        <div className="grid gap-3">
                            {shops.filter(shop => shop.name.toLowerCase().includes(searchShopQuery.toLowerCase())).map(shop => (
                                <button
                                    key={shop._id}
                                    onClick={() => { setSelectedShop(shop); setStep(2); }}
                                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center active:bg-slate-50 text-left"
                                >
                                    <div>
                                        <p className="font-bold text-lg">{shop.name}</p>
                                        <p className="text-sm text-slate-500">{shop.area}</p>
                                    </div>
                                    <ChevronRight className="text-slate-300" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold uppercase text-slate-400">Step 2: Add Products</h2>
                                <p className="font-bold text-blue-600">{selectedShop.name}</p>
                            </div>
                            <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-400 underline">Change Store</button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {cart.map(item => (
                                <div key={item.productId} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800">{item.name}</p>
                                        <p className="text-xs text-slate-400">{formatCurrency(item.price)} per {item.unit || 'unit'}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => updateQuantity(item.productId, -1)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg">-</button>
                                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.productId, 1)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg">+</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Product Catalog</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {products.map(p => (
                                    <button
                                        key={p._id}
                                        onClick={() => addToCart(p)}
                                        className="p-3 border border-slate-100 rounded-xl flex items-center justify-between bg-slate-50 hover:bg-white transition-all text-left"
                                    >
                                        <div>
                                            <p className="font-bold text-xs truncate">{p.name}</p>
                                            <p className="text-[10px] text-blue-600 font-bold">{formatCurrency(p.price)}</p>
                                        </div>
                                        <Plus className="w-4 h-4 text-blue-500" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(3)}
                            disabled={cart.length === 0}
                            className="h-14 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:bg-slate-300 shadow-lg active:scale-95 transition-all w-full"
                        >
                            Next: Delivery Details
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase text-slate-400">Step 3: Delivery Date</h2>
                        </div>

                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Choose Delivery Date
                                </label>
                                <input
                                    type="date"
                                    value={deliveryDate}
                                    onChange={(e) => setDeliveryDate(e.target.value)}
                                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-50">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 ml-1">Order Summary</h3>
                                <div className="flex flex-col gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    {cart.map(item => (
                                        <div key={item.productId} className="flex justify-between items-center text-sm">
                                            <div>
                                                <span className="font-bold text-slate-700">{item.name}</span>
                                                <span className="text-xs text-slate-400 ml-2">({item.quantity} x {formatCurrency(item.price)})</span>
                                            </div>
                                            <span className="font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center mb-6">
                                    <span className="font-bold text-slate-500">Total Items:</span>
                                    <span className="font-black text-slate-900">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-8">
                                    <span className="font-bold text-slate-500">Estimated Total:</span>
                                    <span className="text-2xl font-black text-blue-600">{formatCurrency(totalSubtotal)}</span>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-full h-16 bg-slate-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all"
                                >
                                    {submitting ? 'Confirming...' : 'Place Take Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <NotificationDialog
                {...dialog}
                onClose={() => setDialog({ ...dialog, isOpen: false })}
            />
        </div>
    );
}
