import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateBalance, createBet } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { generateId, PAYOUT_RATIO } from '@/lib/utils';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = getTokenFromHeader(authHeader);

        if (!token) {
            return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
        }

        const { game, amount, betType, result, isWin } = await request.json();

        if (!game || !amount || amount <= 0 || !betType) {
            return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
        }

        const user = getUserById(payload.userId);
        if (!user) {
            return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 });
        }

        if (user.balance < amount) {
            return NextResponse.json({ error: 'Số dư không đủ' }, { status: 400 });
        }

        // Calculate profit/loss
        // Win: get back bet + profit (amount * 0.99)
        // Lose: lose entire bet
        let profit: number;
        let newBalance: number;

        if (isWin) {
            // Win: profit = amount * (payout - 1) = amount * 0.99
            profit = Math.floor(amount * (PAYOUT_RATIO - 1));
            newBalance = user.balance + profit;
        } else {
            // Lose: lose the bet amount
            profit = -amount;
            newBalance = user.balance - amount;
        }

        // Update balance in database
        updateBalance(payload.userId, newBalance);

        // Create bet record
        createBet(
            generateId(),
            payload.userId,
            game,
            amount,
            betType,
            result,
            profit
        );

        return NextResponse.json({
            success: true,
            isWin,
            profit,
            newBalance,
            betAmount: amount,
        });
    } catch (error) {
        console.error('Place bet error:', error);
        return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
    }
}
