'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, BET_AMOUNTS, ROUND_DURATION } from '@/lib/utils';
import { saveGameHistory, loadGameHistory } from '@/lib/gameHistory';

const SYMBOLS = [
    { id: 'bau', emoji: '🍐', name: 'Bầu' },
    { id: 'cua', emoji: '🦀', name: 'Cua' },
    { id: 'tom', emoji: '🦐', name: 'Tôm' },
    { id: 'ca', emoji: '🐟', name: 'Cá' },
    { id: 'ga', emoji: '🐓', name: 'Gà' },
    { id: 'nai', emoji: '🦌', name: 'Nai' },
];

interface HistoryItem {
    results: string[];
}

export default function BauCuaPage() {
    const { user, token, updateBalance } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
    const [phase, setPhase] = useState<'betting' | 'rolling' | 'result'>('betting');
    const [bets, setBets] = useState<Record<string, number>>({});
    const [betAmount, setBetAmount] = useState(BET_AMOUNTS[0]);
    const [results, setResults] = useState<string[]>(['bau', 'cua', 'tom']);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isShaking, setIsShaking] = useState(false);
    const [lastResult, setLastResult] = useState<{ isWin: boolean; profit: number } | null>(null);
    const roundEndedRef = useRef(false);

    useEffect(() => {
        const saved = loadGameHistory<HistoryItem>('bau-cua');
        if (saved.length > 0) setHistory(saved);
    }, []);

    useEffect(() => {
        if (history.length > 0) {
            saveGameHistory('bau-cua', history);
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
            const newResults = [
                SYMBOLS[Math.floor(Math.random() * 6)].id,
                SYMBOLS[Math.floor(Math.random() * 6)].id,
                SYMBOLS[Math.floor(Math.random() * 6)].id,
            ];
            setResults(newResults);
        }, 100);

        setTimeout(async () => {
            clearInterval(rollInterval);
            setIsShaking(false);

            const finalResults = [
                SYMBOLS[Math.floor(Math.random() * 6)].id,
                SYMBOLS[Math.floor(Math.random() * 6)].id,
                SYMBOLS[Math.floor(Math.random() * 6)].id,
            ];
            setResults(finalResults);

            setHistory((prev) => [{ results: finalResults }, ...prev.slice(0, 49)]);

            const totalBet = Object.values(bets).reduce((sum, amt) => sum + amt, 0);

            if (totalBet > 0 && token) {
                let winAmount = 0;
                const winSymbols: string[] = [];

                Object.entries(bets).forEach(([symbolId, betAmt]) => {
                    const count = finalResults.filter((r) => r === symbolId).length;
                    if (count > 0) {
                        winAmount += betAmt * count;
                        winSymbols.push(SYMBOLS.find((s) => s.id === symbolId)?.emoji || symbolId);
                    }
                });

                const isWin = winAmount > 0;
                const profit = isWin ? winAmount - totalBet : -totalBet;

                try {
                    const res = await fetch('/api/games/bet', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            game: 'Bầu Cua',
                            amount: totalBet,
                            betType: Object.keys(bets).map((id) => SYMBOLS.find((s) => s.id === id)?.emoji).join(' '),
                            result: finalResults.map((r) => SYMBOLS.find((s) => s.id === r)?.emoji).join(' '),
                            isWin,
                        }),
                    });

                    const data = await res.json();
                    if (res.ok) {
                        updateBalance(isWin ? data.newBalance + winAmount : data.newBalance);
                        setLastResult({ isWin, profit });
                        showToast(
                            isWin ? 'success' : 'error',
                            isWin ? `Thắng +${formatCurrency(winAmount)}! ${winSymbols.join('')}` : `Thua ${formatCurrency(totalBet)}`
                        );
                    }
                } catch {
                    showToast('error', 'Lỗi kết nối');
                }
            }

            setPhase('result');

            setTimeout(() => {
                setPhase('betting');
                setBets({});
                setLastResult(null);
                roundEndedRef.current = false;
            }, 3000);
        }, 2000);
    }, [bets, token, updateBalance, showToast]);

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

    const placeBet = (symbolId: string) => {
        if (phase !== 'betting' || !user) return;

        if (user.balance < betAmount) {
            showToast('error', 'Số dư không đủ!');
            return;
        }

        setBets((prev) => ({
            ...prev,
            [symbolId]: (prev[symbolId] || 0) + betAmount,
        }));
        showToast('info', `Đặt ${formatCurrency(betAmount)} vào ${SYMBOLS.find((s) => s.id === symbolId)?.name}`);
    };

    const getSymbol = (id: string) => SYMBOLS.find((s) => s.id === id)?.emoji || '❓';

    if (!user) return null;

    const totalBet = Object.values(bets).reduce((sum, amt) => sum + amt, 0);

    return (
        <div className="page">
            <div className="page-content">
                {/* Header */}
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold text-gradient">Bầu Cua</h1>
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

                {/* Result Display */}
                <div className="game-display mb-4">
                    <div className={`flex justify-center gap-4 ${isShaking ? 'animate-shake' : ''}`}>
                        {results.map((r, i) => (
                            <div
                                key={i}
                                className="dice"
                                style={{ width: 64, height: 64, fontSize: 36 }}
                            >
                                {getSymbol(r)}
                            </div>
                        ))}
                    </div>
                    {totalBet > 0 && (
                        <div className="text-center mt-4">
                            <span className="badge badge-gold">Tổng cược: {formatCurrency(totalBet)}</span>
                        </div>
                    )}
                </div>

                {/* Betting Grid */}
                <div className="grid grid-3 gap-2 mb-4">
                    {SYMBOLS.map((symbol) => (
                        <button
                            key={symbol.id}
                            onClick={() => placeBet(symbol.id)}
                            disabled={phase !== 'betting'}
                            className={`bet-option ${bets[symbol.id] ? 'active' : ''}`}
                        >
                            <div className="text-3xl mb-1">{symbol.emoji}</div>
                            <div className="text-sm font-medium">{symbol.name}</div>
                            {bets[symbol.id] && (
                                <div className="text-xs text-success mt-1 font-bold">
                                    {formatCurrency(bets[symbol.id])}
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
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {history.length === 0 ? (
                                <span className="text-muted text-sm">Chưa có lịch sử</span>
                            ) : (
                                history.slice(0, 10).map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex gap-1 p-2 flex-shrink-0"
                                        style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}
                                    >
                                        {item.results.map((r, j) => (
                                            <span key={j} className="text-lg">{getSymbol(r)}</span>
                                        ))}
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
