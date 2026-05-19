import { ChevronDown, FileText, GitBranch, Search } from 'lucide-react';

export function DocsHeader() {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                    <FileText size={16} className="text-accent" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold text-white">Documentation</h1>
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mt-0.5">
                        <span className="flex items-center gap-1.5">
                            <GitBranch size={14} />
                            repolyx/cli
                            <ChevronDown size={12} />
                        </span>
                        <span className="text-neutral-600">·</span>
                        <span>main</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                    <input
                        type="search"
                        placeholder="Search docs..."
                        className="w-40 rounded-lg border border-white/[0.06] bg-white/[0.03] py-1.5 pl-8 pr-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/[0.1] transition-colors"
                    />
                </div>
                <button
                    type="button"
                    className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 transition-colors"
                >
                    Export MD
                </button>
                <button
                    type="button"
                    className="rounded-lg bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
                >
                    Generate docs
                </button>
            </div>
        </div>
    );
}
