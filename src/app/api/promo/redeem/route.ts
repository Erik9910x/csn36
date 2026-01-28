
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { processRedemption } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { PROMO_CODES } from '@/lib/utils';
import { ERROR_CODES } from '@/types';

export async function POST(req: NextRequest) {
    try {
        const token = getTokenFromHeader(req.headers.get('Authorization'));
        const payload = token ? verifyToken(token) : null;

        if (!payload) return NextResponse.json({ error: ERROR_CODES.INVALID_TOKEN }, { status: 401 });

        const body = await req.json();
        const code = body.code?.toUpperCase()?.trim();
        const amount = PROMO_CODES[code];

        if (!amount) return NextResponse.json({ error: ERROR_CODES.INVALID_CODE }, { status: 400 });

        try {
            const newBalance = processRedemption(uuidv4(), payload.userId, code, amount);
            return NextResponse.json({ success: true, message: 'Redeemed', amount, newBalance });
        } catch (err: any) {
            if (err.message === ERROR_CODES.ALREADY_USED) return NextResponse.json({ error: 'Code already used' }, { status: 400 });
            throw err;
        }
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'System Error' }, { status: 500 });
    }
}
