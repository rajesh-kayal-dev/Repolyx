'use client';

import { AlertTriangle, CheckCircle2, GitCommit, Cpu, ArrowRight } from 'lucide-react';
import { DebugIncident, DebugTimelineEvent } from '@/lib/types';

interface InvestigationTimelineProps {
    incident: DebugIncident;
}

const typeConfig: Record<string, { icon: typeof GitCommit; dotClass: string; labelClass: string }> = {
    deploy: {
        icon: GitCommit,
        dotClass: 'bg-accent/20 border-accent/30',
        labelClass: 'text-accent',
    },
    failure: {
        icon: AlertTriangle,
        dotClass: 'bg-red-400/20 border-red-400/30',
        labelClass: 'text-red-400',
    },
    finding: {
        icon: CheckCircle2,
        dotClass: 'bg-emerald-400/20 border-emerald-400/30',
        labelClass: 'text-emerald-400',
    },
    event: {
        icon: Cpu,
        dotClass: 'bg-white/[0.04] border-white/[0.08]',
        labelClass: 'text-neutral-400',
    },
};

function formatTimestamp(ts: string) {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts; // already relative like "4 min ago"
    const now = Date.now();
    const diff = now - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function InvestigationTimeline({ incident }: InvestigationTimelineProps) {
    const events: DebugTimelineEvent[] = Array.isArray(incident.timelineEvents)
        ? incident.timelineEvents
        : [];

    if (events.length === 0) {
        return (
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-semibold text-white">Investigation Timeline</h2>
                        <p className="text-xs text-neutral-500 mt-0.5">Key events leading to this incident</p>
                    </div>
                </div>
                <p className="text-xs text-neutral-600 py-4 text-center">
                    No timeline events yet. Events are added automatically as AI investigates.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">Investigation Timeline</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Key events leading to this incident</p>
                </div>
                <span className="text-xs text-neutral-600">{events.length} events</span>
            </div>

            <div className="relative">
                {/* Vertical connector */}
                <div className="absolute left-[13px] top-3 bottom-3 w-px bg-white/[0.05]" />

                <div className="space-y-4">
                    {events.map((event, i) => {
                        const cfg = typeConfig[event.type] || typeConfig.event;
                        const Icon = cfg.icon;
                        return (
                            <div key={i} className="relative flex items-start gap-3 pl-1">
                                {/* Dot */}
                                <div className={`relative z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full border shrink-0 ${cfg.dotClass}`}>
                                    <Icon size={11} className={cfg.labelClass} />
                                </div>
                                {/* Content */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm font-medium ${cfg.labelClass}`}>
                                            {event.title}
                                        </p>
                                        <span className="text-[10px] text-neutral-600 shrink-0 pt-0.5">
                                            {formatTimestamp(event.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                                        {event.detail}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
