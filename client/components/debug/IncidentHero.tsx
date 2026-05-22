'use client';

import { AlertTriangle, Clock, Server, Shield, Users } from 'lucide-react';
import { DebugIncident } from '@/lib/types';

interface IncidentHeroProps {
    incident: DebugIncident;
    beginnerMode: boolean;
    onUpdateStatus: (status: string) => void;
}

const severityConfig = {
    critical: {
        label: 'Critical',
        badge: 'text-red-300 bg-red-400/10 border-red-400/20',
        glow: 'border-red-400/20 bg-red-400/[0.03]',
        dot: 'bg-red-400',
        icon: 'text-red-400',
    },
    high: {
        label: 'High',
        badge: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
        glow: 'border-amber-400/20 bg-amber-400/[0.03]',
        dot: 'bg-amber-400',
        icon: 'text-amber-400',
    },
    medium: {
        label: 'Medium',
        badge: 'text-accent bg-accent/10 border-accent/20',
        glow: 'border-accent/20 bg-accent/[0.02]',
        dot: 'bg-accent',
        icon: 'text-accent',
    },
    low: {
        label: 'Low',
        badge: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
        glow: 'border-emerald-400/20 bg-emerald-400/[0.02]',
        dot: 'bg-emerald-400',
        icon: 'text-emerald-400',
    },
};

const statusConfig = {
    investigating: { label: 'Investigating', next: 'identified', nextLabel: 'Mark as Identified' },
    identified: { label: 'Identified', next: 'monitoring', nextLabel: 'Start Monitoring' },
    monitoring: { label: 'Monitoring', next: 'resolved', nextLabel: 'Mark Resolved' },
    resolved: { label: 'Resolved', next: null, nextLabel: null },
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export function IncidentHero({ incident, beginnerMode, onUpdateStatus }: IncidentHeroProps) {
    const severity = severityConfig[incident.severity] || severityConfig.medium;
    const status = statusConfig[incident.status] || statusConfig.investigating;

    return (
        <div className={`rounded-xl border p-5 sm:p-6 ${severity.glow}`}>
            {/* Top row: severity + status badges */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${severity.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${severity.dot}`} />
                    {severity.label}
                </span>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-neutral-400">
                    {status.label}
                </span>
                {incident.deployVersion && (
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-mono text-neutral-400">
                        {incident.deployVersion}
                    </span>
                )}
            </div>

            {/* Main incident title */}
            <h2 className="text-xl sm:text-2xl font-semibold text-white leading-snug mb-2">
                {incident.title}
            </h2>

            {/* Impact statement */}
            {incident.impactStatement && (
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-4">
                    {incident.impactStatement}
                </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-4 flex-wrap text-xs text-neutral-500">
                {incident.service && (
                    <span className="flex items-center gap-1.5">
                        <Server size={12} />
                        {incident.service}
                    </span>
                )}
                {incident.errorRate && (
                    <span className="flex items-center gap-1.5">
                        <AlertTriangle size={12} />
                        {incident.errorRate} error rate
                    </span>
                )}
                {incident.affectedUsers && (
                    <span className="flex items-center gap-1.5">
                        <Users size={12} />
                        {incident.affectedUsers} affected
                    </span>
                )}
                <span className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {timeAgo(incident.createdAt)}
                </span>
            </div>

            {/* Status action */}
            {status.next && (
                <div className="mt-4 pt-4 border-t border-white/[0.04]">
                    <button
                        type="button"
                        onClick={() => onUpdateStatus(status.next!)}
                        className="text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
                    >
                        → {status.nextLabel}
                    </button>
                </div>
            )}
        </div>
    );
}
