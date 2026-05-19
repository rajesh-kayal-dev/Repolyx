import { GitBranch, Layers, TerminalSquare, Users } from 'lucide-react';

const stats = [
    { label: 'Repositories', value: '12', icon: GitBranch, change: '+2 this week' },
    { label: 'Active Sessions', value: '4', icon: TerminalSquare, change: '2 queued' },
    { label: 'Open PRs', value: '8', icon: Layers, change: '3 ready for review' },
    { label: 'Team Members', value: '6', icon: Users, change: '2 online now' },
];

export function WorkspaceOverview() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-xl overflow-hidden border border-white/[0.04]">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div key={stat.label} className="bg-[#080b12] px-5 py-4">
                        <div className="flex items-center gap-2 text-neutral-500">
                            <Icon size={14} />
                            <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-white tracking-tight">{stat.value}</p>
                        <p className="mt-0.5 text-xs text-neutral-500">{stat.change}</p>
                    </div>
                );
            })}
        </div>
    );
}
