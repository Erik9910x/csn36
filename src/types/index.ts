export interface User {
    id: string;
    username: string;
    balance: number;
    created_at: string;
    usedCodes?: string[];
}

export interface Bet {
    id: string;
    user_id: string;
    game: string;
    amount: number;
    bet_type: string;
    result: string;
    profit: number;
    created_at: string;
}

export interface GameRound {
    id: string;
    game: string;
    round_number: number;
    result: string;
    hash: string;
    created_at: string;
}

export interface PromoRedemption {
    id: string;
    user_id: string;
    code: string;
    amount: number;
    created_at: string;
}

export interface TodayStats {
    total_bets: number;
    total_wagered: number;
    total_won: number;
    total_lost: number;
}

export type GameType = 'tai-xiu' | 'bau-cua' | 'lottery' | 'slot' | 'aviator';

export interface BetPlacement {
    amount: number;
    betType: string;
}
