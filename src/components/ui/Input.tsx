'use client';

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-400">
                    {label}
                </label>
            )}
            <input
                className={`input-glass w-full bg-black/50 border border-yellow-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none ${error ? 'border-red-500' : ''
                    } ${className}`}
                {...props}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
    );
}
