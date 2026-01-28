
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'v3-secret-key-replace-me';

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
    return jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

export const verifyToken = (token: string): JwtPayload | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded as JwtPayload;
    } catch (e) {
        return null;
    }
};

export const getTokenFromHeader = (header: string | null): string | null => {
    if (!header?.startsWith('Bearer ')) return null;
    return header.substring(7);
};
