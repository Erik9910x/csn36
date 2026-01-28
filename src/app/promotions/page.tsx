
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const promos = [
    { title: 'Tân Thủ', desc: 'Nhận 10M cho thành viên mới', code: 'CHAOMUNGTANTHU', icon: '🎁', highlight: true },
    { title: 'VIP Casino', desc: 'Bonus 36M cho VIP', code: 'VIP36CASINO', icon: '⭐' },
    { title: 'Happy NY', desc: 'Bonus 260M', code: 'HAPPYNEWYEAR2026', icon: '🎉' },
    { title: 'Thanh Hóa', desc: 'Fan Thanh Hóa', code: 'TOIYEUTHANHHOA', icon: '⚽' },
    { title: 'Game Vui', desc: 'Nhận 10M', code: 'GAMEVUIGIAITRI', icon: '🎮' },
];

export default function PromotionsPage() {
    const { user, token, refreshUser, isLoading } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [loadingCode, setLoadingCode] = useState('');
    const [promoInput, setPromoInput] = useState('');

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [user, isLoading, router]);

    const redeem = async (code: string) => {
        if (!token || loadingCode) return;
        setLoadingCode(code);

        try {
            const res = await fetch('/api/promo/redeem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ code })
            });
            const data = await res.json();

            if (res.ok) {
                showToast('success', `Success! +${formatCurrency(data.amount)}`);
                refreshUser();
                if (code === promoInput) setPromoInput('');
            } else {
                showToast('error', data.error || 'Failed');
            }
        } catch {
            showToast('error', 'Network error');
        } finally {
            setLoadingCode('');
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Promotions</h1>

            <div className="card mb-8">
                <div className="flex gap-2">
                    <input
                        className="input"
                        placeholder="Enter Promo Code"
                        value={promoInput}
                        onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    />
                    <button
                        className="btn btn-primary"
                        disabled={!promoInput || !!loadingCode}
                        onClick={() => redeem(promoInput)}
                    >
                        Redeem
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {promos.map(p => {
                    const isUsed = user.usedCodes?.includes(p.code);
                    return (
                        <div key={p.code} className={`card flex items-center gap-4 ${p.highlight ? 'border-yellow-500/50 bg-yellow-500/5' : ''}`}>
                            <div className="text-3xl">{p.icon}</div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{p.title}</h3>
                                <p className="text-gray-400 text-sm">{p.desc}</p>
                                <code className="text-xs bg-gray-900 px-2 py-1 rounded mt-1 inline-block text-emerald-400">{p.code}</code>
                            </div>
                            {isUsed ? (
                                <span className="text-gray-500 text-sm font-semibold px-4">Claimed</span>
                            ) : (
                                <button
                                    className="btn btn-primary text-sm"
                                    onClick={() => redeem(p.code)}
                                    disabled={!!loadingCode}
                                >
                                    {loadingCode === p.code ? '...' : 'Claim'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
