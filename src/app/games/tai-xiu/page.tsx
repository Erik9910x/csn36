'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, BET_AMOUNTS, ROUND_DURATION, rollDice, isTai, generateMD5Display } from '@/lib/utils';
import { saveGameHistory, loadGameHistory } from '@/lib/gameHistory';

type BetType = 'TAI' | 'XIU' | null;

interface HistoryItem {
    result: 'TAI' | 'XIU';
    dice: [number, number, number];
    total: number;
}

export default function TaiXiuPage() {
    const { user, token, updateBalance } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
    const [phase, setPhase] = useState<'betting' | 'rolling' | 'result'>('betting');
    const [selectedType, setSelectedType] = useState<BetType>(null);
    const [betAmount, setBetAmount] = useState(BET_AMOUNTS[0]);
    const [confirmedBet, setConfirmedBet] = useState<{ type: BetType; amount: number }>({ type: null, amount: 0 });
    const [dice, setDice] = useState<[number, number, number]>([1, 1, 1]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [md5Hash, setMd5Hash] = useState('Loading...');
    const [isShaking, setIsShaking] = useState(false);
    const [lastResult, setLastResult] = useState<{ isWin: boolean; profit: number } | null>(null);
    const roundEndedRef = useRef(false);

    useEffect(() => {
        const saved = loadGameHistory<HistoryItem>('tai-xiu');
        if (saved.length > 0) setHistory(saved);
        setMd5Hash(generateMD5Display());
    }, []);

    useEffect(() => {
        if (history.length > 0) {
            saveGameHistory('tai-xiu', history);
        }
    }, [history]);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    const handleRoundEnd = useCallback(async () => {
        if (roundEndedRef.current) return;
        roundEndedRef.current = true;

        setPhase('rolling');
        setIsShaking(true);

        const rollInterval = setInterval(() => {
            setDice([
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
            ]);
        }, 100);

        setTimeout(async () => {
            clearInterval(rollInterval);
            setIsShaking(false);

            const finalDice = rollDice();
            setDice(finalDice);
            const total = finalDice[0] + finalDice[1] + finalDice[2];
            const resultType = isTai(total) ? 'TAI' : 'XIU';

            setHistory((prev) => [{ result: resultType, dice: finalDice, total }, ...prev.slice(0, 49)]);
            setMd5Hash(generateMD5Display());

            if (confirmedBet.type && confirmedBet.amount > 0 && token) {
                const isWin = confirmedBet.type === resultType;

                try {
                    const res = await fetch('/api/games/bet', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            game: 'Tài Xỉu',
                            amount: confirmedBet.amount,
                            betType: confirmedBet.type,
                            result: `${resultType} (${total})`,
                            isWin,
                        }),
                    });

                    const data = await res.json();
                    if (res.ok) {
                        updateBalance(data.newBalance);
                        setLastResult({ isWin, profit: data.profit });
                        showToast(
                            isWin ? 'success' : 'error',
                            isWin
                                ? `Thắng +${formatCurrency(data.profit)}!`
                                : `Thua ${formatCurrency(confirmedBet.amount)}`
                        );
                    }
                } catch {
                    showToast('error', 'Lỗi kết nối');
                }
            }

            setPhase('result');

            setTimeout(() => {
                setPhase('betting');
                setSelectedType(null);
                setConfirmedBet({ type: null, amount: 0 });
                setLastResult(null);
                roundEndedRef.current = false;
            }, 3000);
        }, 2000);
    }, [confirmedBet, token, updateBalance, showToast]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (phase === 'betting' && !roundEndedRef.current) {
                        handleRoundEnd();
                    }
                    return ROUND_DURATION;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [phase, handleRoundEnd]);

    const selectBetType = (type: BetType) => {
        if (phase !== 'betting') return;
        setSelectedType(type);
    };

    const confirmBet = () => {
        if (phase !== 'betting' || !user || !selectedType) return;

        if (user.balance < betAmount) {
            showToast('error', 'Số dư không đủ!');
            return;
        }

        // Stack betting - add to existing bet
        if (confirmedBet.type === selectedType) {
            setConfirmedBet(prev => ({ type: selectedType, amount: prev.amount + betAmount }));
            showToast('success', `Cộng thêm ${formatCurrency(betAmount)} vào ${selectedType}. Tổng: ${formatCurrency(confirmedBet.amount + betAmount)}`);
        } else {
            setConfirmedBet({ type: selectedType, amount: betAmount });
            showToast('success', `Xác nhận đặt ${formatCurrency(betAmount)} vào ${selectedType}`);
        }
    };

    const cancelBet = () => {
        setSelectedType(null);
        setConfirmedBet({ type: null, amount: 0 });
        showToast('info', 'Đã hủy cược');
    };

    const getDiceEmoji = (value: number) => {
        const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return diceEmojis[value - 1] || '🎲';
    };

    if (!user) return null;

    const total = dice[0] + dice[1] + dice[2];

    return (
        <div className="page">
            <div className="page-content">
                {/* Header */}
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold text-gradient mb-1">Tài Xỉu</h1>
                    <code className="text-xs text-muted">{md5Hash}</code>
                </div>

                {/* Timer & Status */}
                <div className="card mb-4">
                    <div className="card-compact flex items-center justify-between">
                        <div>
                            <div className="text-sm text-muted">Trạng thái</div>
                            <div className="font-bold text-lg">
                                {phase === 'betting' ? '🎯 Đặt cược' : phase === 'rolling' ? '🎲 Đang lắc...' : '📊 Kết quả'}
                            </div>
                        </div>
                        <div className="timer-ring">
                            <span className="timer-value">{timeLeft}</span>
                            <svg viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    stroke="var(--border-color)"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    stroke="var(--accent-primary)"
                                    strokeDasharray={283}
                                    strokeDashoffset={283 - (283 * timeLeft) / ROUND_DURATION}
                                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Dice Display */}
                <div className="game-display mb-4">
                    <div className={`dice-container ${isShaking ? 'animate-shake' : ''}`}>
                        {dice.map((d, i) => (
                            <div key={i} className="dice">
                                {getDiceEmoji(d)}
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-4">
                        <div className="text-4xl font-bold text-gradient">{total}</div>
                        {phase === 'result' && (
                            <div className="mt-2">
                                <span className={`badge ${isTai(total) ? 'badge-danger' : 'badge-blue'}`}>
                                    {isTai(total) ? '🔴 TÀI' : '🔵 XỈU'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Betting Panel */}
                <div className="grid grid-2 gap-3 mb-4">
                    <button
                        onClick={() => selectBetType('TAI')}
                        disabled={phase !== 'betting'}
                        className={`bet-option ${selectedType === 'TAI' || confirmedBet.type === 'TAI' ? 'active' : ''}`}
                        style={{ borderColor: selectedType === 'TAI' || confirmedBet.type === 'TAI' ? '#e74c3c' : undefined }}
                    >
                        <div className="bet-label">TÀI</div>
                        <div className="bet-value" style={{ color: '#e74c3c' }}>11-18</div>
                        <div className="bet-odds">x1.95</div>
                        {confirmedBet.type === 'TAI' && confirmedBet.amount > 0 && (
                            <div className="text-sm text-success mt-2 font-bold">
                                ✓ {formatCurrency(confirmedBet.amount)}
                            </div>
                        )}
                    </button>

                    <button
                        onClick={() => selectBetType('XIU')}
                        disabled={phase !== 'betting'}
                        className={`bet-option ${selectedType === 'XIU' || confirmedBet.type === 'XIU' ? 'active' : ''}`}
                        style={{ borderColor: selectedType === 'XIU' || confirmedBet.type === 'XIU' ? '#3498db' : undefined }}
                    >
                        <div className="bet-label">XỈU</div>
                        <div className="bet-value" style={{ color: '#3498db' }}>3-10</div>
                        <div className="bet-odds">x1.95</div>
                        {confirmedBet.type === 'XIU' && confirmedBet.amount > 0 && (
                            <div className="text-sm text-success mt-2 font-bold">
                                ✓ {formatCurrency(confirmedBet.amount)}
                            </div>
                        )}
                    </button>
                </div>

                {/* Amount Selection */}
                <div className="card mb-4">
                    <div className="card-compact">
                        <div className="text-sm text-muted mb-2">Chọn mức cược</div>
                        <div className="flex gap-2 flex-wrap">
                            {BET_AMOUNTS.map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setBetAmount(amount)}
                                    className={`chip ${betAmount === amount ? 'active' : ''}`}
                                >
                                    {formatCurrency(amount)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Confirm Button */}
                {phase === 'betting' && (
                    <div className="grid grid-2 gap-3 mb-4">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={confirmBet}
                            disabled={!selectedType}
                        >
                            ✓ Xác nhận{selectedType ? ` ${selectedType}` : ''}
                        </button>
                        {confirmedBet.amount > 0 && (
                            <button
                                className="btn btn-danger btn-lg"
                                onClick={cancelBet}
                            >
                                ✕ Hủy cược
                            </button>
                        )}
                    </div>
                )}

                {/* Current Bet Status */}
                {confirmedBet.amount > 0 && (
                    <div className="win-display text-center mb-4">
                        <div className="text-sm text-muted">Đã đặt cược</div>
                        <div className="text-xl font-bold">
                            {confirmedBet.type === 'TAI' ? '🔴 TÀI' : '🔵 XỈU'}: {formatCurrency(confirmedBet.amount)}
                        </div>
                        <div className="text-xs text-muted mt-1">Thắng nhận: {formatCurrency(Math.floor(confirmedBet.amount * 1.95))}</div>
                    </div>
                )}

                {/* History */}
                <div className="card">
                    <div className="card-compact">
                        <div className="text-sm text-muted mb-2">Lịch sử kết quả</div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {history.length === 0 ? (
                                <span className="text-muted text-sm">Chưa có lịch sử</span>
                            ) : (
                                history.slice(0, 20).map((item, i) => (
                                    <div
                                        key={i}
                                        className={`history-item ${item.result === 'TAI' ? 'history-tai' : 'history-xiu'}`}
                                    >
                                        {item.total}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Result Modal */}
                {lastResult && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
                    >
                        <div className={lastResult.isWin ? 'win-display' : 'lose-display'} style={{ minWidth: 280 }}>
                            <div className="text-center">
                                <div className="text-5xl mb-3">{lastResult.isWin ? '🏆' : '😢'}</div>
                                <div className="text-2xl font-bold mb-2">
                                    {lastResult.isWin ? 'THẮNG!' : 'THUA!'}
                                </div>
                                <div className={`text-xl font-bold ${lastResult.isWin ? 'text-success' : 'text-danger'}`}>
                                    {lastResult.isWin ? '+' : ''}{formatCurrency(lastResult.profit)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
