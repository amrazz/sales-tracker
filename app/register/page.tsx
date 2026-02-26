'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, User as UserIcon, Mail } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // The register endpoint sets the cookie and logs them in
                router.push('/');
                router.refresh();
            } else {
                setError(data.message || 'Registration failed');
                setLoading(false);
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 pb-safe">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-blue-200 mb-6 rotate-3">
                        <UserIcon className="w-8 h-8 text-white -rotate-3" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h1>
                    <p className="text-slate-500 font-medium mt-2">Start managing your business</p>
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-5">

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                required
                                placeholder="Your full name"
                                className="w-full h-14 bg-slate-50 pl-12 pr-4 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-medium"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="tel"
                                required
                                placeholder="Enter your phone number"
                                className="w-full h-14 bg-slate-50 pl-12 pr-4 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-medium"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                required
                                placeholder="Create a password"
                                className="w-full h-14 bg-slate-50 pl-12 pr-4 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 text-center animate-in shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !name || !phone || !password}
                        className="mt-4 w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                    </button>

                </form>

                {/* Footer Link */}
                <div className="text-center mt-8">
                    <p className="text-sm font-medium text-slate-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 font-bold hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
