'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { formatShortCurrency } from '@/lib/utils';

const navItems = [
    { path: '/', icon: '🏠', label: 'Trang chủ' },
    { path: '/promotions', icon: '🎁', label: 'Khuyến mãi' },
    { path: '/me', icon: '👤', label: 'Tài khoản' },
];

export function Taskbar() {
    const pathname = usePathname();
    const { user } = useAuth();

    const hideOnPages = ['/login', '/register', '/introduction'];
    if (hideOnPages.includes(pathname)) return null;

    return (
        <>
            {/* Top Balance Bar - Only on game pages */}
            {pathname.startsWith('/games/') && user && (
                <div className="page-header">
                    <Link href="/" className="flex items-center gap-2 text-secondary">
                        <span>←</span>
                        <span className="text-sm">Quay lại</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-secondary">Số dư:</span>
                        <span className="text-balance">{formatShortCurrency(user.balance)}</span>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <div className="bottom-nav-inner">
                    {navItems.map((item) => {
                        const isActive = item.path === '/'
                            ? pathname === '/'
                            : pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
