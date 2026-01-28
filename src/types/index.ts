
export interface User {
    id: string;
    username: string;
    balance: number;
    created_at: string;
    usedCodes?: string[];
}

export interface AuthResponse {
    token: string;
    user: User;
}

export const ERROR_CODES = {
    USER_NOT_FOUND: 'User not found',
    INVALID_TOKEN: 'Invalid or expired token',
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    ALREADY_USED: 'Promo code already used',
    INVALID_CODE: 'Invalid promo code',
    SYSTEM_ERROR: 'System error',
} as const;
