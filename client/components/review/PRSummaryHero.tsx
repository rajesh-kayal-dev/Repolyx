import { Sparkles, RefreshCw, Loader2, FileCode, AlertTriangle, Braces, BookOpen } from 'lucide-react';

interface PRSummaryHeroProps {
    review: {
        title: string;
        status: string;
        summary: string | null;
        files: any[];
        suggestions: any[];
    } | null;
    analyzing?: boolean;
    onAnalyze?: () => void;
}

function categorizeFiles(files: any[]) {
    if (!files || files.length === 0) return [];
    const categories: { label: string; icon: any; files: any[]; count: number }[] = [
        { label: 'Frontend', icon: Braces, files: [], count: 0 },
        { label: 'Backend', icon: FileCode, files: [], count: 0 },
        { label: 'Config', icon: Braces, files: [], count: 0 },
        { label: 'Docs', icon: BookOpen, files: [], count: 0 },
    ];

    files.forEach(f => {
        const path = f.path || '';
        if (/\.(tsx|jsx|css|scss|sass)$/i.test(path) || /^src\//.test(path) || /^app\//.test(path) || /^components\//.test(path)) {
            categories[0].files.push(f);
        } else if (/\.(js|ts|py|go|rb|java|rs|php)$/i.test(path) && !/\.(tsx|jsx)$/i.test(path) || /^server\//.test(path) || /^api\//.test(path) || /^controllers?\//.test(path) || /^services?\//.test(path) || /^routes\//.test(path)) {
            categories[1].files.push(f);
        } else if (/\.(json|ya?ml|toml|env\w*)$/i.test(path) || /^config\//.test(path) || /Dockerfile/.test(path)) {
            categories[2].files.push(f);
        } else if (/\.(md|mdx)$/i.test(path) || /^docs\//.test(path) || /^README/i.test(path)) {
            categories[3].files.push(f);
        } else if (/prompts?\/|ai\//.test(path)) {
            categories[1].files.push(f);
        } else {
            categories[1].files.push(f);
        }
    });

    return categories.filter(c => c.files.length > 0).map(c => ({ ...c, count: c.files.length }));
}

export function PRSummaryHero({ review, analyzing, onAnalyze }: PRSummaryHeroProps) {
    const isPending = !review || review.status === 'pending' || review.status === 'failed';
    const isCompleted = review?.status === 'completed';
    const suggestions = review?.suggestions || [];
    const files = review?.files || [];

    const highCount = suggestions.filter((s: any) => s.severity === 'high').length;
    const totalAdditions = files.reduce((sum: number, f: any) => sum + (f.additions || 0), 0);
    const totalDeletions = files.reduce((sum: number, f: any) => sum + (f.deletions || 0), 0);
    const categories = categorizeFiles(files);

    return (
        <div className="rounded-xl border border-white/[0.06] bg-[#080b12] overflow-hidden">
            <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                            {analyzing ? <Loader2 size={15} className="text-accent animate-spin" /> : <Sparkles size={15} className="text-accent" />}
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white">Review Summary</h2>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                {analyzing ? 'Analyzing changes...' : isPending ? 'AI-powered code review' : 'What this PR does'}
                            </p>
                        </div>
                    </div>
                    {onAnalyze && (
                        <div className="flex items-center gap-2">
                            {isCompleted && (
                                <button onClick={onAnalyze} title="Re-analyze" className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors">
                                    <RefreshCw size={13} />
                                    Re-analyze
                                </button>
                            )}
                            {isPending && !analyzing && (
                                <button onClick={onAnalyze} title="Run AI Review" className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors">
                                    <Sparkles size={13} />
                                    Run Review
                                </button>
                            )}
                            {analyzing && (
                                <span className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
                                    <Loader2 size={13} className="animate-spin" />
                                    Analyzing...
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {analyzing ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 size={22} className="text-accent animate-spin" />
                            <p className="text-xs text-neutral-500">AI is reviewing your code changes...</p>
                        </div>
                    </div>
                ) : isPending ? (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-dashed border-white/[0.06] p-6 text-center">
                            <Sparkles size={28} className="mx-auto mb-2 text-neutral-600" />
                            <p className="text-sm text-neutral-400 font-medium">No review yet</p>
                            <p className="text-xs text-neutral-600 mt-1 max-w-md mx-auto">Run an AI review to get a plain-language summary of what this PR changes, why it matters, and whether it's ready to merge.</p>
                        </div>
                        {files.length > 0 && (
                            <div className="flex items-center gap-3 text-xs text-neutral-500">
                                <span className="flex items-center gap-1"><FileCode size={13} /> {files.length} file{files.length !== 1 ? 's' : ''}</span>
                                {totalAdditions > 0 && <span className="text-emerald-400/70">+{totalAdditions}</span>}
                                {totalDeletions > 0 && <span className="text-red-400/70">-{totalDeletions}</span>}
                                {categories.map(c => (
                                    <span key={c.label} className="text-neutral-600">{c.count} {c.label.toLowerCase()}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-5">
                        {review?.summary && (
                            <div className="rounded-lg border border-accent/10 bg-gradient-to-br from-accent/[0.03] to-transparent px-4 py-3.5">
                                <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">{review.summary}</p>
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
                            <span className="flex items-center gap-1.5">
                                <FileCode size={13} className="text-neutral-600" />
                                {files.length} file{files.length !== 1 ? 's' : ''} changed
                                {totalAdditions > 0 && <span className="text-emerald-400/70">+{totalAdditions}</span>}
                                {totalDeletions > 0 && <span className="text-red-400/70">-{totalDeletions}</span>}
                            </span>
                            {suggestions.length > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <AlertTriangle size={13} className="text-neutral-600" />
                                    {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
                                    {highCount > 0 && <span className="text-red-400/70">({highCount} high)</span>}
                                </span>
                            )}
                            {categories.slice(0, 3).map(c => (
                                <span key={c.label} className="text-neutral-500">{c.label}: {c.count}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
