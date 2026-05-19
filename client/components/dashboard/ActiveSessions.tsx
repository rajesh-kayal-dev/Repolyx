import { AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';

interface Session {
    title: string;
    repo: string;
    status: 'processing' | 'running' | 'queued' | 'completed';
    detail: string;
}

const sessions: Session[] = [
    { title: 'Embedding pipeline', repo: 'repolyx/api', status: 'processing', detail: 'Vector store ingestion' },
    { title: 'PR risk scan', repo: 'repolyx/ui', status: 'running', detail: 'Security & tests validation' },
    { title: 'Architecture mapping', repo: 'repolyx/cli', status: 'queued', detail: 'API dependency graph' },
    { title: 'Dependency audit', repo: 'repolyx/api', status: 'completed', detail: '5 packages outdated' },
];

const statusConfig = {
    processing: { icon: Loader2, class: 'text-accent', label: 'Processing' },
    running: { icon: Loader2, class: 'text-emerald-400', label: 'Running' },
    queued: { icon: Clock, class: 'text-neutral-500', label: 'Queued' },
    completed: { icon: CheckCircle2, class: 'text-emerald-400', label: 'Completed' },
};

export function ActiveSessions() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">Active AI Sessions</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Current analysis tasks across repositories</p>
                </div>
                <button
                    type="button"
                    className="text-xs font-medium text-accent hover:text-white transition-colors"
                >
                    View all
                </button>
            </div>
            <div className="space-y-px">
                {sessions.map((session) => {
                    const config = statusConfig[session.status];
                    const Icon = config.icon;
                    return (
                        <div
                            key={session.title}
                            className="flex items-center gap-4 rounded-lg bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors"
                        >
                            <Icon size={14} className={`shrink-0 ${config.class} ${session.status === 'running' || session.status === 'processing' ? 'animate-spin' : ''}`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-200 truncate">{session.title}</p>
                                <p className="text-xs text-neutral-500 truncate">{session.repo} &middot; {session.detail}</p>
                            </div>
                            <span className={`shrink-0 text-[11px] font-medium ${config.class}`}>{config.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
