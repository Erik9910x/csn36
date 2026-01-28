'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password || !confirmPassword) {
            showToast('error', 'Vui lòng nhập đủ thông tin');
            return;
        }

        if (password !== confirmPassword) {
            showToast('error', 'Mật khẩu không khớp');
            return;
        }

        if (password.length < 4) {
            showToast('error', 'Mật khẩu tối thiểu 4 ký tự');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
                showToast('success', 'Đăng ký thành công!');
                setTimeout(() => router.push('/login'), 2000);
            } else {
                showToast('error', data.error || 'Đăng ký thất bại');
            }
        } catch {
            showToast('error', 'Lỗi kết nối');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="page flex flex-col items-center justify-center p-6" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-2xl font-bold text-success mb-2">Đăng ký thành công!</h1>
                    <p className="text-muted">Đang chuyển đến trang đăng nhập...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page flex flex-col items-center justify-center p-6" style={{ minHeight: '100vh' }}>
            <div className="text-center mb-6">
                <div className="text-5xl mb-3">🎰</div>
                <h1 className="text-2xl font-bold">Đăng ký</h1>
                <p className="text-muted text-sm">Tạo tài khoản mới</p>
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
                                placeholder="Tối thiểu 4 ký tự"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                className="input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-block"
                    disabled={isLoading}
                >
                    {isLoading ? '⏳ Đang xử lý...' : '🚀 Đăng ký'}
                </button>

                <div className="text-center mt-4">
                    <span className="text-muted text-sm">Đã có tài khoản? </span>
                    <Link href="/login" className="text-success font-medium">
                        Đăng nhập
                    </Link>
                </div>

                <p className="text-xs text-muted mt-4 text-center">
                    Nhận ngay 1,000,000đ khi đăng ký thành công!
                </p>
            </form>
        </div>
    );
}
