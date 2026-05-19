import { AlertTriangle, CheckCircle2, Lightbulb, Shield } from 'lucide-react';

interface Suggestion {
    type: 'risk' | 'quality' | 'test' | 'info';
    title: string;
    description: string;
    file: string;
    severity: 'high' | 'medium' | 'low';
}

const suggestions: Suggestion[] = [
    {
        type: 'risk',
        title: 'Missing input validation',
        description: 'The `parseInput` function does not handle malformed JSON. This could cause unhandled runtime errors in production.',
        file: 'src/parser.ts',
        severity: 'high',
    },
    {
        type: 'quality',
        title: 'Unused dependency detected',
        description: '`lodash` is imported but never used after the refactor. Removing it will reduce bundle size.',
        file: 'src/parser.ts',
        severity: 'low',
    },
    {
        type: 'test',
        title: 'Edge case not covered',
        description: 'The validator handles empty strings but missing tests for `null` and `undefined` inputs.',
        file: 'src/utils/validator.ts',
        severity: 'medium',
    },
    {
        type: 'info',
        title: 'API contract change detected',
        description: 'The handler response format changed. Ensure downstream consumers are updated.',
        file: 'src/api/handler.ts',
        severity: 'medium',
    },
];

const typeConfig = {
    risk: { icon: Shield, class: 'text-red-400 bg-red-400/10' },
    quality: { icon: Lightbulb, class: 'text-accent bg-accent/10' },
    test: { icon: AlertTriangle, class: 'text-amber-400 bg-amber-400/10' },
    info: { icon: CheckCircle2, class: 'text-emerald-400 bg-emerald-400/10' },
};

export function AISuggestions() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">AI Review</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">{suggestions.length} suggestions found across changed files</p>
                </div>
            </div>
            <div className="space-y-px">
                {suggestions.map((s, i) => {
                    const config = typeConfig[s.type];
                    const Icon = config.icon;
                    return (
                        <div key={i} className="rounded-lg bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors">
                            <div className="flex items-start gap-3">
                                <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 mt-0.5 ${config.class}`}>
                                    <Icon size={13} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-neutral-200">{s.title}</p>
                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${s.severity === 'high' ? 'text-red-400 bg-red-400/10' : s.severity === 'medium' ? 'text-amber-400 bg-amber-400/10' : 'text-neutral-500 bg-white/[0.04]'}`}>
                                            {s.severity}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-1">{s.description}</p>
                                    <p className="text-[11px] text-neutral-500 mt-1.5 font-mono">{s.file}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
