
'use client';

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function Home() {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div className="text-center mt-20">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="text-center space-y-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    CASINO36 V3
                </h1>
                <p className="text-gray-400 text-lg">The Cleanest, Fastest Demo Casino</p>
            </header>

            {user ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card hover:border-emerald-500 cursor-pointer group">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎲</div>
                        <h3 className="text-xl font-bold mb-2">Tai Xiu</h3>
                        <p className="text-gray-400">Classic dice game. Coming soon.</p>
                    </div>
                    <Link href="/promotions" className="card hover:border-emerald-500 cursor-pointer group">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎁</div>
                        <h3 className="text-xl font-bold mb-2">Promotions</h3>
                        <p className="text-gray-400">Get free chips to play.</p>
                    </Link>
                </div>
            ) : (
                <div className="text-center p-12 card border-dashed">
                    <h2 className="text-2xl font-bold mb-4">Ready to play?</h2>
                    <div className="flex justify-center gap-4">
                        <Link href="/login" className="btn bg-gray-700 hover:bg-gray-600">Login</Link>
                        <Link href="/register" className="btn btn-primary">Create Account</Link>
                    </div>
                </div>
            )}
        </div>
    );
}
