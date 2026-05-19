import { GitBranch, GitCommit, GitPullRequest, Shield, Users } from 'lucide-react';

const items = [
    { label: 'Review progress', value: '1 of 3 approved' },
    { label: 'Unresolved issues', value: '7' },
    { label: 'Risk level', value: 'Medium' },
    { label: 'Test coverage', value: '74%' },
    { label: 'CI status', value: 'Passing' },
];

export function ReviewSummary() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">Review Summary</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Merge readiness overview</p>
                </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.04]">
                {items.map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs text-neutral-500">{item.label}</span>
                        <span className="text-xs text-neutral-300">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
