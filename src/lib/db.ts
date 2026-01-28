
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { User, Bet, PromoRedemption, GameRound, ERROR_CODES } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// FORCE V3 DATABASE - Fresh Start
const DB_PATH = path.join(DATA_DIR, 'casino36_v3.db');
const db = new Database(DB_PATH);

// Initialize V3 Schema
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        balance INTEGER DEFAULT 10000000, -- 10M Default
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

    CREATE TABLE IF NOT EXISTS bets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        game TEXT NOT NULL,
        amount INTEGER NOT NULL,
        bet_type TEXT,
        result TEXT,
        profit INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`);

console.log(`[DB] Connected to V3 Database at ${DB_PATH}`);

// --- Typed Helpers ---

export const createUser = (id: string, username: string, passwordHash: string): void => {
  // Explicitly enforce 10M balance on create
  const stmt = db.prepare('INSERT INTO users (id, username, password_hash, balance) VALUES (?, ?, ?, 10000000)');
  try {
    stmt.run(id, username, passwordHash);
    console.log(`[DB] Created user ${username} with 10M`);
  } catch (e) {
    console.error('[DB] Create user failed', e);
    throw e;
  }
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

// --- Transactional Logic ---

export const processRedemption = (redemptionId: string, userId: string, code: string, amount: number): number => {
  const tx = db.transaction(() => {
    // 1. Check if used
    const existing = db.prepare('SELECT 1 FROM promo_redemptions WHERE user_id = ? AND code = ?').get(userId, code);
    if (existing) throw new Error(ERROR_CODES.ALREADY_USED);

    // 2. Get User & Verify
    const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId) as { balance: number };
    if (!user) throw new Error(ERROR_CODES.USER_NOT_FOUND);

    // 3. Update State
    const newBalance = (user.balance || 0) + amount;
    db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, userId);
    db.prepare('INSERT INTO promo_redemptions (id, user_id, code, amount) VALUES (?, ?, ?, ?)').run(redemptionId, userId, code, amount);

    return newBalance;
  });

  try {
    return tx();
  } catch (error) {
    console.error(`[DB] Redemption failed for ${userId} code ${code}:`, error);
    throw error;
  }
};

export default db;
