import { CheckCircle2, GitCommit, Info, RefreshCw, AlertTriangle } from 'lucide-react';

interface Activity {
    type: 'commit' | 'scan' | 'deploy' | 'alert' | 'info';
    title: string;
    detail: string;
    timestamp: string;
}

const activities: Activity[] = [
    { type: 'scan', title: 'Security scan completed', detail: 'repolyx/api — no critical vulnerabilities found', timestamp: '12 min ago' },
    { type: 'commit', title: 'New commits pushed', detail: 'repolyx/cli — 3 commits by jordan', timestamp: '28 min ago' },
    { type: 'alert', title: 'Health alert resolved', detail: 'UI repo memory cache drift corrected', timestamp: '1h ago' },
    { type: 'deploy', title: 'Deployment succeeded', detail: 'repolyx/api → staging (v2.4.1)', timestamp: '2h ago' },
    { type: 'info', title: 'Dependency audit', detail: '5 packages have new minor versions available', timestamp: '3h ago' },
];

const typeConfig = {
    scan: { icon: CheckCircle2, class: 'text-emerald-400 bg-emerald-400/10' },
    commit: { icon: GitCommit, class: 'text-accent bg-accent/10' },
    deploy: { icon: RefreshCw, class: 'text-emerald-400 bg-emerald-400/10' },
    alert: { icon: AlertTriangle, class: 'text-amber-400 bg-amber-400/10' },
    info: { icon: Info, class: 'text-neutral-400 bg-white/[0.04]' },
};

export function ActivityFeed() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Latest events across your workspace</p>
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
                            <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 mt-0.5 ${config.class}`}>
                                <Icon size={13} />
                            </div>
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
