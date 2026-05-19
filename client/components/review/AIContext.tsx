import { FileText, GitBranch, Shield, Zap } from 'lucide-react';

const contextItems = [
    { label: 'Referenced files', value: '4 files affected' },
    { label: 'Related APIs', value: '/api/scan, /api/auth' },
    { label: 'Affected modules', value: 'parser, validator, handler' },
    { label: 'Dependency impact', value: '2 packages affected' },
];

const suggestedActions = [
    'Review auth changes',
    'Inspect API validation',
    'Check missing tests',
    'Analyze dependency impact',
];

export function AIContext() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">AI Context</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Impact analysis for this PR</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-accent">
                    <Zap size={12} />
                    Analyzed
                </span>
            </div>
            <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.04] mb-4">
                {contextItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs text-neutral-500">{item.label}</span>
                        <span className="text-xs text-neutral-300">{item.value}</span>
                    </div>
                ))}
            </div>

            <p className="text-xs text-neutral-500 mb-2.5">Suggested actions</p>
            <div className="flex flex-wrap gap-1.5">
                {suggestedActions.map((action) => (
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
