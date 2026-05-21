import { FileCode, AlertTriangle, Shield, GitMerge, Loader2 } from 'lucide-react';

interface InsightCardsProps {
    review: {
        files: any[];
        suggestions: any[];
        riskLevel: string | null;
        mergeReady: number;
        summary: string | null;
    } | null;
    analyzing?: boolean;
}

function getRiskColor(level: string | null): { bg: string; text: string; label: string } {
    switch (level) {
        case 'high': return { bg: 'bg-red-400/10', text: 'text-red-400', label: 'High Risk' };
        case 'medium': return { bg: 'bg-amber-400/10', text: 'text-amber-400', label: 'Medium Risk' };
        case 'low': return { bg: 'bg-emerald-400/10', text: 'text-emerald-400', label: 'Low Risk' };
        default: return { bg: 'bg-white/[0.04]', text: 'text-neutral-500', label: 'Not assessed' };
    }
}

function getMergeLabel(score: number): string {
    if (score >= 80) return 'Ready to merge';
    if (score >= 50) return 'Review carefully';
    if (score >= 30) return 'Changes needed';
    return 'Not ready';
}

function getMergeColor(score: number): string {
    if (score >= 80) return 'bg-emerald-400';
    if (score >= 50) return 'bg-amber-400';
    if (score >= 30) return 'bg-orange-400';
    return 'bg-red-400';
}

export function InsightCards({ review, analyzing }: InsightCardsProps) {
    if (analyzing) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                        <div className="flex items-center justify-center py-4">
                            <Loader2 size={16} className="text-accent animate-spin" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const isEmpty = !review || !review.files || review.files.length === 0;
    const files = review?.files || [];
    const suggestions = review?.suggestions || [];
    const totalAdditions = files.reduce((sum: number, f: any) => sum + (f.additions || 0), 0);
    const totalDeletions = files.reduce((sum: number, f: any) => sum + (f.deletions || 0), 0);
    const highCount = suggestions.filter((s: any) => s.severity === 'high').length;
    const riskColor = getRiskColor(review?.riskLevel || null);
    const mergeScore = review?.mergeReady ?? 0;

    const cards = [
        {
            icon: FileCode,
            color: 'text-accent',
            bg: 'bg-accent/10',
            label: 'What Changed',
            value: isEmpty ? '—' : `${files.length} file${files.length !== 1 ? 's' : ''}`,
            detail: isEmpty ? 'No changes to analyze' : (
                <span>{totalAdditions > 0 && <span className="text-emerald-400/70">+{totalAdditions} </span>}{totalDeletions > 0 && <span className="text-red-400/70">-{totalDeletions}</span>}</span>
            ),
        },
        {
            icon: Shield,
            color: riskColor.text,
            bg: riskColor.bg,
            label: 'Risk Level',
            value: isEmpty ? '—' : riskColor.label,
            detail: !isEmpty && highCount > 0 ? `${highCount} high-severity issue${highCount > 1 ? 's' : ''}` : !isEmpty ? 'No critical issues' : null,
        },
        {
            icon: AlertTriangle,
            color: suggestions.length > 0 ? 'text-amber-400' : 'text-emerald-400',
            bg: suggestions.length > 0 ? 'bg-amber-400/10' : 'bg-emerald-400/10',
            label: 'Issues Found',
            value: isEmpty ? '—' : `${suggestions.length}`,
            detail: isEmpty ? null : suggestions.length > 0 ? `${highCount} high, ${suggestions.length - highCount} other` : 'No issues detected',
        },
        {
            icon: GitMerge,
            color: mergeScore >= 80 ? 'text-emerald-400' : mergeScore >= 50 ? 'text-amber-400' : 'text-neutral-500',
            bg: mergeScore >= 80 ? 'bg-emerald-400/10' : mergeScore >= 50 ? 'bg-amber-400/10' : 'bg-white/[0.04]',
            label: 'Merge Readiness',
            value: isEmpty ? '—' : `${mergeScore}%`,
            detail: isEmpty ? null : (
                <div className="flex items-center gap-2">
                    <span>{getMergeLabel(mergeScore)}</span>
                    <div className="flex-1 max-w-[80px] h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${getMergeColor(mergeScore)}`} style={{ width: `${mergeScore}%` }} />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div key={card.label} className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4 hover:border-white/[0.10] transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.bg}`}>
                                <Icon size={13} className={card.color} />
                            </div>
                            <span className="text-xs font-medium text-neutral-500">{card.label}</span>
                        </div>
                        <p className="text-lg font-semibold text-white">{card.value}</p>
                        {card.detail && (
                            <div className="text-xs text-neutral-500 mt-1">{card.detail}</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
