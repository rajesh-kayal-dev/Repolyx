'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Activity, Layers, FileText, ShieldAlert, AlertTriangle, Sparkles, TerminalSquare, GitBranch, ShieldCheck } from 'lucide-react';
import type { ActivityEvent } from '@/lib/types';

const iconMap: Record<string, React.ComponentType<{ size?: number | string }>> = {
    scan: Activity,
    analysis: Layers,
    pr: FileText,
    security: ShieldAlert,
    dependency: AlertTriangle,
    docs: Sparkles,
    debug: TerminalSquare,
    sync: GitBranch,
    auth: ShieldCheck,
};

const statusVariant = (status: ActivityEvent['status']) => {
    if (status === 'critical') return 'warning';
    if (status === 'warning') return 'warning';
    if (status === 'processing') return 'success';
    return 'secondary';
};

interface ActivityEventCardProps {
    event: ActivityEvent;
}

export function ActivityEventCard({ event }: ActivityEventCardProps) {
    const Icon = iconMap[event.type] || Activity;

    return (
        <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="group overflow-hidden rounded-3xl border border-white/10 bg-[#090b10] p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/20 hover:shadow-[0_25px_60px_rgba(10,204,255,0.08)]"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300">
                        <Icon size={18} />
                    </span>
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{event.repo}</p>
                        <h3 className="mt-2 text-lg text-white">{event.title}</h3>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant={statusVariant(event.status)}>{event.status === 'processing' ? 'In progress' : event.status}</Badge>
                    <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">{event.timestamp}</span>
                </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-neutral-300">{event.description}</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
                {event.details.map((detail) => (
                    <span key={detail} className="rounded-2xl border border-white/10 bg-[#05080d] p-3 text-left">
                        {detail}
                    </span>
                ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
                {event.quickActions.map((action) => (
                    <Button key={action} variant="ghost" className="h-10 rounded-2xl border border-white/10 px-4 text-xs uppercase tracking-[0.16em] text-white/80 hover:text-white">
                        {action}
                    </Button>
                ))}
            </div>
        </motion.article>
    );
}
