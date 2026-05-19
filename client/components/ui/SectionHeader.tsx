import type { ReactNode } from 'react';

interface SectionHeaderProps {
    eyebrow: string;
    title: string;
    description: string;
    children?: ReactNode;
}

export function SectionHeader({ eyebrow, title, description, children }: SectionHeaderProps) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.4em] text-cyan-400 font-orbitron">{eyebrow}</p>
                <h2 className="text-3xl font-orbitron uppercase tracking-tight text-white">{title}</h2>
            </div>
            {children ? <div>{children}</div> : <p className="max-w-xl text-sm text-neutral-500 uppercase tracking-[0.2em]">{description}</p>}
        </div>
    );
}
