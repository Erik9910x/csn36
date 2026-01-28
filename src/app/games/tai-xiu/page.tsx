
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function TaiXiuPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Tài Xỉu
            </h1>
            <div className="card p-12 text-center max-w-2xl border-orange-500/30">
                <div className="text-6xl mb-6">🎲 🎲 🎲</div>
                <p className="text-xl text-gray-300 mb-8">
                    Hệ thống đang được nâng cấp phiên bản <b>V4 Premium</b>.
                    <br />
                    Trò chơi sẽ quay trở lại trong ít phút nữa!
                </p>
                <div className="animate-pulse flex justify-center gap-2">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-orange-500 rounded-full animation-delay-200"></span>
                    <span className="w-3 h-3 bg-orange-500 rounded-full animation-delay-400"></span>
                </div>
            </div>
        </div>
    );
}
