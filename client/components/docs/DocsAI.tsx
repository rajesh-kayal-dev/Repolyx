import { FileText, Sparkles, Zap } from 'lucide-react';

const quickActions = [
    'Generate API reference',
    'Summarize auth flow',
    'Create release notes',
    'Explain architecture',
];

export function DocsAI() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">AI Assistant</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Generate and improve documentation</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-accent">
                    <Zap size={12} />
                    Ready
                </span>
            </div>

            <div className="space-y-3">
                <p className="text-xs text-neutral-500">Quick actions</p>
                <div className="flex flex-wrap gap-1.5">
                    {quickActions.map((action) => (
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

            <div className="mt-4 rounded-lg bg-white/[0.02] px-4 py-3">
                <div className="flex items-start gap-3">
                    <Sparkles size={14} className="text-accent shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-medium text-neutral-200 mb-0.5">Current focus</p>
                        <p className="text-xs text-neutral-400">
                            Capturing repo architecture in one page with API routes and auth requirements.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
