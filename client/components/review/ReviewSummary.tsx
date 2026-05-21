import { Loader2, Sparkles } from 'lucide-react';

interface ReviewSummaryProps {
    review: {
        title: string;
        status: string;
        riskLevel: string | null;
        mergeReady: number;
        testCoverage: string | null;
        ciStatus: string | null;
        summary: string | null;
        files: any[];
        suggestions: any[];
    } | null;
    loading?: boolean;
    onAnalyze?: () => void;
}

export function ReviewSummary({ review, loading, onAnalyze }: ReviewSummaryProps) {
    if (loading) {
        return (
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-semibold text-white">Review Summary</h2>
                        <p className="text-xs text-neutral-500 mt-0.5">Analyzing...</p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-6">
                    <Loader2 size={18} className="text-accent animate-spin" />
                </div>
            </div>
        );
    }

    if (!review || review.status === 'pending') {
        return (
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-semibold text-white">Review Summary</h2>
                        <p className="text-xs text-neutral-500 mt-0.5">Run AI review to see summary</p>
                    </div>
                    {onAnalyze && (
                        <button onClick={onAnalyze} className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors">
                            <Sparkles size={13} />
                            Run Review
                        </button>
                    )}
                </div>
                <div className="rounded-xl border border-white/[0.06] divide-y divide-white/[0.04]">
                    {[{ label: 'Review progress', value: 'Not started' },
                      { label: 'Issues found', value: '—' },
                      { label: 'Risk level', value: '—' },
                      { label: 'Merge readiness', value: '—' },
                    ].map(item => (
                        <div key={item.label} className="flex items-center justify-between px-4 py-2">
                            <span className="text-xs text-neutral-500">{item.label}</span>
                            <span className="text-xs text-neutral-600">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const totalIssues = review.suggestions?.length || 0;
    const highIssues = review.suggestions?.filter((s: any) => s.severity === 'high').length || 0;
    const fileCount = review.files?.length || 0;

    const items = [
        { label: 'Files changed', value: `${fileCount}` },
        { label: 'Issues found', value: `${totalIssues}${highIssues > 0 ? ` (${highIssues} high)` : ''}` },
        { label: 'Risk level', value: review.riskLevel ? review.riskLevel.charAt(0).toUpperCase() + review.riskLevel.slice(1) : 'Unknown' },
        { label: 'Merge readiness', value: `${review.mergeReady || 0}%` },
        { label: 'CI status', value: review.ciStatus ? review.ciStatus.charAt(0).toUpperCase() + review.ciStatus.slice(1) : 'Unknown' },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-white">Review Summary</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">What this PR does</p>
                </div>
            </div>
            {review.summary && (
                <div className="rounded-xl border border-accent/15 bg-accent/[0.03] px-4 py-3 mb-4">
                    <p className="text-sm text-neutral-200 leading-relaxed">{review.summary}</p>
                </div>
            )}
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
