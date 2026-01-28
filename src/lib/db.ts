import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'v2_casino36.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    balance INTEGER DEFAULT 10000000,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
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

  CREATE TABLE IF NOT EXISTS promo_redemptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    code TEXT NOT NULL,
    amount INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, code)
  );

  CREATE TABLE IF NOT EXISTS game_rounds (
    id TEXT PRIMARY KEY,
    game TEXT NOT NULL,
    round_number INTEGER NOT NULL,
    result TEXT NOT NULL,
    hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;

// User operations
export const createUser = (id: string, username: string, passwordHash: string) => {
  const stmt = db.prepare('INSERT INTO users (id, username, password_hash, balance) VALUES (?, ?, ?, ?)');
  return stmt.run(id, username, passwordHash, 10000000);
};

export const getUserByUsername = (username: string) => {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username) as { id: string; username: string; password_hash: string; balance: number; created_at: string } | undefined;
};

export const getUserById = (id: string) => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as { id: string; username: string; password_hash: string; balance: number; created_at: string } | undefined;
};

export const updateBalance = (userId: string, newBalance: number) => {
  const stmt = db.prepare('UPDATE users SET balance = ? WHERE id = ?');
  return stmt.run(newBalance, userId);
};

// Bet operations
export const createBet = (id: string, userId: string, game: string, amount: number, betType: string, result: string, profit: number) => {
  const stmt = db.prepare('INSERT INTO bets (id, user_id, game, amount, bet_type, result, profit) VALUES (?, ?, ?, ?, ?, ?, ?)');
  return stmt.run(id, userId, game, amount, betType, result, profit);
};

export const getBetsByUser = (userId: string, limit = 50) => {
  const stmt = db.prepare('SELECT * FROM bets WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
  return stmt.all(userId, limit);
};

export const getTodayStats = (userId: string) => {
  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as total_bets,
      COALESCE(SUM(amount), 0) as total_wagered,
      COALESCE(SUM(CASE WHEN profit > 0 THEN profit ELSE 0 END), 0) as total_won,
      COALESCE(SUM(CASE WHEN profit < 0 THEN profit ELSE 0 END), 0) as total_lost
    FROM bets 
    WHERE user_id = ? AND date(created_at) = date('now')
  `);
  return stmt.get(userId) as { total_bets: number; total_wagered: number; total_won: number; total_lost: number };
};

// Promo operations
export const processRedemption = (redemptionId: string, userId: string, code: string, amount: number) => {
  const process = db.transaction(() => {
    // 1. Check strict existence
    const check = db.prepare('SELECT 1 FROM promo_redemptions WHERE user_id = ? AND code = ?').get(userId, code);
    if (check) throw new Error('ALREADY_USED');

    // 2. Get User
    const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId) as { balance: number };
    if (!user) throw new Error('USER_NOT_FOUND');

    // 3. Update Balance
    const newBalance = (user.balance || 0) + amount;
    db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, userId);

    // 4. Insert Record
    db.prepare('INSERT INTO promo_redemptions (id, user_id, code, amount) VALUES (?, ?, ?, ?)').run(redemptionId, userId, code, amount);

    return newBalance;
  });

  try {
    console.log(`[DB] Processing redemption: ${code} for ${userId}`);
    return process();
  } catch (error) {
    console.error('[DB] Redemption transaction failed:', error);
    throw error;
  }
};

export const hasRedeemedCode = (userId: string, code: string) => {
  const stmt = db.prepare('SELECT * FROM promo_redemptions WHERE user_id = ? AND code = ?');
  return stmt.get(userId, code) !== undefined;
};

export const getUsedCodes = (userId: string) => {
  const stmt = db.prepare('SELECT code FROM promo_redemptions WHERE user_id = ?');
  const rows = stmt.all(userId) as { code: string }[];
  return rows.map(r => r.code);
};

export const redeemCode = (id: string, userId: string, code: string, amount: number) => {
  const stmt = db.prepare('INSERT INTO promo_redemptions (id, user_id, code, amount) VALUES (?, ?, ?, ?)');
  return stmt.run(id, userId, code, amount);
};

// Game rounds
export const createGameRound = (id: string, game: string, roundNumber: number, result: string, hash: string) => {
  const stmt = db.prepare('INSERT INTO game_rounds (id, game, round_number, result, hash) VALUES (?, ?, ?, ?, ?)');
  return stmt.run(id, game, roundNumber, result, hash);
};

export const getRecentRounds = (game: string, limit = 20) => {
  const stmt = db.prepare('SELECT * FROM game_rounds WHERE game = ? ORDER BY created_at DESC LIMIT ?');
  return stmt.all(game, limit);
};
