'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                router.push('/login');
                router.refresh();
            }
        } catch (error) {
            console.error('Logout failed:', error);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
            <header className="bg-white p-6 pb-8 border-b border-slate-200">
                <div className="flex items-center gap-4 mt-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0">
                        <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-none">My Account</h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">Manage your business profile</p>
                    </div>
                </div>
            </header>

            <div className="p-4 flex flex-col gap-4 mt-2">

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">Security & Privacy</p>
                            <p className="text-xs text-slate-500">Your data is securely isolated.</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="w-full p-4 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors active:bg-red-100 disabled:opacity-50 text-left"
                    >
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold">Log Out</p>
                            <p className="text-xs text-red-400">End your current session</p>
                        </div>
                    </button>
                </div>

                <div className="text-center mt-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Van Sales App v1.1.0</p>
                </div>

            </div>
        </div>
    );
}
