'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface Bet {
    id: string;
    game: string;
    amount: number;
    betDetails: string;
    result: string;
    profit: number;
    createdAt: string;
}

interface Stats {
    totalBets: number;
    totalWins: number;
    totalProfit: number;
    winRate: number;
}

type GameFilter = 'all' | 'Tài Xỉu' | 'Bầu Cua' | 'Xổ Số' | 'Nổ Hũ' | 'Aviator';

const GAMES: { value: GameFilter; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Tài Xỉu', label: 'Tài Xỉu' },
    { value: 'Bầu Cua', label: 'Bầu Cua' },
    { value: 'Xổ Số', label: 'Xổ Số' },
    { value: 'Nổ Hũ', label: 'Nổ Hũ' },
    { value: 'Aviator', label: 'Aviator' },
];

export default function ProfilePage() {
    const { user, token, logout, updateBalance } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();

    const [stats, setStats] = useState<Stats | null>(null);
    const [bets, setBets] = useState<Bet[]>([]);
    const [filter, setFilter] = useState<GameFilter>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [withdrawTriggered, setWithdrawTriggered] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    const fetchData = async () => {
        try {
            const [statsRes, betsRes] = await Promise.all([
                fetch('/api/user/stats', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch('/api/user/bets', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            if (betsRes.ok) {
                const betsData = await betsRes.json();
                setBets(betsData.bets || []);
            }
        } catch {
            showToast('error', 'Lỗi tải dữ liệu');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/introduction');
    };

    const handleWithdraw = () => {
        if (!stats) return;

        if (stats.totalBets < 100) {
            showToast('error', `Cần đặt thêm ${100 - stats.totalBets} lượt cược để mở khóa rút tiền!`);
            return;
        }

        setWithdrawTriggered(true);
        setTimeout(() => {
            showToast('error', 'Hệ thống tạm thời không có tiền. Vui lòng thử lại sau! 😂');
            setWithdrawTriggered(false);
        }, 2000);
    };

    const handleAddFunds = () => {
        updateBalance(user!.balance + 1000000);
        showToast('success', 'Đã nạp +1,000,000đ vào tài khoản!');
    };

    const filteredBets = filter === 'all' ? bets : bets.filter((b) => b.game === filter);

    if (!user) return null;

    return (
        <div className="page">
            <div className="page-content">
                {/* Profile Header */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="flex items-center gap-4 mb-4">
                            <div
                                className="flex items-center justify-center text-3xl"
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    background: 'var(--bg-tertiary)',
                                    border: '2px solid var(--accent-primary)',
                                }}
                            >
                                👤
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold">{user.username}</h2>
                                <span className="badge badge-gold">VIP Member</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center p-3" style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                                <span className="text-muted">Số dư</span>
                                <span className="text-xl font-bold text-success">{formatCurrency(user.balance)}</span>
                            </div>
                            <div className="grid grid-2 gap-2">
                                <button className="btn btn-primary" onClick={handleAddFunds}>
                                    + Nạp tiền
                                </button>
                                <button
                                    className="btn btn-gold"
                                    onClick={handleWithdraw}
                                    disabled={withdrawTriggered}
                                >
                                    {withdrawTriggered ? '⏳...' : '💸 Rút tiền'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-4 gap-2 mb-4">
                        <div className="stat-card">
                            <div className="stat-value">{stats.totalBets ?? 0}</div>
                            <div className="stat-label">Lượt cược</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value text-gold">{stats.totalWins ?? 0}</div>
                            <div className="stat-label">Thắng</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{(stats.winRate ?? 0).toFixed(0)}%</div>
                            <div className="stat-label">Tỷ lệ</div>
                        </div>
                        <div className="stat-card">
                            <div className={`stat-value ${(stats.totalProfit ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                                {(stats.totalProfit ?? 0) >= 0 ? '+' : ''}{formatCurrency(stats.totalProfit ?? 0)}
                            </div>
                            <div className="stat-label">Lợi nhuận</div>
                        </div>
                    </div>
                )}

                {/* Bet History */}
                <div className="card mb-4">
                    <div className="card-header">
                        <span className="font-bold">📜 Lịch sử cược</span>
                    </div>
                    <div className="card-compact">
                        {/* Filter */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
                            {GAMES.map((g) => (
                                <button
                                    key={g.value}
                                    onClick={() => setFilter(g.value)}
                                    className={`chip ${filter === g.value ? 'active' : ''}`}
                                    style={{ flexShrink: 0 }}
                                >
                                    {g.label}
                                </button>
                            ))}
                        </div>

                        {/* History */}
                        {isLoading ? (
                            <div className="flex justify-center p-4">
                                <div className="spinner"></div>
                            </div>
                        ) : filteredBets.length === 0 ? (
                            <p className="text-muted text-center p-4">Chưa có lịch sử</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {filteredBets.slice(0, 15).map((bet) => (
                                    <div
                                        key={bet.id}
                                        className="flex items-center justify-between p-3"
                                        style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{bet.game}</div>
                                            <div className="text-xs text-muted">{bet.betDetails}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-bold ${bet.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                                                {bet.profit >= 0 ? '+' : ''}{formatCurrency(bet.profit)}
                                            </div>
                                            <div className="text-xs text-muted">
                                                {new Date(bet.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Logout */}
                <button className="btn btn-danger btn-block" onClick={handleLogout}>
                    🚪 Đăng xuất
                </button>
            </div>
        </div>
    );
}
