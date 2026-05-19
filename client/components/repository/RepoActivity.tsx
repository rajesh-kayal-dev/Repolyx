import { CheckCircle2, GitCommit, Info, RefreshCw, AlertTriangle } from 'lucide-react';

interface Activity {
    type: 'commit' | 'scan' | 'deploy' | 'alert' | 'info';
    title: string;
    detail: string;
    timestamp: string;
}

const activities: Activity[] = [
    { type: 'scan', title: 'Indexing completed', detail: 'Source tree and dependencies mapped', timestamp: '2m ago' },
    { type: 'commit', title: 'New commits', detail: '3 commits by jordan on main', timestamp: '15m ago' },
    { type: 'alert', title: 'Auth flow flagged', detail: 'OAuth redirect route needs audit', timestamp: '1h ago' },
    { type: 'deploy', title: 'Analysis updated', detail: 'Dependency graph regenerated', timestamp: '2h ago' },
    { type: 'info', title: 'Sync complete', detail: 'Branch state reconciled with upstream', timestamp: '3h ago' },
];

const typeConfig = {
    scan: { icon: CheckCircle2, class: 'text-emerald-400' },
    commit: { icon: GitCommit, class: 'text-accent' },
    deploy: { icon: RefreshCw, class: 'text-emerald-400' },
    alert: { icon: AlertTriangle, class: 'text-amber-400' },
    info: { icon: Info, class: 'text-neutral-400' },
};

export function RepoActivity() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">Activity</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Recent changes and updates</p>
                </div>
                <button
                    type="button"
                    className="text-xs font-medium text-accent hover:text-white transition-colors"
                >
                    View all
                </button>
            </div>
            <div className="space-y-px">
                {activities.map((activity, i) => {
                    const config = typeConfig[activity.type];
                    const Icon = config.icon;
                    return (
                        <div
                            key={i}
                            className="flex items-start gap-3 rounded-lg bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors"
                        >
                            <Icon size={13} className={`shrink-0 mt-0.5 ${config.class}`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-200">{activity.title}</p>
                                <p className="text-xs text-neutral-500 truncate">{activity.detail}</p>
                            </div>
                            <span className="shrink-0 text-[11px] text-neutral-500">{activity.timestamp}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
