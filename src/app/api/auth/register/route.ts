import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByUsername } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

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

        if (username.length < 3 || username.length > 20) {
            return NextResponse.json(
                { error: 'Username must be 3-20 characters' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if username exists
        const existingUser = getUserByUsername(username);
        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 409 }
            );
        }

        // Create user
        const userId = uuidv4();
        const passwordHash = await hashPassword(password);
        createUser(userId, username, passwordHash);

        return NextResponse.json(
            { message: 'Registration successful', userId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
