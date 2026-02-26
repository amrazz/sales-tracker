'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navigation() {
    const pathname = usePathname();

    if (pathname === '/login') return null;

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Stock', href: '/stock', icon: Package },
        { name: 'Sales', href: '/sales', icon: ShoppingCart },
        { name: 'Credits', href: '/credits', icon: Wallet },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    return (
        <nav className="print:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.05)] z-50">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                                isActive ? "text-blue-600" : "text-slate-400"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive && "fill-blue-50")} />
                            <span className="text-[10px] font-medium leading-none">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
