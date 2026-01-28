
export const PROMO_CODES: Record<string, number> = {
    'CHAOMUNGTANTHU': 10_000_000,
    'VIP36CASINO': 36_000_000,
    'HAPPYNEWYEAR2026': 260_000_000,
    'TOIYEUTHANHHOA': 36_360_000,
    'GAMEVUIGIAITRI': 10_000_000,
};

export const formatCurrency = (amount: number | undefined | null): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export const formatShortCurrency = (amount: number | undefined | null): string => {
    if (!amount) return '0';
    if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1) + 'B';
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + 'M';
    if (amount >= 1_000) return (amount / 1_000).toFixed(0) + 'K';
    return amount.toString();
};

export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
