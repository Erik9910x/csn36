
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createUser, getUserByUsername } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || username.length < 3) return NextResponse.json({ error: 'Username too short' }, { status: 400 });
        if (!password || password.length < 6) return NextResponse.json({ error: 'Password too short' }, { status: 400 });

        if (getUserByUsername(username)) {
            return NextResponse.json({ error: 'Username taken' }, { status: 409 });
        }

        const userId = uuidv4();
        createUser(userId, username, await hashPassword(password));

        return NextResponse.json({ message: 'Success', userId }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'System Error' }, { status: 500 });
    }
}
