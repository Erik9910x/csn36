
'use client';

export default function BauCuaPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Bầu Cua
            </h1>
            <div className="card p-12 text-center max-w-2xl border-cyan-500/30">
                <div className="text-6xl mb-6">🦀 🦞 🦌</div>
                <p className="text-xl text-gray-300 mb-8">
                    Trò chơi dân gian đang được cập nhật giao diện mới.
                    <br />
                    Vui lòng quay lại sau!
                </p>
                <div className="animate-pulse flex justify-center gap-2">
                    <span className="w-3 h-3 bg-cyan-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-cyan-500 rounded-full animation-delay-200"></span>
                    <span className="w-3 h-3 bg-cyan-500 rounded-full animation-delay-400"></span>
                </div>
            </div>
        </div>
    );
}
