'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, SLOT_SYMBOLS } from '@/lib/utils';
import { saveGameHistory, loadGameHistory } from '@/lib/gameHistory';

const ROWS = 3;
const COLS = 5;
const MIN_BET = 5000;
const MAX_BET = 1000000;

interface SlotHistoryItem {
    grid: string[][];
    win: number;
    type: string | null;
}

export default function SlotPage() {
    const { user, token, updateBalance } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    const [betAmount, setBetAmount] = useState(MIN_BET);
    const [grid, setGrid] = useState<string[][]>(
        Array(ROWS).fill(null).map(() => Array(COLS).fill(null).map(() => SLOT_SYMBOLS[0]))
    );
    const [isSpinning, setIsSpinning] = useState(false);
    const [autoSpin, setAutoSpin] = useState(false);
    const [fastSpin, setFastSpin] = useState(false);
    const [lastWin, setLastWin] = useState<{ amount: number; type: string } | null>(null);
    const [history, setHistory] = useState<SlotHistoryItem[]>([]);
    const autoSpinRef = useRef(false);
    const fastSpinRef = useRef(false);

    useEffect(() => {
        const saved = loadGameHistory<SlotHistoryItem>('slot');
        if (saved.length > 0) setHistory(saved);
        setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill(null).map(() => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)])));
    }, []);

    useEffect(() => {
        if (history.length > 0) {
            saveGameHistory('slot', history);
        }
    }, [history]);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    useEffect(() => {
        autoSpinRef.current = autoSpin;
    }, [autoSpin]);

    useEffect(() => {
        fastSpinRef.current = fastSpin;
    }, [fastSpin]);

    const spin = async () => {
        if (isSpinning || !user || !token) return;

        if (user.balance < betAmount) {
            showToast('error', 'Số dư không đủ!');
            setAutoSpin(false);
            return;
        }

        setIsSpinning(true);
        setLastWin(null);

        const spinDuration = fastSpinRef.current ? 500 : 1500;
        const spinInterval = fastSpinRef.current ? 30 : 50;
        let elapsed = 0;

        const animateInterval = setInterval(() => {
            elapsed += spinInterval;
            const progress = elapsed / spinDuration;

            setGrid((prev) =>
                prev.map((row, rowIndex) =>
                    row.map((_, colIndex) => {
                        const colStopProgress = 0.4 + colIndex * 0.12;
                        if (progress > colStopProgress) {
                            return prev[rowIndex][colIndex];
                        }
                        return SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
                    })
                )
            );

            if (elapsed >= spinDuration) {
                clearInterval(animateInterval);
                finishSpin();
            }
        }, spinInterval);

        const finishSpin = async () => {
            const finalGrid = Array(ROWS)
                .fill(null)
                .map(() =>
                    Array(COLS)
                        .fill(null)
                        .map(() => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)])
                );
            setGrid(finalGrid);

            const { winAmount, winType } = calculateWin(finalGrid, betAmount);

            setHistory((prev) => [
                { grid: finalGrid, win: winAmount, type: winType },
                ...prev.slice(0, 49),
            ]);

            try {
                const isWin = winAmount > 0;
                const res = await fetch('/api/games/bet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        game: 'Nổ Hũ',
                        amount: betAmount,
                        betType: `Bet ${formatCurrency(betAmount)}`,
                        result: winType || 'No win',
                        isWin,
                    }),
                });

                const data = await res.json();
                if (res.ok) {
                    const newBalance = isWin ? data.newBalance + winAmount : data.newBalance;
                    updateBalance(newBalance);

                    if (winAmount > 0) {
                        setLastWin({ amount: winAmount, type: winType! });
                        showToast('success', `${winType}! +${formatCurrency(winAmount)}`);
                    }
                }
            } catch {
                showToast('error', 'Lỗi kết nối');
            }

            setIsSpinning(false);

            const delay = fastSpinRef.current ? 300 : 800;
            if (autoSpinRef.current) {
                setTimeout(() => {
                    if (autoSpinRef.current) {
                        spin();
                    }
                }, delay);
            }
        };
    };

    const calculateWin = (g: string[][], bet: number): { winAmount: number; winType: string | null } => {
        const rand = Math.random();

        const middleRow = g[1];
        const firstSymbol = middleRow[0];
        let matchCount = 1;
        for (let i = 1; i < COLS; i++) {
            if (middleRow[i] === firstSymbol) matchCount++;
            else break;
        }

        if (matchCount >= 5 && rand < 0.005) {
            return { winAmount: bet * 50, winType: '🎰 JACKPOT!' };
        }
        if (matchCount >= 4 && rand < 0.02) {
            return { winAmount: bet * 20, winType: '⭐ MEGA WIN!' };
        }
        if (matchCount >= 3 && rand < 0.08) {
            return { winAmount: bet * 5, winType: '🎉 BIG WIN!' };
        }
        if (rand < 0.25) {
            return { winAmount: bet * 2, winType: '✨ Win!' };
        }
        if (rand < 0.40) {
            return { winAmount: Math.floor(bet * 0.5), winType: '💫 Small Win' };
        }

        return { winAmount: 0, winType: null };
    };

    if (!user) return null;

    return (
        <div className="page">
            <div className="page-content">
                {/* Header */}
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold text-gradient">Nổ Hũ</h1>
                </div>

                {/* Slot Grid */}
                <div className="game-display mb-4">
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
                        {grid.map((row, rowIndex) =>
                            row.map((symbol, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`slot-reel ${isSpinning ? 'animate-pulse' : ''}`}
                                >
                                    {symbol}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Win Display */}
                {lastWin && (
                    <div className="win-display text-center mb-4">
                        <div className="text-xl font-bold">{lastWin.type}</div>
                        <div className="text-2xl font-bold text-success">+{formatCurrency(lastWin.amount)}</div>
                    </div>
                )}

                {/* Bet Controls */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setBetAmount((prev) => Math.max(MIN_BET, prev - 5000))}
                                disabled={isSpinning}
                            >
                                -
                            </button>
                            <div className="text-center">
                                <div className="text-sm text-muted">Mức cược</div>
                                <div className="text-xl font-bold text-success">{formatCurrency(betAmount)}</div>
                            </div>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setBetAmount((prev) => Math.min(MAX_BET, prev + 5000))}
                                disabled={isSpinning}
                            >
                                +
                            </button>
                        </div>

                        <div className="grid grid-2 gap-3 mb-3">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={spin}
                                disabled={isSpinning}
                            >
                                {isSpinning ? '⏳' : '🎰'} QUAY
                            </button>
                            <button
                                className={autoSpin ? 'btn btn-danger btn-lg' : 'btn btn-ghost btn-lg'}
                                onClick={() => {
                                    setAutoSpin(!autoSpin);
                                    if (!autoSpin && !isSpinning) {
                                        spin();
                                    }
                                }}
                                disabled={isSpinning && !autoSpin}
                            >
                                {autoSpin ? '⏹️ DỪNG' : '🔄 AUTO'}
                            </button>
                        </div>

                        <button
                            onClick={() => setFastSpin(!fastSpin)}
                            className={fastSpin ? 'btn btn-gold btn-block' : 'btn btn-ghost btn-block'}
                        >
                            ⚡ Fast Spin {fastSpin ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>

                {/* History */}
                <div className="card">
                    <div className="card-compact">
                        <div className="text-sm text-muted mb-2">Lịch sử gần đây</div>
                        <div className="flex flex-col gap-2">
                            {history.length === 0 ? (
                                <span className="text-muted text-sm">Chưa có lịch sử</span>
                            ) : (
                                history.slice(0, 5).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm p-2" style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                                        <div className="flex gap-1">
                                            {item.grid[1].map((s, j) => (
                                                <span key={j}>{s}</span>
                                            ))}
                                        </div>
                                        <span className={item.win > 0 ? 'text-success' : 'text-muted'}>
                                            {item.win > 0 ? `+${formatCurrency(item.win)}` : 'Không trúng'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
