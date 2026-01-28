
'use client';

import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export const Taskbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 z-40 flex items-center justify-between px-4 lg:px-8">
            <Link href="/" className="text-xl font-bold text-emerald-400">CASINO36</Link>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs text-gray-400">Balance</span>
                            <span className="font-mono font-bold text-emerald-400">{formatCurrency(user.balance)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/promotions" className="btn btn-primary text-sm">🎁 Promos</Link>
                            <button onClick={logout} className="text-gray-400 hover:text-white px-3 py-1">Logout</button>
                        </div>
                    </>
                ) : (
                    <div className="flex gap-2">
                        <Link href="/login" className="text-gray-300 hover:text-white px-3 py-2">Login</Link>
                        <Link href="/register" className="btn btn-primary text-sm">Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};
