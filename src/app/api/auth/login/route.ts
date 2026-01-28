import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getUsedCodes } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        // Validation
        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Find user
        const user = getUserByUsername(username);
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await comparePassword(password, user.password_hash);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Generate token
        const token = generateToken({ userId: user.id, username: user.username });

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                balance: user.balance,
                created_at: user.created_at,
                usedCodes: getUsedCodes(user.id),
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
