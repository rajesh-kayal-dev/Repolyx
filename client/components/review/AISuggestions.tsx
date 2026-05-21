import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Lightbulb, Shield, Loader2, ChevronDown, ChevronRight, FileText } from 'lucide-react';

interface Suggestion {
    id?: string;
    type: string;
    title: string;
    description: string;
    filePath: string | null;
    severity: string;
    codeSnippet?: string | null;
}

interface AISuggestionsProps {
    suggestions: Suggestion[];
    loading?: boolean;
}

const typeConfig: Record<string, { icon: any; class: string; label: string }> = {
    risk: { icon: Shield, class: 'text-red-400 bg-red-400/10', label: 'Risk' },
    quality: { icon: Lightbulb, class: 'text-accent bg-accent/10', label: 'Quality' },
    test: { icon: AlertTriangle, class: 'text-amber-400 bg-amber-400/10', label: 'Test' },
    info: { icon: CheckCircle2, class: 'text-emerald-400 bg-emerald-400/10', label: 'Info' },
};

export function AISuggestions({ suggestions, loading }: AISuggestionsProps) {
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

    if (loading) {
        return (
            <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-semibold text-white">AI Review</h2>
                        <p className="text-xs text-neutral-500 mt-0.5">Analyzing changes...</p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-10">
                    <Loader2 size={20} className="text-accent animate-spin" />
                </div>
            </div>
        );
    }

    if (!suggestions || suggestions.length === 0) {
        return null;
    }

    const toggleExpand = (idx: number) => {
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    const sorted = [...suggestions].sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return (order[a.severity as keyof typeof order] ?? 3) - (order[b.severity as keyof typeof order] ?? 3);
    });

    return (
        <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">AI Review</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">{suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} found across changed files</p>
                </div>
            </div>
            <div className="space-y-px">
                {sorted.map((s, i) => {
                    const config = typeConfig[s.type] || typeConfig.info;
                    const Icon = config.icon;
                    const isExpanded = expandedItems.has(i);
                    return (
                        <div key={s.id || i}>
                            <button
                                onClick={() => toggleExpand(i)}
                                className="w-full text-left rounded-lg bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors"
                            >
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
                                            <span className="text-[10px] text-neutral-500 bg-white/[0.04] px-1.5 py-0.5 rounded">{config.label}</span>
                                        </div>
                                        {s.filePath && (
                                            <p className="text-[11px] text-neutral-500 mt-1 font-mono flex items-center gap-1">
                                                <FileText size={10} />
                                                {s.filePath}
                                            </p>
                                        )}
                                    </div>
                                    <div className="shrink-0 mt-1">
                                        {isExpanded ? <ChevronDown size={13} className="text-neutral-600" /> : <ChevronRight size={13} className="text-neutral-600" />}
                                    </div>
                                </div>
                            </button>
                            {isExpanded && (
                                <div className="mx-4 mb-2 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                    <p className="text-xs text-neutral-300 leading-relaxed">{s.description}</p>
                                    {s.codeSnippet && (
                                        <pre className="mt-2 p-3 rounded-lg bg-black/40 border border-white/[0.04] text-[11px] text-neutral-300 font-mono overflow-x-auto whitespace-pre-wrap">{s.codeSnippet}</pre>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
