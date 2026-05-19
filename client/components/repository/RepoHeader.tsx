import { ChevronDown, GitBranch } from 'lucide-react';

interface RepoHeaderProps {
    name: string;
    branch: string;
    status: string;
}

export function RepoHeader({ name, branch, status }: RepoHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-lg font-semibold text-white">{name}</h1>
                    <div className="flex items-center gap-3 mt-0.5">
                        <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                            <GitBranch size={14} />
                            <span>{branch}</span>
                            <ChevronDown size={12} />
                        </div>
                        <span className="text-neutral-600">/</span>
                        <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span className="text-sm text-neutral-500">{status}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-sm font-medium text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 transition-colors"
                >
                    Run analysis
                </button>
                <button
                    type="button"
                    className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-sm font-medium text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 transition-colors"
                >
                    Ask AI
                </button>
                <button
                    type="button"
                    className="rounded-lg bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
                >
                    Generate docs
                </button>
            </div>
        </div>
    );
}
