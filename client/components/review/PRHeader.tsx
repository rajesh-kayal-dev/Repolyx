import { GitBranch, GitPullRequest, User } from 'lucide-react';

interface PRHeaderProps {
    title: string;
    branch: string;
    baseBranch: string;
    author: string;
    status: string;
    mergeReady: number;
}

export function PRHeader({ title, branch, baseBranch, author, status, mergeReady }: PRHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 mt-0.5">
                    <GitPullRequest size={16} className="text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold text-white">{title}</h1>
                    <div className="flex items-center gap-3 mt-0.5 text-sm text-neutral-500">
                        <span className="flex items-center gap-1.5">
                            <GitBranch size={14} />
                            <span className="text-neutral-400">{branch}</span>
                            <span className="text-neutral-600">→</span>
                            <span>{baseBranch}</span>
                        </span>
                        <span className="text-neutral-600">·</span>
                        <span className="flex items-center gap-1.5">
                            <User size={14} />
                            {author}
                        </span>
                        <span className="text-neutral-600">·</span>
                        <span className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${status === 'Open' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            {status}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-sm font-medium text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 transition-colors"
                >
                    Ask AI
                </button>
                <button
                    type="button"
                    className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-sm font-medium text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 transition-colors"
                >
                    Open diff
                </button>
                <button
                    type="button"
                    className="rounded-lg bg-emerald-400/10 px-4 py-1.5 text-sm font-medium text-emerald-400 hover:bg-emerald-400/20 transition-colors"
                >
                    Approve
                </button>
                <button
                    type="button"
                    className="rounded-lg bg-amber-400/10 px-4 py-1.5 text-sm font-medium text-amber-400 hover:bg-amber-400/20 transition-colors"
                >
                    Request changes
                </button>
            </div>
        </div>
    );
}
