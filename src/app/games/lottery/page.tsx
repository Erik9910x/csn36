'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, BET_AMOUNTS, ROUND_DURATION, generateLotteryNumber } from '@/lib/utils';
import { saveGameHistory, loadGameHistory } from '@/lib/gameHistory';

type BetType = 'TAI' | 'XIU' | 'CHAN' | 'LE' | null;

interface HistoryItem {
    number: string;
    isTai: boolean;
    isChan: boolean;
}

export default function LotteryPage() {
    const { user, token, updateBalance } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
    const [phase, setPhase] = useState<'betting' | 'rolling' | 'result'>('betting');
    const [currentBet, setCurrentBet] = useState<{ type: BetType; amount: number }>({ type: null, amount: 0 });
    const [betAmount, setBetAmount] = useState(BET_AMOUNTS[0]);
    const [lotteryNumber, setLotteryNumber] = useState('00000');
    const [roundId, setRoundId] = useState(1000);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [lastResult, setLastResult] = useState<{ isWin: boolean; profit: number } | null>(null);
    const roundEndedRef = useRef(false);

    useEffect(() => {
        const saved = loadGameHistory<HistoryItem>('lottery');
        if (saved.length > 0) setHistory(saved);
        setRoundId(1000 + Math.floor(Math.random() * 9000));
    }, []);

    useEffect(() => {
        if (history.length > 0) {
            saveGameHistory('lottery', history);
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
        setIsAnimating(true);

        const rollInterval = setInterval(() => {
            setLotteryNumber(generateLotteryNumber());
        }, 50);

        setTimeout(async () => {
            clearInterval(rollInterval);
            setIsAnimating(false);

            const finalNumber = generateLotteryNumber();
            setLotteryNumber(finalNumber);

            const total = finalNumber.split('').reduce((sum, d) => sum + parseInt(d), 0);
            const isTai = total >= 23;
            const isChan = total % 2 === 0;

            setHistory((prev) => [
                { number: finalNumber, isTai, isChan },
                ...prev.slice(0, 49),
            ]);

            setRoundId((prev) => prev + 1);

            if (currentBet.type && currentBet.amount > 0 && token) {
                let isWin = false;
                if (currentBet.type === 'TAI') isWin = isTai;
                else if (currentBet.type === 'XIU') isWin = !isTai;
                else if (currentBet.type === 'CHAN') isWin = isChan;
                else if (currentBet.type === 'LE') isWin = !isChan;

                try {
                    const res = await fetch('/api/games/bet', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            game: 'Xổ Số',
                            amount: currentBet.amount,
                            betType: currentBet.type,
                            result: `${finalNumber} (${isTai ? 'Tài' : 'Xỉu'}, ${isChan ? 'Chẵn' : 'Lẻ'})`,
                            isWin,
                        }),
                    });

                    const data = await res.json();
                    if (res.ok) {
                        updateBalance(data.newBalance);
                        setLastResult({ isWin, profit: data.profit });
                        showToast(
                            isWin ? 'success' : 'error',
                            isWin ? `Thắng +${formatCurrency(data.profit)}!` : `Thua ${formatCurrency(currentBet.amount)}`
                        );
                    }
                } catch {
                    showToast('error', 'Lỗi kết nối');
                }
            }

            setPhase('result');

            setTimeout(() => {
                setPhase('betting');
                setCurrentBet({ type: null, amount: 0 });
                setLastResult(null);
                roundEndedRef.current = false;
            }, 3000);
        }, 2500);
    }, [currentBet, token, updateBalance, showToast]);

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

    const placeBet = (type: BetType) => {
        if (phase !== 'betting' || !user) return;

        if (user.balance < betAmount) {
            showToast('error', 'Số dư không đủ!');
            return;
        }

        setCurrentBet({ type, amount: betAmount });
        showToast('info', `Đặt ${formatCurrency(betAmount)} vào ${type}`);
    };

    if (!user) return null;

    const total = lotteryNumber.split('').reduce((sum, d) => sum + parseInt(d), 0);

    return (
        <div className="page">
            <div className="page-content">
                {/* Header */}
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold text-gradient">Xổ Số</h1>
                    <span className="text-sm text-muted">Kỳ #{roundId}</span>
                </div>

                {/* Timer & Status */}
                <div className="card mb-4">
                    <div className="card-compact flex items-center justify-between">
                        <div>
                            <div className="text-sm text-muted">Trạng thái</div>
                            <div className="font-bold text-lg">
                                {phase === 'betting' ? '🎯 Đặt cược' : phase === 'rolling' ? '🔢 Đang quay...' : '📊 Kết quả'}
                            </div>
                        </div>
                        <div className="timer-ring">
                            <span className="timer-value">{timeLeft}</span>
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" stroke="var(--border-color)" />
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

                {/* Number Display */}
                <div className="game-display mb-4">
                    <div className="flex justify-center gap-2">
                        {lotteryNumber.split('').map((digit, i) => (
                            <div
                                key={i}
                                className={`flex items-center justify-center text-2xl font-bold ${isAnimating ? 'animate-pulse' : ''}`}
                                style={{
                                    width: 48,
                                    height: 56,
                                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: '#000'
                                }}
                            >
                                {digit}
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-4">
                        <span className="text-muted text-sm">Tổng: </span>
                        <span className="text-2xl font-bold text-gradient">{total}</span>
                        {phase === 'result' && (
                            <div className="flex justify-center gap-2 mt-2">
                                <span className={`badge ${total >= 23 ? 'badge-danger' : 'badge-blue'}`}>
                                    {total >= 23 ? 'TÀI' : 'XỈU'}
                                </span>
                                <span className={`badge ${total % 2 === 0 ? 'badge-success' : 'badge-gold'}`}>
                                    {total % 2 === 0 ? 'CHẴN' : 'LẺ'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Betting Panel */}
                <div className="grid grid-2 gap-2 mb-4">
                    {[
                        { type: 'TAI' as BetType, label: 'TÀI', desc: '≥23', color: '#e74c3c' },
                        { type: 'XIU' as BetType, label: 'XỈU', desc: '<23', color: '#3498db' },
                        { type: 'CHAN' as BetType, label: 'CHẴN', desc: 'Tổng chẵn', color: '#00d4aa' },
                        { type: 'LE' as BetType, label: 'LẺ', desc: 'Tổng lẻ', color: '#ffd700' },
                    ].map((option) => (
                        <button
                            key={option.type}
                            onClick={() => placeBet(option.type)}
                            disabled={phase !== 'betting'}
                            className={`bet-option ${currentBet.type === option.type ? 'active' : ''}`}
                            style={{ borderColor: currentBet.type === option.type ? option.color : undefined }}
                        >
                            <div className="bet-label">{option.label}</div>
                            <div className="bet-value" style={{ color: option.color, fontSize: 16 }}>{option.desc}</div>
                            {currentBet.type === option.type && currentBet.amount > 0 && (
                                <div className="text-sm text-success mt-1 font-bold">
                                    {formatCurrency(currentBet.amount)}
                                </div>
                            )}
                        </button>
                    ))}
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

                {/* History */}
                <div className="card">
                    <div className="card-compact">
                        <div className="text-sm text-muted mb-2">Lịch sử kết quả</div>
                        {history.length === 0 ? (
                            <span className="text-muted text-sm">Chưa có lịch sử</span>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {history.slice(0, 5).map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm p-2" style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                                        <span className="font-mono font-bold text-success">{item.number}</span>
                                        <span className={`badge ${item.isTai ? 'badge-danger' : 'badge-blue'}`} style={{ fontSize: 10 }}>
                                            {item.isTai ? 'T' : 'X'}
                                        </span>
                                        <span className={`badge ${item.isChan ? 'badge-success' : 'badge-gold'}`} style={{ fontSize: 10 }}>
                                            {item.isChan ? 'C' : 'L'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
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
