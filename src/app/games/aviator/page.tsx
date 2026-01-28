'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import { saveGameHistory, loadGameHistory } from '@/lib/gameHistory';

const MIN_BET = 1000;
const MAX_BET = 1000000;

interface HistoryItem {
    multiplier: number;
    color: string;
}

const generateBiasedMultiplier = (): number => {
    const rand = Math.random();
    if (rand < 0.60) return 1 + Math.random() * 0.5;
    if (rand < 0.85) return 1.5 + Math.random() * 1;
    if (rand < 0.95) return 2.5 + Math.random() * 2.5;
    return 5 + Math.random() * 10;
};

const getMultiplierColor = (mult: number): string => {
    if (mult < 1.5) return 'badge-danger';
    if (mult < 2) return 'badge-gold';
    if (mult < 3) return 'badge-success';
    return 'badge-blue';
};

export default function AviatorPage() {
    const { user, token, updateBalance } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    const [betAmount, setBetAmount] = useState(10000);
    const [phase, setPhase] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
    const [multiplier, setMultiplier] = useState(1.0);
    const [crashPoint, setCrashPoint] = useState(0);
    const [hasBet, setHasBet] = useState(false);
    const [hasCashedOut, setHasCashedOut] = useState(false);
    const [autoCashout, setAutoCashout] = useState<number | null>(null);
    const [autoBet, setAutoBet] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [lastWin, setLastWin] = useState<number | null>(null);
    const [countdown, setCountdown] = useState(5);

    const animationRef = useRef<number | null>(null);
    const autoBetRef = useRef(false);
    const startTimeRef = useRef(0);

    useEffect(() => {
        const saved = loadGameHistory<HistoryItem>('aviator');
        if (saved.length > 0) setHistory(saved);
    }, []);

    useEffect(() => {
        if (history.length > 0) {
            saveGameHistory('aviator', history);
        }
    }, [history]);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    useEffect(() => {
        autoBetRef.current = autoBet;
    }, [autoBet]);

    const placeBetInternal = useCallback(async () => {
        if (!user || !token) return;
        if (user.balance < betAmount) {
            showToast('error', 'Số dư không đủ!');
            setAutoBet(false);
            return;
        }
        setHasBet(true);
        showToast('info', `Đặt ${formatCurrency(betAmount)}`);
    }, [user, token, betAmount, showToast]);

    const startRound = useCallback(() => {
        const newCrashPoint = generateBiasedMultiplier();
        setCrashPoint(newCrashPoint);
        setMultiplier(1.0);
        setPhase('flying');
        setHasCashedOut(false);
        setLastWin(null);
        startTimeRef.current = Date.now();

        const animate = () => {
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            const currentMultiplier = 1 + elapsed * 0.3 + Math.pow(elapsed * 0.05, 2);

            if (currentMultiplier >= newCrashPoint) {
                setMultiplier(newCrashPoint);
                endRound(newCrashPoint);
                return;
            }

            setMultiplier(currentMultiplier);
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
    }, []);

    const endRound = useCallback(
        async (finalMultiplier: number) => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }

            setPhase('crashed');
            const color = getMultiplierColor(finalMultiplier);

            setHistory((prev) => [{ multiplier: finalMultiplier, color }, ...prev.slice(0, 49)]);

            if (hasBet && !hasCashedOut && token) {
                try {
                    const res = await fetch('/api/games/bet', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            game: 'Aviator',
                            amount: betAmount,
                            betType: 'Bet',
                            result: `Crashed at ${finalMultiplier.toFixed(2)}x`,
                            isWin: false,
                        }),
                    });

                    const data = await res.json();
                    if (res.ok) {
                        updateBalance(data.newBalance);
                        showToast('error', `Bay mất tại ${finalMultiplier.toFixed(2)}x!`);
                    }
                } catch {
                    showToast('error', 'Lỗi kết nối');
                }
            }

            setHasBet(false);

            let count = 5;
            setCountdown(count);
            const countdownInterval = setInterval(() => {
                count--;
                setCountdown(count);
                if (count <= 0) {
                    clearInterval(countdownInterval);
                    setPhase('waiting');
                    setMultiplier(1.0);

                    if (autoBetRef.current) {
                        setTimeout(() => {
                            if (autoBetRef.current) {
                                placeBetInternal();
                            }
                        }, 500);
                    }

                    setTimeout(startRound, 1000);
                }
            }, 1000);
        },
        [hasBet, hasCashedOut, token, betAmount, updateBalance, showToast, startRound, placeBetInternal]
    );

    useEffect(() => {
        if (phase === 'flying' && hasBet && !hasCashedOut && autoCashout && multiplier >= autoCashout) {
            cashOut();
        }
    }, [multiplier, phase, hasBet, hasCashedOut, autoCashout]);

    useEffect(() => {
        const timeout = setTimeout(startRound, 2000);
        return () => {
            clearTimeout(timeout);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    const placeBet = async () => {
        if (phase !== 'waiting' || hasBet) return;
        await placeBetInternal();
    };

    const cashOut = async () => {
        if (phase !== 'flying' || !hasBet || hasCashedOut || !token) return;

        setHasCashedOut(true);
        const winAmount = Math.floor(betAmount * multiplier);
        setLastWin(winAmount);

        try {
            const res = await fetch('/api/games/bet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    game: 'Aviator',
                    amount: betAmount,
                    betType: `Cashout at ${multiplier.toFixed(2)}x`,
                    result: `Won ${formatCurrency(winAmount)}`,
                    isWin: true,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                updateBalance(data.newBalance);
                showToast('success', `Rút thành công +${formatCurrency(winAmount - betAmount)}!`);
            }
        } catch {
            showToast('error', 'Lỗi kết nối');
        }
    };

    if (!user) return null;

    return (
        <div className="page">
            <div className="page-content">
                {/* Header */}
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold text-gradient">Aviator</h1>
                </div>

                {/* History */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
                    {history.length === 0 ? (
                        <span className="text-muted text-sm">Chờ kết quả...</span>
                    ) : (
                        history.slice(0, 15).map((item, i) => (
                            <span key={i} className={`badge ${item.color} flex-shrink-0`}>
                                {item.multiplier.toFixed(2)}x
                            </span>
                        ))
                    )}
                </div>

                {/* Game Display */}
                <div className="game-display mb-4" style={{ height: 200, position: 'relative' }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                        {phase === 'crashed' ? (
                            <div className="text-center">
                                <div className="text-4xl font-bold text-danger">💥 {multiplier.toFixed(2)}x</div>
                                <div className="text-danger mt-2">BAY MẤT!</div>
                                <div className="text-muted mt-1">Vòng mới sau {countdown}s...</div>
                            </div>
                        ) : phase === 'waiting' ? (
                            <div className="text-center">
                                <div className="text-4xl">⏳</div>
                                <div className="text-muted mt-2">Chuẩn bị bay...</div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-5xl font-bold text-gradient">{multiplier.toFixed(2)}x</div>
                                <div className="text-2xl mt-2">✈️</div>
                            </div>
                        )}
                    </div>

                    {lastWin && (
                        <div className="absolute top-4 right-4">
                            <span className="badge badge-success">+{formatCurrency(lastWin - betAmount)}</span>
                        </div>
                    )}
                </div>

                {/* Bet Controls */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setBetAmount((prev) => Math.max(MIN_BET, prev - 10000))}
                                disabled={hasBet}
                            >
                                -
                            </button>
                            <div className="text-center">
                                <div className="text-sm text-muted">Mức cược</div>
                                <div className="text-xl font-bold text-success">{formatCurrency(betAmount)}</div>
                            </div>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setBetAmount((prev) => Math.min(MAX_BET, prev + 10000))}
                                disabled={hasBet}
                            >
                                +
                            </button>
                        </div>

                        <div className="grid grid-2 gap-3">
                            {hasBet && phase === 'flying' && !hasCashedOut ? (
                                <button className="btn btn-gold btn-lg" onClick={cashOut} style={{ gridColumn: 'span 2' }}>
                                    💰 RÚT ({multiplier.toFixed(2)}x = {formatCurrency(Math.floor(betAmount * multiplier))})
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="btn btn-primary btn-lg"
                                        onClick={placeBet}
                                        disabled={phase !== 'waiting' || hasBet}
                                    >
                                        {hasBet ? '✓ Đã đặt' : '🎯 ĐẶT'}
                                    </button>
                                    <button
                                        className={autoBet ? 'btn btn-danger btn-lg' : 'btn btn-ghost btn-lg'}
                                        onClick={() => setAutoBet(!autoBet)}
                                    >
                                        {autoBet ? '⏹️ DỪNG' : '🔄 AUTO'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Auto Cashout */}
                <div className="card">
                    <div className="card-compact flex items-center justify-between">
                        <div>
                            <div className="font-medium">Auto Cashout</div>
                            <div className="text-sm text-muted">Tự động rút tiền</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setAutoCashout((prev) => (prev ? Math.max(1.1, prev - 0.1) : 1.5))}
                            >
                                -
                            </button>
                            <span className="font-bold text-success" style={{ minWidth: 50, textAlign: 'center' }}>
                                {autoCashout ? `${autoCashout.toFixed(1)}x` : 'OFF'}
                            </span>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setAutoCashout((prev) => (prev ? prev + 0.1 : 1.5))}
                            >
                                +
                            </button>
                            {autoCashout && (
                                <button className="btn btn-danger btn-sm" onClick={() => setAutoCashout(null)}>
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
