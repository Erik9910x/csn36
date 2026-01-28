'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            showToast('error', 'Vui lòng nhập đủ thông tin');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (res.ok) {
                login(data.user, data.token);
                showToast('success', 'Đăng nhập thành công!');
                router.push('/');
            } else {
                showToast('error', data.error || 'Đăng nhập thất bại');
            }
        } catch {
            showToast('error', 'Lỗi kết nối');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page flex flex-col items-center justify-center p-6" style={{ minHeight: '100vh' }}>
            <div className="text-center mb-6">
                <div className="text-5xl mb-3">🎰</div>
                <h1 className="text-2xl font-bold">Đăng nhập</h1>
                <p className="text-muted text-sm">Chào mừng trở lại!</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full" style={{ maxWidth: 360 }}>
                <div className="card mb-4">
                    <div className="card-body flex flex-col gap-4">
                        <div className="input-group">
                            <label className="input-label">Tên đăng nhập</label>
                            <input
                                type="text"
                                className="input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập username"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Mật khẩu</label>
                            <input
                                type="password"
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-block"
                    disabled={isLoading}
                >
                    {isLoading ? '⏳ Đang xử lý...' : '🔑 Đăng nhập'}
                </button>

                <div className="text-center mt-4">
                    <span className="text-muted text-sm">Chưa có tài khoản? </span>
                    <Link href="/register" className="text-success font-medium">
                        Đăng ký ngay
                    </Link>
                </div>
            </form>
        </div>
    );
}
