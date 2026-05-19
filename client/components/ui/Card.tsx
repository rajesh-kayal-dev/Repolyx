import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    return (
        <div className={clsx('rounded-[28px] border border-white/10 bg-[#0c111a] p-6 shadow-soft', className)}>
            {children}
        </div>
    );
}
