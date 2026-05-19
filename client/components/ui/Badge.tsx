import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'muted';
    className?: string;
}

const badgeStyles: Record<string, string> = {
    default: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
    secondary: 'bg-white/5 text-neutral-300 border border-white/10',
    outline: 'border border-white/10 bg-transparent text-neutral-400',
    success: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    muted: 'bg-white/5 text-neutral-300 border border-white/10'
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
    return (
        <span className={clsx('inline-flex rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]', badgeStyles[variant], className)}>
            {children}
        </span>
    );
}
