
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { User, ERROR_CODES } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// FORCE V4 DATABASE - Cleanest Start
const DB_PATH = path.join(DATA_DIR, 'casino36_v4.db');
const db = new Database(DB_PATH);

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        balance INTEGER DEFAULT 10000000,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS promo_redemptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        code TEXT NOT NULL,
        amount INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, code)
    );
`);

export const createUser = (id: string, username: string, passwordHash: string): void => {
    const stmt = db.prepare('INSERT INTO users (id, username, password_hash, balance) VALUES (?, ?, ?, 10000000)');
    stmt.run(id, username, passwordHash);
};

export const getUserByUsername = (username: string): (User & { password_hash: string }) | undefined => {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
};

export const getUserById = (id: string): (User & { password_hash: string }) | undefined => {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
};

export const getUsedCodes = (userId: string): string[] => {
    const rows = db.prepare('SELECT code FROM promo_redemptions WHERE user_id = ?').all(userId) as { code: string }[];
    return rows.map(r => r.code);
};

export const processRedemption = (redemptionId: string, userId: string, code: string, amount: number): number => {
    const tx = db.transaction(() => {
        const existing = db.prepare('SELECT 1 FROM promo_redemptions WHERE user_id = ? AND code = ?').get(userId, code);
        if (existing) throw new Error(ERROR_CODES.ALREADY_USED);

        const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId) as { balance: number };
        if (!user) throw new Error(ERROR_CODES.USER_NOT_FOUND);

        const newBalance = (user.balance || 0) + amount;
        db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, userId);
        db.prepare('INSERT INTO promo_redemptions (id, user_id, code, amount) VALUES (?, ?, ?, ?)').run(redemptionId, userId, code, amount);

        return newBalance;
    });
    return tx();
};

export default db;
