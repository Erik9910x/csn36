'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
    children: ReactNode;
    variant?: 'default' | 'gradient';
    glow?: boolean;
    className?: string;
}

export function GlassCard({
    children,
    variant = 'default',
    glow = false,
    className = '',
    ...props
}: GlassCardProps) {
    const baseClasses = 'rounded-2xl transition-all duration-300';

    const variantClasses = {
        default: 'glass-card',
        gradient: 'glass-card bg-gradient-to-br from-yellow-900/10 to-black/50',
    };

    const glowClass = glow ? 'glow-gold' : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className={`${baseClasses} ${variantClasses[variant]} ${glowClass} ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
}
