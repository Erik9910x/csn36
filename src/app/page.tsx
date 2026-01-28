
'use client';

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

const GAMES = [
    {
        id: 'tai-xiu',
        name: 'Tài Xỉu',
        desc: 'Dự đoán kết quả 3 viên xúc xắc',
        icon: '🎲',
        color: 'from-red-500 to-orange-500',
        active: true
    },
    {
        id: 'bau-cua',
        name: 'Bầu Cua',
        desc: 'Trò chơi dân gian Việt Nam',
        icon: '🦀',
        color: 'from-blue-500 to-cyan-500',
        active: true
    },
    {
        id: 'xoc-dia',
        name: 'Xóc Đĩa',
        desc: 'Chẵn lẻ kịch tính',
        icon: '⚪',
        color: 'from-purple-500 to-pink-500',
        active: true
    },
    {
        id: 'slot',
        name: 'Nổ Hũ',
        desc: 'Quay hũ trúng thưởng lớn',
        icon: '🎰',
        color: 'from-yellow-400 to-orange-500',
        active: true
    },
    {
        id: 'aviator',
        name: 'Bắn Cá',
        desc: 'Khám phá đại dương',
        icon: '🐟',
        color: 'from-emerald-400 to-teal-500',
        active: true
    }
];

export default function Home() {
    const { user, isLoading } = useAuth();

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="space-y-12 animate-fade-in">
            {/* Hero Section */}
            <section className="text-center space-y-6 pt-10">
                <h1 className="text-6xl font-extrabold tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                        SÂN CHƠI ĐẲNG CẤP
                    </span>
                    <br />
                    <span className="text-white text-5xl mt-2 block">CHÂU Á 2026</span>
                </h1>
                <p className="text-gray-400 text-xl max-w-2xl mx-auto">
                    Trải nghiệm đỉnh cao với hệ thống bảo mật tuyệt đối, nạp rút tự động và tỷ lệ cược hấp dẫn nhất thị trường.
                </p>

                {!user && (
                    <div className="flex justify-center gap-6 mt-8">
                        <Link href="/register" className="btn btn-primary text-lg px-8 py-4 shadow-glow">
                            THAM GIA NGAY
                        </Link>
                        <Link href="/login" className="btn btn-ghost text-lg px-8 py-4">
                            CHƠI THỬ
                        </Link>
                    </div>
                )}
            </section>

            {/* Game Grid */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <span className="text-emerald-400">🔥</span>
                        Trò Chơi Hot
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {GAMES.map((game) => (
                        <Link
                            href={`/games/${game.id}`}
                            key={game.id}
                            className="group relative overflow-hidden rounded-2xl bg-[#1c2128] border border-[#30363d] p-1 transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/20"
                        >
                            {/* Gradient Background Effect */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                            <div className="relative h-48 bg-[#0d1117] rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                                <span className="text-6xl transform group-hover:scale-125 transition-transform duration-300">{game.icon}</span>
                            </div>

                            <div className="p-4">
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                                    {game.name}
                                </h3>
                                <p className="text-sm text-gray-500">{game.desc}</p>
                                <div className="mt-4 w-full py-2 rounded-lg bg-[#21262d] text-center text-sm font-bold text-gray-300 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                    CHƠI NGAY
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
