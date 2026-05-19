import { AlertTriangle, CheckCircle2, FileText, GitCommit, GitPullRequest, Info, Layers, RefreshCw, Shield, ShieldAlert, TerminalSquare } from 'lucide-react';
import type { ActivityEvent } from '@/lib/types';

const typeConfig: Record<string, { icon: typeof Info; class: string }> = {
    scan: { icon: CheckCircle2, class: 'text-emerald-400' },
    analysis: { icon: Layers, class: 'text-accent' },
    pr: { icon: GitPullRequest, class: 'text-emerald-400' },
    security: { icon: ShieldAlert, class: 'text-red-400' },
    dependency: { icon: AlertTriangle, class: 'text-amber-400' },
    docs: { icon: FileText, class: 'text-accent' },
    debug: { icon: TerminalSquare, class: 'text-amber-400' },
    sync: { icon: RefreshCw, class: 'text-neutral-400' },
    auth: { icon: Shield, class: 'text-accent' },
};

interface ActivityFeedProps {
    events: ActivityEvent[];
}

const groups = [
    { label: 'Today', range: 'today' },
    { label: 'Yesterday', range: 'yesterday' },
    { label: 'Earlier this week', range: 'week' },
];

export function ActivityFeed({ events }: ActivityFeedProps) {
    return (
        <div>
            {groups.map((group) => {
                const groupEvents = events.filter((_, i) => {
                    if (group.range === 'today') return i < 3;
                    if (group.range === 'yesterday') return i >= 3 && i < 6;
                    return i >= 6;
                });
                if (groupEvents.length === 0) return null;

                return (
                    <div key={group.range} className="mb-6 last:mb-0">
                        <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{group.label}</h3>
                            <span className="h-px flex-1 bg-white/[0.04]" />
                        </div>
                        <div className="space-y-1">
                            {groupEvents.map((event) => {
                                const config = typeConfig[event.type] || { icon: Info, class: 'text-neutral-400' };
                                const Icon = config.icon;
                                return (
                                    <div
                                        key={event.id}
                                        className="flex items-start gap-3 rounded-lg px-4 py-3 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <Icon size={14} className={`shrink-0 mt-0.5 ${config.class}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm text-neutral-200">{event.title}</p>
                                                <span className="text-[11px] text-neutral-500">{event.repo}</span>
                                                {event.live && (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                                                )}
                                            </div>
                                            <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{event.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[11px] text-neutral-500">{event.timestamp}</span>
                                            {event.quickActions.length > 0 && (
                                                <button
                                                    type="button"
                                                    className="text-[11px] text-accent hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    View
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
