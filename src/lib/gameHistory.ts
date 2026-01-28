// Game history storage utilities
const HISTORY_KEYS = {
    'tai-xiu': 'casino36_taixiu_history',
    'bau-cua': 'casino36_baucua_history',
    'lottery': 'casino36_lottery_history',
    'slot': 'casino36_slot_history',
    'aviator': 'casino36_aviator_history',
};

export type GameType = keyof typeof HISTORY_KEYS;

export function saveGameHistory<T>(game: GameType, history: T[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(HISTORY_KEYS[game], JSON.stringify(history.slice(0, 50)));
    } catch {
        // Storage full or unavailable
    }
}

export function loadGameHistory<T>(game: GameType): T[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(HISTORY_KEYS[game]);
        if (stored) {
            return JSON.parse(stored) as T[];
        }
    } catch {
        // Parse error
    }
    return [];
}

export function clearGameHistory(game: GameType): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(HISTORY_KEYS[game]);
    } catch {
        // Storage unavailable
    }
}
