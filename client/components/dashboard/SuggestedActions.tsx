import { ArrowRight, GitPullRequest, RefreshCw, Search, Shield } from 'lucide-react';

const actions = [
    { label: 'Review PR risks', description: '3 PRs awaiting AI risk assessment', icon: GitPullRequest, priority: 'high' },
    { label: 'Inspect auth flow', description: 'OAuth redirect route needs verification', icon: Shield, priority: 'high' },
    { label: 'Run dependency sweep', description: '5 packages have new minor updates', icon: RefreshCw, priority: 'medium' },
    { label: 'Search codebase', description: 'Find patterns across repositories', icon: Search, priority: 'low' },
];

export function SuggestedActions() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">Suggested Actions</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Contextual next steps based on repository state</p>
                </div>
            </div>
            <div className="space-y-px">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.label}
                            type="button"
                            className="flex w-full items-center gap-3 rounded-lg bg-white/[0.02] px-4 py-3 text-left transition-colors hover:bg-white/[0.04] group"
                        >
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${action.priority === 'high' ? 'bg-accent/10 text-accent' : 'bg-white/[0.04] text-neutral-400'}`}>
                                <Icon size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">{action.label}</p>
                                <p className="text-xs text-neutral-500 truncate">{action.description}</p>
                            </div>
                            <ArrowRight size={14} className="shrink-0 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
