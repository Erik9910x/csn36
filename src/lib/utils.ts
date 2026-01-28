// Promo codes configuration
export const PROMO_CODES: Record<string, number> = {
    'CHAOMUNGTANTHU': 10_000_000,
    'VIP36CASINO': 36_000_000,
    'HAPPYNEWYEAR2026': 260_000_000,
    'TOIYEUTHANHHOA': 36_360_000,
    'GAMEVUIGIAITRI': 10_000_000,
};

// Format number with Vietnamese style
export const formatCurrency = (amount: number): string => {
    if (amount === undefined || amount === null) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
};

// Format number with K/M suffix
export const formatShortCurrency = (amount: number): string => {
    if (amount === undefined || amount === null) return '0';
    if (amount >= 1_000_000_000) {
        return `${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (amount >= 1_000_000) {
        return `${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
        return `${(amount / 1_000).toFixed(0)}K`;
    }
    return amount.toString();
};

// Generate random hash for display
export const generateMD5Display = (): string => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
};

// Betting amounts presets
export const BET_AMOUNTS = [10_000, 100_000, 1_000_000, 10_000_000, 50_000_000];

// Game constants
export const ROUND_DURATION = 30; // seconds
export const PAYOUT_RATIO = 1.99;

// Dice game helpers
export const rollDice = (): [number, number, number] => {
    return [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
    ];
};

export const getDiceTotal = (dice: [number, number, number]): number => {
    return dice[0] + dice[1] + dice[2];
};

export const isTai = (total: number): boolean => total >= 11 && total <= 18;
export const isXiu = (total: number): boolean => total >= 3 && total <= 10;

// Bau Cua symbols
export const BAU_CUA_SYMBOLS = ['🦌', '🐅', '🦀', '🐟', '🐓', '🍐'];
export const BAU_CUA_NAMES = ['Nai', 'Hổ', 'Cua', 'Cá', 'Gà', 'Bầu'];

// Lottery helpers
export const generateLotteryNumber = (): string => {
    return Math.floor(Math.random() * 100000).toString().padStart(5, '0');
};

// Slot symbols
export const SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '🎰', '⭐', '🔔'];

// Aviator helpers
export const generateMultiplier = (): number => {
    // Weighted random for crash point
    const rand = Math.random();
    if (rand < 0.5) return 1 + Math.random() * 1.5; // 1.0x - 2.5x (50%)
    if (rand < 0.8) return 2.5 + Math.random() * 3; // 2.5x - 5.5x (30%)
    if (rand < 0.95) return 5.5 + Math.random() * 5; // 5.5x - 10.5x (15%)
    return 10.5 + Math.random() * 40; // 10.5x - 50.5x (5%)
};

// UUID generator
export const generateId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
