import type { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-5 py-3 text-sm rounded-2xl',
};

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
    return (
        <button
            {...props}
            className={clsx(
                'inline-flex items-center justify-center font-medium transition duration-200',
                sizeStyles[size],
                variant === 'primary' && 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-glow',
                variant === 'secondary' && 'border border-white/10 bg-white/5 text-white hover:border-cyan-400 hover:bg-white/10',
                variant === 'outline' && 'border border-white/10 bg-transparent text-neutral-300 hover:border-cyan-400 hover:text-white',
                variant === 'ghost' && 'bg-transparent text-neutral-200 hover:text-white hover:bg-white/5',
                className
            )}
        />
    );
}
