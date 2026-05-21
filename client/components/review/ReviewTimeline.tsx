import { Clock, GitPullRequest, Sparkles, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface ReviewTimelineProps {
    review: {
        status: string;
        createdAt: string;
        updatedAt: string;
        summary: string | null;
        suggestions: any[];
    } | null;
    analyzing?: boolean;
}

function timeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
}

export function ReviewTimeline({ review, analyzing }: ReviewTimelineProps) {
    const events: { icon: any; color: string; bg: string; label: string; time: string | null }[] = [];

    if (analyzing) {
        events.push({ icon: Loader2, color: 'text-accent', bg: 'bg-accent/10', label: 'Analyzing pull request...', time: null });
    }

    if (review?.createdAt) {
        events.push({ icon: GitPullRequest, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Review created', time: timeAgo(review.createdAt) });
    }

    if (review?.status === 'completed' || review?.summary) {
        events.push({ icon: Sparkles, color: 'text-accent', bg: 'bg-accent/10', label: 'AI analysis completed', time: review?.updatedAt ? timeAgo(review.updatedAt) : null });
    }

    if (review?.status === 'failed') {
        events.push({ icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Analysis failed', time: review?.updatedAt ? timeAgo(review.updatedAt) : null });
    }

    if (review?.suggestions && review.suggestions.length > 0 && review.status === 'completed') {
        const highCount = review.suggestions.filter((s: any) => s.severity === 'high').length;
        events.push({
            icon: CheckCircle2,
            color: highCount > 0 ? 'text-amber-400' : 'text-emerald-400',
            bg: highCount > 0 ? 'bg-amber-400/10' : 'bg-emerald-400/10',
            label: `${review.suggestions.length} issue${review.suggestions.length !== 1 ? 's' : ''} found${highCount > 0 ? ` (${highCount} high)` : ''}`,
            time: null,
        });
    }

    if (events.length === 0) return null;

    return (
        <div className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4">
            <div className="flex items-center gap-2 mb-4">
                <Clock size={14} className="text-neutral-500" />
                <h2 className="text-sm font-semibold text-white">Timeline</h2>
            </div>
            <div className="space-y-0">
                {events.map((event, i) => {
                    const Icon = event.icon;
                    const isLast = i === events.length - 1;
                    return (
                        <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className={`flex h-6 w-6 items-center justify-center rounded-full ${event.bg}`}>
                                    <Icon size={11} className={`${event.color} ${analyzing && i === 0 ? 'animate-spin' : ''}`} />
                                </div>
                                {!isLast && <div className="w-px flex-1 bg-white/[0.04] my-1" />}
                            </div>
                            <div className={`pb-4 ${isLast ? '' : ''}`}>
                                <p className="text-xs text-neutral-300">{event.label}</p>
                                {event.time && <p className="text-[11px] text-neutral-600 mt-0.5">{event.time}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
