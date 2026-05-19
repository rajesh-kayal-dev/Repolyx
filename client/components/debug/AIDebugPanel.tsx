import { AlertTriangle, ArrowRight, FileText, Lightbulb, Zap } from 'lucide-react';

const suggestions = [
    'Inspect latest deployment',
    'Compare runtime traces',
    'Analyze auth failures',
    'Review API latency',
    'Find related commits',
];

export function AIDebugPanel() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">AI Debug Assistant</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Analysis of current incidents</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                    Active
                </span>
            </div>

            {/* AI Summary */}
            <div className="rounded-xl border border-white/[0.06] bg-amber-400/[0.03] p-4 mb-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/10 shrink-0">
                        <Lightbulb size={13} className="text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-neutral-200 mb-1">Probable root cause</p>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                            The deployment <span className="text-white font-mono">v2.4.1</span> increased database connection
                            usage without adjusting the pool limit. This caused the <span className="text-white font-mono">api-gateway</span>{' '}
                            to exhaust available connections, resulting in 502/504 timeouts on <span className="text-white font-mono">/api/scan</span>.
                        </p>
                        <div className="mt-3 flex items-center gap-3 text-xs">
                            <span className="text-red-400 flex items-center gap-1">
                                <AlertTriangle size={11} /> 3 services affected
                            </span>
                            <span className="text-accent flex items-center gap-1">
                                <FileText size={11} /> 2 files to review
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended fix */}
            <div className="rounded-xl border border-white/[0.06] bg-emerald-400/[0.03] p-4 mb-4">
                <p className="text-xs font-medium text-emerald-400 mb-1">Recommended fix</p>
                <p className="text-xs text-neutral-400">
                    Increase <span className="text-white font-mono">DB_POOL_MAX</span> from 20 to 50 and add connection retry
                    with exponential backoff in the API gateway middleware.
                </p>
            </div>

            {/* Actions */}
            <p className="text-xs text-neutral-500 mb-2.5">Investigation actions</p>
            <div className="flex flex-wrap gap-1.5">
                {suggestions.map((action) => (
                    <button
                        key={action}
                        type="button"
                        className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 hover:border-white/[0.1] transition-colors"
                    >
                        {action}
                    </button>
                ))}
            </div>
        </div>
    );
}
