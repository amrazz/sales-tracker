'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus, Search, Trash2, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import QuickAddProduct from '@/components/QuickAddProduct';
import NotificationDialog from '@/components/NotificationDialog';

export default function SalesPage() {
    const [shops, setShops] = useState<any[]>([]);
    const [searchShopQuery, setSearchShopQuery] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);

    const [selectedShop, setSelectedShop] = useState<any>(null);
    const [cart, setCart] = useState<any[]>([]);
    const [paymentType, setPaymentType] = useState<'cash' | 'upi' | 'credit'>('cash');
    const [amountPaid, setAmountPaid] = useState<string>('');
    const [discount, setDiscount] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    // Add Shop Modal State
    const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
    const [newShopName, setNewShopName] = useState('');
    const [newShopArea, setNewShopArea] = useState('');
    const [isAddingShop, setIsAddingShop] = useState(false);

    // Dialog state
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

    const handleAddShopFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newShopName.trim() || !newShopArea.trim()) return;
        setIsAddingShop(true);
        try {
            const res = await fetch('/api/shops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newShopName, area: newShopArea }),
            });
            const data = await res.json();
            if (res.ok) {
                setShops([data, ...shops]);
                setIsAddShopModalOpen(false);
                setNewShopName('');
                setNewShopArea('');

                // Auto-select the newly created shop and move to step 2
                setSelectedShop(data);
                setStep(2);

                setDialog({
                    isOpen: true,
                    title: 'Shop Added',
                    message: `${data.name} added and selected!`,
                    type: 'success'
                });
            } else {
                setDialog({
                    isOpen: true,
                    title: 'Error',
                    message: data.message || 'Failed to add shop',
                    type: 'error'
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAddingShop(false);
        }
    };

    const getStockForProduct = (productId: string) => {
        const item = products.find(p => p._id === productId);
        return item ? (item.stock || 0) : 0;
    };

    const addToCart = (product: any, initialQuantity = 1, initialPrice?: number) => {
        const available = product.stock !== undefined ? product.stock : getStockForProduct(product._id);
        const existing = cart.find(item => item.productId === product._id);
        const currentQtyInCart = existing ? existing.quantity : 0;

        if (currentQtyInCart + initialQuantity > available) {
            setDialog({
                isOpen: true,
                title: 'Stock Limit',
                message: `Only ${available} ${product.unit || 'units'} available in stock!`,
                type: 'warning'
            });
            return;
        }

        if (existing) {
            setCart(cart.map(item =>
                item.productId === product._id
                    ? { ...item, quantity: item.quantity + initialQuantity }
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product._id,
                name: product.name,
                unit: product.unit,
                quantity: initialQuantity,
                price: initialPrice !== undefined ? initialPrice : (product.price || 0)
            }]);
        }
    };

    const updateQuantity = (productId: string, delta: number) => {
        const available = getStockForProduct(productId);
        setCart(cart.map(item => {
            if (item.productId === productId) {
                const newQty = Math.max(0, item.quantity + delta);
                if (newQty > available) {
                    setDialog({
                        isOpen: true,
                        title: 'Limit Reached',
                        message: `Maximum available stock is ${available}`,
                        type: 'warning'
                    });
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const updatePrice = (productId: string, price: number) => {
        setCart(cart.map(item =>
            item.productId === productId ? { ...item, price } : item
        ));
    };

    const totalSubtotal = cart.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
    const discountAmount = Number(discount) || 0;
    const finalTotal = Math.max(0, totalSubtotal - discountAmount);

    const handleSubmit = async () => {
        if (!selectedShop || cart.length === 0) return;
        setSubmitting(true);
        try {
            await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shopId: selectedShop._id,
                    items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
                    subtotal: totalSubtotal,
                    discount: discountAmount,
                    totalAmount: finalTotal,
                    amountPaid: paymentType === 'credit' ? 0 : (amountPaid === '' ? finalTotal : Number(amountPaid)),
                    paymentType
                }),
            });
            // Reset
            setStep(1);
            setSelectedShop(null);
            setCart([]);
            setPaymentType('cash');
            setAmountPaid('');
            setDiscount('');
            setDialog({
                isOpen: true,
                title: 'Sale Recorded!',
                message: 'Your transaction was saved successfully.',
                type: 'success'
            });
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="bg-white p-6 border-b border-slate-200">
                <h1 className="text-2xl font-bold">New Sale</h1>
                <div className="flex gap-2 mt-4">
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
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase text-slate-400">Step 1: Select Shop</h2>
                            <button
                                onClick={() => setIsAddShopModalOpen(true)}
                                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg active:bg-blue-100 transition-all cursor-pointer"
                            >
                                <Plus className="w-3 h-3" />
                                Add Shop
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search shop by name or area..."
                                value={searchShopQuery}
                                onChange={(e) => setSearchShopQuery(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div className="grid gap-3">
                            {shops.filter(shop => {
                                if (!searchShopQuery.trim()) return true;
                                const query = searchShopQuery.toLowerCase();
                                return shop.name.toLowerCase().includes(query) || shop.area.toLowerCase().includes(query);
                            }).map(shop => (
                                <button
                                    key={shop._id}
                                    onClick={() => { setSelectedShop(shop); setStep(2); }}
                                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center active:bg-slate-50 transition-all text-left"
                                >
                                    <div>
                                        <p className="font-bold text-lg">{shop.name}</p>
                                        <p className="text-sm text-slate-500">{shop.area}</p>
                                    </div>
                                    <ChevronRight className="text-slate-300" />
                                </button>
                            ))}
                        </div>
                        {shops.length === 0 && (
                            <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-slate-200 px-6">
                                <p className="text-slate-500 mb-4">No shops found. Please add shops first.</p>
                                <button
                                    onClick={() => setIsAddShopModalOpen(true)}
                                    className="inline-flex items-center justify-center gap-2 px-6 h-12 bg-blue-600 text-white rounded-xl font-bold active:scale-95 transition-all w-full md:w-auto"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Your First Shop
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold uppercase text-slate-400">Step 2: Add Items</h2>
                                <p className="font-bold text-blue-600">{selectedShop.name}</p>
                            </div>
                            <button
                                onClick={() => setStep(1)}
                                className="text-xs font-bold text-slate-400 hover:text-slate-600"
                            >
                                Change Shop
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex flex-col gap-3">
                            {cart.map(item => (
                                <div key={item.productId} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="font-black text-lg text-slate-800">{item.name}</span>
                                            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{item.unit || 'pcs'}</p>
                                        </div>
                                        <button onClick={() => updateQuantity(item.productId, -100)} className="w-8 h-8 flex items-center justify-center rounded-full text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center bg-slate-100 rounded-2xl p-1.5 min-w-[130px] justify-between">
                                            <button onClick={() => updateQuantity(item.productId, -1)} className="w-10 h-10 flex items-center justify-center font-black text-xl hover:bg-white hover:shadow-sm rounded-xl transition-all">-</button>
                                            <span className="font-black text-lg w-8 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.productId, 1)} className="w-10 h-10 flex items-center justify-center font-black text-xl hover:bg-white hover:shadow-sm rounded-xl transition-all">+</button>
                                        </div>
                                        <div className="flex-1 text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Total</p>
                                            <span className="font-black text-lg text-blue-600">
                                                {formatCurrency(item.price * item.quantity)}
                                            </span>
                                            <p className="text-[10px] font-bold text-slate-400">
                                                {formatCurrency(item.price)} / {item.unit || 'unit'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Products Selector */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase">Add Products</h3>
                                <QuickAddProduct onAdded={(p, stock, price) => {
                                    const newProd = { ...p, stock };
                                    setProducts([...products, newProd]);
                                    addToCart(newProd, 1, price);
                                }} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {products.map(p => {
                                    const stock = getStockForProduct(p._id);
                                    const existingCartItem = cart.find(item => item.productId === p._id);
                                    const currentQtyInCart = existingCartItem ? existingCartItem.quantity : 0;
                                    const remainingStock = stock - currentQtyInCart;
                                    const outOfStock = remainingStock <= 0;
                                    return (
                                        <button
                                            key={p._id}
                                            onClick={() => addToCart(p)}
                                            disabled={outOfStock}
                                            className={cn(
                                                "p-4 border rounded-2xl flex flex-col gap-1 transition-all active:scale-95 text-left",
                                                outOfStock
                                                    ? "bg-slate-50 border-slate-100 opacity-50 grayscale cursor-not-allowed"
                                                    : "bg-white border-slate-200 shadow-sm hover:border-blue-300"
                                            )}
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className="font-extrabold text-sm text-slate-800 line-clamp-1">{p.name}</span>
                                                <Plus className={cn("w-4 h-4", outOfStock ? "text-slate-300" : "text-blue-500")} />
                                            </div>
                                            <div className="flex justify-between items-end mt-1">
                                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">₹{p.price || 0}</span>
                                                <span className={cn(
                                                    "text-[9px] font-bold uppercase tracking-tighter",
                                                    outOfStock ? "text-red-400" : "text-slate-400"
                                                )}>
                                                    {outOfStock ? 'Out of Stock' : `${remainingStock} ${p.unit || 'pcs'}`}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="h-14 px-6 bg-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center active:scale-95 transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={cart.length === 0}
                                className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:bg-slate-300 shadow-lg active:scale-95 transition-all"
                            >
                                Continue to Payment
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold uppercase text-slate-400">Step 3: Payment</h2>
                                <p className="font-bold text-blue-600">{selectedShop.name}</p>
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                className="text-xs font-bold text-slate-400 hover:text-slate-600"
                            >
                                Edit Items
                            </button>
                        </div>

                        <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl flex flex-col gap-1">
                            <div className="flex justify-between items-center opacity-80 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider">Subtotal</span>
                                <span className="font-bold">{formatCurrency(totalSubtotal)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between items-center text-red-200 mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider">Discount</span>
                                    <span className="font-bold">-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                            <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest">Final Bill Amount</p>
                            <h3 className="text-4xl font-black">{formatCurrency(finalTotal)}</h3>
                        </div>

                        {/* Discount Input */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Special Discount</label>
                                {discountAmount > 0 && (
                                    <button
                                        onClick={() => setDiscount('')}
                                        className="text-[10px] font-bold text-red-500 hover:text-red-600"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                                <input
                                    type="number"
                                    className="h-14 w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-xl font-black text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 placeholder:font-bold"
                                    value={discount}
                                    onChange={(e) => {
                                        setDiscount(e.target.value);
                                        // Reset amount paid to total after discount if not manually changed
                                        // We'll handle this in a useEffect or here
                                    }}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase">Select Payment Mode</h3>
                            <div className="grid gap-3">
                                {[
                                    { id: 'cash', label: 'Cash Payment', icon: CheckCircle2, sub: 'Received in hand' },
                                    { id: 'upi', label: 'UPI / Online', icon: CheckCircle2, sub: 'PhonePe, GPay, etc.' },
                                    { id: 'credit', label: 'Add to Credit', icon: CheckCircle2, sub: 'Will pay later' }
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            setPaymentType(type.id as any);
                                            if (type.id === 'credit') setAmountPaid('0');
                                            else setAmountPaid(finalTotal.toString());
                                        }}
                                        className={cn(
                                            "p-5 rounded-2xl border flex items-center gap-4 text-left transition-all active:scale-[0.98]",
                                            paymentType === type.id
                                                ? "bg-blue-50 border-blue-600 ring-1 ring-blue-600"
                                                : "bg-white border-slate-200 shadow-sm"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                            paymentType === type.id ? "border-blue-600 bg-blue-600" : "border-slate-300"
                                        )}>
                                            {paymentType === type.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                                        </div>
                                        <div>
                                            <p className="font-bold">{type.label}</p>
                                            <p className="text-xs text-slate-500">{type.sub}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Partial Payment Input */}
                        {paymentType !== 'credit' && (
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Amount Received Now</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">₹</span>
                                    <input
                                        type="number"
                                        className="h-16 w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-3xl font-black text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                        value={amountPaid}
                                        onChange={(e) => {
                                            let val = Number(e.target.value);
                                            if (val > finalTotal) val = finalTotal;
                                            setAmountPaid(e.target.value === '' ? '' : val.toString());
                                        }}
                                        placeholder={finalTotal.toString()}
                                        max={finalTotal}
                                    />
                                </div>

                                {Number(amountPaid !== '' ? amountPaid : finalTotal) < finalTotal && (
                                    <div className="mt-2 text-amber-600 bg-amber-50 p-3 rounded-xl flex items-start gap-2 text-sm font-bold border border-amber-100">
                                        <span className="text-amber-500 mt-0.5">ℹ️</span>
                                        <p>
                                            ₹{finalTotal - Number(amountPaid)} remaining balance will be added to
                                            <span className="text-amber-700"> {selectedShop.name}&apos;s Credit Ledger</span> automatically.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setStep(2)}
                                disabled={submitting}
                                className="h-16 px-8 bg-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center active:scale-95 transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 h-16 bg-slate-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all"
                            >
                                {submitting ? 'Recording...' : 'Finish & Record Sale'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <NotificationDialog
                {...dialog}
                onClose={() => setDialog({ ...dialog, isOpen: false })}
            />

            {/* Add Shop Modal */}
            {isAddShopModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6 flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Add New Shop</h3>
                            <button
                                onClick={() => setIsAddShopModalOpen(false)}
                                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95 transition-all"
                            >
                                <span className="sr-only">Close</span>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddShopFormSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Shop Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Metro Supermarket"
                                    className="h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:font-medium placeholder:text-slate-400"
                                    value={newShopName}
                                    onChange={(e) => setNewShopName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Area / Location</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Downtown High Street"
                                    className="h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:font-medium placeholder:text-slate-400"
                                    value={newShopArea}
                                    onChange={(e) => setNewShopArea(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddShopModalOpen(false)}
                                    className="flex-1 h-14 bg-slate-100 text-slate-600 font-bold rounded-2xl active:scale-95 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAddingShop}
                                    className="flex-2 h-14 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center"
                                >
                                    {isAddingShop ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : 'Save Shop'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

