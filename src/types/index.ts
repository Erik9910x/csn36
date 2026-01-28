
export interface User {
    id: string;
    username: string;
    balance: number;
    created_at: string;
    // Optional because it might be fetched separately
    usedCodes?: string[];
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface ApiError {
    error: string;
}

export interface PromoRedemption {
    id: string;
    user_id: string;
    code: string;
    amount: number;
    created_at: string;
}

// Game Related Types
export type GameType = 'tai-xiu' | 'bau-cua' | 'lottery' | 'slot' | 'aviator';

export interface GameRound {
    id: string;
    game: GameType;
    round_number: number;
    result: string;
    hash: string;
    created_at: string;
}

export interface Bet {
    id: string;
    user_id: string;
    game: GameType;
    amount: number;
    bet_type: string;
    result: string; // 'WIN' | 'LOSE' | 'PENDING'
    profit: number;
    created_at: string;
}

export const ERROR_CODES = {
    USER_NOT_FOUND: 'User not found',
    INVALID_TOKEN: 'Invalid or expired token',
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    ALREADY_USED: 'Promo code already used',
    INVALID_CODE: 'Invalid promo code',
    SYSTEM_ERROR: 'System error',
} as const;
