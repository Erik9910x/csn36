'use client';

import Link from 'next/link';

const features = [
    { icon: '🎮', title: '5 Games', desc: 'Đa dạng trò chơi' },
    { icon: '💰', title: 'x1.95', desc: 'Tỷ lệ thắng cao' },
    { icon: '⚡', title: '24/7', desc: 'Hoạt động liên tục' },
    { icon: '🔒', title: 'An toàn', desc: 'Bảo mật tuyệt đối' },
];

export default function IntroductionPage() {
    return (
        <div className="page flex flex-col items-center justify-center p-6" style={{ minHeight: '100vh' }}>
            <div className="text-center mb-8">
                <div className="text-6xl mb-4">🎰</div>
                <h1 className="text-3xl font-bold text-gradient mb-2">OKVIP CASINO</h1>
                <p className="text-muted">Nền tảng game demo #1 Việt Nam</p>
            </div>

            <div className="grid grid-2 gap-4 mb-8" style={{ maxWidth: 400 }}>
                {features.map((f, i) => (
                    <div key={i} className="card text-center">
                        <div className="card-compact">
                            <div className="text-2xl mb-1">{f.icon}</div>
                            <div className="font-bold text-success">{f.title}</div>
                            <div className="text-xs text-muted">{f.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3" style={{ width: '100%', maxWidth: 320 }}>
                <Link href="/register">
                    <button className="btn btn-primary btn-lg btn-block">
                        🚀 Đăng ký ngay
                    </button>
                </Link>
                <Link href="/login">
                    <button className="btn btn-ghost btn-lg btn-block">
                        Đã có tài khoản? Đăng nhập
                    </button>
                </Link>
            </div>

            <p className="text-xs text-muted mt-8 text-center">
                ⚠️ Đây là game DEMO, không có giá trị tiền thật
            </p>
        </div>
    );
}
