'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';

const games = [
  {
    id: 'tai-xiu',
    name: 'Tài Xỉu',
    icon: '🎲',
    description: 'Đoán tổng 3 xúc xắc',
    path: '/games/tai-xiu',
    badge: 'HOT',
    badgeColor: 'badge-danger'
  },
  {
    id: 'bau-cua',
    name: 'Bầu Cua',
    icon: '🦀',
    description: '6 biểu tượng may mắn',
    path: '/games/bau-cua',
    badge: null
  },
  {
    id: 'lottery',
    name: 'Xổ Số',
    icon: '🎱',
    description: 'Số may mắn 5 chữ số',
    path: '/games/lottery',
    badge: null
  },
  {
    id: 'slot',
    name: 'Nổ Hũ',
    icon: '🎰',
    description: 'Jackpot lên đến x50',
    path: '/games/slot',
    badge: 'NEW',
    badgeColor: 'badge-success'
  },
  {
    id: 'aviator',
    name: 'Aviator',
    icon: '✈️',
    description: 'Rút trước khi crash',
    path: '/games/aviator',
    badge: 'x100',
    badgeColor: 'badge-gold'
  },
];

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/introduction');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="page flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="page">
      <div className="page-content">
        {/* Balance Card */}
        <div className="balance-bar mb-4">
          <div className="balance-info">
            <span className="balance-label">Số dư khả dụng</span>
            <span className="balance-value">{formatCurrency(user.balance)}</span>
          </div>
          <Link href="/promotions">
            <button className="btn btn-primary btn-sm">
              + Nạp tiền
            </button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-4 mb-4">
          <div className="stat-card">
            <div className="stat-value">5</div>
            <div className="stat-label">Games</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-gold">24/7</div>
            <div className="stat-label">Online</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">x1.95</div>
            <div className="stat-label">Tỷ lệ</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-danger">0%</div>
            <div className="stat-label">Phí rút</div>
          </div>
        </div>

        {/* Games Section */}
        <div className="mb-3 flex justify-between items-center">
          <h2 className="text-lg font-bold">🎮 Chọn Game</h2>
          <span className="text-sm text-muted">{games.length} games</span>
        </div>

        <div className="grid grid-2 gap-3">
          {games.map((game) => (
            <Link key={game.id} href={game.path}>
              <div className="game-card">
                {game.badge && (
                  <span className={`badge ${game.badgeColor} game-card-badge`}>
                    {game.badge}
                  </span>
                )}
                <div className="game-card-body">
                  <div className="game-icon">{game.icon}</div>
                  <div className="game-name">{game.name}</div>
                  <div className="game-desc">{game.description}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Promo Banner */}
        <div className="card mt-4" style={{ background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)' }}>
          <div className="card-compact flex items-center gap-3">
            <span className="text-3xl">🎁</span>
            <div className="flex-1">
              <div className="font-bold text-accent-primary">Nhập mã OKVIP2026</div>
              <div className="text-sm text-secondary">Nhận ngay 500,000đ miễn phí</div>
            </div>
            <Link href="/promotions">
              <button className="btn btn-ghost btn-sm">Nhập</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
