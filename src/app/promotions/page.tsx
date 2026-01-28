'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const promos = [
    {
        icon: '🎁',
        title: 'Tân Thủ',
        desc: 'Nhận 10,000,000đ cho thành viên mới',
        code: 'CHAOMUNGTANTHU',
        highlight: true,
    },
    {
        icon: '⭐',
        title: 'VIP Casino',
        desc: 'Bonus 36,000,000đ dành cho VIP',
        code: 'VIP36CASINO',
    },
    {
        icon: '🎉',
        title: 'Happy New Year',
        desc: 'Nhận 260,000,000đ mừng năm mới',
        code: 'HAPPYNEWYEAR2026',
    },
    {
        icon: '❤️',
        title: 'Thanh Hóa',
        desc: 'Bonus 36,360,000đ cho fan Thanh Hóa',
        code: 'TOIYEUTHANHHOA',
    },
    {
        icon: '🎮',
        title: 'Game Vui',
        desc: 'Nhận 10,000,000đ chơi game',
        code: 'GAMEVUIGIAITRI',
    },
];

export default function PromotionsPage() {
    const { user, token, updateBalance } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    const [promoCode, setPromoCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [usedCodes, setUsedCodes] = useState<string[]>([]);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
        const stored = localStorage.getItem('usedPromoCodes');
        if (stored) setUsedCodes(JSON.parse(stored));
    }, [user, router]);

    const redeemCode = async (code: string) => {
        if (!token) return;

        const upperCode = code.toUpperCase().trim();

        if (usedCodes.includes(upperCode)) {
            showToast('error', 'Mã này đã được sử dụng!');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/promo/redeem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ code: upperCode }),
            });

            const data = await res.json();
            if (res.ok) {
                updateBalance(data.newBalance);
                const newUsedCodes = [...usedCodes, upperCode];
                setUsedCodes(newUsedCodes);
                localStorage.setItem('usedPromoCodes', JSON.stringify(newUsedCodes));
                showToast('success', `Nhận thành công +${formatCurrency(data.amount)}!`);
                setPromoCode('');
            } else {
                showToast('error', data.error || 'Lỗi nhập mã');
            }
        } catch {
            showToast('error', 'Lỗi kết nối');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="page">
            <div className="page-content">
                {/* Header */}
                <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🎁</div>
                    <h1 className="text-2xl font-bold">Khuyến mãi</h1>
                    <p className="text-muted text-sm">Nhập mã để nhận ưu đãi</p>
                </div>

                {/* Input Code */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="input flex-1"
                                placeholder="Nhập mã khuyến mãi..."
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            />
                            <button
                                className="btn btn-primary"
                                onClick={() => redeemCode(promoCode)}
                                disabled={isLoading || !promoCode.trim()}
                            >
                                {isLoading ? '⏳' : 'Nhập'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Promo List */}
                <div className="flex flex-col gap-3">
                    {promos.map((promo) => {
                        const isUsed = usedCodes.includes(promo.code);
                        return (
                            <div
                                key={promo.code}
                                className="card"
                                style={promo.highlight ? { border: '1px solid var(--accent-gold)', background: 'rgba(255, 215, 0, 0.05)' } : undefined}
                            >
                                <div className="card-compact flex items-center gap-3">
                                    <div className="text-3xl">{promo.icon}</div>
                                    <div className="flex-1">
                                        <div className="font-bold">{promo.title}</div>
                                        <div className="text-sm text-muted">{promo.desc}</div>
                                        <div className="text-xs text-secondary mt-1">Mã: {promo.code}</div>
                                    </div>
                                    {isUsed ? (
                                        <span className="badge badge-success">Đã dùng</span>
                                    ) : (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => redeemCode(promo.code)}
                                            disabled={isLoading}
                                        >
                                            Nhận
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info */}
                <div className="card mt-4" style={{ borderColor: 'var(--accent-blue)' }}>
                    <div className="card-compact">
                        <div className="flex items-start gap-2">
                            <span className="text-xl">ℹ️</span>
                            <div className="text-sm text-muted">
                                <p className="mb-1">• Mỗi mã chỉ được sử dụng 1 lần</p>
                                <p className="mb-1">• Đây là game demo, tiền không có giá trị thật</p>
                                <p>• Liên hệ admin để nhận thêm mã!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
