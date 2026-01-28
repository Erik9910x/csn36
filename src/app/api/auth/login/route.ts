
import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getUsedCodes } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        const user = getUserByUsername(username);
        if (!user || !(await comparePassword(password, user.password_hash))) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = generateToken(user);
        const usedCodes = getUsedCodes(user.id);

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                balance: user.balance,
                created_at: user.created_at,
                usedCodes
            }
        });
    } catch (e) {
        console.error('Login API Error:', e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
