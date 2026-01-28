
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createUser, getUserByUsername } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || username.length < 3) {
            return NextResponse.json({ error: 'Username too short' }, { status: 400 });
        }
        if (!password || password.length < 6) {
            return NextResponse.json({ error: 'Password too short' }, { status: 400 });
        }

        const existing = getUserByUsername(username);
        if (existing) {
            return NextResponse.json({ error: 'Username taken' }, { status: 409 });
        }

        const userId = uuidv4();
        const hashed = await hashPassword(password);

        // This will create user with 10M default from our new DB logic
        createUser(userId, username, hashed);

        return NextResponse.json({ message: 'Success', userId }, { status: 201 });
    } catch (e) {
        console.error('Register API Error:', e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
