'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps {
    variant?: 'primary' | 'gold' | 'glass' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: ReactNode;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
}

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    children,
    className = '',
    disabled,
    type = 'button',
    onClick,
}: ButtonProps) {
    const baseClasses = 'font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-400 shadow-lg shadow-yellow-500/20',
        gold: 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black hover:shadow-lg hover:shadow-yellow-500/40 font-black',
        glass: 'glass text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-500/10',
        danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/20',
        success: 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-500/20',
    };

    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <motion.button
            type={type}
            whileHover={!disabled ? { scale: 1.02, y: -1 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={disabled || loading}
            onClick={onClick}
        >
            {loading ? (
                <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    ⏳
                </motion.span>
            ) : (
                children
            )}
        </motion.button>
    );
}
