'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, createContext, useContext, ReactNode } from 'react';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (type: Toast['type'], message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (type: Toast['type'], message: string, duration = 3000) => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, type, message, duration }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({
    toast,
    onRemove,
}: {
    toast: Toast;
    onRemove: (id: string) => void;
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration || 3000);
        return () => clearTimeout(timer);
    }, [toast, onRemove]);

    const colors = {
        success: 'from-green-500/20 to-green-600/20 border-green-500/50',
        error: 'from-red-500/20 to-red-600/20 border-red-500/50',
        info: 'from-blue-500/20 to-blue-600/20 border-blue-500/50',
        warning: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50',
    };

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`px-4 py-3 rounded-xl bg-gradient-to-r ${colors[toast.type]} border backdrop-blur-xl flex items-center gap-3 min-w-[280px] max-w-[400px]`}
        >
            <span className="text-xl">{icons[toast.type]}</span>
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-white/60 hover:text-white transition-colors"
            >
                ✕
            </button>
        </motion.div>
    );
};
