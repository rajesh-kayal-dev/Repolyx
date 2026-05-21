import { FileText, Shield, AlertTriangle, GitMerge, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { MarkdownPreview } from '@/components/repository/MarkdownPreview';

interface AIReportProps {
    review: {
        report: string | null;
        summary: string | null;
        riskLevel: string | null;
        mergeReady: number;
        files: any[];
        suggestions: any[];
        testCoverage: string | null;
        ciStatus: string | null;
    } | null;
    analyzing?: boolean;
}

function categorizeFiles(files: any[]) {
    const cats: Record<string, number> = {};
    files.forEach(f => {
        const p = f.path || '';
        if (/\.(tsx|jsx|css|scss|sass)$/i.test(p) || /^(src|app|components)\//.test(p)) cats['Frontend'] = (cats['Frontend'] || 0) + 1;
        else if (/\.(js|ts|py|go|rb|java|rs|php)$/i.test(p) || /^(server|api|controllers?|services?|routes|lib|utils?)\//.test(p)) cats['Backend'] = (cats['Backend'] || 0) + 1;
        else if (/\.(json|ya?ml|toml|env\w*)$/i.test(p) || /^config\//.test(p)) cats['Config'] = (cats['Config'] || 0) + 1;
        else if (/\.(md|mdx)$/i.test(p) || /^docs\//.test(p)) cats['Docs'] = (cats['Docs'] || 0) + 1;
        else cats['Other'] = (cats['Other'] || 0) + 1;
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
}

function getMergeAdvice(score: number): string {
    if (score >= 80) return 'This PR looks good. Address any minor suggestions at your convenience before merging.';
    if (score >= 50) return 'Some moderate issues were found. Review the suggestions before merging.';
    if (score >= 30) return 'Several issues need attention before this PR is ready.';
    return 'Critical issues need to be fixed before merging.';
}

function FallbackReport({ review }: { review: NonNullable<AIReportProps['review']> }) {
    const files = review.files || [];
    const suggestions = review.suggestions || [];
    const totalAdditions = files.reduce((s: number, f: any) => s + (f.additions || 0), 0);
    const totalDeletions = files.reduce((s: number, f: any) => s + (f.deletions || 0), 0);
    const categories = categorizeFiles(files);
    const highIssues = suggestions.filter((s: any) => s.severity === 'high');
    const mediumIssues = suggestions.filter((s: any) => s.severity === 'medium');

    const riskColor = review.riskLevel === 'high' ? 'text-red-400' : review.riskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400';
    const riskLabel = review.riskLevel ? `${review.riskLevel.charAt(0).toUpperCase() + review.riskLevel.slice(1)} risk` : 'Not assessed';
    const mergeRecommendation = review.mergeReady >= 80 ? 'Ready to merge' : review.mergeReady >= 50 ? 'Review before merging' : review.mergeReady >= 30 ? 'Changes needed' : 'Not ready';

    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-white/[0.06] p-3.5">
                <div className="flex items-center gap-2 mb-2">
                    <FileText size={13} className="text-neutral-500" />
                    <span className="text-xs font-medium text-neutral-300">What changed</span>
                </div>
                {review.summary ? (
                    <p className="text-sm text-neutral-200 leading-relaxed">{review.summary}</p>
                ) : (
                    <p className="text-sm text-neutral-400">
                        This PR changes <strong className="text-neutral-200">{files.length} file{files.length !== 1 ? 's' : ''}</strong> with{' '}
                        <strong className="text-emerald-400">+{totalAdditions}</strong> additions and{' '}
                        <strong className="text-red-400">-{totalDeletions}</strong> deletions.
                    </p>
                )}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {categories.map(([cat, count]) => (
                            <span key={cat} className="text-[11px] text-neutral-500 bg-white/[0.03] px-2 py-0.5 rounded">{cat}: {count}</span>
                        ))}
                    </div>
                )}
            </div>

            <div className="rounded-lg border border-white/[0.06] p-3.5">
                <div className="flex items-center gap-2 mb-2">
                    <Shield size={13} className="text-neutral-500" />
                    <span className="text-xs font-medium text-neutral-300">Risk assessment</span>
                </div>
                <p className="text-sm">
                    <span className={`font-medium ${riskColor}`}>{riskLabel}</span>
                    <span className="text-neutral-400"> — {highIssues.length} high-severity, {mediumIssues.length} medium-severity issue{mediumIssues.length !== 1 ? 's' : ''}, {suggestions.length} total</span>
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                    This PR touches <strong className="text-neutral-300">{categories.map(([c]) => c).join(', ')}</strong>.
                    {totalAdditions > 0 && <> Added <strong className="text-emerald-400/80">{totalAdditions} lines</strong>.</>}
                    {totalDeletions > 0 && <> Removed <strong className="text-red-400/80">{totalDeletions} lines</strong>.</>}
                    {review.ciStatus === 'passing' && <> CI checks are passing.</>}
                    {review.ciStatus === 'failing' && <> CI checks are failing.</>}
                </p>
            </div>

            {suggestions.length > 0 && (
                <div className="rounded-lg border border-white/[0.06] p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={13} className="text-neutral-500" />
                        <span className="text-xs font-medium text-neutral-300">Issues found</span>
                        <span className="text-[11px] text-neutral-500 ml-auto">{suggestions.length} total</span>
                    </div>
                    {highIssues.length > 0 && (
                        <div className="mb-2">
                            <p className="text-xs text-red-400/90 font-medium mb-1">High severity — should be fixed before merging</p>
                            <ul className="space-y-1">
                                {highIssues.map((s: any, i: number) => (
                                    <li key={i} className="text-xs text-neutral-400 flex gap-2">
                                        <ArrowRight size={11} className="shrink-0 mt-0.5 text-red-400/60" />
                                        <span><strong className="text-neutral-300">{s.title}</strong>{s.filePath ? <> in <span className="text-neutral-500 font-mono">{s.filePath.split('/').pop()}</span></> : ''}. {s.description?.slice(0, 120)}{s.description?.length > 120 ? '...' : ''}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {mediumIssues.length > 0 && (
                        <div className={highIssues.length > 0 ? 'mt-2' : ''}>
                            <p className="text-xs text-amber-400/90 font-medium mb-1">Medium severity — worth reviewing</p>
                            <ul className="space-y-1">
                                {mediumIssues.map((s: any, i: number) => (
                                    <li key={i} className="text-xs text-neutral-400 flex gap-2">
                                        <ArrowRight size={11} className="shrink-0 mt-0.5 text-amber-400/60" />
                                        <span><strong className="text-neutral-300">{s.title}</strong>{s.filePath ? <> in <span className="text-neutral-500 font-mono">{s.filePath.split('/').pop()}</span></> : ''}. {s.description?.slice(0, 100)}{s.description?.length > 100 ? '...' : ''}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className="rounded-lg border border-white/[0.06] p-3.5">
                <div className="flex items-center gap-2 mb-2">
                    <GitMerge size={13} className="text-neutral-500" />
                    <span className="text-xs font-medium text-neutral-300">Recommendation</span>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-sm font-semibold ${review.mergeReady >= 80 ? 'text-emerald-400' : review.mergeReady >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {mergeRecommendation}
                    </span>
                    <div className="flex-1 max-w-[100px] h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className={`h-full rounded-full ${review.mergeReady >= 80 ? 'bg-emerald-400' : review.mergeReady >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${Math.min(100, Math.max(0, review.mergeReady || 0))}%` }} />
                    </div>
                    <span className="text-xs text-neutral-500">{review.mergeReady || 0}%</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">{getMergeAdvice(review.mergeReady || 0)}</p>
                <p className="text-xs text-neutral-400 mt-1">
                    {highIssues.length === 0 && mediumIssues.length === 0 && suggestions.length === 0
                        ? 'No issues were found in this review.'
                        : `${highIssues.length} high-severity, ${mediumIssues.length} medium-severity, and ${suggestions.length - highIssues.length - mediumIssues.length} lower-severity items.`
                    }
                </p>
            </div>
        </div>
    );
}

export function AIReport({ review, analyzing }: AIReportProps) {
    if (analyzing) {
        return (
            <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/10">
                        <Loader2 size={12} className="text-accent animate-spin" />
                    </div>
                    <h2 className="text-sm font-semibold text-white">AI Report</h2>
                </div>
                <div className="flex items-center justify-center py-6">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 size={18} className="text-accent animate-spin" />
                        <p className="text-xs text-neutral-500">Generating report...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!review || !review.files || review.files.length === 0) {
        return (
            <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/10">
                        <FileText size={12} className="text-accent" />
                    </div>
                    <h2 className="text-sm font-semibold text-white">AI Report</h2>
                </div>
                <div className="rounded-lg border border-dashed border-white/[0.06] p-6 text-center">
                    <Sparkles size={22} className="mx-auto mb-2 text-neutral-600" />
                    <p className="text-xs text-neutral-500">Run the review to get a plain-language report</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
            {review?.report && (
                <>
                    <div className="mb-4 rounded-lg border border-accent/15 bg-accent/[0.03] overflow-hidden">
                        <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-accent/10">
                            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-accent/10">
                                <Sparkles size={11} className="text-accent" />
                            </div>
                            <span className="text-xs font-semibold text-white">AI Review</span>
                        </div>
                        <div className="p-3.5">
                            <div className="prose prose-invert prose-sm max-w-none [&_p]:text-xs [&_p]:text-neutral-300 [&_p]:leading-relaxed [&_strong]:text-white [&_ul]:text-xs [&_ul]:text-neutral-300 [&_li]:text-xs [&_li]:text-neutral-300 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:first:mt-0 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-neutral-200 [&_h3]:mt-3 [&_h3]:mb-1">
                                <MarkdownPreview content={review.report} />
                            </div>
                        </div>
                    </div>
                    <hr className="border-white/[0.06] my-4" />
                </>
            )}
            <div className="flex items-center gap-2 mb-4">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/10">
                    <FileText size={12} className="text-accent" />
                </div>
                <h2 className="text-sm font-semibold text-white">AI Report</h2>
            </div>
            <FallbackReport review={review} />
        </div>
    );
}
