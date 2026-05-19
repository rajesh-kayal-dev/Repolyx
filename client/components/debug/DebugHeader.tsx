import { ChevronDown, GitBranch, Search, TerminalSquare } from 'lucide-react';

export function DebugHeader() {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10">
                    <TerminalSquare size={16} className="text-amber-400" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold text-white">Debug Assistant</h1>
                    <div className="flex items-center gap-3 text-sm text-neutral-500 mt-0.5">
                        <span className="flex items-center gap-1.5">
                            <GitBranch size={14} />
                            repolyx/api
                            <ChevronDown size={12} />
                        </span>
                        <span className="text-neutral-600">·</span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            production
                        </span>
                        <span className="text-neutral-600">·</span>
                        <span>2 active incidents</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                    <input
                        type="search"
                        placeholder="Search logs..."
                        className="w-40 rounded-lg border border-white/[0.06] bg-white/[0.03] py-1.5 pl-8 pr-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/[0.1] transition-colors"
                    />
                </div>
                <button
                    type="button"
                    className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 transition-colors"
                >
                    Start investigation
                </button>
                <button
                    type="button"
                    className="rounded-lg bg-amber-400/10 px-3 py-1.5 text-sm font-medium text-amber-400 hover:bg-amber-400/20 transition-colors"
                >
                    Explain error
                </button>
            </div>
        </div>
    );
}
