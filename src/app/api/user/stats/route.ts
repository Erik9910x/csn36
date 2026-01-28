import { NextRequest, NextResponse } from 'next/server';
import { getTodayStats } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = getTokenFromHeader(authHeader);

        if (!token) {
            return NextResponse.json({ error: 'No token' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const stats = getTodayStats(payload.userId);

        return NextResponse.json({ stats });
    } catch (error) {
        console.error('Get stats error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
