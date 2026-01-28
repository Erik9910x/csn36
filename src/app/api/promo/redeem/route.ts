import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateBalance, hasRedeemedCode, redeemCode } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { PROMO_CODES, generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = getTokenFromHeader(authHeader);

        if (!token) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập' },
                { status: 401 }
            );
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json(
                { error: 'Token không hợp lệ' },
                { status: 401 }
            );
        }

        const { code } = await request.json();

        if (!code) {
            return NextResponse.json(
                { error: 'Vui lòng nhập mã khuyến mãi' },
                { status: 400 }
            );
        }

        const upperCode = code.toUpperCase().trim();
        const amount = PROMO_CODES[upperCode];

        if (!amount) {
            return NextResponse.json(
                { error: 'Mã khuyến mãi không tồn tại' },
                { status: 400 }
            );
        }

        // Check if already redeemed
        if (hasRedeemedCode(payload.userId, upperCode)) {
            return NextResponse.json(
                { error: 'Bạn đã sử dụng mã này rồi' },
                { status: 400 }
            );
        }

        // Get user and update balance
        const user = getUserById(payload.userId);
        if (!user) {
            return NextResponse.json(
                { error: 'Người dùng không tồn tại' },
                { status: 404 }
            );
        }

        const currentBalance = user.balance || 0;
        const newBalance = currentBalance + amount;
        updateBalance(payload.userId, newBalance);
        redeemCode(generateId(), payload.userId, upperCode, amount);

        return NextResponse.json({
            message: 'Nhận thưởng thành công!',
            amount,
            newBalance,
        });
    } catch (error) {
        console.error('Promo redeem error:', error);
        return NextResponse.json(
            { error: 'Lỗi hệ thống' },
            { status: 500 }
        );
    }
}
