
'use client';

import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export const Taskbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 h-20 bg-[#161b22]/90 backdrop-blur-md border-b border-[#30363d] z-50 transition-all duration-300">
            <div className="container mx-auto h-full px-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center text-black font-bold text-xl group-hover:rotate-12 transition-transform">
                        36
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                        CASINO<span className="text-emerald-500">36</span>
                    </span>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            <div className="hidden md:flex flex-col items-end mr-4">
                                <span className="text-xs text-gray-400 font-medium">SỐ DƯ</span>
                                <span className="font-mono font-bold text-2xl text-emerald-400 drop-shadow-glow">
                                    {formatCurrency(user.balance)}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link href="/promotions" className="btn btn-gold px-4 py-2 text-sm">
                                    🎁 Khuyến Mãi
                                </Link>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500 transition-all text-sm font-semibold"
                                >
                                    Đăng Xuất
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <Link href="/login" className="btn btn-ghost px-6">Đăng Nhập</Link>
                            <Link href="/register" className="btn btn-primary px-6">Đăng Ký</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
