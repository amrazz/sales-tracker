'use client';

import { useState, useEffect } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<{ name: string } | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Simple way to get user info from a cookie or session if available on client
        // For now, we'll try to fetch it or just use a placeholder if not found
        fetch('/api/auth/me')
            .then(res => res.ok ? res.json() : null)
            .then(data => setUser(data))
            .catch(() => setUser(null));
    }, []);

    if (pathname === '/login' || pathname === '/register') return null;

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                STrack
            </Link>

            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden hover:bg-slate-200 transition-colors"
                >
                    {user?.name ? (
                        <span className="text-sm font-bold text-blue-600">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    ) : (
                        <User className="w-5 h-5 text-slate-500" />
                    )}
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                            <div className="px-4 py-2 border-b border-slate-50 mb-1">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Account</p>
                                <p className="text-sm font-bold text-slate-700 truncate">{user?.name || 'User'}</p>
                            </div>

                            <Link
                                href="/profile"
                                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Settings className="w-4 h-4" />
                                Profile Setup
                            </Link>

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    handleLogout();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
