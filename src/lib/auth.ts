
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = 'v4-nuclear-launch-codes';

interface JwtPayload {
    userId: string;
    username: string;
}

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};

export const generateToken = (user: { id: string, username: string }): string => {
    return jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
        return null;
    }
};

export const getTokenFromHeader = (header: string | null): string | null => {
    if (!header?.startsWith('Bearer ')) return null;
    return header.substring(7);
};
