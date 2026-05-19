import { GitBranch } from 'lucide-react';

interface Repo {
    name: string;
    language: string;
    branch: string;
    status: 'healthy' | 'warning' | 'error';
    lastActivity: string;
}

const repos: Repo[] = [
    { name: 'repolyx/cli', language: 'TypeScript', branch: 'main', status: 'healthy', lastActivity: '2m ago' },
    { name: 'repolyx/api', language: 'Node.js', branch: 'develop', status: 'warning', lastActivity: '15m ago' },
    { name: 'repolyx/ui', language: 'React', branch: 'main', status: 'healthy', lastActivity: '1h ago' },
    { name: 'repolyx/docs', language: 'MDX', branch: 'main', status: 'healthy', lastActivity: '3h ago' },
];

const statusColors = {
    healthy: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-red-400',
};

export function RepoHealth() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">Repository Health</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Status overview of monitored repositories</p>
                </div>
                <button
                    type="button"
                    className="text-xs font-medium text-accent hover:text-white transition-colors"
                >
                    Manage repos
                </button>
            </div>
            <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/[0.04]">
                            <th className="text-left px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500">Repository</th>
                            <th className="text-left px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500 hidden sm:table-cell">Branch</th>
                            <th className="text-left px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500">Status</th>
                            <th className="text-right px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500 hidden sm:table-cell">Activity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {repos.map((repo) => (
                            <tr key={repo.name} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <GitBranch size={14} className="text-neutral-500 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-neutral-200">{repo.name}</p>
                                            <p className="text-xs text-neutral-500">{repo.language}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 hidden sm:table-cell">
                                    <span className="text-sm text-neutral-400">{repo.branch}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`h-1.5 w-1.5 rounded-full ${statusColors[repo.status]}`} />
                                        <span className="text-sm text-neutral-400 capitalize">{repo.status}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right hidden sm:table-cell">
                                    <span className="text-sm text-neutral-500">{repo.lastActivity}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
