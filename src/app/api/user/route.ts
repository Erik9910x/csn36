
import { NextRequest, NextResponse } from 'next/server';
import { getUserById, getUsedCodes } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const token = getTokenFromHeader(req.headers.get('Authorization'));
        const payload = token ? verifyToken(token) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = getUserById(payload.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                balance: user.balance,
                created_at: user.created_at,
                usedCodes: getUsedCodes(user.id)
            }
        });
    } catch (e) {
        console.error('User API Error:', e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
